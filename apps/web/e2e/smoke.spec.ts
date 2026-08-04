import { expect, test } from "@playwright/test";

test("U.S. consumer can compare and review a prepared purchase", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: /what do you want to find or get done/i })).toBeVisible();

  const prompt = page.getByRole("textbox", { name: /search, compare, or prepare/i });
  await prompt.focus();
  await prompt.press("ArrowDown");
  await prompt.press("Enter");

  await expect(page).toHaveURL(/\/compare\?mode=compare/);
  await expect(page.getByRole("heading", { name: /find a laptop under/i })).toBeVisible();
  await expect(page.getByText(/demo data for interface testing/i)).toBeVisible();

  await page.getByRole("button", { name: /prepare to buy/i }).click();
  await expect(page).toHaveURL(/\/confirm/);
  await expect(page.getByRole("heading", { name: /review and confirm/i })).toBeVisible();
  await expect(page.getByText("bestbuy.com", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: /confirm with system verification/i }).click();
  await expect(page.getByRole("heading", { name: /purchase preparation completed/i })).toBeVisible();
  await expect(page.getByText(/no real order or payment was submitted/i)).toBeVisible();
});
