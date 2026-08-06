export type IntentMode = "search" | "compare" | "prepare";

export type ProviderIntegrationStatus = "demo" | "sandbox" | "live";
export type OutcomeStatus = "prepared" | "confirmed" | "accepted" | "completed" | "reversed";

export interface SourceRecord {
  id: string;
  publisher: string;
  title: string;
  url: string;
  retrievedAt: string;
  type: "merchant" | "editorial" | "user-reviews";
  supports: string;
  stale: boolean;
  conflict?: string;
}

export interface SearchResult {
  id: string;
  title: string;
  url: string;
  displayUrl: string;
  snippet: string;
  sourceType: "web" | "merchant" | "editorial";
  retrievedAt: string;
}

export interface ProviderRecord {
  id: string;
  name: string;
  domain: string;
  integrationStatus: ProviderIntegrationStatus;
  capabilities: string[];
  commercialModel: string;
  recommendationIndependent: boolean;
}

export interface ProductOption {
  id: string;
  name: string;
  merchant: string;
  price: number;
  currency: string;
  headline: string;
  strengths: string[];
  tradeoffs: string[];
  delivery: string;
  returns: string;
  warranty: string;
  sourceIds: string[];
}

export interface OrderPreview {
  productId: string;
  destinationDomain: string;
  merchantName: string;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  cashback: number;
  currency: string;
  deliveryDate: string;
  returnDeadline: string;
  deliveryAddress: string;
  paymentLabel: string;
  sharedData: string[];
  retainedData: string[];
}

export interface OutcomeRecord {
  id: string;
  taskId: string;
  type: "purchase" | "booking" | "activation" | "qualified-lead";
  status: OutcomeStatus;
  providerId: string;
  providerName: string;
  destinationDomain: string;
  subject: string;
  amount: number;
  currency: string;
  attributionToken: string;
  createdAt: string;
  userConfirmed: boolean;
  completionEvidence: string;
  reversalDeadline: string;
  commercialDisclosure: string;
}
