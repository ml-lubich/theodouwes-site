import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import {
  __resetBuckets,
  acquireSlot,
  buildCookie,
  CHAT_LIMITS,
  checkRateLimit,
  clientIp,
  COOKIE_NAME,
  decodeCookie,
  encodeCookie,
  releaseSlot,
} from "./rate-limit";

beforeEach(() => {
  __resetBuckets();
  process.env.CHAT_RATE_SECRET = "test-secret";
});

afterEach(() => {
  delete process.env.CHAT_RATE_SECRET;
});

describe("checkRateLimit", () => {
  test("grants a fresh visitor a cookie and counts down remaining", () => {
    const decision = checkRateLimit("1.1.1.1", undefined, 1000);
    expect(decision.ok).toBe(true);
    if (decision.ok) expect(decision.remaining).toBe(CHAT_LIMITS.cookie.max - 1);
  });

  test("reuses and increments an existing valid cookie", () => {
    const first = checkRateLimit("1.1.1.2", undefined, 1000);
    if (!first.ok) throw new Error("expected ok");
    const second = checkRateLimit("1.1.1.2", first.cookie, 1500);
    expect(second.ok).toBe(true);
    if (second.ok) expect(second.remaining).toBe(CHAT_LIMITS.cookie.max - 2);
  });

  // Each step is spaced past the 20s burst window so only the limit under
  // test — never the burst guard — is what trips.
  const BEYOND_BURST = CHAT_LIMITS.burst.windowMs + 1000;

  test("refuses once the cookie quota is exhausted", () => {
    let cookie: string | undefined;
    const now = 1000;
    for (let i = 0; i < CHAT_LIMITS.cookie.max; i++) {
      const d = checkRateLimit("1.1.1.3", cookie, now + i * BEYOND_BURST);
      if (!d.ok) throw new Error("unexpected refusal while under quota");
      cookie = d.cookie;
    }
    const refused = checkRateLimit("1.1.1.3", cookie, now + CHAT_LIMITS.cookie.max * BEYOND_BURST);
    expect(refused.ok).toBe(false);
    if (!refused.ok) expect(refused.reason).toBe("cookie");
  });

  test("charges the IP floor even with no cookie, so clearing cookies buys nothing", () => {
    const now = 2000;
    for (let i = 0; i < CHAT_LIMITS.ip.max; i++) {
      const d = checkRateLimit("2.2.2.2", undefined, now + i * BEYOND_BURST);
      expect(d.ok).toBe(true);
    }
    const refused = checkRateLimit("2.2.2.2", undefined, now + CHAT_LIMITS.ip.max * BEYOND_BURST);
    expect(refused.ok).toBe(false);
    if (!refused.ok) expect(refused.reason).toBe("ip");
  });

  test("stops a scripted burst regardless of the hourly budget", () => {
    const now = 3000;
    for (let i = 0; i < CHAT_LIMITS.burst.max; i++) {
      expect(checkRateLimit("3.3.3.3", undefined, now).ok).toBe(true);
    }
    const refused = checkRateLimit("3.3.3.3", undefined, now);
    expect(refused.ok).toBe(false);
    if (!refused.ok) expect(refused.reason).toBe("burst");
  });

  test("refuses a replayed (stale) cookie rather than granting a quota reset", () => {
    const now = 4000;
    const early = checkRateLimit("4.4.4.4", undefined, now);
    if (!early.ok) throw new Error("expected ok");
    const later = checkRateLimit("4.4.4.4", early.cookie, now + 1);
    if (!later.ok) throw new Error("expected ok");

    // Replaying the early (lower-count) cookie must be refused, not honoured.
    const replayed = checkRateLimit("4.4.4.4", early.cookie, now + 2);
    expect(replayed.ok).toBe(false);
    if (!replayed.ok) expect(replayed.reason).toBe("replay");
  });

  test("a forged cookie (bad signature) is treated as no cookie, not an error", () => {
    const forged = "sid.1000.0.not-a-real-signature";
    const decision = checkRateLimit("5.5.5.5", forged, 1000);
    expect(decision.ok).toBe(true);
  });
});

describe("cookie encode/decode", () => {
  test("round-trips a window", () => {
    const w = { sid: "abc", start: 100, count: 3 };
    expect(decodeCookie(encodeCookie(w))).toEqual(w);
  });

  test("rejects malformed input without throwing", () => {
    expect(decodeCookie(undefined)).toBeNull();
    expect(decodeCookie("")).toBeNull();
    expect(decodeCookie("only.two.parts")).toBeNull();
    expect(decodeCookie("a.b.c.d")).toBeNull();
  });

  test("buildCookie sets HttpOnly, SameSite=Lax and the theoai_q name", () => {
    const header = buildCookie("value");
    expect(header).toContain(`${COOKIE_NAME}=value`);
    expect(header).toContain("HttpOnly");
    expect(header).toContain("SameSite=Lax");
  });
});

describe("clientIp", () => {
  test("takes the first hop of x-forwarded-for", () => {
    expect(clientIp(new Headers({ "x-forwarded-for": "9.9.9.9, 1.1.1.1" }))).toBe("9.9.9.9");
  });

  test("falls back to x-real-ip, then unknown", () => {
    expect(clientIp(new Headers({ "x-real-ip": "8.8.8.8" }))).toBe("8.8.8.8");
    expect(clientIp(new Headers())).toBe("unknown");
  });
});

describe("concurrency slots", () => {
  test("caps in-flight streams per IP and releases idempotently", () => {
    const release1 = acquireSlot("6.6.6.6");
    const release2 = acquireSlot("6.6.6.6");
    expect(release1).not.toBeNull();
    expect(release2).not.toBeNull();
    expect(acquireSlot("6.6.6.6")).toBeNull(); // concurrent limit is 2

    release1?.();
    release1?.(); // double-release must not free a slot twice
    expect(acquireSlot("6.6.6.6")).not.toBeNull();

    releaseSlot("6.6.6.6");
    release2?.();
  });
});
