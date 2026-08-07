import { describe, expect, it } from "vitest";
import { ApiError } from "./http";
import {
  assertOutcomeTransition,
  assertProviderAccess,
  canTransitionOutcome,
  deriveProviderCredential,
} from "./security";
import type { Env } from "./types";

describe("outcome state machine", () => {
  it("allows confirmed outcomes to progress and completed outcomes to reverse", () => {
    expect(canTransitionOutcome("confirmed", "accepted")).toBe(true);
    expect(canTransitionOutcome("accepted", "completed")).toBe(true);
    expect(canTransitionOutcome("completed", "refunded")).toBe(true);
    expect(canTransitionOutcome("disputed", "completed")).toBe(true);
  });

  it("blocks provider results before consumer confirmation", () => {
    expect(() => assertOutcomeTransition("prepared", "completed", false)).toThrow(ApiError);
    expect(() => assertOutcomeTransition("confirmed", "completed", false)).toThrow(
      /consumer confirms/,
    );
  });

  it("blocks invalid commercial state rewrites", () => {
    expect(() => assertOutcomeTransition("cancelled", "completed", true)).toThrow(
      /cannot transition/,
    );
    expect(() => assertOutcomeTransition("refunded", "accepted", true)).toThrow(
      /cannot transition/,
    );
  });

  it("accepts duplicate status events without changing commercial meaning", () => {
    expect(() => assertOutcomeTransition("accepted", "accepted", true)).not.toThrow();
  });
});

describe("provider credential isolation", () => {
  const env = {
    PROVIDER_ADMIN_TOKEN: "admin-master-secret",
    PROVIDER_WEBHOOK_SECRET: "webhook-master-secret",
  } as Env;

  it("derives different credentials for providers, purposes, and rotations", async () => {
    const providerAApi = await deriveProviderCredential(
      "master-secret",
      "provider-a",
      1,
      "api",
    );
    const providerBApi = await deriveProviderCredential(
      "master-secret",
      "provider-b",
      1,
      "api",
    );
    const providerAWebhook = await deriveProviderCredential(
      "master-secret",
      "provider-a",
      1,
      "webhook",
    );
    const providerARotated = await deriveProviderCredential(
      "master-secret",
      "provider-a",
      2,
      "api",
    );

    expect(providerAApi).not.toBe(providerBApi);
    expect(providerAApi).not.toBe(providerAWebhook);
    expect(providerAApi).not.toBe(providerARotated);
    expect(providerAApi).toMatch(/^aab_pat_1_[a-f0-9]{64}$/);
    expect(providerAWebhook).toMatch(/^aab_wh_1_[a-f0-9]{64}$/);
  });

  it("allows a provider token only for its own current credential version", async () => {
    const providerAToken = await deriveProviderCredential(
      env.PROVIDER_ADMIN_TOKEN!,
      "provider-a",
      3,
      "api",
    );
    const providerBToken = await deriveProviderCredential(
      env.PROVIDER_ADMIN_TOKEN!,
      "provider-b",
      3,
      "api",
    );

    await expect(
      assertProviderAccess(
        new Request("https://api.example.test/v1/providers/provider-a/offers", {
          headers: { Authorization: `Bearer ${providerAToken}` },
        }),
        env,
        "provider-a",
        3,
      ),
    ).resolves.toBeUndefined();

    await expect(
      assertProviderAccess(
        new Request("https://api.example.test/v1/providers/provider-a/offers", {
          headers: { Authorization: `Bearer ${providerBToken}` },
        }),
        env,
        "provider-a",
        3,
      ),
    ).rejects.toThrow(ApiError);

    await expect(
      assertProviderAccess(
        new Request("https://api.example.test/v1/providers/provider-a/offers", {
          headers: { Authorization: `Bearer ${providerAToken}` },
        }),
        env,
        "provider-a",
        4,
      ),
    ).rejects.toThrow(ApiError);
  });

  it("keeps the platform admin token as an emergency provider-management credential", async () => {
    await expect(
      assertProviderAccess(
        new Request("https://api.example.test/v1/providers/provider-a/offers", {
          headers: { Authorization: `Bearer ${env.PROVIDER_ADMIN_TOKEN}` },
        }),
        env,
        "provider-a",
        99,
      ),
    ).resolves.toBeUndefined();
  });
});
