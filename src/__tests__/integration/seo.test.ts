import { describe, expect, mock, test } from "bun:test";
import { profile } from "@/lib/profile";

mock.module("next/font/google", () => ({
  IBM_Plex_Sans: () => ({ variable: "--font-sans" }),
  IBM_Plex_Mono: () => ({ variable: "--font-mono" }),
  Source_Serif_4: () => ({ variable: "--font-serif" }),
}));

mock.module("next/og", () => ({
  ImageResponse: class {
    constructor(
      public readonly element: unknown,
      public readonly init: unknown,
    ) {}
  },
}));

const seo = () => import("@/lib/seo");
const layout = () => import("@/app/layout");

type Node = Record<string, unknown>;
const graph = async (): Promise<Node[]> =>
  ((await seo()).buildJsonLd() as unknown as { "@graph": Node[] })["@graph"];

describe("seo constants", () => {
  test("SITE_URL is the apex origin", async () => {
    expect((await seo()).SITE_URL).toBe("https://theodouwes.com");
  });

  test("title length <= 60", async () => {
    expect((await seo()).SITE_TITLE.length).toBeLessThanOrEqual(60);
  });

  test("description length is 140-160", async () => {
    const len = (await seo()).SITE_DESCRIPTION.length;
    expect(len).toBeGreaterThanOrEqual(140);
    expect(len).toBeLessThanOrEqual(160);
  });

  test("description keywords come from real site content", async () => {
    const { SITE_DESCRIPTION } = await seo();
    for (const kw of ["Navigara", "San Francisco", "Berkeley", "underwriting"]) {
      expect(SITE_DESCRIPTION).toContain(kw);
    }
  });
});

describe("googleVerification", () => {
  test("undefined when env var is missing", async () => {
    expect((await seo()).googleVerification({})).toBeUndefined();
  });

  test("undefined for empty string", async () => {
    const { googleVerification } = await seo();
    expect(googleVerification({ NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION: "" })).toBeUndefined();
  });

  test("undefined for whitespace-only value", async () => {
    const { googleVerification } = await seo();
    expect(googleVerification({ NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION: "   \t\n" })).toBeUndefined();
  });

  test("returns {google} for a provided value (trimmed)", async () => {
    const { googleVerification } = await seo();
    expect(googleVerification({ NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION: "  abc123 " })).toEqual({
      google: "abc123",
    });
  });
});

describe("JSON-LD", () => {
  test("round-trips through JSON", async () => {
    const ld = (await seo()).buildJsonLd();
    expect(JSON.parse(JSON.stringify(ld))).toEqual(ld);
  });

  test("context and graph shape", async () => {
    const ld = (await seo()).buildJsonLd() as unknown as Node;
    expect(ld["@context"]).toBe("https://schema.org");
    expect(Array.isArray(ld["@graph"])).toBe(true);
  });

  test("Person, WebSite, ProfilePage have the expected @ids", async () => {
    const { SITE_URL } = await seo();
    const g = await graph();
    const id = (t: string) => g.find((n) => n["@type"] === t)?.["@id"];
    expect(id("Person")).toBe(`${SITE_URL}/#person`);
    expect(id("WebSite")).toBe(`${SITE_URL}/#website`);
    expect(id("ProfilePage")).toBe(`${SITE_URL}/#profilepage`);
  });

  test("every @id is unique and starts with SITE_URL", async () => {
    const { SITE_URL } = await seo();
    const ids = (await graph()).map((n) => n["@id"] as string).filter(Boolean);
    expect(ids.length).toBeGreaterThanOrEqual(3);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id.startsWith(SITE_URL)).toBe(true);
  });

  test("ProfilePage and WebSite reference the person by @id", async () => {
    const { SITE_URL } = await seo();
    const g = await graph();
    const personRef = `${SITE_URL}/#person`;
    const page = JSON.stringify(g.find((n) => n["@type"] === "ProfilePage"));
    const site = JSON.stringify(g.find((n) => n["@type"] === "WebSite"));
    expect(page).toContain(`"@id":"${personRef}"`);
    expect(site).toContain(`"@id":"${personRef}"`);
  });

  test("telephone is only the already-public profile phone", async () => {
    const person = (await graph()).find((n) => n["@type"] === "Person");
    expect(person?.telephone).toBe(profile.links.phone);
  });

  test("serialized JSON-LD contains no </script (injection safety)", async () => {
    const raw = JSON.stringify((await seo()).buildJsonLd());
    expect(raw.toLowerCase()).not.toContain("</script");
  });
});

