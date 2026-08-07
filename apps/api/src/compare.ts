import { extractConstraints } from "./constraints";
import { cleanText, json, normalizeCategory, readJson } from "./http";
import { rankOffersForGoal } from "./relevance";
import { id, nowIso } from "./security";
import type { CompareRequest, Constraints, Env, OfferRow } from "./types";

function offerView(row: OfferRow, constraints: Constraints) {
  let evidence: Record<string, unknown> = {};
  try {
    evidence = JSON.parse(row.evidence_json) as Record<string, unknown>;
  } catch {
    evidence = {};
  }

  const strengths: string[] = [];
  if (constraints.budget !== null) {
    strengths.push(
      row.price <= constraints.budget ? "Fits the stated budget." : "Exceeds the stated budget.",
    );
  }
  if (row.availability) {
    strengths.push(
      row.availability === "in_stock"
        ? "Provider reports this result as available."
        : `Availability: ${row.availability}.`,
    );
  }
  if (row.delivery_text) strengths.push(row.delivery_text);
  if (strengths.length === 0) strengths.push("Active Provider evidence is available for review.");

  const tradeoffs: string[] = [];
  if (row.returns_text) tradeoffs.push(`Return/refund terms: ${row.returns_text}.`);
  if (row.warranty_text) tradeoffs.push(`Warranty/service terms: ${row.warranty_text}.`);
  if (tradeoffs.length === 0) tradeoffs.push("Review the Provider evidence and final terms before preparing an action.");

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

async function readActiveOffers(env: Env, category: string | null): Promise<OfferRow[]> {
  if (category) {
    const result = await env.DB.prepare(
      `SELECT o.*, p.name AS provider_name, p.domain AS provider_domain
         FROM offers o
         JOIN providers p ON p.id = o.provider_id
        WHERE o.category = ? AND o.active = 1 AND p.active = 1
        ORDER BY o.retrieved_at DESC
        LIMIT 200`,
    )
      .bind(category)
      .all<OfferRow>();
    return result.results ?? [];
  }

  const result = await env.DB.prepare(
    `SELECT o.*, p.name AS provider_name, p.domain AS provider_domain
       FROM offers o
       JOIN providers p ON p.id = o.provider_id
      WHERE o.active = 1 AND p.active = 1
      ORDER BY o.retrieved_at DESC
      LIMIT 200`,
  ).all<OfferRow>();
  return result.results ?? [];
}

export async function compareOffers(request: Request, env: Env): Promise<Response> {
  const body = await readJson<CompareRequest>(request, 32 * 1024);
  const query = cleanText(body.query, 1_000);
  if (!query) {
    return json(
      request,
      env,
      { error: { code: "invalid_query", message: "A comparison goal is required." } },
      400,
    );
  }

  const rawCategory = cleanText(body.category, 80);
  const requestedCategory = rawCategory ? normalizeCategory(rawCategory) : null;
  const constraints = await extractConstraints(query, env);
  const allOffers = await readActiveOffers(env, requestedCategory);
  const candidates = rankOffersForGoal(
    allOffers,
    query,
    constraints.budget,
    requestedCategory !== null,
    3,
  );
  const resolvedCategory = requestedCategory ?? candidates[0]?.category ?? null;

  const taskId = id("task");
  await env.DB.prepare(
    "INSERT INTO tasks (id, mode, query, category, created_at) VALUES (?, 'compare', ?, ?, ?)",
  )
    .bind(taskId, query, resolvedCategory, nowIso())
    .run();

  if (candidates.length === 0) {
    return json(request, env, {
      taskId,
      query,
      category: resolvedCategory,
      constraints,
      recommendations: [],
      incomplete: true,
      message: requestedCategory
        ? "No active Provider Offers are available for the requested category."
        : "No active Provider Offers matched this goal. Use normal Search or connect relevant Provider supply.",
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
    category: resolvedCategory,
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
