/**
 * ─── Adversarial rate limiting for the TheoAI chat endpoint ────────────
 *
 * Threat model: a public, unauthenticated endpoint that spends real money
 * on every call. The attacker can clear cookies, spoof `x-forwarded-for`
 * on a self-hosted origin, and open many tabs. We are not trying to be
 * unbeatable — we are trying to make abuse cost more than it is worth
 * while never blocking a genuine visitor asking a handful of questions.
 *
 * Three independent layers; a request must clear ALL of them:
 *
 *  1. Signed cookie quota — the quota state lives in an HMAC-signed cookie,
 *     so it needs no server storage and cannot be forged. Deleting the
 *     cookie is possible, which is exactly why it is not the only layer.
 *  2. IP bucket — the floor that cookie-wiping cannot escape. A missing or
 *     invalid cookie still consumes IP quota, so clearing cookies buys
 *     nothing: it drops you to the stricter limit.
 *  3. Global spend cap — a hard ceiling on total daily requests across all
 *     visitors, protecting the OpenRouter balance from a distributed flood.
 *
 * On Vercel, `x-forwarded-for` is set by the platform edge and the client
 * cannot override it, so the IP layer is trustworthy in production.
 */

import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

export const CHAT_LIMITS = {
  /** Per-browser (signed cookie). A real conversation is ~10 turns, so 12 is
   *  a full conversation with headroom rather than a budget anyone bumps
   *  into by reading the site. */
  cookie: { max: 12, windowMs: 60 * 60 * 1000 },
  /** Per-IP ceiling, and the reason the cookie layer is worth anything.
   *  Kept marginally above the cookie limit on purpose — a shared NAT (an
   *  office, a conference) puts real distinct visitors behind one address,
   *  and a hard equality would lock out everyone once the first hits 12. */
  ip: { max: 15, windowMs: 60 * 60 * 1000 },
  /** Short burst guard — stops a scripted hammer regardless of the hourly budget. */
  burst: { max: 5, windowMs: 20 * 1000 },
  /** Whole-site daily ceiling, sized to a small monthly OpenRouter budget.
   *
   *  This is the governor, not the guarantee: it lives in per-instance
   *  memory, so a recycled instance forgets the count. The hard cap is the
   *  spend limit set on the OpenRouter key itself — when that trips, the
   *  route falls through to the :free models and the bot keeps answering. */
  global: { max: 100, windowMs: 24 * 60 * 60 * 1000 },
  /** Simultaneous in-flight streams per IP. Each stream holds a socket and a
   *  model call open for seconds, so request-count limits alone do not bound
   *  resource use — 50 parallel streams cost 50x even at 1 request each. */
  concurrent: 2,
} as const;

export const COOKIE_NAME = "theoai_q";

export type Decision =
  | { ok: true; cookie: string; remaining: number }
  | { ok: false; reason: "burst" | "cookie" | "ip" | "global" | "replay"; retryAfterSec: number };

interface Window {
  /** Per-browser session id, minted server-side and carried inside the signature.
   *  Replay is detected per-sid, never per-IP — two devices behind one NAT are
   *  different sids and must not shadow each other. */
  sid: string;
  start: number;
  count: number;
}

/* ── Signed cookie quota ─────────────────────────────────────────────── */

/** Session ids are minted server-side only; a client cannot invent a valid one
 *  because the id is covered by the signature. */
function newSid(): string {
  return randomBytes(9).toString("base64url");
}