describe("layout metadata", () => {
  test("emits deploy markers and a color-scheme viewport", async () => {
    const { metadata, viewport } = await layout();
    const other = metadata.other as Record<string, string>;
    expect(other["site-design"]).toBe("editorial-v1");
    expect(other["generator-build"]).toMatch(/^[0-9a-f]{7}$|^dev$/);
    expect(viewport.colorScheme).toBe("light dark");
  });

  test("metadataBase, canonical apex, title, robots, openGraph, twitter", async () => {
    const { SITE_URL, SITE_TITLE } = await seo();
    const { metadata } = await layout();
    expect(metadata.metadataBase?.href.startsWith(SITE_URL)).toBe(true);
    expect(metadata.alternates?.canonical).toBe("/");
    expect(metadata.metadataBase?.host.startsWith("www.")).toBe(false);
    expect((metadata.title as { default: string }).default).toBe(SITE_TITLE);
    const robots = metadata.robots as { googleBot: Record<string, unknown> };
    expect(robots.googleBot["max-image-preview"]).toBe("large");
    expect(metadata.openGraph).toBeTruthy();
    expect(metadata.twitter).toBeTruthy();
  });

  test("keeps keywords/authors/category and defers images to file-based OG routes", async () => {
    const { SITE_TITLE, SITE_DESCRIPTION } = await seo();
    const { metadata } = await layout();
    expect(metadata.keywords).toContain("Theo Douwes");
    expect(metadata.authors).toBeTruthy();
    expect(metadata.category).toBe("technology");
    expect(metadata.openGraph?.images).toBeUndefined();
    expect(metadata.twitter?.images).toBeUndefined();
    expect(metadata.openGraph?.title).toBe(SITE_TITLE);
    expect(metadata.openGraph?.description).toBe(SITE_DESCRIPTION);
    expect(metadata.twitter?.description).toBe(SITE_DESCRIPTION);
  });
});

describe("sitemap", () => {
  test("includes home; all urls on apex; no /status or /api; lastModified set", async () => {
    const { SITE_URL } = await seo();
    const entries = (await import("@/app/sitemap")).default();
    const urls = entries.map((e) => e.url);
    expect(urls).toContain(SITE_URL);
    for (const e of entries) {
      expect(e.url.startsWith("https://theodouwes.com")).toBe(true);
      expect(e.url).not.toContain("/status");
      expect(e.url).not.toContain("/api");
      expect(e.lastModified).toBeTruthy();
    }
  });
});

describe("robots", () => {
  test("sitemap, host, and * rule", async () => {
    const { SITE_URL } = await seo();
    const r = (await import("@/app/robots")).default();
    expect(r.sitemap).toBe(`${SITE_URL}/sitemap.xml`);
    expect(r.host).toContain("theodouwes.com");
    const rules = Array.isArray(r.rules) ? r.rules : [r.rules];
    const star = rules.find((x) => x.userAgent === "*" || (Array.isArray(x.userAgent) && x.userAgent.includes("*")));
    expect(star).toBeDefined();
    const allow = ([] as string[]).concat(star?.allow ?? []);
    const disallow = ([] as string[]).concat(star?.disallow ?? []);
    expect(allow).toContain("/");
    expect(disallow).toContain("/status");
  });
});

describe("manifest", () => {
  test("has name, start_url '/', non-empty icons", async () => {
    const m = (await import("@/app/manifest")).default();
    expect(m.name).toBeTruthy();
    expect(m.start_url).toBe("/");
    expect((m.icons ?? []).length).toBeGreaterThan(0);
  });
});

describe("opengraph-image", () => {
  test("size 1200x630 and png content type", async () => {
    const og = await import("@/app/opengraph-image");
    expect(og.size).toEqual({ width: 1200, height: 630 });
    expect(og.contentType).toBe("image/png");
  });

  test("renders a card naming Theo and the apex domain", async () => {
    const og = await import("@/app/opengraph-image");
    const res = og.default() as unknown as { element: unknown; init: unknown };
    const text = JSON.stringify(res.element);
    expect(text).toContain("Theo Douwes");
    expect(text).toContain("theodouwes.com");
    expect(res.init).toEqual(og.size);
  });

  test("twitter-image reuses the OG card at 1200x630", async () => {
    const tw = await import("@/app/twitter-image");
    const og = await import("@/app/opengraph-image");
    expect(tw.default).toBe(og.default);
    expect(tw.size).toEqual({ width: 1200, height: 630 });
  });
});

describe("next.config redirects", () => {
  test("permanent www -> apex redirect", async () => {
    const cfg = (await import("../../../next.config")).default;
    const redirects = await cfg.redirects!();
    const r = redirects.find((x) =>
      (x.has ?? []).some((h) => h.type === "host" && h.value === "www.theodouwes.com"),
    );
    expect(r).toBeDefined();
    expect(r?.permanent).toBe(true);
    expect(r?.destination.startsWith("https://theodouwes.com")).toBe(true);
  });
});
