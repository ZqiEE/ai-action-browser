import {
  compareOffers,
  confirmOutcome,
  health,
  prepareOutcome,
  providerDiagnostics,
  providerEvent,
  readOutcome,
  rotateProviderCredentials,
  searchWeb,
  upsertOffers,
  upsertProvider,
} from "./handlers";
import { allowedOrigin, ApiError, corsHeaders, errorResponse } from "./http";
import {
  cleanupRateLimits,
  enforceRateLimit,
  logRequest,
  requestId,
  withRuntimeHeaders,
  type RateLimitDecision,
} from "./runtime";
import type { Env } from "./types";

function decodePathSegment(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    throw new ApiError(400, "invalid_path", "The request path is invalid.");
  }
}

async function handle(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);

  if (request.method === "OPTIONS") {
    if (request.headers.get("Origin") && !allowedOrigin(request, env)) {
      return errorResponse(request, env, 403, "origin_not_allowed", "This origin is not allowed.");
    }
    return new Response(null, { status: 204, headers: corsHeaders(request, env) });
  }

  if (request.headers.get("Origin") && !allowedOrigin(request, env)) {
    return errorResponse(request, env, 403, "origin_not_allowed", "This origin is not allowed.");
  }

  if (request.method === "GET" && url.pathname === "/health") {
    return health(request, env);
  }
  if (request.method === "POST" && url.pathname === "/v1/search") {
    return searchWeb(request, env);
  }
  if (request.method === "POST" && url.pathname === "/v1/compare") {
    return compareOffers(request, env);
  }
  if (request.method === "POST" && url.pathname === "/v1/providers") {
    return upsertProvider(request, env);
  }

  const rotateCredentialsMatch = url.pathname.match(
    /^\/v1\/providers\/([^/]+)\/credentials\/rotate$/,
  );
  if (request.method === "POST" && rotateCredentialsMatch?.[1]) {
    return rotateProviderCredentials(
      request,
      env,
      decodePathSegment(rotateCredentialsMatch[1]),
    );
  }

  const diagnosticsMatch = url.pathname.match(/^\/v1\/providers\/([^/]+)\/diagnostics$/);
  if (request.method === "GET" && diagnosticsMatch?.[1]) {
    return providerDiagnostics(request, env, decodePathSegment(diagnosticsMatch[1]));
  }

  const offersMatch = url.pathname.match(/^\/v1\/providers\/([^/]+)\/offers$/);
  if (request.method === "POST" && offersMatch?.[1]) {
    return upsertOffers(request, env, decodePathSegment(offersMatch[1]));
  }
  if (request.method === "POST" && url.pathname === "/v1/prepare") {
    return prepareOutcome(request, env);
  }

  const confirmMatch = url.pathname.match(/^\/v1\/outcomes\/([^/]+)\/confirm$/);
  if (request.method === "POST" && confirmMatch?.[1]) {
    return confirmOutcome(request, env, decodePathSegment(confirmMatch[1]));
  }

  const outcomeMatch = url.pathname.match(/^\/v1\/outcomes\/([^/]+)$/);
  if (request.method === "GET" && outcomeMatch?.[1]) {
    return readOutcome(request, env, decodePathSegment(outcomeMatch[1]));
  }
  if (request.method === "POST" && url.pathname === "/v1/provider-events") {
    return providerEvent(request, env);
  }

  return errorResponse(request, env, 404, "not_found", "Route not found.");
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const startedAt = Date.now();
    const id = requestId(request);
    let rateLimit: RateLimitDecision | null = null;
    let response: Response;

    try {
      rateLimit = await enforceRateLimit(request, env);
      if (rateLimit?.limited) {
        response = errorResponse(
          request,
          env,
          429,
          "rate_limited",
          "Too many requests. Retry after the current rate-limit window resets.",
        );
        const headers = new Headers(response.headers);
        headers.set("Retry-After", String(Math.max(1, Math.ceil((rateLimit.resetAt - Date.now()) / 1_000))));
        response = new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers,
        });
      } else {
        response = await handle(request, env);
      }
    } catch (error) {
      if (error instanceof ApiError) {
        response = errorResponse(request, env, error.status, error.code, error.message);
      } else {
        console.error(
          JSON.stringify({
            event: "request_failed",
            requestId: id,
            path: new URL(request.url).pathname,
            method: request.method,
            error: error instanceof Error ? error.message : "unknown_error",
          }),
        );
        response = errorResponse(request, env, 500, "internal_error", "The request could not be completed.");
      }
    }

    const finalResponse = withRuntimeHeaders(response, id, rateLimit);
    logRequest(request, finalResponse, id, startedAt, rateLimit);
    return finalResponse;
  },

  scheduled(_controller: ScheduledController, env: Env, ctx: ExecutionContext): void {
    ctx.waitUntil(cleanupRateLimits(env));
  },
};
