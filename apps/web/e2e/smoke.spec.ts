import { expect, test } from "@playwright/test";

const recommendation = {
  id: "offer-test-1",
  providerId: "provider-test",
  providerName: "Test Provider",
  providerDomain: "provider.test",
  category: "laptop",
  title: "Test Laptop",
  description: "Active provider offer for contract testing.",
  price: 949,
  currency: "USD",
  availability: "in_stock",
  delivery: "Estimated by Friday",
  returns: "30-day returns",
  warranty: "1-year limited warranty",
  sourceUrl: "https://provider.test/products/test-laptop",
  retrievedAt: "2026-08-07T12:00:00Z",
  strengths: ["Fits the stated budget.", "Provider reports the item in stock."],
  tradeoffs: ["Returns: 30-day returns.", "Warranty: 1-year limited warranty."],
  evidence: { sourceType: "provider_feed" },
  recommendationIndependent: true,
};

const compareQuery =
  "Find a laptop under $1,000 for video editing, delivered by next week, with free returns.";
const continueUrl = "https://provider.test/action?attr=attr-test-1";

const outcome = {
  id: "outcome-test-1",
  taskId: "task-test-1",
  offerId: recommendation.id,
  offerTitle: recommendation.title,
  providerId: recommendation.providerId,
  providerName: recommendation.providerName,
  providerDomain: recommendation.providerDomain,
  status: "confirmed",
  amount: recommendation.price,
  currency: recommendation.currency,
  userConfirmed: true,
  completionEvidence: null,
  reversalDeadline: "2026-09-06T12:00:00Z",
  createdAt: "2026-08-07T12:00:00Z",
  updatedAt: "2026-08-07T12:01:00Z",
};

test("consumer can explicitly choose Compare, confirm a provider handoff, and view the outcome receipt", async ({ page }) => {
  await page.route("https://api.contract.test/v1/compare", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        taskId: "task-test-1",
        query: compareQuery,
        category: "laptop",
        constraints: {
          budget: 1000,
          useCase: "video editing",
          delivery: "by next week",
          returns: "free returns",
        },
        recommendations: [recommendation],
        incomplete: false,
        recommendationPolicy: {
          commissionUsedForRanking: false,
          bidsUsedForRanking: false,
          expectedRevenueUsedForRanking: false,
        },
      }),
    });
  });

  await page.route("https://api.contract.test/v1/prepare", async (route) => {
    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({
        outcomeId: outcome.id,
        taskId: outcome.taskId,
        status: "prepared",
        offer: recommendation,
        reversalDeadline: outcome.reversalDeadline,
        userConfirmationRequired: true,
      }),
    });
  });

  await page.route("https://api.contract.test/v1/outcomes/outcome-test-1/confirm", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ outcome, continueUrl }),
    });
  });

  await page.route("https://api.contract.test/v1/outcomes/outcome-test-1", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ outcome, events: [] }),
    });
  });

  await page.goto("/");
  await expect(page.getByRole("heading", { name: "New task" })).toBeVisible();

  const prompt = page.getByRole("textbox", { name: /search, compare, or prepare/i });
  await expect(prompt).toHaveValue("");
  await prompt.fill(compareQuery);
  await page.getByRole("button", { name: "Compare" }).click();
  await expect(page.getByRole("button", { name: "Compare" })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: /continue with compare/i }).click();

  await expect(page).toHaveURL(/\/compare\?mode=compare/);
  await expect(page.getByRole("heading", { name: /find a laptop under/i })).toBeVisible();
  await expect(page.getByText(/commission, bids, partner level/i)).toBeVisible();
  await expect(page.getByLabel("Independent recommendations").getByText("Test Laptop", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: /prepare with this provider/i }).click();
  await expect(page).toHaveURL(/\/confirm/);
  await expect(page.getByRole("heading", { name: /review the provider handoff/i })).toBeVisible();
  await expect(page.getByText("provider.test", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: /confirm handoff to test provider/i }).click();
  await expect(page).toHaveURL(/\/outcomes\/outcome-test-1/);
  await expect(page.getByRole("heading", { name: /provider handoff recorded/i })).toBeVisible();
  await expect(page.getByText("attr-test-1", { exact: true })).toHaveCount(0);
  await expect(page.getByText(/no authenticated provider event/i)).toBeVisible();
  await expect(page.getByRole("link", { name: /continue to test provider/i })).toHaveAttribute(
    "href",
    continueUrl,
  );
});

test("browser extension context stays separate from the stored Compare goal and strips URL secrets", async ({ page }) => {
  let requestBody: {
    query?: string;
    category?: string;
    pageContext?: { title?: string; url?: string };
  } = {};

  await page.route("https://api.contract.test/v1/compare", async (route) => {
    requestBody = route.request().postDataJSON() as typeof requestBody;
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        taskId: "task-context-1",
        query: requestBody.query,
        category: "laptop",
        constraints: {
          budget: 1000,
          useCase: "not specified",
          delivery: "not specified",
          returns: "not specified",
        },
        recommendations: [recommendation],
        incomplete: false,
        pageContextUsed: true,
        recommendationPolicy: {
          commissionUsedForRanking: false,
          bidsUsedForRanking: false,
          expectedRevenueUsedForRanking: false,
        },
      }),
    });
  });

  const goal = "Compare this with better laptops under $1,000";
  const params = new URLSearchParams({
    mode: "compare",
    q: goal,
    ctx_source: "extension",
    ctx_title: "Current Laptop Product",
    ctx_url: "https://user:secret@shop.example/products/current?session=abc#checkout",
  });

  await page.goto(`/#/compare?${params.toString()}`);

  await expect(page.getByText("Current page", { exact: true })).toBeVisible();
  await expect(page.getByText("Current Laptop Product", { exact: true })).toBeVisible();
  await expect(page.getByText("shop.example", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: goal })).toBeVisible();
  await expect.poll(() => requestBody.query).toBe(goal);
  expect(requestBody.category).toBeUndefined();
  expect(requestBody.pageContext).toEqual({
    title: "Current Laptop Product",
    url: "https://shop.example/products/current",
  });
  expect(JSON.stringify(requestBody)).not.toContain("session=abc");
  expect(JSON.stringify(requestBody)).not.toContain("secret@");
  expect(JSON.stringify(requestBody)).not.toContain("#checkout");
});
