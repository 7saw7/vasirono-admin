const DEFAULT_LOCALE = "es-PE";
const DEFAULT_CURRENCY = "PEN";

export function formatCurrency(
  value: number | null | undefined,
  currency = DEFAULT_CURRENCY,
  locale = DEFAULT_LOCALE
): string {
  if (typeof value !== "number" || Number.isNaN(value)) return "—";

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercent(
  value: number | null | undefined,
  locale = DEFAULT_LOCALE
): string {
  if (typeof value !== "number" || Number.isNaN(value)) return "—";

  return new Intl.NumberFormat(locale, {
    style: "percent",
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatText(value: string | null | undefined): string {
  const normalized = value?.trim();
  return normalized ? normalized : "—";
}

export function formatBoolean(value: boolean | null | undefined): string {
  if (value === true) return "Sí";
  if (value === false) return "No";
  return "—";
}