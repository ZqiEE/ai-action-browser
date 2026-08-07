import assert from "node:assert/strict";
import test from "node:test";
import { buildTaskUrl, normalizeTabContext } from "../lib/context.mjs";

test("normalizes only active http or https page context and strips sensitive URL parts", () => {
  assert.deepEqual(
    normalizeTabContext({
      title: " Example   Laptop ",
      url: "https://user:secret@shop.example/products/1?session=abc#checkout",
    }),
    {
      available: true,
      title: "Example Laptop",
      url: "https://shop.example/products/1",
      hostname: "shop.example",
    },
  );

  assert.equal(normalizeTabContext({ title: "Settings", url: "chrome://settings" }).available, false);
  assert.equal(normalizeTabContext({ title: "Local file", url: "file:///tmp/private.txt" }).available, false);
});

test("builds Search, Compare, and Prepare routes without server query leakage", () => {
  const context = normalizeTabContext({ title: "Current Product", url: "https://shop.example/p/1?sku=abc" });

  for (const [mode, expectedRoute] of [
    ["search", "#/search?"],
    ["compare", "#/compare?"],
    ["prepare", "#/compare?"],
  ]) {
    const taskUrl = buildTaskUrl({ mode, goal: "Find a better option", context });
    const parsed = new URL(taskUrl);
    assert.equal(parsed.origin + parsed.pathname, "https://zqiee.github.io/ai-action-browser/");
    assert.equal(parsed.search, "");
    assert.ok(taskUrl.includes(expectedRoute));
    assert.ok(parsed.hash.includes("ctx_source=extension"));
    assert.ok(parsed.hash.includes("ctx_title=Current+Product"));
    assert.ok(parsed.hash.includes("ctx_url=https%3A%2F%2Fshop.example%2Fp%2F1"));
    assert.equal(parsed.hash.includes("sku%3Dabc"), false);
    if (mode === "compare") assert.ok(parsed.hash.includes("mode=compare"));
    if (mode === "prepare") assert.ok(parsed.hash.includes("mode=prepare"));
  }
});

test("omits page context when the user disables it", () => {
  const context = normalizeTabContext({ title: "Private-ish page", url: "https://example.test/account" });
  const taskUrl = buildTaskUrl({
    mode: "search",
    goal: "search without context",
    context,
    includeContext: false,
  });

  assert.equal(taskUrl.includes("ctx_"), false);
});

test("rejects empty goals, unsupported modes, and insecure production app origins", () => {
  assert.throws(() => buildTaskUrl({ mode: "search", goal: "   " }), /Enter a goal/);
  assert.throws(() => buildTaskUrl({ mode: "commit", goal: "Do it" }), /Unsupported/);
  assert.throws(
    () => buildTaskUrl({ mode: "search", goal: "test", appBaseUrl: "http://example.com/" }),
    /must use HTTPS/,
  );

  assert.doesNotThrow(() =>
    buildTaskUrl({ mode: "search", goal: "local test", appBaseUrl: "http://localhost:5173/" }),
  );
});
