import { expect, test } from "@playwright/test";
import { setupMockApp } from "./helpers/mockApp";

test.describe("DataSentinel routes", () => {
  test.beforeEach(async ({ page }) => {
    await setupMockApp(page, { session: "tenant-admin" });
  });

  test("dashboard route renders the overview workspace", async ({ page }) => {
    await page.goto("/datasentinel/dashboard");

    await expect(
      page.getByRole("heading", { name: /^Security Dashboard$/i }),
    ).toBeVisible();
    await expect(page.getByText(/Security Overview/i)).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Open alerts queue/i }),
    ).toBeVisible();
  });

  test("activity route renders the monitoring workspace", async ({ page }) => {
    await page.goto("/datasentinel/activity");

    await expect(
      page.getByRole("heading", { name: /^Activity Monitoring$/i }),
    ).toBeVisible();
  });

  test("alerts route renders the triage workspace", async ({ page }) => {
    await page.goto("/datasentinel/alerts");

    await expect(
      page.getByRole("heading", { name: /^Security Alerts$/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /^Refresh$/i }),
    ).toBeVisible();
  });
});
