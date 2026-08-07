import { describe, expect, it } from "vitest";
import { providerDiagnostics } from "./diagnostics";
import { deriveProviderCredential } from "./security";
import type { Env } from "./types";

function diagnosticsEnv(options: { activeOffers: number; staleOffers: number }): Env {
  const provider = {
    id: "provider-example",
    name: "Example Provider",
    domain: "provider.example",
    active: 1,
    credential_version: 2,
  };

  return {
    ALLOWED_ORIGIN: "https://app.example.test",
    PROVIDER_ADMIN_TOKEN: "platform-admin-master-secret",
    PROVIDER_WEBHOOK_SECRET: "platform-webhook-master-secret",
    DB: {
      prepare(sql: string) {
        if (sql.includes("FROM providers")) {
          return {
            bind: () => ({ first: async () => provider }),
          };
        }
        if (sql.includes("FROM offers")) {
          return {
            bind: () => ({
              first: async () => ({
                total: options.activeOffers,
                active: options.activeOffers,
                stale: options.staleOffers,
                latest_retrieved_at: "2026-08-07T12:00:00.000Z",
              }),
            }),
          };
        }
        if (sql.includes("FROM outcomes")) {
          return {
            bind: () => ({
              first: async () => ({ confirmed: 2, completed: 3, reversed: 1, disputed: 0 }),
            }),
          };
        }
        throw new Error(`Unexpected SQL: ${sql}`);
      },
    },
  } as unknown as Env;
}

describe("Provider production diagnostics", () => {
  it("reports traffic readiness without returning Provider secrets", async () => {
    const env = diagnosticsEnv({ activeOffers: 4, staleOffers: 1 });
    const token = await deriveProviderCredential(
      env.PROVIDER_ADMIN_TOKEN!,
      "provider-example",
      2,
      "api",
    );
    const response = await providerDiagnostics(
      new Request("https://api.example.test/v1/providers/provider-example/diagnostics", {
        headers: { Authorization: `Bearer ${token}` },
      }),
      env,
      "provider-example",
    );
    const body = (await response.json()) as Record<string, unknown>;

    expect(response.status).toBe(200);
    expect(body.readyForTraffic).toBe(true);
    expect(JSON.stringify(body)).not.toContain(token);
    expect(JSON.stringify(body)).not.toContain("platform-webhook-master-secret");
    expect(body).toMatchObject({
      provider: { id: "provider-example", credentialVersion: 2 },
      offers: { active: 4, stale: 1, freshnessWindowHours: 24 },
      outcomes: { confirmedOrAccepted: 2, completed: 3, cancelledOrRefunded: 1, disputed: 0 },
      checks: {
        providerActive: true,
        hasActiveOffers: true,
        hasFreshActiveOffer: true,
        recommendationRankingCommerciallyIndependent: true,
      },
    });
  });

  it("does not declare a Provider ready when every active Offer is stale", async () => {
    const env = diagnosticsEnv({ activeOffers: 2, staleOffers: 2 });
    const token = await deriveProviderCredential(
      env.PROVIDER_ADMIN_TOKEN!,
      "provider-example",
      2,
      "api",
    );
    const response = await providerDiagnostics(
      new Request("https://api.example.test/v1/providers/provider-example/diagnostics", {
        headers: { Authorization: `Bearer ${token}` },
      }),
      env,
      "provider-example",
    );
    const body = (await response.json()) as { readyForTraffic: boolean };

    expect(response.status).toBe(200);
    expect(body.readyForTraffic).toBe(false);
  });

  it("rejects an invalid Provider token", async () => {
    const env = diagnosticsEnv({ activeOffers: 1, staleOffers: 0 });

    await expect(
      providerDiagnostics(
        new Request("https://api.example.test/v1/providers/provider-example/diagnostics", {
          headers: { Authorization: "Bearer wrong-provider-token" },
        }),
        env,
        "provider-example",
      ),
    ).rejects.toMatchObject({ status: 401, code: "unauthorized" });
  });
});
