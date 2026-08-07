import { extractConstraints, fallbackConstraints } from "./constraints";
import {
  ApiError,
  cleanText,
  fetchWithTimeout,
  json,
  normalizeCategory,
  normalizeIdentifier,
  normalizeProviderDomain,
  parseIsoDate,
  parseProviderHttpsUrl,
  parsePublicHttpUrl,
  readBodyText,
  readJson,
  stringifyBoundedJson,
} from "./http";
import {
  appendAttribution,
  assertAdmin,
  assertOutcomeTransition,
  assertProviderAccess,
  id,
  issueProviderCredentials,
  nowIso,
  validProviderSignature,
} from "./security";
import {
  PROVIDER_OUTCOME_STATUSES,
  type CompareRequest,
  type Constraints,
  type Env,
  type OfferInput,
  type OfferRow,
  type OutcomeRow,
  type PrepareRequest,
  type ProviderEventInput,
  type ProviderInput,
  type ProviderRow,
  type SearchRequest,
} from "./types";

function offerView(row: OfferRow, constraints: Constraints) {
  const withinBudget = constraints.budget === null || row.price <= constraints.budget;
  let evidence: Record<string, unknown> = {};
  try {
    evidence = JSON.parse(row.evidence_json) as Record<string, unknown>;
  } catch {
    evidence = {};
  }

  return {
    id: row.id,
    providerId: row.provider_id,
    providerName: row.provider_name,
    providerDomain: row.provider_domain,
    category: row.category,
    title: row.title,
    description: row.description,
    price: row.price,
    currency: row.currency,
    availability: row.availability,
    delivery: row.delivery_text,
    returns: row.returns_text,
    warranty: row.warranty_text,
    sourceUrl: row.source_url,
    retrievedAt: row.retrieved_at,
    strengths: [
      withinBudget ? "Fits the stated budget." : "Exceeds the stated budget.",
      row.availability === "in_stock"
        ? "Provider reports the item in stock."
        : `Availability: ${row.availability}.`,
      row.delivery_text,
    ],
    tradeoffs: [
      row.returns_text === ""
        ? "Return terms were not supplied."
        : `Returns: ${row.returns_text}.`,
      row.warranty_text === ""
        ? "Warranty terms were not supplied."
        : `Warranty: ${row.warranty_text}.`,
    ],
    evidence,
    recommendationIndependent: true,
  };
}

