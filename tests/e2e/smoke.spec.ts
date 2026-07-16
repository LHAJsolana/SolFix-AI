import { expect, test } from "@playwright/test";

test("landing page and demo flow render", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Find the instruction that broke." })).toBeVisible();
  await page.getByRole("button", { name: /Load example/i }).first().click();
  await expect(page.getByRole("heading", { name: /Insufficient SOL balance/i })).toBeVisible();
  await expect(page.getByText("Raw logs").last()).toBeVisible();
});

test("invalid signature shows validation error", async ({ page }) => {
  await page.goto("/analyze");
  await page.getByLabel("Transaction signature").fill("not-real");
  await page.getByRole("button", { name: /Inspect transaction/i }).click();
  await expect(page.getByText(/64-88 base58/i)).toBeVisible();
});
