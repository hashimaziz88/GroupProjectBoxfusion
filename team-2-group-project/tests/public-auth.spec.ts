import { expect, test } from "@playwright/test";
import { setupMockApp } from "./helpers/mockApp";

test.describe("Public and auth routes", () => {
  test("entry route redirects anonymous users to landing", async ({ page }) => {
    await setupMockApp(page, { session: "anonymous" });

    await page.goto("/");

    await expect(page).toHaveURL(/\/landing$/);
    await expect(
      page.getByRole("heading", {
        name: /See everything happening/i,
      }),
    ).toBeVisible();
  });

  test("landing page shows product messaging and login CTA", async ({ page }) => {
    await setupMockApp(page, { session: "anonymous" });

    await page.goto("/landing");

    await expect(
      page.getByText("Database Activity Monitoring", { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Get started free/i }),
    ).toBeVisible();
    await page.getByRole("button", { name: /^Sign in$/i }).first().click();
    await expect(page).toHaveURL(/\/login$/);
  });

  test("login page can switch tenant context and then authenticate", async ({
    page,
  }) => {
    await setupMockApp(page, { session: "anonymous" });

    await page.goto("/login");

    await page.getByPlaceholder(/Enter a tenancy name/i).fill("Default");
    await page.getByRole("button", { name: /Change tenant/i }).click();

    await expect(
      page.getByText(/Tenant changed to Default\./i),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: /Register/i })).toBeVisible();

    await page.getByLabel(/Username or email/i).fill("admin");
    await page.getByLabel(/^Password$/i).fill("Password123!");
    await page.getByRole("button", { name: /^Log in$/i }).click();

    await expect(page).toHaveURL(/\/home$/);
    await expect(page.getByRole("heading", { name: /^Home$/i })).toBeVisible();
  });

  test("login page hides tenant registration prompts in host context", async ({
    page,
  }) => {
    await setupMockApp(page, { session: "anonymous" });

    await page.goto("/login");

    await expect(page.getByRole("link", { name: /Register/i })).toHaveCount(0);
    await expect(page.getByText(/Need a tenant account\?/i)).toHaveCount(0);
  });

  test("register page requires tenant context", async ({
    page,
  }) => {
    await setupMockApp(page, { session: "anonymous" });

    await page.goto("/register");
    await expect(
      page.getByText(/Self-registration is only available within a tenant/i),
    ).toBeVisible();
  });

  test("register page supports tenant registration", async ({
    page,
  }) => {
    await setupMockApp(page, { session: "tenant-context" });

    await page.goto("/register");

    await expect(
      page.getByRole("heading", { name: /^Register$/i }),
    ).toBeVisible();
    await page.getByLabel(/^Name$/i).fill("Grace");
    await page.getByLabel(/^Surname$/i).fill("Hopper");
    await page.getByLabel(/Email address/i).fill("grace.hopper@default.com");
    await page.getByLabel(/^Username$/i).fill("grace.hopper");
    await page.getByLabel(/^Password$/i).fill("Password123!");
    await page.getByRole("button", { name: /^Register$/i }).click();

    await expect(page).toHaveURL(/\/home$/);
    await expect(page.getByRole("heading", { name: /^Home$/i })).toBeVisible();
  });

  test("protected routes redirect anonymous users to login", async ({ page }) => {
    await setupMockApp(page, { session: "anonymous" });

    await page.goto("/home");

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole("heading", { name: /^Log in$/i })).toBeVisible();
  });
});
