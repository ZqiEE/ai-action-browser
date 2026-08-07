import { ApiError } from "./http";
import type { Env, OutcomeStatus, ProviderOutcomeStatus } from "./types";

const ALLOWED_TRANSITIONS: Readonly<Record<OutcomeStatus, ReadonlySet<ProviderOutcomeStatus>>> = {
  prepared: new Set(),
  confirmed: new Set(["accepted", "completed", "cancelled", "disputed"]),
  accepted: new Set(["completed", "cancelled", "disputed"]),
  completed: new Set(["refunded", "disputed"]),
  cancelled: new Set(),
  refunded: new Set(),
  disputed: new Set(["completed", "refunded", "cancelled"]),
};

export function id(prefix: string): string {
  return `${prefix}_${crypto.randomUUID()}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}

function constantTimeEqual(left: string, right: string): boolean {
  if (left.length !== right.length) return false;
  let mismatch = 0;
  for (let index = 0; index < left.length; index += 1) {
    mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return mismatch === 0;
}

export function assertAdmin(request: Request, env: Env): void {
  if (!env.PROVIDER_ADMIN_TOKEN) {
    throw new ApiError(503, "provider_admin_not_configured", "Provider administration is not configured.");
  }
  const authorization = request.headers.get("Authorization") ?? "";
  const supplied = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!supplied || !constantTimeEqual(supplied, env.PROVIDER_ADMIN_TOKEN)) {
    throw new ApiError(401, "unauthorized", "Provider administration credentials are required.");
  }
}

export function appendAttribution(
  urlValue: string,
  outcomeId: string,
  attributionToken: string,
): string {
  const url = new URL(urlValue);
  url.searchParams.set("aab_outcome", outcomeId);
  url.searchParams.set("aab_attribution", attributionToken);
  return url.toString();
}

export function canTransitionOutcome(
  current: OutcomeStatus,
  next: ProviderOutcomeStatus,
): boolean {
  return current === next || ALLOWED_TRANSITIONS[current].has(next);
}

export function assertOutcomeTransition(
  current: OutcomeStatus,
  next: ProviderOutcomeStatus,
  userConfirmed: boolean,
): void {
  if (!userConfirmed || current === "prepared") {
    throw new ApiError(
      409,
      "consumer_confirmation_required",
      "A provider result cannot be recorded before the consumer confirms the handoff.",
    );
  }
  if (!canTransitionOutcome(current, next)) {
    throw new ApiError(
      409,
      "invalid_outcome_transition",
      `Outcome cannot transition from ${current} to ${next}.`,
    );
  }
}

function hex(bytes: ArrayBuffer): string {
  return [...new Uint8Array(bytes)]
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
}

async function hmacHex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const digest = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return hex(digest);
}

export async function deriveProviderCredential(
  masterSecret: string,
  providerId: string,
  credentialVersion: number,
  purpose: "api" | "webhook",
): Promise<string> {
  if (!masterSecret) {
    throw new ApiError(503, "provider_credentials_not_configured", "Provider credentials are not configured.");
  }
  const digest = await hmacHex(
    masterSecret,
    `aab-provider-credential:v1:${purpose}:${providerId}:${credentialVersion}`,
  );
  return `${purpose === "api" ? "aab_pat" : "aab_wh"}_${credentialVersion}_${digest}`;
}

export async function issueProviderCredentials(
  env: Env,
  providerId: string,
  credentialVersion: number,
): Promise<{ credentialVersion: number; apiToken: string; webhookSigningSecret: string }> {
  if (!env.PROVIDER_ADMIN_TOKEN || !env.PROVIDER_WEBHOOK_SECRET) {
    throw new ApiError(503, "provider_credentials_not_configured", "Provider credentials are not configured.");
  }
  const [apiToken, webhookSigningSecret] = await Promise.all([
    deriveProviderCredential(env.PROVIDER_ADMIN_TOKEN, providerId, credentialVersion, "api"),
    deriveProviderCredential(env.PROVIDER_WEBHOOK_SECRET, providerId, credentialVersion, "webhook"),
  ]);
  return { credentialVersion, apiToken, webhookSigningSecret };
}

export async function assertProviderAccess(
  request: Request,
  env: Env,
  providerId: string,
  credentialVersion: number,
): Promise<void> {
  if (!env.PROVIDER_ADMIN_TOKEN) {
    throw new ApiError(503, "provider_admin_not_configured", "Provider administration is not configured.");
  }
  const authorization = request.headers.get("Authorization") ?? "";
  const supplied = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (supplied && constantTimeEqual(supplied, env.PROVIDER_ADMIN_TOKEN)) return;

  const expected = await deriveProviderCredential(
    env.PROVIDER_ADMIN_TOKEN,
    providerId,
    credentialVersion,
    "api",
  );
  if (!supplied || !constantTimeEqual(supplied, expected)) {
    throw new ApiError(401, "unauthorized", "Provider credentials are required.");
  }
}

export async function validSignature(
  body: string,
  signature: string | null,
  secret: string | undefined,
): Promise<boolean> {
  if (!secret || !signature) return false;
  const supplied = signature.startsWith("sha256=") ? signature.slice(7) : signature;
  if (!/^[a-f0-9]{64}$/i.test(supplied)) return false;
  const digest = await hmacHex(secret, body);
  return constantTimeEqual(digest, supplied.toLowerCase());
}

export async function validProviderSignature(
  body: string,
  signature: string | null,
  env: Env,
  providerId: string,
  credentialVersion: number,
): Promise<boolean> {
  if (!env.PROVIDER_WEBHOOK_SECRET) return false;
  const secret = await deriveProviderCredential(
    env.PROVIDER_WEBHOOK_SECRET,
    providerId,
    credentialVersion,
    "webhook",
  );
  return validSignature(body, signature, secret);
}
