const DEFAULT_LOCALE = "es-PE";
const DEFAULT_CURRENCY = "PEN";

export function toDate(value: string | Date | null | undefined): Date | null {
  if (!value) return null;

  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(
  value: string | Date | null | undefined,
  locale = DEFAULT_LOCALE
): string {
  const date = toDate(value);
  if (!date) return "—";

  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function formatDateTime(
  value: string | Date | null | undefined,
  locale = DEFAULT_LOCALE
): string {
  const date = toDate(value);
  if (!date) return "—";

  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatRelativeDaysFromNow(
  value: string | Date | null | undefined
): string {
  const date = toDate(value);
  if (!date) return "—";

  const now = Date.now();
  const diffMs = date.getTime() - now;
  const dayMs = 1000 * 60 * 60 * 24;
  const diffDays = Math.round(diffMs / dayMs);

  if (diffDays === 0) return "hoy";
  if (diffDays === 1) return "mañana";
  if (diffDays === -1) return "ayer";
  if (diffDays > 1) return `en ${diffDays} días`;
  return `hace ${Math.abs(diffDays)} días`;
}

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

export function formatText(value: string | null | undefined): string {
  const normalized = value?.trim();
  return normalized ? normalized : "—";
}

export function formatBoolean(value: boolean | null | undefined): string {
  if (value === true) return "Sí";
  if (value === false) return "No";
  return "—";
}