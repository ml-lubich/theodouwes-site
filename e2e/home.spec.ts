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
    await expect(page.locator("#skills")).toBeVisible();
    await expect(page.locator("#work")).toBeVisible();
    await expect(page.locator("#projects")).toBeVisible();
    await expect(page.locator("#writing")).toBeVisible();
    await expect(page.locator("#connect")).toBeVisible();
  });

  test("exposes LinkedIn GitHub and Medium profile links", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: /LinkedIn/i }).first()).toHaveAttribute(
      "href",
      "https://www.linkedin.com/in/theo-douwes",
    );
    await expect(page.getByRole("link", { name: /GitHub/i }).first()).toHaveAttribute(
      "href",
      "https://github.com/TheoDouwes",
    );
    await expect(page.getByRole("link", { name: /Medium/i }).first()).toHaveAttribute(
      "href",
      "https://medium.com/Douwes.theo",
    );
  });

  test("serves robots sitemap and llms.txt for crawlers", async ({ request }) => {
    const robots = await request.get("/robots.txt");
    expect(robots.ok()).toBeTruthy();
    const robotsBody = await robots.text();
    expect(robotsBody).toContain("Sitemap:");
    expect(robotsBody).toMatch(/Allow:\s*\//);

    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.ok()).toBeTruthy();
    expect(await sitemap.text()).toContain("theodouwes.com");

    const llms = await request.get("/llms.txt");
    expect(llms.ok()).toBeTruthy();
    expect(await llms.text()).toContain("Theo Alexander Douwes");
  });

  test("links to Theo's GitHub profile", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("link", { name: "GitHub" }).last()).toHaveAttribute(
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

  test("mobile hamburger opens nav and scrolls to Work", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    const openMenu = page.getByRole("button", { name: "Open menu" });
    await expect(openMenu).toBeVisible();
    await openMenu.click();
    await expect(page.getByRole("button", { name: "Close menu" })).toBeVisible();

    await page
      .getByRole("navigation", { name: "Primary" })
      .getByRole("link", { name: "Work" })
      .click();
    await expect(page.locator("#work")).toBeInViewport();
    await expect(page.getByRole("button", { name: "Open menu" })).toBeVisible();
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