function outcomeView(row: OutcomeRow) {
  return {
    id: row.id,
    taskId: row.task_id,
    offerId: row.offer_id,
    offerTitle: row.offer_title,
    providerId: row.provider_id,
    providerName: row.provider_name,
    providerDomain: row.provider_domain,
    status: row.status,
    amount: row.amount,
    currency: row.currency,
    userConfirmed: row.user_confirmed === 1,
    completionEvidence: row.completion_evidence,
    reversalDeadline: row.reversal_deadline,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function getOutcomeRow(env: Env, outcomeId: string): Promise<OutcomeRow | null> {
  return env.DB.prepare(
    `SELECT o.*, p.name AS provider_name, p.domain AS provider_domain, f.title AS offer_title
       FROM outcomes o
       JOIN providers p ON p.id = o.provider_id
       JOIN offers f ON f.id = o.offer_id
      WHERE o.id = ?`,
  )
    .bind(outcomeId)
    .first<OutcomeRow>();
}

export async function health(request: Request, env: Env): Promise<Response> {
  const result = await env.DB.prepare("SELECT 1 AS ok").first<{ ok: number }>();
  return json(request, env, {
    status: result?.ok === 1 ? "ok" : "degraded",
    searchConfigured: Boolean(env.BRAVE_SEARCH_API_KEY),
    providerAdminConfigured: Boolean(env.PROVIDER_ADMIN_TOKEN),
    providerWebhookConfigured: Boolean(env.PROVIDER_WEBHOOK_SECRET),
    providerCredentialIsolationConfigured: Boolean(
      env.PROVIDER_ADMIN_TOKEN && env.PROVIDER_WEBHOOK_SECRET,
    ),
    constraintModelConfigured: Boolean(env.OPENAI_API_KEY && env.OPENAI_MODEL),
  });
}

export async function searchWeb(request: Request, env: Env): Promise<Response> {
  if (!env.BRAVE_SEARCH_API_KEY) {
    throw new ApiError(503, "search_not_configured", "Live search is not configured.");
  }

  const body = await readJson<SearchRequest>(request, 16 * 1024);
  const query = cleanText(body.query, 500);
  if (!query) throw new ApiError(400, "invalid_query", "A search query is required.");
  const requestedCount =
    typeof body.count === "number" && Number.isFinite(body.count) ? Math.floor(body.count) : 8;
  const count = Math.max(1, Math.min(10, requestedCount));

  const url = new URL("https://api.search.brave.com/res/v1/web/search");
  url.searchParams.set("q", query);
  url.searchParams.set("count", String(count));
  url.searchParams.set("safesearch", "moderate");

  const startedAt = Date.now();
  let upstream: Response;
  try {
    upstream = await fetchWithTimeout(
      url,
      {
        headers: {
          Accept: "application/json",
          "Accept-Encoding": "gzip",
          "X-Subscription-Token": env.BRAVE_SEARCH_API_KEY,
        },
      },
      8_000,
    );
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiError(504, "search_timeout", "The search provider timed out.");
    }
    throw new ApiError(502, "search_provider_error", "The search provider could not be reached.");
  }

  if (!upstream.ok) {
    throw new ApiError(
      502,
      "search_provider_error",
      "The search provider could not complete the request.",
    );
  }

  const data = (await upstream.json()) as {
    web?: { results?: Array<{ title?: string; url?: string; description?: string; age?: string }> };
  };
  const results = (data.web?.results ?? []).flatMap((result, index) => {
    const resultUrl = parsePublicHttpUrl(result.url);
    const title = cleanText(result.title, 300);
    if (!resultUrl || !title) return [];
    return [
      {
        id: `search_${index}_${crypto.randomUUID()}`,
        title,
        url: resultUrl.toString(),
        displayUrl: resultUrl.hostname,
        snippet: cleanText(result.description, 1_000),
        sourceType: "web",
        age: cleanText(result.age, 80) || null,
      },
    ];
  });

  return json(request, env, {
    query,
    results,
    source: "brave_web_search",
    durationMs: Date.now() - startedAt,
  });
}

export async function compareOffers(request: Request, env: Env): Promise<Response> {
  const body = await readJson<CompareRequest>(request, 32 * 1024);
  const query = cleanText(body.query, 1_000);
  if (!query) throw new ApiError(400, "invalid_query", "A comparison goal is required.");
  const category = normalizeCategory(cleanText(body.category, 80) || "laptop");

  const constraints = await extractConstraints(query, env);
  const taskId = id("task");
  const createdAt = nowIso();
  await env.DB.prepare(
    "INSERT INTO tasks (id, mode, query, category, created_at) VALUES (?, 'compare', ?, ?, ?)",
  )
    .bind(taskId, query, category, createdAt)
    .run();

  const offersResult = await env.DB.prepare(
    `SELECT o.*, p.name AS provider_name, p.domain AS provider_domain
       FROM offers o
       JOIN providers p ON p.id = o.provider_id
      WHERE o.category = ? AND o.active = 1 AND p.active = 1
      ORDER BY o.price ASC
      LIMIT 50`,
  )
    .bind(category)
    .all<OfferRow>();

  const allOffers = offersResult.results ?? [];
  const withinBudget =
    constraints.budget === null
      ? allOffers
      : allOffers.filter((offer) => offer.price <= constraints.budget!);
  const candidates = (withinBudget.length > 0 ? withinBudget : allOffers).slice(0, 3);

  if (candidates.length === 0) {
    return json(request, env, {
      taskId,
      query,
      category,
      constraints,
      recommendations: [],
      incomplete: true,
      message: "No active provider offers are available for this category.",
      recommendationPolicy: {
        commissionUsedForRanking: false,
        bidsUsedForRanking: false,
        expectedRevenueUsedForRanking: false,
      },
    });
  }

  return json(request, env, {
    taskId,
    query,
    category,
    constraints,
    recommendations: candidates.map((row) => offerView(row, constraints)),
    incomplete: false,
    recommendationPolicy: {
      commissionUsedForRanking: false,
      bidsUsedForRanking: false,
      expectedRevenueUsedForRanking: false,
    },
  });
}

export async function upsertProvider(request: Request, env: Env): Promise<Response> {
  assertAdmin(request, env);
  if (!env.PROVIDER_WEBHOOK_SECRET) {
    throw new ApiError(503, "provider_credentials_not_configured", "Provider credentials are not configured.");
  }
  const body = await readJson<ProviderInput>(request, 16 * 1024);
  const providerId = normalizeIdentifier(body.id, 120, "provider_id");
  const name = cleanText(body.name, 200);
  const domain = normalizeProviderDomain(body.domain);
  if (!name) throw new ApiError(400, "invalid_provider_name", "Provider name is required.");

  const timestamp = nowIso();
  await env.DB.prepare(
    `INSERT INTO providers (id, name, domain, active, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       name = excluded.name,
       domain = excluded.domain,
       active = excluded.active,
       updated_at = excluded.updated_at`,
  )
    .bind(providerId, name, domain, body.active === false ? 0 : 1, timestamp, timestamp)
    .run();

  const provider = await env.DB.prepare(
    "SELECT id, name, domain, active, credential_version FROM providers WHERE id = ?",
  )
    .bind(providerId)
    .first<ProviderRow>();
  if (!provider) throw new ApiError(500, "provider_write_failed", "Provider could not be read after update.");
  const credentials = await issueProviderCredentials(env, provider.id, provider.credential_version);

  return json(
    request,
    env,
    {
      id: provider.id,
      name: provider.name,
      domain: provider.domain,
      active: provider.active === 1,
      credentials,
    },
    201,
  );
}

export async function rotateProviderCredentials(
  request: Request,
  env: Env,
  providerIdValue: string,
): Promise<Response> {
  assertAdmin(request, env);
  if (!env.PROVIDER_WEBHOOK_SECRET) {
    throw new ApiError(503, "provider_credentials_not_configured", "Provider credentials are not configured.");
  }
  const providerId = normalizeIdentifier(providerIdValue, 120, "provider_id");
  const existing = await env.DB.prepare(
    "SELECT id FROM providers WHERE id = ?",
  )
    .bind(providerId)
    .first<{ id: string }>();
  if (!existing) throw new ApiError(404, "provider_not_found", "Provider was not found.");

  await env.DB.prepare(
    "UPDATE providers SET credential_version = credential_version + 1, updated_at = ? WHERE id = ?",
  )
    .bind(nowIso(), providerId)
    .run();

  const provider = await env.DB.prepare(
    "SELECT id, name, domain, active, credential_version FROM providers WHERE id = ?",
  )
    .bind(providerId)
    .first<ProviderRow>();
  if (!provider) throw new ApiError(500, "provider_write_failed", "Provider could not be read after rotation.");
  const credentials = await issueProviderCredentials(env, provider.id, provider.credential_version);
  return json(request, env, { providerId: provider.id, credentials });
}

export async function upsertOffers(
  request: Request,
  env: Env,
  providerIdValue: string,
): Promise<Response> {
  const providerId = normalizeIdentifier(providerIdValue, 120, "provider_id");
  const provider = await env.DB.prepare(
    "SELECT id, name, domain, active, credential_version FROM providers WHERE id = ?",
  )
    .bind(providerId)
    .first<ProviderRow>();
  if (!provider) throw new ApiError(404, "provider_not_found", "Provider was not found.");
  await assertProviderAccess(request, env, providerId, provider.credential_version);

  const body = await readJson<{ offers: OfferInput[] }>(request);
  if (!Array.isArray(body.offers) || body.offers.length === 0 || body.offers.length > 500) {
    throw new ApiError(400, "invalid_offers", "Provide between 1 and 500 offers.");
  }

  const timestamp = nowIso();
  const statements = body.offers.map((offer) => {
    const offerId = normalizeIdentifier(offer.id, 160, "offer_id");
    const category = normalizeCategory(offer.category);
    const title = cleanText(offer.title, 300);
    const currency = cleanText(offer.currency, 3).toUpperCase();
    if (!title) throw new ApiError(400, "invalid_offer_title", "Each offer requires a title.");
    if (
      typeof offer.price !== "number" ||
      !Number.isFinite(offer.price) ||
      offer.price < 0 ||
      offer.price > 1_000_000
    ) {
      throw new ApiError(400, "invalid_offer_price", "Offer price must be between 0 and 1,000,000.");
    }
    if (!/^[A-Z]{3}$/.test(currency)) {
      throw new ApiError(400, "invalid_offer_currency", "Offer currency must be a three-letter code.");
    }

    const prepareUrl = parseProviderHttpsUrl(offer.prepareUrl, provider.domain, "prepare_url");
    const sourceUrl = parseProviderHttpsUrl(offer.sourceUrl, provider.domain, "source_url");
    const evidenceJson = stringifyBoundedJson(offer.evidence, "offer_evidence", 32 * 1024);
    const retrievedAt = parseIsoDate(offer.retrievedAt, "retrieved_at", {
      maxFutureMs: 5 * 60 * 1_000,
    });

    return env.DB.prepare(
      `INSERT INTO offers (
        id, provider_id, category, title, description, price, currency, availability,
        delivery_text, returns_text, warranty_text, prepare_url, source_url, evidence_json,
        retrieved_at, active, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        provider_id = excluded.provider_id,
        category = excluded.category,
        title = excluded.title,
        description = excluded.description,
        price = excluded.price,
        currency = excluded.currency,
        availability = excluded.availability,
        delivery_text = excluded.delivery_text,
        returns_text = excluded.returns_text,
        warranty_text = excluded.warranty_text,
        prepare_url = excluded.prepare_url,
        source_url = excluded.source_url,
        evidence_json = excluded.evidence_json,
        retrieved_at = excluded.retrieved_at,
        active = excluded.active,
        updated_at = excluded.updated_at`,
    ).bind(
      offerId,
      providerId,
      category,
      title,
      cleanText(offer.description, 2_000),
      offer.price,
      currency,
      cleanText(offer.availability, 80) || "unknown",
      cleanText(offer.deliveryText, 300),
      cleanText(offer.returnsText, 300),
      cleanText(offer.warrantyText, 300),
      prepareUrl,
      sourceUrl,
      evidenceJson,
      retrievedAt,
      offer.active === false ? 0 : 1,
      timestamp,
      timestamp,
    );
  });

  await env.DB.batch(statements);
  return json(request, env, { providerId, imported: statements.length }, 201);
}

export async function prepareOutcome(request: Request, env: Env): Promise<Response> {
  const body = await readJson<PrepareRequest>(request, 32 * 1024);
  const offerId = normalizeIdentifier(body.offerId, 160, "offer_id");

  const offer = await env.DB.prepare(
    `SELECT o.*, p.name AS provider_name, p.domain AS provider_domain
       FROM offers o
       JOIN providers p ON p.id = o.provider_id
      WHERE o.id = ? AND o.active = 1 AND p.active = 1`,
  )
    .bind(offerId)
    .first<OfferRow>();
  if (!offer) throw new ApiError(404, "offer_not_found", "The selected offer is unavailable.");

  let taskId = cleanText(body.taskId, 160);
  const timestamp = nowIso();
  if (!taskId) {
    taskId = id("task");
    await env.DB.prepare(
      "INSERT INTO tasks (id, mode, query, category, created_at) VALUES (?, 'prepare', ?, ?, ?)",
    )
      .bind(taskId, cleanText(body.query, 1_000) || offer.title, offer.category, timestamp)
      .run();
  } else {
    const task = await env.DB.prepare("SELECT id FROM tasks WHERE id = ?")
      .bind(taskId)
      .first<{ id: string }>();
    if (!task) throw new ApiError(404, "task_not_found", "The browser task was not found.");
  }

  const outcomeId = id("outcome");
  const attributionToken = id("attr");
  const handoffUrl = appendAttribution(offer.prepare_url, outcomeId, attributionToken);
  const reversalDeadline = new Date(Date.now() + 30 * 24 * 60 * 60 * 1_000).toISOString();

  await env.DB.prepare(
    `INSERT INTO outcomes (
      id, task_id, offer_id, provider_id, attribution_token, status, amount, currency,
      user_confirmed, handoff_url, completion_evidence, reversal_deadline, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, 'prepared', ?, ?, 0, ?, NULL, ?, ?, ?)`,
  )
    .bind(
      outcomeId,
      taskId,
      offer.id,
      offer.provider_id,
      attributionToken,
      offer.price,
      offer.currency,
      handoffUrl,
      reversalDeadline,
      timestamp,
      timestamp,
    )
    .run();

  return json(
    request,
    env,
    {
      outcomeId,
      taskId,
      status: "prepared",
      offer: offerView(offer, fallbackConstraints(body.query ?? offer.title)),
      reversalDeadline,
      userConfirmationRequired: true,
    },
    201,
  );
}

export async function confirmOutcome(
  request: Request,
  env: Env,
  outcomeIdValue: string,
): Promise<Response> {
  const body = await readJson<{ confirmed: boolean }>(request, 8 * 1024);
  if (body.confirmed !== true) {
    throw new ApiError(400, "confirmation_required", "Explicit confirmation is required.");
  }

  const outcomeId = cleanText(outcomeIdValue, 160);
  const existing = await getOutcomeRow(env, outcomeId);
  if (!existing) throw new ApiError(404, "outcome_not_found", "The prepared outcome was not found.");
  if (existing.status !== "prepared" && existing.status !== "confirmed") {
    throw new ApiError(409, "invalid_outcome_state", "This outcome can no longer be confirmed.");
  }

  if (existing.status === "prepared") {
    await env.DB.prepare(
      "UPDATE outcomes SET status = 'confirmed', user_confirmed = 1, updated_at = ? WHERE id = ?",
    )
      .bind(nowIso(), outcomeId)
      .run();
  }

  const updated = await getOutcomeRow(env, outcomeId);
  if (!updated) throw new ApiError(404, "outcome_not_found", "Outcome was not found after confirmation.");
  return json(request, env, { outcome: outcomeView(updated), continueUrl: updated.handoff_url });
}

export async function readOutcome(
  request: Request,
  env: Env,
  outcomeIdValue: string,
): Promise<Response> {
  const outcomeId = cleanText(outcomeIdValue, 160);
  const row = await getOutcomeRow(env, outcomeId);
  if (!row) throw new ApiError(404, "outcome_not_found", "Outcome was not found.");

  const events = await env.DB.prepare(
    `SELECT id, provider_event_id AS providerEventId, status, evidence_json AS evidenceJson,
            occurred_at AS occurredAt, received_at AS receivedAt
       FROM outcome_events WHERE outcome_id = ? ORDER BY occurred_at ASC`,
  )
    .bind(outcomeId)
    .all<Record<string, unknown>>();

  return json(request, env, {
    outcome: outcomeView(row),
    events: (events.results ?? []).map((event) => {
      let evidence: unknown = {};
      try {
        evidence = JSON.parse(String(event.evidenceJson ?? "{}"));
      } catch {
        evidence = {};
      }
      const { evidenceJson: _evidenceJson, ...publicEvent } = event;
      return { ...publicEvent, evidence };
    }),
  });
}

export async function providerEvent(request: Request, env: Env): Promise<Response> {
  if (!env.PROVIDER_WEBHOOK_SECRET) {
    throw new ApiError(503, "provider_webhook_not_configured", "Provider events are not configured.");
  }

  const raw = await readBodyText(request, 64 * 1024);
  let body: ProviderEventInput;
  try {
    body = JSON.parse(raw) as ProviderEventInput;
  } catch {
    throw new ApiError(400, "invalid_json", "The provider event body is not valid JSON.");
  }

  const providerId = normalizeIdentifier(body.providerId, 120, "provider_id");
  const provider = await env.DB.prepare(
    "SELECT id, credential_version FROM providers WHERE id = ?",
  )
    .bind(providerId)
    .first<{ id: string; credential_version: number }>();
  if (
    !provider ||
    !(await validProviderSignature(
      raw,
      request.headers.get("X-AAB-Signature"),
      env,
      providerId,
      provider.credential_version,
    ))
  ) {
    throw new ApiError(401, "invalid_signature", "The provider event signature is invalid.");
  }

  if (!PROVIDER_OUTCOME_STATUSES.has(body.status)) {
    throw new ApiError(400, "invalid_status", "Unsupported outcome status.");
  }
  const eventId = cleanText(body.eventId, 200);
  const attributionToken = cleanText(body.attributionToken, 200);
  if (!eventId || !attributionToken) {
    throw new ApiError(
      400,
      "invalid_event",
      "Provider id, event id, attribution token, status, and occurredAt are required.",
    );
  }
  const occurrence = parseIsoDate(body.occurredAt, "occurred_at", {
    maxFutureMs: 5 * 60 * 1_000,
  });
  const evidenceJson = stringifyBoundedJson(body.evidence, "event_evidence", 32 * 1024);

  const duplicate = await env.DB.prepare(
    `SELECT outcome_id AS outcomeId
       FROM outcome_events
      WHERE provider_id = ? AND provider_event_id = ?`,
  )
    .bind(providerId, eventId)
    .first<{ outcomeId: string }>();
  if (duplicate) {
    return json(request, env, { accepted: true, duplicate: true, outcomeId: duplicate.outcomeId });
  }

  const outcome = await env.DB.prepare(
    "SELECT id, status, user_confirmed FROM outcomes WHERE attribution_token = ? AND provider_id = ?",
  )
    .bind(attributionToken, providerId)
    .first<{ id: string; status: OutcomeRow["status"]; user_confirmed: number }>();
  if (!outcome) {
    throw new ApiError(404, "outcome_not_found", "No attributed outcome was found for this provider.");
  }

  assertOutcomeTransition(outcome.status, body.status, outcome.user_confirmed === 1);
  const receivedAt = nowIso();
  try {
    await env.DB.batch([
      env.DB.prepare(
        `INSERT INTO outcome_events (
          id, outcome_id, provider_id, provider_event_id, status, evidence_json, occurred_at, received_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      ).bind(
        id("event"),
        outcome.id,
        providerId,
        eventId,
        body.status,
        evidenceJson,
        occurrence,
        receivedAt,
      ),
      env.DB.prepare(
        `UPDATE outcomes
            SET status = ?, completion_evidence = ?, updated_at = ?
          WHERE id = ?`,
      ).bind(body.status, evidenceJson, receivedAt, outcome.id),
    ]);
  } catch (error) {
    if (error instanceof Error && error.message.toLowerCase().includes("unique")) {
      const duplicateAfterRace = await env.DB.prepare(
        `SELECT outcome_id AS outcomeId
           FROM outcome_events
          WHERE provider_id = ? AND provider_event_id = ?`,
      )
        .bind(providerId, eventId)
        .first<{ outcomeId: string }>();
      if (duplicateAfterRace) {
        return json(request, env, {
          accepted: true,
          duplicate: true,
          outcomeId: duplicateAfterRace.outcomeId,
        });
      }
    }
    throw error;
  }

  return json(request, env, { accepted: true, duplicate: false, outcomeId: outcome.id });
}
