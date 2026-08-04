export const supportedLocales = [
  "en-US",
  "es-US",
  "es-MX",
  "fr-CA",
  "de-DE",
  "ja-JP",
  "ko-KR",
  "zh-CN",
  "ar-SA",
] as const;

export type SupportedLocale = (typeof supportedLocales)[number];

export const defaultLocale: SupportedLocale = "en-US";

export function resolveLocale(language = navigator.language): SupportedLocale {
  const exact = supportedLocales.find((locale) => locale.toLowerCase() === language.toLowerCase());
  if (exact) return exact;

  const languageCode = language.split("-")[0]?.toLowerCase();
  return (
    supportedLocales.find((locale) => locale.toLowerCase().startsWith(`${languageCode}-`)) ??
    defaultLocale
  );
}

export function getTextDirection(locale: string): "ltr" | "rtl" {
  return /^(ar|fa|he|ur)(-|$)/i.test(locale) ? "rtl" : "ltr";
}

export function formatCurrency(
  amount: number,
  currency = "USD",
  locale: string = defaultLocale,
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(
  value: string,
  locale: string = defaultLocale,
): string {
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}
