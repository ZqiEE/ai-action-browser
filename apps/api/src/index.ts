import {
  compareOffers,
  confirmOutcome,
  health,
  prepareOutcome,
  providerEvent,
  readOutcome,
  rotateProviderCredentials,
  searchWeb,
  upsertOffers,
  upsertProvider,
} from "./handlers";
import { allowedOrigin, ApiError, corsHeaders, errorResponse } from "./http";
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
    try {
      return await handle(request, env);
    } catch (error) {
      if (error instanceof ApiError) {
        return errorResponse(request, env, error.status, error.code, error.message);
      }

      console.error("request_failed", {
        path: new URL(request.url).pathname,
        method: request.method,
        error: error instanceof Error ? error.message : "unknown_error",
      });
      return errorResponse(request, env, 500, "internal_error", "The request could not be completed.");
    }
  },
};
