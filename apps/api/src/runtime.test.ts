import { describe, expect, it } from "vitest";
import { enforceRateLimit, requestId, withRuntimeHeaders } from "./runtime";
import type { Env } from "./types";

function envWithCount(requestCount: number): Env {
  return {
    DB: {
      prepare: () => ({
        bind: () => ({
          first: async () => ({ request_count: requestCount }),
        }),
      }),
    },
    ALLOWED_ORIGIN: "https://app.example.test",
  } as unknown as Env;
}

describe("production request protection", () => {
  it("applies a bounded consumer search policy without storing a raw client identifier", async () => {
    const decision = await enforceRateLimit(
      new Request("https://api.example.test/v1/search", {
        method: "POST",
        headers: { "CF-Connecting-IP": "203.0.113.4" },
      }),
      envWithCount(1),
    );

    expect(decision).toMatchObject({
      limited: false,
      limit: 30,
      remaining: 29,
      routeGroup: "search",
    });
  });

  it("marks requests over the route budget as limited", async () => {
    const decision = await enforceRateLimit(
      new Request("https://api.example.test/v1/provider-events", {
        method: "POST",
        headers: { "CF-Connecting-IP": "203.0.113.5" },
      }),
      envWithCount(241),
    );

    expect(decision).toMatchObject({ limited: true, limit: 240, remaining: 0 });
  });

  it("does not rate-limit health checks", async () => {
    await expect(
      enforceRateLimit(new Request("https://api.example.test/health"), envWithCount(999)),
    ).resolves.toBeNull();
  });

  it("accepts a safe caller request id and replaces malformed values", () => {
    expect(
      requestId(
        new Request("https://api.example.test/health", {
          headers: { "X-Request-Id": "customer-trace-123" },
        }),
      ),
    ).toBe("customer-trace-123");

    expect(
      requestId(
        new Request("https://api.example.test/health", {
          headers: { "X-Request-Id": "bad id with spaces" },
        }),
      ),
    ).toMatch(/^req_[0-9a-f-]{36}$/);
  });

  it("adds correlation and rate-limit headers to responses", () => {
    const response = withRuntimeHeaders(new Response("ok", { status: 200 }), "req-test-123", {
      limited: false,
      limit: 20,
      remaining: 19,
      resetAt: 2_000_000_000_000,
      routeGroup: "compare",
    });

    expect(response.headers.get("X-Request-Id")).toBe("req-test-123");
    expect(response.headers.get("X-RateLimit-Limit")).toBe("20");
    expect(response.headers.get("X-RateLimit-Remaining")).toBe("19");
  });
});
