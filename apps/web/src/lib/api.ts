export interface LiveSearchResult {
  id: string;
  title: string;
  url: string;
  displayUrl: string;
  snippet: string;
  sourceType: "web";
  age: string | null;
}

export interface LiveSearchResponse {
  query: string;
  results: LiveSearchResult[];
  source: string;
  durationMs: number;
}

export interface BrowserConstraints {
  budget: number | null;
  useCase: string;
  delivery: string;
  returns: string;
}

export interface LiveRecommendation {
  id: string;
  providerId: string;
  providerName: string;
  providerDomain: string;
  category: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  availability: string;
  delivery: string;
  returns: string;
  warranty: string;
  sourceUrl: string;
  retrievedAt: string;
  strengths: string[];
  tradeoffs: string[];
  evidence: Record<string, unknown>;
  recommendationIndependent: true;
}

export interface LiveCompareResponse {
  taskId: string;
  query: string;
  category: string | null;
  constraints: BrowserConstraints;
  recommendations: LiveRecommendation[];
  incomplete: boolean;
  message?: string;
  recommendationPolicy?: {
    commissionUsedForRanking: false;
    bidsUsedForRanking: false;
    expectedRevenueUsedForRanking: false;
  };
}

export interface PreparedOutcomeResponse {
  outcomeId: string;
  taskId: string;
  status: "prepared";
  offer: LiveRecommendation;
  reversalDeadline: string;
  userConfirmationRequired: true;
}

export interface OutcomeView {
  id: string;
  taskId: string;
  offerId: string;
  offerTitle: string;
  providerId: string;
  providerName: string;
  providerDomain: string;
  status: "prepared" | "confirmed" | "accepted" | "completed" | "cancelled" | "refunded" | "disputed";
  amount: number;
  currency: string;
  userConfirmed: boolean;
  completionEvidence: string | null;
  reversalDeadline: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ApiErrorBody {
  error?: {
    code?: string;
    message?: string;
  };
}

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

function apiBaseUrl(): string {
  const value = import.meta.env.VITE_API_BASE_URL?.trim();
  if (!value) {
    throw new ApiError(
      503,
      "api_not_configured",
      "The production API URL is not configured. Set VITE_API_BASE_URL before deployment.",
    );
  }
  return value.replace(/\/$/, "");
}

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBaseUrl()}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });

  if (!response.ok) {
    let body: ApiErrorBody = {};
    try {
      body = (await response.json()) as ApiErrorBody;
    } catch {
      // Preserve the status when an upstream proxy returns a non-JSON failure.
    }
    throw new ApiError(
      response.status,
      body.error?.code ?? "request_failed",
      body.error?.message ?? "The request could not be completed.",
    );
  }

  return (await response.json()) as T;
}

export function searchWeb(query: string): Promise<LiveSearchResponse> {
  return apiRequest<LiveSearchResponse>("/v1/search", {
    method: "POST",
    body: JSON.stringify({ query, count: 8 }),
  });
}

export function compareGoal(query: string, category?: string): Promise<LiveCompareResponse> {
  return apiRequest<LiveCompareResponse>("/v1/compare", {
    method: "POST",
    body: JSON.stringify(category ? { query, category } : { query }),
  });
}

export function prepareOffer(
  offerId: string,
  taskId: string,
  query: string,
): Promise<PreparedOutcomeResponse> {
  return apiRequest<PreparedOutcomeResponse>("/v1/prepare", {
    method: "POST",
    body: JSON.stringify({ offerId, taskId, query }),
  });
}

export function confirmPreparedOutcome(
  outcomeId: string,
): Promise<{ outcome: OutcomeView; continueUrl: string }> {
  return apiRequest<{ outcome: OutcomeView; continueUrl: string }>(
    `/v1/outcomes/${encodeURIComponent(outcomeId)}/confirm`,
    {
      method: "POST",
      body: JSON.stringify({ confirmed: true }),
    },
  );
}

export function getOutcome(
  outcomeId: string,
): Promise<{ outcome: OutcomeView; events: Array<Record<string, unknown>> }> {
  return apiRequest<{ outcome: OutcomeView; events: Array<Record<string, unknown>> }>(
    `/v1/outcomes/${encodeURIComponent(outcomeId)}`,
  );
}
