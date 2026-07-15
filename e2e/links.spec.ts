import { expect, test, type APIRequestContext, type Page } from "@playwright/test";

const DEAD_STATUSES = new Set([404, 410, 500, 501, 502, 503, 504]);
const SKIP_PROTOCOLS = /^(mailto:|tel:|javascript:)/i;

function isHashOnly(href: string): boolean {
  return href.startsWith("#");
}

function escapeCssId(id: string): string {
  return id.replace(/([ !"#$%&'()*+,./:;<=>?@[\\\]^`{|}~])/g, "\\$1");
}

function sameOrigin(url: string, baseURL: string): boolean {
  try {
    return new URL(url).origin === new URL(baseURL).origin;
  } catch {
    return false;
  }
}

function normalizeHref(href: string, baseURL: string): string | null {
  if (SKIP_PROTOCOLS.test(href)) return null;
  if (isHashOnly(href)) return href;
  try {
    return new URL(href, baseURL).toString();
  } catch {
    return null;
  }
}

async function collectPageHrefs(page: Page): Promise<string[]> {
  return page.$$eval("a[href]", (anchors) =>
    anchors
      .map((a) => a.getAttribute("href"))
      .filter((href): href is string => typeof href === "string" && href.trim().length > 0),
  );
}

async function statusForUrl(
  request: APIRequestContext,
  url: string,
): Promise<number> {
  const head = await request.fetch(url, {
    method: "HEAD",
    maxRedirects: 5,
    failOnStatusCode: false,
  });
  let status = head.status();
  if (status === 405 || status === 501 || status === 403) {
    const get = await request.fetch(url, {
      method: "GET",
      maxRedirects: 5,
      failOnStatusCode: false,
    });
    status = get.status();
  }
  return status;
}

/**
 * Dynamically explore the site graph starting at `/`:
 * - crawl same-origin pages discovered via links
 * - validate every outbound URL is not 404/5xx
 * - validate in-page anchors resolve
 * - validate critical static assets
 */
test.describe("dynamic link explorer", () => {
  test("explores all reachable links without 404/5xx", async ({
    page,
    request,
    baseURL,
  }) => {
    expect(baseURL).toBeTruthy();
    const origin = baseURL!;

    const queue: string[] = [new URL("/", origin).toString()];
    const visitedPages = new Set<string>();
    const checkedUrls = new Set<string>();
    const problems: string[] = [];
    const checkedOutbound: string[] = [];

    // Seed with known static assets.
    for (const asset of ["/theo.webp", "/brain.bin", "/icon"]) {
      const assetUrl = new URL(asset, origin).toString();
      const status = await statusForUrl(request, assetUrl);
      checkedUrls.add(assetUrl);
      if (DEAD_STATUSES.has(status) || status >= 400) {
        problems.push(`asset ${assetUrl} → HTTP ${status}`);
      }
    }

    while (queue.length > 0 && visitedPages.size < 25) {
      const current = queue.shift()!;
      const pageKey = current.split("#")[0]!;
      if (visitedPages.has(pageKey)) continue;
      visitedPages.add(pageKey);

      const nav = await page.goto(pageKey, { waitUntil: "domcontentloaded" });
      const navStatus = nav?.status() ?? 0;
      if (DEAD_STATUSES.has(navStatus)) {
        problems.push(`page ${pageKey} → HTTP ${navStatus}`);
        continue;
      }

      const hrefs = await collectPageHrefs(page);
      for (const raw of hrefs) {
        const href = normalizeHref(raw, pageKey);
        if (!href) continue;

        if (isHashOnly(raw)) {
          const id = raw.slice(1);
          if (!id) continue;
          const exists = await page.locator(`#${escapeCssId(id)}`).count();
          if (exists === 0) {
            problems.push(`Missing anchor on ${pageKey}: ${raw}`);
          }
          continue;
        }

        if (checkedUrls.has(href)) continue;
        checkedUrls.add(href);

        if (sameOrigin(href, origin)) {
          const pathOnly = href.split("#")[0]!;
          if (!visitedPages.has(pathOnly) && !queue.includes(pathOnly)) {
            queue.push(pathOnly);
          }
          const status = await statusForUrl(request, pathOnly);
          if (DEAD_STATUSES.has(status)) {
            problems.push(`${pathOnly} → HTTP ${status}`);
          }
          continue;
        }

        checkedOutbound.push(href);
        const status = await statusForUrl(request, href);
        // Bot walls (LinkedIn 999/403) are not dead links.
        if (DEAD_STATUSES.has(status)) {
          problems.push(`${href} → HTTP ${status}`);
        }
      }
    }

    expect(visitedPages.size).toBeGreaterThan(0);
    expect(checkedUrls.size).toBeGreaterThan(5);
    expect(problems, problems.join("\n") || "dead links found").toEqual([]);
  });
});
