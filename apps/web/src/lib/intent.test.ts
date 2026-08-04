import { describe, expect, it } from "vitest";
import { suggestIntent } from "@/lib/intent";

describe("suggestIntent", () => {
  it("suggests comparison for constrained shopping requests", () => {
    expect(suggestIntent("Find the best laptop under $1,000"))?.toMatchObject({ mode: "compare" });
  });

  it("suggests preparation when the user asks to book or submit", () => {
    expect(suggestIntent("Book a family hotel near Central Park"))?.toMatchObject({ mode: "prepare" });
  });

  it("keeps ordinary searches neutral", () => {
    expect(suggestIntent("weather in Chicago tomorrow"))?.toBeNull();
  });
});
