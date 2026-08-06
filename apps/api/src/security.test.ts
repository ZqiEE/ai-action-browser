import { describe, expect, it } from "vitest";
import { ApiError } from "./http";
import { assertOutcomeTransition, canTransitionOutcome } from "./security";

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
