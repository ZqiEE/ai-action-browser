interface Env {
  DB: D1Database;
  ALLOWED_ORIGIN: string;
  BRAVE_SEARCH_API_KEY?: string;
  OPENAI_API_KEY?: string;
  OPENAI_MODEL?: string;
  PROVIDER_ADMIN_TOKEN?: string;
  PROVIDER_WEBHOOK_SECRET?: string;
}

interface SearchRequest {
  query: string;
  count?: number;
}

interface CompareRequest {
  query: string;
  category?: string;
}

interface ProviderInput {
  id: string;
  name: string;
  domain: string;
  active?: boolean;
}

interface OfferInput {
  id: string;
  category: string;
  title: string;
  description?: string;
  price: number;
  currency: string;
  availability: string;
  deliveryText: string;
  returnsText: string;
  warrantyText: string;
  prepareUrl: string;
  sourceUrl: string;
  evidence?: Record<string, unknown>;
  retrievedAt: string;
  active?: boolean;
}

interface PrepareRequest {
  offerId: string;
  taskId?: string;
  query?: string;
}

interface ProviderEventInput {
  eventId: string;
  attributionToken: string;
  status: "accepted" | "completed" | "cancelled" | "refunded" | "disputed";
  occurredAt: string;
  evidence?: Record<string, unknown>;
}

interface OfferRow {
  id: string;
  provider_id: string;
  provider_name: string;
  provider_domain: string;
  category: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  availability: string;
  delivery_text: string;
  returns_text: string;
  warranty_text: string;
  prepare_url: string;
  source_url: string;
  evidence_json: string;
  retrieved_at: string;
}

interface OutcomeRow {
  id: string;
  task_id: string;
  offer_id: string;
  provider_id: string;
  provider_name: string;
  provider_domain: string;
  offer_title: string;
  attribution_token: string;
  status: string;
  amount: number;
  currency: string;
  user_confirmed: number;
  handoff_url: string;
  completion_evidence: string | null;
  reversal_deadline: string | null;
  created_at: string;
  updated_at: string;
}

interface Constraints {
  budget: number | null;
  useCase: string;
  delivery: string;
  returns: string;
}

const JSON_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
} as const;

const OUTCOME_STATUSES = new Set([
  "accepted",
  "completed",
  "cancelled",
  "refunded",
  "disputed",
]);

