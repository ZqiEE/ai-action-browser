export type IntentMode = "search" | "compare" | "prepare";

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
