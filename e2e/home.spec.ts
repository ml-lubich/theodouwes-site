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
    await expect(
      page.getByRole("link", { name: /LinkedIn/i }).first(),
    ).toHaveAttribute("href", "https://www.linkedin.com/in/theo-douwes");
    await expect(
      page.getByRole("link", { name: /GitHub/i }).first(),
    ).toHaveAttribute("href", "https://github.com/TheoDouwes");
    await expect(
      page.getByRole("link", { name: /Medium/i }).first(),
    ).toHaveAttribute("href", "https://medium.com/Douwes.theo");
  });

  test("serves robots sitemap and llms.txt for crawlers", async ({
    request,
  }) => {
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

    await expect(
      page.getByRole("link", { name: "GitHub" }).last(),
    ).toHaveAttribute("href", "https://github.com/TheoDouwes");
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

  for (const width of [1000, 1280, 1920]) {
    test(`keeps the Skillstorm compact, readable, and inside its stage at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 1200 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto("/");
      await page.locator(".skill-storm").scrollIntoViewIfNeeded();

      const layout = await page.locator(".skill-pill").evaluateAll((pills) => {
        const stage = document
          .querySelector(".skill-storm")!
          .getBoundingClientRect();
        const catalog = document
          .querySelector(".skills-catalog")!
          .getBoundingClientRect();
        const rotator = document.querySelector<HTMLElement>(".skill-storm-3d")!;
        const overflow: string[] = [];
        const overlaps: string[] = [];

        for (const angle of Array.from(
          { length: 24 },
          (_, index) => index * 15,
        )) {
          rotator.style.setProperty("--storm-angle", `${angle}deg`);
          const boxes = pills.map((pill) => {
            const rect = pill.getBoundingClientRect();
            return {
              text: pill.textContent ?? "",
              left: rect.left,
              right: rect.right,
              top: rect.top,
              bottom: rect.bottom,
            };
          });
          overflow.push(
            ...boxes
              .filter(
                (pill) =>
                  pill.left < Math.max(0, stage.left) ||
                  pill.right > Math.min(window.innerWidth, stage.right) ||
                  pill.top < stage.top ||
                  pill.bottom > stage.bottom ||
                  pill.bottom > catalog.top,
              )
              .map((pill) => `${angle}:${pill.text}`),
          );
          for (let index = 0; index < boxes.length; index++) {
            for (let other = index + 1; other < boxes.length; other++) {
              const x = Math.max(
                0,
                Math.min(boxes[index].right, boxes[other].right) -
                  Math.max(boxes[index].left, boxes[other].left),
              );
              const y = Math.max(
                0,
                Math.min(boxes[index].bottom, boxes[other].bottom) -
                  Math.max(boxes[index].top, boxes[other].top),
              );
              if (x * y > 8) {
                overlaps.push(
                  `${angle}:${boxes[index].text}|${boxes[other].text}`,
                );
              }
            }
          }
        }
        return {
          count: pills.length,
          height: stage.height,
          overflow,
          overlaps,
        };
      });

      expect(layout.count).toBeLessThanOrEqual(48);
      expect(layout.height).toBeLessThanOrEqual(700);
      expect(layout.overflow).toEqual([]);
      expect(layout.overlaps).toEqual([]);
    });
  }

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
    await expect(
      page.getByRole("button", { name: "Close menu" }),
    ).toBeVisible();

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

  // The hero grid only splits into two columns at 900px, so the whole
  // sub-900px range (small phones through resized/portrait tablet
  // windows) must get the centered single-column treatment.
  for (const width of [375, 700, 850]) {
    test(`centers the hero name and brain at ${width}px wide`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/");

      // Measure actual glyph extent (not the stretched block box) via a Range.
      const glyphRect = await page.evaluate(() => {
        const el = document.querySelector(".hero-brand-last");
        if (!el) return null;
        const range = document.createRange();
        range.selectNodeContents(el);
        const r = range.getBoundingClientRect();
        return { x: r.x, width: r.width };
      });
      const brainBox = await page.locator(".hero-brain").boundingBox();
      expect(glyphRect).not.toBeNull();
      expect(brainBox).not.toBeNull();

      const viewportCenter = width / 2;
      const nameCenter = glyphRect!.x + glyphRect!.width / 2;
      const brainCenter = brainBox!.x + brainBox!.width / 2;

      expect(Math.abs(nameCenter - viewportCenter)).toBeLessThan(20);
      expect(Math.abs(brainCenter - viewportCenter)).toBeLessThan(20);
    });
  }

  test("theme toggle switches to light mode with black brain", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("theo-theme", "dark");
    });
    await page.goto("/");
    const toggle = page.getByRole("button", { name: /Switch to light mode/i });
    await expect(toggle).toBeVisible();
    await toggle.click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await expect(
      page.getByRole("button", { name: /Switch to dark mode/i }),
    ).toBeVisible();
    await expect(page.locator(".brain-stage")).toHaveAttribute(
      "data-brain-color",
      "#000000",
    );
  });
});