function id(prefix: string): string {
  return `${prefix}_${crypto.randomUUID()}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

function allowedOrigin(request: Request, env: Env): string | null {
  const origin = request.headers.get("Origin");
  if (!origin) return null;
  const allowed = env.ALLOWED_ORIGIN.split(",").map((value) => value.trim());
  return allowed.includes("*") || allowed.includes(origin) ? origin : null;
}

function corsHeaders(request: Request, env: Env): HeadersInit {
  const origin = allowedOrigin(request, env);
  if (!origin) return {};
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Headers": "Authorization, Content-Type, X-AAB-Signature",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function json(
  request: Request,
  env: Env,
  value: unknown,
  status = 200,
  extraHeaders: HeadersInit = {},
): Response {
  return new Response(JSON.stringify(value), {
    status,
    headers: {
      ...JSON_HEADERS,
      ...corsHeaders(request, env),
      ...extraHeaders,
    },
  });
}

function errorResponse(
  request: Request,
  env: Env,
  status: number,
  code: string,
  message: string,
): Response {
  return json(request, env, { error: { code, message } }, status);
}

async function readJson<T>(request: Request): Promise<T> {
  const contentType = request.headers.get("Content-Type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    throw new Error("Content-Type must be application/json.");
  }
  return (await request.json()) as T;
}

function cleanText(value: unknown, maxLength: number): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

function parseBudget(query: string): number | null {
  const patterns = [
    /(?:under|below|less than|max(?:imum)?|budget(?: of)?)\s*\$?\s*([\d,]+)/i,
    /\$\s*([\d,]+)/,
    /([\d,]+)\s*(?:usd|dollars?|美元)/i,
  ];
  for (const pattern of patterns) {
    const match = query.match(pattern);
    const raw = match?.[1]?.replaceAll(",", "");
    if (!raw) continue;
    const value = Number(raw);
    if (Number.isFinite(value) && value > 0 && value < 1_000_000) return value;
  }
  return null;
}

function fallbackConstraints(query: string): Constraints {
  const lower = query.toLowerCase();
  return {
    budget: parseBudget(query),
    useCase: lower.includes("video") || query.includes("视频") ? "video editing" : "general use",
    delivery: lower.includes("next week") || query.includes("下周") ? "by next week" : "not specified",
    returns: lower.includes("free return") || query.includes("免费退") ? "free returns" : "not specified",
  };
}

function extractResponseText(value: unknown): string | null {
  if (!value || typeof value !== "object") return null;
  const output = (value as { output?: unknown }).output;
  if (!Array.isArray(output)) return null;
  for (const item of output) {
    if (!item || typeof item !== "object") continue;
    const content = (item as { content?: unknown }).content;
    if (!Array.isArray(content)) continue;
    for (const part of content) {
      if (!part || typeof part !== "object") continue;
      const candidate = part as { type?: unknown; text?: unknown };
      if (candidate.type === "output_text" && typeof candidate.text === "string") {
        return candidate.text;
      }
    }
  }
  return null;
}

async function extractConstraints(query: string, env: Env): Promise<Constraints> {
  const fallback = fallbackConstraints(query);
  if (!env.OPENAI_API_KEY || !env.OPENAI_MODEL) return fallback;

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: env.OPENAI_MODEL,
        store: false,
        max_output_tokens: 200,
        input: [
          {
            role: "system",
            content:
              "Extract only explicit shopping constraints. Do not invent requirements. Return the requested JSON schema.",
          },
          { role: "user", content: query },
        ],
        text: {
          format: {
            type: "json_schema",
            name: "laptop_constraints",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              properties: {
                budget: { type: ["number", "null"] },
                useCase: { type: "string" },
                delivery: { type: "string" },
                returns: { type: "string" },
              },
              required: ["budget", "useCase", "delivery", "returns"],
            },
          },
        },
      }),
    });

    if (!response.ok) return fallback;
    const text = extractResponseText(await response.json());
    if (!text) return fallback;
    const parsed = JSON.parse(text) as Partial<Constraints>;
    return {
      budget:
        typeof parsed.budget === "number" && Number.isFinite(parsed.budget)
          ? parsed.budget
          : fallback.budget,
      useCase: cleanText(parsed.useCase, 120) || fallback.useCase,
      delivery: cleanText(parsed.delivery, 120) || fallback.delivery,
      returns: cleanText(parsed.returns, 120) || fallback.returns,
    };
  } catch {
    return fallback;
  }
}

function assertAdmin(request: Request, env: Env): boolean {
  if (!env.PROVIDER_ADMIN_TOKEN) return false;
  return request.headers.get("Authorization") === `Bearer ${env.PROVIDER_ADMIN_TOKEN}`;
}

function appendAttribution(urlValue: string, outcomeId: string, attributionToken: string): string {
  const url = new URL(urlValue);
  url.searchParams.set("aab_outcome", outcomeId);
  url.searchParams.set("aab_attribution", attributionToken);
  return url.toString();
}

function offerView(row: OfferRow, constraints: Constraints) {
  const withinBudget = constraints.budget === null || row.price <= constraints.budget;
  const evidence = (() => {
    try {
      return JSON.parse(row.evidence_json) as Record<string, unknown>;
    } catch {
      return {};
    }
  })();

  const strengths = [
    withinBudget ? "Fits the stated budget." : "Exceeds the stated budget.",
    row.availability === "in_stock" ? "Provider reports the item in stock." : `Availability: ${row.availability}.`,
    row.delivery_text,
  ];

  const tradeoffs = [
    row.returns_text === "" ? "Return terms were not supplied." : `Returns: ${row.returns_text}.`,
    row.warranty_text === "" ? "Warranty terms were not supplied." : `Warranty: ${row.warranty_text}.`,
  ];

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
    strengths,
    tradeoffs,
    evidence,
    recommendationIndependent: true,
  };
}

async function searchWeb(request: Request, env: Env): Promise<Response> {
  if (!env.BRAVE_SEARCH_API_KEY) {
    return errorResponse(request, env, 503, "search_not_configured", "Live search is not configured.");
  }

  const body = await readJson<SearchRequest>(request);
  const query = cleanText(body.query, 500);
  if (!query) return errorResponse(request, env, 400, "invalid_query", "A search query is required.");
  const count = Math.max(1, Math.min(10, Math.floor(body.count ?? 8)));

  const url = new URL("https://api.search.brave.com/res/v1/web/search");
  url.searchParams.set("q", query);
  url.searchParams.set("count", String(count));
  url.searchParams.set("safesearch", "moderate");

  const startedAt = Date.now();
  const upstream = await fetch(url, {
    headers: {
      Accept: "application/json",
      "Accept-Encoding": "gzip",
      "X-Subscription-Token": env.BRAVE_SEARCH_API_KEY,
    },
  });

  if (!upstream.ok) {
    return errorResponse(request, env, 502, "search_provider_error", "The search provider could not complete the request.");
  }

  const data = (await upstream.json()) as {
    web?: { results?: Array<{ title?: string; url?: string; description?: string; age?: string }> };
  };
  const results = (data.web?.results ?? []).flatMap((result, index) => {
    if (!result.url || !result.title) return [];
    const resultUrl = new URL(result.url);
    return [
      {
        id: `search_${index}_${crypto.randomUUID()}`,
        title: cleanText(result.title, 300),
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

async function compareOffers(request: Request, env: Env): Promise<Response> {
  const body = await readJson<CompareRequest>(request);
  const query = cleanText(body.query, 1_000);
  const category = cleanText(body.category, 80) || "laptop";
  if (!query) return errorResponse(request, env, 400, "invalid_query", "A comparison goal is required.");

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

async function upsertProvider(request: Request, env: Env): Promise<Response> {
  if (!assertAdmin(request, env)) {
    return errorResponse(request, env, 401, "unauthorized", "Provider administration credentials are required.");
  }
  const body = await readJson<ProviderInput>(request);
  const providerId = cleanText(body.id, 120);
  const name = cleanText(body.name, 200);
  const domain = cleanText(body.domain, 255).toLowerCase();
  if (!providerId || !name || !domain) {
    return errorResponse(request, env, 400, "invalid_provider", "Provider id, name, and domain are required.");
  }
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
  return json(request, env, { id: providerId, name, domain, active: body.active !== false }, 201);
}

async function upsertOffers(
  request: Request,
  env: Env,
  providerId: string,
): Promise<Response> {
  if (!assertAdmin(request, env)) {
    return errorResponse(request, env, 401, "unauthorized", "Provider administration credentials are required.");
  }
  const provider = await env.DB.prepare("SELECT id FROM providers WHERE id = ?")
    .bind(providerId)
    .first<{ id: string }>();
  if (!provider) return errorResponse(request, env, 404, "provider_not_found", "Provider was not found.");

  const body = await readJson<{ offers: OfferInput[] }>(request);
  if (!Array.isArray(body.offers) || body.offers.length === 0 || body.offers.length > 500) {
    return errorResponse(request, env, 400, "invalid_offers", "Provide between 1 and 500 offers.");
  }

  const timestamp = nowIso();
  const statements = body.offers.map((offer) => {
    const offerId = cleanText(offer.id, 160);
    const category = cleanText(offer.category, 80);
    const title = cleanText(offer.title, 300);
    const currency = cleanText(offer.currency, 12).toUpperCase();
    const prepareUrl = new URL(offer.prepareUrl).toString();
    const sourceUrl = new URL(offer.sourceUrl).toString();
    if (!offerId || !category || !title || !Number.isFinite(offer.price) || offer.price < 0 || !currency) {
      throw new Error("Each offer requires a valid id, category, title, price, and currency.");
    }
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
      JSON.stringify(offer.evidence ?? {}),
      new Date(offer.retrievedAt).toISOString(),
      offer.active === false ? 0 : 1,
      timestamp,
      timestamp,
    );
  });

  await env.DB.batch(statements);
  return json(request, env, { providerId, imported: statements.length }, 201);
}

async function prepareOutcome(request: Request, env: Env): Promise<Response> {
  const body = await readJson<PrepareRequest>(request);
  const offerId = cleanText(body.offerId, 160);
  if (!offerId) return errorResponse(request, env, 400, "invalid_offer", "An offer id is required.");

  const offer = await env.DB.prepare(
    `SELECT o.*, p.name AS provider_name, p.domain AS provider_domain
       FROM offers o
       JOIN providers p ON p.id = o.provider_id
      WHERE o.id = ? AND o.active = 1 AND p.active = 1`,
  )
    .bind(offerId)
    .first<OfferRow>();
  if (!offer) return errorResponse(request, env, 404, "offer_not_found", "The selected offer is unavailable.");

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
    if (!task) return errorResponse(request, env, 404, "task_not_found", "The browser task was not found.");
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

  return json(request, env, {
    outcomeId,
    taskId,
    status: "prepared",
    offer: offerView(offer, fallbackConstraints(body.query ?? offer.title)),
    attributionToken,
    handoffUrl,
    reversalDeadline,
    userConfirmationRequired: true,
  }, 201);
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

function outcomeView(row: OutcomeRow) {
  return {
    id: row.id,
    taskId: row.task_id,
    offerId: row.offer_id,
    offerTitle: row.offer_title,
    providerId: row.provider_id,
    providerName: row.provider_name,
    providerDomain: row.provider_domain,
    attributionToken: row.attribution_token,
    status: row.status,
    amount: row.amount,
    currency: row.currency,
    userConfirmed: row.user_confirmed === 1,
    handoffUrl: row.handoff_url,
    completionEvidence: row.completion_evidence,
    reversalDeadline: row.reversal_deadline,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function confirmOutcome(request: Request, env: Env, outcomeId: string): Promise<Response> {
  const body = await readJson<{ confirmed: boolean }>(request);
  if (body.confirmed !== true) {
    return errorResponse(request, env, 400, "confirmation_required", "Explicit confirmation is required.");
  }
  const existing = await getOutcomeRow(env, outcomeId);
  if (!existing) return errorResponse(request, env, 404, "outcome_not_found", "The prepared outcome was not found.");
  if (existing.status !== "prepared" && existing.status !== "confirmed") {
    return errorResponse(request, env, 409, "invalid_outcome_state", "This outcome can no longer be confirmed.");
  }
  const timestamp = nowIso();
  await env.DB.prepare(
    "UPDATE outcomes SET status = 'confirmed', user_confirmed = 1, updated_at = ? WHERE id = ?",
  )
    .bind(timestamp, outcomeId)
    .run();
  const updated = await getOutcomeRow(env, outcomeId);
  return json(request, env, { outcome: outcomeView(updated!), continueUrl: updated!.handoff_url });
}

async function readOutcome(request: Request, env: Env, outcomeId: string): Promise<Response> {
  const row = await getOutcomeRow(env, outcomeId);
  if (!row) return errorResponse(request, env, 404, "outcome_not_found", "Outcome was not found.");
  const events = await env.DB.prepare(
    `SELECT id, provider_event_id AS providerEventId, status, evidence_json AS evidenceJson,
            occurred_at AS occurredAt, received_at AS receivedAt
       FROM outcome_events WHERE outcome_id = ? ORDER BY occurred_at ASC`,
  )
    .bind(outcomeId)
    .all<Record<string, unknown>>();
  return json(request, env, {
    outcome: outcomeView(row),
    events: (events.results ?? []).map((event) => ({
      ...event,
      evidence: (() => {
        try {
          return JSON.parse(String(event.evidenceJson ?? "{}"));
        } catch {
          return {};
        }
      })(),
      evidenceJson: undefined,
    })),
  });
}

function hex(bytes: ArrayBuffer): string {
  return [...new Uint8Array(bytes)].map((value) => value.toString(16).padStart(2, "0")).join("");
}

function constantTimeEqual(left: string, right: string): boolean {
  if (left.length !== right.length) return false;
  let mismatch = 0;
  for (let index = 0; index < left.length; index += 1) {
    mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return mismatch === 0;
}

async function validSignature(body: string, signature: string | null, secret: string | undefined) {
  if (!secret || !signature) return false;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const digest = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
  const supplied = signature.startsWith("sha256=") ? signature.slice(7) : signature;
  return constantTimeEqual(hex(digest), supplied.toLowerCase());
}

async function providerEvent(request: Request, env: Env): Promise<Response> {
  const raw = await request.text();
  if (!(await validSignature(raw, request.headers.get("X-AAB-Signature"), env.PROVIDER_WEBHOOK_SECRET))) {
    return errorResponse(request, env, 401, "invalid_signature", "The provider event signature is invalid.");
  }

  const body = JSON.parse(raw) as ProviderEventInput;
  if (!OUTCOME_STATUSES.has(body.status)) {
    return errorResponse(request, env, 400, "invalid_status", "Unsupported outcome status.");
  }
  const eventId = cleanText(body.eventId, 200);
  const attributionToken = cleanText(body.attributionToken, 200);
  if (!eventId || !attributionToken || !body.occurredAt) {
    return errorResponse(request, env, 400, "invalid_event", "Event id, attribution token, and occurredAt are required.");
  }

  const outcome = await env.DB.prepare("SELECT id FROM outcomes WHERE attribution_token = ?")
    .bind(attributionToken)
    .first<{ id: string }>();
  if (!outcome) return errorResponse(request, env, 404, "outcome_not_found", "No attributed outcome was found.");

  const receivedAt = nowIso();
  const occurrence = new Date(body.occurredAt).toISOString();
  try {
    await env.DB.batch([
      env.DB.prepare(
        `INSERT INTO outcome_events (
          id, outcome_id, provider_event_id, status, evidence_json, occurred_at, received_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      ).bind(
        id("event"),
        outcome.id,
        eventId,
        body.status,
        JSON.stringify(body.evidence ?? {}),
        occurrence,
        receivedAt,
      ),
      env.DB.prepare(
        `UPDATE outcomes
            SET status = ?, completion_evidence = ?, updated_at = ?
          WHERE id = ?`,
      ).bind(body.status, JSON.stringify(body.evidence ?? {}), receivedAt, outcome.id),
    ]);
  } catch (error) {
    if (error instanceof Error && error.message.toLowerCase().includes("unique")) {
      return json(request, env, { accepted: true, duplicate: true, outcomeId: outcome.id });
    }
    throw error;
  }

  return json(request, env, { accepted: true, duplicate: false, outcomeId: outcome.id });
}

