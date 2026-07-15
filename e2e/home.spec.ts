import { expect, test } from "@playwright/test";

test.describe("Theo Douwes site", () => {
  test("loads hero with brand, photo, and primary CTA", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      /Theo\s+Douwes/i,
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

  test("renders rotatable brain beneath the hero name", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".hero-brain")).toBeVisible();
    await expect(page.locator(".hero-brand-last")).toHaveText(/Douwes/i);
    await expect(page.getByText(/Drag to rotate/i)).toBeVisible();

    const nameBox = await page.locator(".hero-brand").boundingBox();
    const brainBox = await page.locator(".hero-brain").boundingBox();
    const portraitBox = await page.locator(".hero-media").boundingBox();
    expect(nameBox).not.toBeNull();
    expect(brainBox).not.toBeNull();
    expect(portraitBox).not.toBeNull();
    expect(brainBox!.y).toBeGreaterThan(nameBox!.y + nameBox!.height - 1);
    expect(brainBox!.x).toBeLessThan(portraitBox!.x);
  });
});
