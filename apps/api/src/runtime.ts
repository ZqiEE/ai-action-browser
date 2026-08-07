import { ApiError } from "./http";
import type { Env } from "./types";

export interface RateLimitDecision {
  limited: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
  routeGroup: string;
}

interface RoutePolicy {
  group: string;
  limit: number;
}

const WINDOW_MS = 60_000;

function routePolicy(request: Request): RoutePolicy | null {
  const { pathname } = new URL(request.url);
  if (request.method === "OPTIONS" || (request.method === "GET" && pathname === "/health")) {
    return null;
  }
  if (request.method === "POST" && pathname === "/v1/search") return { group: "search", limit: 30 };
  if (request.method === "POST" && pathname === "/v1/compare") return { group: "compare", limit: 20 };
  if (request.method === "POST" && pathname === "/v1/prepare") return { group: "prepare", limit: 20 };
  if (request.method === "POST" && /^\/v1\/outcomes\/[^/]+\/confirm$/.test(pathname)) {
    return { group: "confirm", limit: 20 };
  }
  if (request.method === "GET" && /^\/v1\/outcomes\/[^/]+$/.test(pathname)) {
    return { group: "outcome_read", limit: 120 };
  }
  if (request.method === "POST" && pathname === "/v1/providers") {
    return { group: "provider_admin", limit: 60 };
  }
  if (request.method === "POST" && /^\/v1\/providers\/[^/]+\/credentials\/rotate$/.test(pathname)) {
    return { group: "provider_admin", limit: 60 };
  }
  if (request.method === "GET" && /^\/v1\/providers\/[^/]+\/diagnostics$/.test(pathname)) {
    return { group: "provider_diagnostics", limit: 60 };
  }
  if (request.method === "POST" && /^\/v1\/providers\/[^/]+\/offers$/.test(pathname)) {
    return { group: "provider_feed", limit: 60 };
  }
  if (request.method === "POST" && pathname === "/v1/provider-events") {
    return { group: "provider_events", limit: 240 };
  }
  return { group: "other", limit: 60 };
}

function clientIdentity(request: Request): string {
  const cfIp = request.headers.get("CF-Connecting-IP")?.trim();
  if (cfIp) return cfIp;
  return "local-or-unknown-client";
}

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function enforceRateLimit(request: Request, env: Env): Promise<RateLimitDecision | null> {
  const policy = routePolicy(request);
  if (!policy) return null;

  const now = Date.now();
  const bucket = String(Math.floor(now / WINDOW_MS));
  const resetAt = (Number(bucket) + 1) * WINDOW_MS;
  const clientHash = (await sha256Hex(clientIdentity(request))).slice(0, 32);
  const expiresAt = new Date(resetAt + WINDOW_MS).toISOString();

  const row = await env.DB.prepare(
    `INSERT INTO request_rate_limits (
       bucket, client_hash, route_group, request_count, expires_at
     ) VALUES (?, ?, ?, 1, ?)
     ON CONFLICT(bucket, client_hash, route_group) DO UPDATE SET
       request_count = request_count + 1,
       expires_at = excluded.expires_at
     RETURNING request_count`,
  )
    .bind(bucket, clientHash, policy.group, expiresAt)
    .first<{ request_count: number }>();

  if (!row || !Number.isFinite(row.request_count)) {
    throw new ApiError(503, "rate_limit_unavailable", "Request protection is temporarily unavailable.");
  }

  const remaining = Math.max(0, policy.limit - row.request_count);
  return {
    limited: row.request_count > policy.limit,
    limit: policy.limit,
    remaining,
    resetAt,
    routeGroup: policy.group,
  };
}

export async function cleanupRateLimits(env: Env): Promise<void> {
  await env.DB.prepare("DELETE FROM request_rate_limits WHERE expires_at < ?")
    .bind(new Date().toISOString())
    .run();
}

export function requestId(request: Request): string {
  const incoming = request.headers.get("X-Request-Id")?.trim() ?? "";
  if (/^[A-Za-z0-9._:-]{8,128}$/.test(incoming)) return incoming;
  return `req_${crypto.randomUUID()}`;
}

export function withRuntimeHeaders(
  response: Response,
  id: string,
  rateLimit: RateLimitDecision | null,
): Response {
  const headers = new Headers(response.headers);
  headers.set("X-Request-Id", id);
  if (rateLimit) {
    headers.set("X-RateLimit-Limit", String(rateLimit.limit));
    headers.set("X-RateLimit-Remaining", String(rateLimit.remaining));
    headers.set("X-RateLimit-Reset", String(Math.ceil(rateLimit.resetAt / 1_000)));
  }
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

export function logRequest(
  request: Request,
  response: Response,
  id: string,
  startedAt: number,
  rateLimit: RateLimitDecision | null,
): void {
  const cf = (request as Request & { cf?: { colo?: string; country?: string } }).cf;
  console.log(
    JSON.stringify({
      event: "http_request",
      requestId: id,
      method: request.method,
      path: new URL(request.url).pathname,
      status: response.status,
      durationMs: Date.now() - startedAt,
      routeGroup: rateLimit?.routeGroup ?? "unlimited",
      rateLimited: rateLimit?.limited ?? false,
      colo: cf?.colo ?? null,
      country: cf?.country ?? null,
    }),
  );
}
