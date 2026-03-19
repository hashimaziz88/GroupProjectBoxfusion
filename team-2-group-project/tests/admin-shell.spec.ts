import { expect, test } from "@playwright/test";
import { setupMockApp } from "./helpers/mockApp";

test.describe("Admin and shell routes", () => {
  test("tenant admin sees tenant navigation from the dashboard", async ({
    page,
  }) => {
    await setupMockApp(page, { session: "tenant-admin" });

    await page.goto("/datasentinel/dashboard");
    await expect(
      page.getByRole("heading", { name: /^Security Dashboard$/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("menuitem", { name: /^Dashboard$/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("menuitem", { name: /^Infrastructure$/i }),
    ).toBeVisible();
    await expect(page.getByRole("menuitem", { name: /^Reports$/i })).toBeVisible();
    await expect(page.getByRole("menuitem", { name: /^Users$/i })).toBeVisible();
    await expect(page.getByRole("menuitem", { name: /^Roles$/i })).toBeVisible();
    await expect(page.getByRole("menuitem", { name: /^Tenants$/i })).toHaveCount(0);
    await expect(page.getByRole("button", { name: /^Log out$/i })).toBeVisible();
  });

  test("host admin sees host navigation without tenant-only sections", async ({
    page,
  }) => {
    await setupMockApp(page, { session: "host-admin" });

    await page.goto("/users");
    await expect(
      page.getByRole("heading", { name: /^Users$/i }),
    ).toBeVisible();
    await expect(page.getByRole("menuitem", { name: /^Tenants$/i })).toBeVisible();
    await expect(page.getByRole("menuitem", { name: /^Users$/i })).toBeVisible();
    await expect(page.getByRole("menuitem", { name: /^Roles$/i })).toBeVisible();
    await expect(
      page.getByRole("menuitem", { name: /^Dashboard$/i }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("menuitem", { name: /^Infrastructure$/i }),
    ).toHaveCount(0);
    await expect(page.getByRole("menuitem", { name: /^Reports$/i })).toHaveCount(0);
  });
});
