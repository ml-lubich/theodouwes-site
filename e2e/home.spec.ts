import { expect, test } from "@playwright/test";

test.describe("Theo Douwes site", () => {
  test("loads hero with brand, photo, and primary CTA", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      /Theo\s+Douwes/i,
    );
    await expect(
      page.getByText(/Statistics graduate building GTM systems/i),
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
    await expect(page.locator("#projects")).toBeVisible();
    await expect(page.locator("#writing")).toBeVisible();
  });

  test("links to Theo's GitHub profile", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("link", { name: "GitHub" })).toHaveAttribute(
      "href",
      "https://github.com/TheoDouwes",
    );
  });

  test("lists Navigara experience", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByText("Navigara").first()).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /GTM and Sales Engineer/i }),
    ).toBeVisible();
  });

  test("shows documented acquisition stats", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("$5.88M").first()).toBeVisible();
    await expect(page.getByText("400+").first()).toBeVisible();
  });

  test("nav anchors scroll to sections", async ({ page }) => {
    await page.goto("/");
    await page
      .getByRole("navigation", { name: "Primary" })
      .getByRole("link", { name: "Work" })
      .click();
    await expect(page.locator("#work")).toBeInViewport();
  });

  test("renders rotatable brain behind the hero name", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".hero-brain")).toBeVisible();
    await expect(page.locator(".hero-brand-last")).toHaveText(/Douwes/i);
    await expect(page.locator(".hero-brain .brain-stage")).toBeVisible();

    const nameBox = await page.locator(".hero-brand").boundingBox();
    const brainBox = await page.locator(".hero-brain").boundingBox();
    const portraitBox = await page.locator(".hero-media").boundingBox();
    expect(nameBox).not.toBeNull();
    expect(brainBox).not.toBeNull();
    expect(portraitBox).not.toBeNull();
    // Brain is a name backdrop in the copy column, left of the portrait.
    expect(brainBox!.x).toBeLessThan(portraitBox!.x);
    expect(brainBox!.width).toBeGreaterThan(80);
    expect(brainBox!.height).toBeGreaterThan(80);
  });
});