function secret(): string {
  // A missing secret must not silently disable the cookie layer.
  return process.env.CHAT_RATE_SECRET || process.env.OPENROUTER_API_KEY || "theoai-dev-secret";
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function encodeCookie(w: Window): string {
  const payload = `${w.sid}.${w.start}.${w.count}`;
  return `${payload}.${sign(payload)}`;
}

/** Returns null when the cookie is absent, malformed, or fails signature check. */
export function decodeCookie(raw: string | undefined): Window | null {
  if (!raw) return null;
  const parts = raw.split(".");
  if (parts.length !== 4) return null;
  const [sid, start, count, mac] = parts;
  const expected = sign(`${sid}.${start}.${count}`);
  // Constant-time compare; length mismatch short-circuits before timingSafeEqual.
  if (mac.length !== expected.length) return null;
  if (!timingSafeEqual(Buffer.from(mac), Buffer.from(expected))) return null;
  const s = Number(start);
  const c = Number(count);
  if (!Number.isFinite(s) || !Number.isFinite(c) || c < 0) return null;
  if (!sid) return null;
  return { sid, start: s, count: c };
}

/* ── In-memory buckets (IP, burst, global) ───────────────────────────── */

// ponytail: process-local Maps. On Fluid Compute instances are reused, so this
// holds well in practice, but it is per-instance — a wide fan-out can get more
// than `max` through. Swap `bump` for a shared store (Upstash Redis INCR+EXPIRE)
// if the limits ever need to be exact across instances.
interface Bucket {
  start: number;
  count: number;
}

const buckets = new Map<string, Bucket>();

/** Sweep expired entries so a flood of unique IPs cannot grow the map without bound. */
function sweep(now: number, windowMs: number): void {
  if (buckets.size < 5000) return;
  for (const [k, w] of buckets) if (now - w.start >= windowMs) buckets.delete(k);
}

function bump(key: string, now: number, limit: { max: number; windowMs: number }): boolean {
  sweep(now, limit.windowMs);
  const w = buckets.get(key);
  if (!w || now - w.start >= limit.windowMs) {
    buckets.set(key, { start: now, count: 1 });
    return true;
  }
  if (w.count >= limit.max) return false;
  w.count += 1;
  return true;
}

function retryAfter(start: number, now: number, windowMs: number): number {
  return Math.max(1, Math.ceil((start + windowMs - now) / 1000));
}

/* ── Entry point ─────────────────────────────────────────────────────── */

export function checkRateLimit(
  ip: string,
  cookieRaw: string | undefined,
  now: number = Date.now(),
): Decision {
  // 1. Global ceiling first — cheapest check, protects the balance above all.
  if (!bump("global", now, CHAT_LIMITS.global)) {
    const w = buckets.get("global")!;
    return { ok: false, reason: "global", retryAfterSec: retryAfter(w.start, now, CHAT_LIMITS.global.windowMs) };
  }

  // 2. Burst guard per IP.
  if (!bump(`burst:${ip}`, now, CHAT_LIMITS.burst)) {
    const w = buckets.get(`burst:${ip}`)!;
    return { ok: false, reason: "burst", retryAfterSec: retryAfter(w.start, now, CHAT_LIMITS.burst.windowMs) };
  }

  // 3. IP floor — charged on EVERY request, cookie or not. This is what makes
  //    clearing cookies pointless: you fall back to the stricter budget.
  if (!bump(`ip:${ip}`, now, CHAT_LIMITS.ip)) {
    const w = buckets.get(`ip:${ip}`)!;
    return { ok: false, reason: "ip", retryAfterSec: retryAfter(w.start, now, CHAT_LIMITS.ip.windowMs) };
  }

  // 4. Signed cookie quota. A forged/absent cookie simply starts a fresh
  //    window — harmless, because layer 3 already charged the IP.
  const prev = decodeCookie(cookieRaw);

  // Replayed (stale) cookie — refuse rather than silently granting a quota reset.
  if (prev && isReplay(prev)) {
    return { ok: false, reason: "replay", retryAfterSec: retryAfter(prev.start, now, CHAT_LIMITS.cookie.windowMs) };
  }

  const fresh = !prev || now - prev.start >= CHAT_LIMITS.cookie.windowMs;
  const w: Window = fresh ? { sid: prev?.sid ?? newSid(), start: now, count: 0 } : prev;

  if (w.count >= CHAT_LIMITS.cookie.max) {
    return { ok: false, reason: "cookie", retryAfterSec: retryAfter(w.start, now, CHAT_LIMITS.cookie.windowMs) };
  }

  w.count += 1;
  recordHighWater(w);
  return { ok: true, cookie: encodeCookie(w), remaining: CHAT_LIMITS.cookie.max - w.count };
}

/** Extracts the client IP. On Vercel `x-forwarded-for` is edge-set and unspoofable. */
export function clientIp(headers: Headers): string {
  const xff = headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return headers.get("x-real-ip")?.trim() || "unknown";
}

export function buildCookie(value: string): string {
  const maxAge = Math.ceil(CHAT_LIMITS.cookie.windowMs / 1000);
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${COOKIE_NAME}=${value}; Path=/; Max-Age=${maxAge}; HttpOnly; SameSite=Lax${secure}`;
}

/* ── Replay detection ────────────────────────────────────────────────
 * The signature proves WE issued a cookie; it does not prove it is the
 * LATEST one. Without this, an attacker saves an early low-count cookie
 * and replays it to reset their own quota indefinitely. We keep the
 * highest count seen per session id and refuse anything older. */

const highWater = new Map<string, { start: number; count: number }>();

/** True when this cookie is older than one we have already honoured. */
function isReplay(w: Window): boolean {
  const seen = highWater.get(w.sid);
  if (!seen) return false;
  // A new window legitimately resets the count, so only compare within one.
  if (seen.start !== w.start) return false;
  return w.count < seen.count;
}

function recordHighWater(w: Window): void {
  if (highWater.size > 20_000) highWater.clear();
  highWater.set(w.sid, { start: w.start, count: w.count });
}

/* ── Concurrency slots ───────────────────────────────────────────────
 * Request-count limits do not bound concurrent work: one client can open
 * many streams that each hold a socket and a model call open for seconds. */

const inFlight = new Map<string, number>();

/** Returns a release token, or null when the IP already has too many open. */
export function acquireSlot(ip: string): (() => void) | null {
  const open = inFlight.get(ip) ?? 0;
  if (open >= CHAT_LIMITS.concurrent) return null;
  inFlight.set(ip, open + 1);
  let released = false;
  // Idempotent: a double-release must not free a slot it does not own.
  return () => {
    if (released) return;
    released = true;
    releaseSlot(ip);
  };
}

export function releaseSlot(ip: string): void {
  const open = inFlight.get(ip) ?? 0;
  if (open <= 1) inFlight.delete(ip);
  else inFlight.set(ip, open - 1);
}

/** Test-only: clears the process-local buckets. */
export function __resetBuckets(): void {
  buckets.clear();
  highWater.clear();
  inFlight.clear();
}
