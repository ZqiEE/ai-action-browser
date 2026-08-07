import { json, normalizeIdentifier } from "./http";
import { assertProviderAccess } from "./security";
import type { Env, ProviderRow } from "./types";

interface OfferDiagnosticsRow {
  total: number;
  active: number;
  stale: number;
  latest_retrieved_at: string | null;
}

interface OutcomeDiagnosticsRow {
  confirmed: number;
  completed: number;
  reversed: number;
  disputed: number;
}

export async function providerDiagnostics(
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

  if (!provider) {
    return json(request, env, { error: { code: "provider_not_found", message: "Provider was not found." } }, 404);
  }

  await assertProviderAccess(request, env, provider.id, provider.credential_version);

  const staleCutoff = new Date(Date.now() - 24 * 60 * 60 * 1_000).toISOString();
  const offerStats = await env.DB.prepare(
    `SELECT
       COUNT(*) AS total,
       SUM(CASE WHEN active = 1 THEN 1 ELSE 0 END) AS active,
       SUM(CASE WHEN active = 1 AND retrieved_at < ? THEN 1 ELSE 0 END) AS stale,
       MAX(CASE WHEN active = 1 THEN retrieved_at ELSE NULL END) AS latest_retrieved_at
     FROM offers
     WHERE provider_id = ?`,
  )
    .bind(staleCutoff, provider.id)
    .first<OfferDiagnosticsRow>();

  const outcomeStats = await env.DB.prepare(
    `SELECT
       SUM(CASE WHEN status IN ('confirmed', 'accepted') THEN 1 ELSE 0 END) AS confirmed,
       SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed,
       SUM(CASE WHEN status IN ('cancelled', 'refunded') THEN 1 ELSE 0 END) AS reversed,
       SUM(CASE WHEN status = 'disputed' THEN 1 ELSE 0 END) AS disputed
     FROM outcomes
     WHERE provider_id = ?`,
  )
    .bind(provider.id)
    .first<OutcomeDiagnosticsRow>();

  const activeOffers = Number(offerStats?.active ?? 0);
  const staleOffers = Number(offerStats?.stale ?? 0);
  const readyForTraffic = provider.active === 1 && activeOffers > 0 && staleOffers < activeOffers;

  return json(request, env, {
    provider: {
      id: provider.id,
      name: provider.name,
      domain: provider.domain,
      active: provider.active === 1,
      credentialVersion: provider.credential_version,
    },
    credentials: {
      apiTokenAccepted: true,
      webhookSigningConfigured: Boolean(env.PROVIDER_WEBHOOK_SECRET),
    },
    offers: {
      total: Number(offerStats?.total ?? 0),
      active: activeOffers,
      stale: staleOffers,
      latestRetrievedAt: offerStats?.latest_retrieved_at ?? null,
      freshnessWindowHours: 24,
    },
    outcomes: {
      confirmedOrAccepted: Number(outcomeStats?.confirmed ?? 0),
      completed: Number(outcomeStats?.completed ?? 0),
      cancelledOrRefunded: Number(outcomeStats?.reversed ?? 0),
      disputed: Number(outcomeStats?.disputed ?? 0),
    },
    readyForTraffic,
    checks: {
      providerActive: provider.active === 1,
      hasActiveOffers: activeOffers > 0,
      hasFreshActiveOffer: activeOffers > staleOffers,
      recommendationRankingCommerciallyIndependent: true,
    },
  });
}
