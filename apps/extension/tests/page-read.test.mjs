import assert from "node:assert/strict";
import test from "node:test";
import { normalizePageRead, pageReadToGoalText } from "../lib/page-read.mjs";

test("normalizes bounded page details", () => {
  const result = normalizePageRead({
    sensitivePage: false,
    description: "  Product   page ",
    headings: [" Main laptop ", " Specs ", " Returns "],
    selectedText: "  user selected   text ",
    excerpt: " visible   page text ",
  });

  assert.deepEqual(result, {
    sensitivePage: false,
    description: "Product page",
    headings: ["Main laptop", "Specs", "Returns"],
    selectedText: "user selected text",
    excerpt: "visible page text",
  });
});

test("suppresses extracted content on sensitive pages", () => {
  const result = normalizePageRead({
    sensitivePage: true,
    description: "should not survive",
    headings: ["Account"],
    selectedText: "private",
    excerpt: "private account information",
  });

  assert.deepEqual(result, {
    sensitivePage: true,
    description: "",
    headings: [],
    selectedText: "",
    excerpt: "",
  });
  assert.equal(pageReadToGoalText(result), "");
});

test("formats only user-visible bounded details for the goal", () => {
  const text = pageReadToGoalText({
    sensitivePage: false,
    selectedText: "Battery lasts 18 hours",
    description: "A thin laptop",
    headings: ["Model X", "Specifications"],
    excerpt: "16 GB RAM and 1 TB SSD",
  });

  assert.match(text, /Selected text: Battery lasts 18 hours/);
  assert.match(text, /Page description: A thin laptop/);
  assert.match(text, /Page headings: Model X \| Specifications/);
  assert.match(text, /Visible page excerpt: 16 GB RAM and 1 TB SSD/);
});
