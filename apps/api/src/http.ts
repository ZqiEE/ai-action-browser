import type { Env } from "./types";

const MAX_JSON_BODY_BYTES = 512 * 1024;

const JSON_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
} as const;

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

export function allowedOrigin(request: Request, env: Env): string | null {
  const origin = request.headers.get("Origin");
  if (!origin) return null;
  const allowed = env.ALLOWED_ORIGIN.split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  return allowed.includes("*") || allowed.includes(origin) ? origin : null;
}

export function corsHeaders(request: Request, env: Env): HeadersInit {
  const origin = allowedOrigin(request, env);
  if (!origin) return {};
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Headers": "Authorization, Content-Type, X-AAB-Signature",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

export function json(
  request: Request,
  env: Env,
  value: unknown,
  status = 200,
  extraHeaders: HeadersInit = {},
): Response {
  return new Response(JSON.stringify(value), {
    status,
    headers: {
      ...JSON_HEADERS,
      ...corsHeaders(request, env),
      ...extraHeaders,
    },
  });
}

export function errorResponse(
  request: Request,
  env: Env,
  status: number,
  code: string,
  message: string,
): Response {
  return json(request, env, { error: { code, message } }, status);
}

export async function readBodyText(
  request: Request,
  maxBytes = MAX_JSON_BODY_BYTES,
): Promise<string> {
  const declaredLength = Number(request.headers.get("Content-Length") ?? "0");
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
    throw new ApiError(413, "request_too_large", "The request body is too large.");
  }

  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > maxBytes) {
    throw new ApiError(413, "request_too_large", "The request body is too large.");
  }
  return text;
}

export async function readJson<T>(request: Request, maxBytes = MAX_JSON_BODY_BYTES): Promise<T> {
  const contentType = request.headers.get("Content-Type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    throw new ApiError(415, "unsupported_media_type", "Content-Type must be application/json.");
  }

  const raw = await readBodyText(request, maxBytes);
  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new ApiError(400, "invalid_json", "The request body is not valid JSON.");
  }
}

export function cleanText(value: unknown, maxLength: number): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

export function normalizeIdentifier(value: unknown, maxLength: number, fieldName: string): string {
  const identifier = cleanText(value, maxLength).toLowerCase();
  if (!/^[a-z0-9][a-z0-9._-]*$/.test(identifier)) {
    throw new ApiError(
      400,
      `invalid_${fieldName}`,
      `${fieldName} must use lowercase letters, numbers, dots, underscores, or hyphens.`,
    );
  }
  return identifier;
}

export function normalizeCategory(value: unknown): string {
  return normalizeIdentifier(value, 80, "category");
}

export function normalizeProviderDomain(value: unknown): string {
  const raw = cleanText(value, 255).toLowerCase().replace(/\.$/, "");
  if (!raw || raw.includes(":") || raw.includes("/") || raw.includes("@")) {
    throw new ApiError(400, "invalid_provider_domain", "Provider domain must be a hostname only.");
  }

  let hostname: string;
  try {
    hostname = new URL(`https://${raw}`).hostname.toLowerCase();
  } catch {
    throw new ApiError(400, "invalid_provider_domain", "Provider domain is invalid.");
  }

  if (hostname !== raw || !hostname.includes(".")) {
    throw new ApiError(400, "invalid_provider_domain", "Provider domain must be a public hostname.");
  }
  return hostname;
}

export function parseProviderHttpsUrl(value: unknown, providerDomain: string, fieldName: string): string {
  const raw = cleanText(value, 2_048);
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new ApiError(400, `invalid_${fieldName}`, `${fieldName} must be a valid URL.`);
  }

  if (url.protocol !== "https:" || url.username || url.password) {
    throw new ApiError(400, `invalid_${fieldName}`, `${fieldName} must use HTTPS without credentials.`);
  }

  const hostname = url.hostname.toLowerCase();
  if (hostname !== providerDomain && !hostname.endsWith(`.${providerDomain}`)) {
    throw new ApiError(
      400,
      `invalid_${fieldName}_domain`,
      `${fieldName} must use the provider domain or one of its subdomains.`,
    );
  }
  return url.toString();
}

export function parsePublicHttpUrl(value: unknown): URL | null {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    if ((url.protocol !== "https:" && url.protocol !== "http:") || url.username || url.password) {
      return null;
    }
    return url;
  } catch {
    return null;
  }
}

export function parseIsoDate(
  value: unknown,
  fieldName: string,
  options: { maxFutureMs?: number } = {},
): string {
  const raw = cleanText(value, 80);
  const timestamp = Date.parse(raw);
  if (!raw || !Number.isFinite(timestamp)) {
    throw new ApiError(400, `invalid_${fieldName}`, `${fieldName} must be a valid ISO-8601 date.`);
  }
  if (options.maxFutureMs !== undefined && timestamp > Date.now() + options.maxFutureMs) {
    throw new ApiError(400, `invalid_${fieldName}`, `${fieldName} is too far in the future.`);
  }
  return new Date(timestamp).toISOString();
}

export function stringifyBoundedJson(
  value: unknown,
  fieldName: string,
  maxBytes = 32 * 1024,
): string {
  let serialized: string;
  try {
    serialized = JSON.stringify(value ?? {});
  } catch {
    throw new ApiError(400, `invalid_${fieldName}`, `${fieldName} must be JSON serializable.`);
  }
  if (new TextEncoder().encode(serialized).byteLength > maxBytes) {
    throw new ApiError(400, `${fieldName}_too_large`, `${fieldName} is too large.`);
  }
  return serialized;
}

export async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}
