import { expect, test } from "@playwright/test";

const hasBaseUrl = Boolean(process.env.E2E_BASE_URL);

test.describe("RideSync smoke", () => {
  test.skip(!hasBaseUrl, "Set E2E_BASE_URL to run smoke coverage against a deployed web build.");

  test("loads auth entry from root", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Set up a secure identity before you join the ride.")).toBeVisible();
  });

  test("loads the design showcase route", async ({ page }) => {
    await page.goto("/internal/design-showcase");
    await expect(page.getByText("Design showcase")).toBeVisible();
  });
});
