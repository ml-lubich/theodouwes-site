import { expect, test } from "@playwright/test";

test.describe("Theo Douwes site", () => {
  test("loads hero with brand, photo, and primary CTA", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      /Theo Douwes/i,
    );
    await expect(
      page.getByText(/Quantifying developer productivity/i),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "View work" })).toBeVisible();
    await expect(
      page.getByRole("img", { name: /Theo Alexander Douwes/i }),
    ).toBeVisible();
  });

  test("exposes primary sections", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator("#about")).toBeVisible();
    await expect(page.locator("#work")).toBeVisible();
    await expect(page.locator("#featured")).toBeVisible();
    await expect(page.locator("#writing")).toBeVisible();
  });

  test("lists Navigara experience", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByText("Navigara").first()).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /Open-source Researcher/i }),
    ).toBeVisible();
  });

  test("nav anchors scroll to sections", async ({ page }) => {
    await page.goto("/");
    await page
      .getByRole("navigation", { name: "Primary" })
      .getByRole("link", { name: "Work" })
      .click();
    await expect(page.locator("#work")).toBeInViewport();
  });

  test("renders rotatable brain behind Douwes", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".brain-behind")).toBeVisible();
    await expect(page.locator(".hero-brand-last")).toHaveText(/Douwes/i);
    await expect(page.getByText(/Drag to rotate/i)).toBeVisible();
  });
});
