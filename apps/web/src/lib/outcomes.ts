import type { OutcomeRecord } from "@/types";

export const OUTCOME_STORAGE_KEY = "aab-demo-outcomes";

interface CreateOutcomeInput {
  taskId: string;
  providerId: string;
  providerName: string;
  destinationDomain: string;
  subject: string;
  amount: number;
  currency: string;
  now?: Date;
}

function randomId(prefix: string): string {
  const value = globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2, 12);
  return `${prefix}_${value}`;
}

export function createConfirmedOutcome(input: CreateOutcomeInput): OutcomeRecord {
  const now = input.now ?? new Date();
  const reversalDeadline = new Date(now);
  reversalDeadline.setUTCDate(reversalDeadline.getUTCDate() + 30);

  return {
    id: randomId("outcome"),
    taskId: input.taskId,
    type: "purchase",
    status: "confirmed",
    providerId: input.providerId,
    providerName: input.providerName,
    destinationDomain: input.destinationDomain,
    subject: input.subject,
    amount: input.amount,
    currency: input.currency,
    attributionToken: randomId("attr"),
    createdAt: now.toISOString(),
    userConfirmed: true,
    completionEvidence:
      "Demo confirmation only. A production provider would later report accepted, completed, cancelled, refunded, or disputed status.",
    reversalDeadline: reversalDeadline.toISOString(),
    commercialDisclosure:
      "A provider may pay an outcome fee after an eligible completed result. Commercial terms never enter independent recommendation ranking.",
  };
}

export function readOutcomes(storage: Storage = window.localStorage): OutcomeRecord[] {
  try {
    const raw = storage.getItem(OUTCOME_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as OutcomeRecord[]) : [];
  } catch {
    return [];
  }
}

export function saveOutcome(record: OutcomeRecord, storage: Storage = window.localStorage): void {
  const existing = readOutcomes(storage).filter((item) => item.id !== record.id);
  storage.setItem(OUTCOME_STORAGE_KEY, JSON.stringify([record, ...existing].slice(0, 20)));
}

export function findOutcome(
  outcomeId: string,
  storage: Storage = window.localStorage,
): OutcomeRecord | undefined {
  return readOutcomes(storage).find((item) => item.id === outcomeId);
}