async function handle(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);

  if (request.method === "OPTIONS") {
    if (request.headers.get("Origin") && !allowedOrigin(request, env)) {
      return errorResponse(request, env, 403, "origin_not_allowed", "This origin is not allowed.");
    }
    return new Response(null, { status: 204, headers: corsHeaders(request, env) });
  }

  if (request.headers.get("Origin") && !allowedOrigin(request, env)) {
    return errorResponse(request, env, 403, "origin_not_allowed", "This origin is not allowed.");
  }

  if (request.method === "GET" && url.pathname === "/health") {
    const result = await env.DB.prepare("SELECT 1 AS ok").first<{ ok: number }>();
    return json(request, env, { status: result?.ok === 1 ? "ok" : "degraded" });
  }

  if (request.method === "POST" && url.pathname === "/v1/search") {
    return searchWeb(request, env);
  }
  if (request.method === "POST" && url.pathname === "/v1/compare") {
    return compareOffers(request, env);
  }
  if (request.method === "POST" && url.pathname === "/v1/providers") {
    return upsertProvider(request, env);
  }
  const offersMatch = url.pathname.match(/^\/v1\/providers\/([^/]+)\/offers$/);
  if (request.method === "POST" && offersMatch?.[1]) {
    return upsertOffers(request, env, decodeURIComponent(offersMatch[1]));
  }
  if (request.method === "POST" && url.pathname === "/v1/prepare") {
    return prepareOutcome(request, env);
  }
  const confirmMatch = url.pathname.match(/^\/v1\/outcomes\/([^/]+)\/confirm$/);
  if (request.method === "POST" && confirmMatch?.[1]) {
    return confirmOutcome(request, env, decodeURIComponent(confirmMatch[1]));
  }
  const outcomeMatch = url.pathname.match(/^\/v1\/outcomes\/([^/]+)$/);
  if (request.method === "GET" && outcomeMatch?.[1]) {
    return readOutcome(request, env, decodeURIComponent(outcomeMatch[1]));
  }
  if (request.method === "POST" && url.pathname === "/v1/provider-events") {
    return providerEvent(request, env);
  }

  return errorResponse(request, env, 404, "not_found", "Route not found.");
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      return await handle(request, env);
    } catch (error) {
      console.error("request_failed", {
        path: new URL(request.url).pathname,
        method: request.method,
        error: error instanceof Error ? error.message : "unknown_error",
      });
      return errorResponse(request, env, 500, "internal_error", "The request could not be completed.");
    }
  },
};
