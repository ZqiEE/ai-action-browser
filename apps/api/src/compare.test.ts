import { describe, expect, it } from "vitest";
import { compareOffers } from "./compare";
import type { Env, OfferRow } from "./types";

const softwareOffer: OfferRow = {
  id: "offer-software",
  provider_id: "provider-software",
  provider_name: "Software Provider",
  provider_domain: "software.example",
  category: "software",
  title: "Secure note software",
  description: "Encrypted notes for teams",
  price: 12,
  currency: "USD",
  availability: "available",
  delivery_text: "",
  returns_text: "Cancel any time",
  warranty_text: "",
  prepare_url: "https://software.example/start",
  source_url: "https://software.example/notes",
  evidence_json: "{}",
  retrieved_at: "2026-08-08T00:00:00.000Z",
};

function compareEnv(captured: { taskBindings?: unknown[] }): Env {
  return {
    ALLOWED_ORIGIN: "https://app.example.test",
    DB: {
      prepare(sql: string) {
        if (sql.includes("FROM offers")) {
          return {
            all: async () => ({ results: [softwareOffer] }),
            bind: () => ({ all: async () => ({ results: [softwareOffer] }) }),
          };
        }
        if (sql.includes("INSERT INTO tasks")) {
          return {
            bind: (...values: unknown[]) => ({
              run: async () => {
                captured.taskBindings = values;
                return { success: true };
              },
            }),
          };
        }
        throw new Error(`Unexpected SQL: ${sql}`);
      },
    },
  } as unknown as Env;
}

describe("Compare browser context privacy", () => {
  it("uses page context transiently but stores only the explicit user goal", async () => {
    const captured: { taskBindings?: unknown[] } = {};
    const goal = "Compare this with a safer option";
    const response = await compareOffers(
      new Request("https://api.example.test/v1/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: goal,
          pageContext: {
            title: "Secure note software",
            url: "https://software.example/notes?session=secret#billing",
          },
        }),
      }),
      compareEnv(captured),
    );
    const body = (await response.json()) as {
      query: string;
      pageContextUsed: boolean;
      recommendations: Array<{ id: string }>;
    };

    expect(response.status).toBe(200);
    expect(body.query).toBe(goal);
    expect(body.pageContextUsed).toBe(true);
    expect(body.recommendations[0]?.id).toBe("offer-software");

    expect(captured.taskBindings?.[1]).toBe(goal);
    expect(JSON.stringify(captured.taskBindings)).not.toContain("software.example");
    expect(JSON.stringify(captured.taskBindings)).not.toContain("session=secret");
    expect(JSON.stringify(captured.taskBindings)).not.toContain("#billing");
  });
});
