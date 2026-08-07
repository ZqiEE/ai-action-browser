export interface Env {
  DB: D1Database;
  ALLOWED_ORIGIN: string;
  BRAVE_SEARCH_API_KEY?: string;
  OPENAI_API_KEY?: string;
  OPENAI_MODEL?: string;
  PROVIDER_ADMIN_TOKEN?: string;
  PROVIDER_WEBHOOK_SECRET?: string;
}

export interface BrowserPageContextInput {
  title?: string;
  url: string;
}

export interface SearchRequest {
  query: string;
  count?: number;
  pageContext?: BrowserPageContextInput;
}

export interface CompareRequest {
  query: string;
  category?: string;
  pageContext?: BrowserPageContextInput;
}

export interface ProviderInput {
  id: string;
  name: string;
  domain: string;
  active?: boolean;
}

export interface OfferInput {
  id: string;
  category: string;
  title: string;
  description?: string;
  price: number;
  currency: string;
  availability: string;
  deliveryText?: string;
  returnsText?: string;
  warrantyText?: string;
  prepareUrl: string;
  sourceUrl: string;
  evidence?: Record<string, unknown>;
  retrievedAt: string;
  active?: boolean;
}

export interface PrepareRequest {
  offerId: string;
  taskId?: string;
  query?: string;
}

export type OutcomeStatus =
  | "prepared"
  | "confirmed"
  | "accepted"
  | "completed"
  | "cancelled"
  | "refunded"
  | "disputed";

export type ProviderOutcomeStatus = Exclude<OutcomeStatus, "prepared" | "confirmed">;

export interface ProviderEventInput {
  providerId: string;
  eventId: string;
  attributionToken: string;
  status: ProviderOutcomeStatus;
  occurredAt: string;
  evidence?: Record<string, unknown>;
}

export interface ProviderRow {
  id: string;
  name: string;
  domain: string;
  active: number;
  credential_version: number;
}

export interface OfferRow {
  id: string;
  provider_id: string;
  provider_name: string;
  provider_domain: string;
  category: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  availability: string;
  delivery_text: string;
  returns_text: string;
  warranty_text: string;
  prepare_url: string;
  source_url: string;
  evidence_json: string;
  retrieved_at: string;
}

export interface OutcomeRow {
  id: string;
  task_id: string;
  offer_id: string;
  provider_id: string;
  provider_name: string;
  provider_domain: string;
  offer_title: string;
  attribution_token: string;
  status: OutcomeStatus;
  amount: number;
  currency: string;
  user_confirmed: number;
  handoff_url: string;
  completion_evidence: string | null;
  reversal_deadline: string | null;
  created_at: string;
  updated_at: string;
}

export interface Constraints {
  budget: number | null;
  useCase: string;
  delivery: string;
  returns: string;
}

export const PROVIDER_OUTCOME_STATUSES = new Set<ProviderOutcomeStatus>([
  "accepted",
  "completed",
  "cancelled",
  "refunded",
  "disputed",
]);
