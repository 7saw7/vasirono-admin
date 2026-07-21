import {
  settingsDashboardDataSchema,
  settingsListFiltersSchema,
} from "./schema";
import type { SettingsListFilters } from "./types";
import { callBackofficeService } from "@/lib/microservices/backoffice-client";

const ADMIN_SETTINGS_PATH = "/api/backoffice/settings";

type RecordLike = Record<string, unknown>;

function asRecord(value: unknown): RecordLike {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as RecordLike)
    : {};
}

function unwrapPayload(value: unknown): unknown {
  const record = asRecord(value);
  if ("data" in record) return record.data;
  return value;
}

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function toStringValue(value: unknown, fallback = ""): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean")
    return String(value);
  return fallback;
}

function toNullableString(value: unknown): string | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean")
    return String(value);
  return null;
}

function toBoolean(value: unknown, fallback = false): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["true", "1", "si", "sí", "yes"].includes(normalized)) return true;
    if (["false", "0", "no"].includes(normalized)) return false;
  }
  if (typeof value === "number") return value !== 0;
  return fallback;
}

function normalizeSimpleItem(value: unknown) {
  const item = asRecord(value);
  return {
    id: toNumber(item.id),
    name: toStringValue(item.name, "Sin nombre"),
  };
}

function normalizeVerificationLevelItem(value: unknown) {
  const item = asRecord(value);
  return {
    id: toNumber(item.id),
    code: toStringValue(item.code),
    name: toStringValue(item.name, "Sin nombre"),
    description: toNullableString(item.description),
    sortOrder: toNumber(item.sortOrder ?? item.sort_order),
  };
}

function normalizeVerificationMethodItem(value: unknown) {
  const item = asRecord(value);
  return {
    id: toNumber(item.id),
    code: toStringValue(item.code),
    name: toStringValue(item.name, "Sin nombre"),
    description: toNullableString(item.description),
    requiresDocument: toBoolean(
      item.requiresDocument ?? item.requires_document,
    ),
    requiresManualReview: toBoolean(
      item.requiresManualReview ?? item.requires_manual_review,
    ),
    isActive: toBoolean(item.isActive ?? item.is_active, true),
  };
}

function normalizeVerificationStatusItem(value: unknown) {
  const item = asRecord(value);
  return {
    id: toNumber(item.id),
    code: toStringValue(item.code),
    name: toStringValue(item.name, "Sin nombre"),
    description: toNullableString(item.description),
    sortOrder: toNumber(item.sortOrder ?? item.sort_order),
    isTerminal: toBoolean(item.isTerminal ?? item.is_terminal),
  };
}

function normalizePaginated<T>(
  value: unknown,
  mapper: (item: unknown) => T,
  fallbackPage: number,
  fallbackPageSize: number,
) {
  const payload = asRecord(value);
  const pagination = asRecord(payload.pagination ?? payload.meta);
  const rawItems = Array.isArray(payload.items)
    ? payload.items
    : Array.isArray(payload.rows)
      ? payload.rows
      : [];

  return {
    items: rawItems.map(mapper),
    page: toNumber(payload.page ?? pagination.page, fallbackPage),
    pageSize: toNumber(
      payload.pageSize ??
        payload.page_size ??
        pagination.pageSize ??
        pagination.page_size,
      fallbackPageSize,
    ),
    total: toNumber(payload.total ?? pagination.total, rawItems.length),
  };
}

function normalizeSettingsDashboard(
  value: unknown,
  filters: Required<Pick<SettingsListFilters, "page" | "pageSize">>,
) {
  const payload = asRecord(unwrapPayload(value));
  const summary = asRecord(payload.summary);
  const page = Number(filters.page) || 1;
  const pageSize = Number(filters.pageSize) || 10;

  return {
    summary: {
      totalRoles: toNumber(summary.totalRoles ?? summary.total_roles),
      totalVerificationStatuses: toNumber(
        summary.totalVerificationStatuses ??
          summary.total_verification_statuses,
      ),
      totalClaimStatuses: toNumber(
        summary.totalClaimStatuses ?? summary.total_claim_statuses,
      ),
      totalPaymentStatuses: toNumber(
        summary.totalPaymentStatuses ?? summary.total_payment_statuses,
      ),
      totalSubscriptionStatuses: toNumber(
        summary.totalSubscriptionStatuses ??
          summary.total_subscription_statuses,
      ),
      totalNotificationTypes: toNumber(
        summary.totalNotificationTypes ?? summary.total_notification_types,
      ),
      totalVerificationLevels: toNumber(
        summary.totalVerificationLevels ?? summary.total_verification_levels,
      ),
      totalVerificationMethods: toNumber(
        summary.totalVerificationMethods ?? summary.total_verification_methods,
      ),
      totalVerificationRequestStatuses: toNumber(
        summary.totalVerificationRequestStatuses ??
          summary.total_verification_request_statuses,
      ),
      totalVerificationCheckStatuses: toNumber(
        summary.totalVerificationCheckStatuses ??
          summary.total_verification_check_statuses,
      ),
      totalVerificationDocumentTypes: toNumber(
        summary.totalVerificationDocumentTypes ??
          summary.total_verification_document_types,
      ),
      totalVerificationDocumentReviewStatuses: toNumber(
        summary.totalVerificationDocumentReviewStatuses ??
          summary.total_verification_document_review_statuses,
      ),
    },
    roles: normalizePaginated(
      payload.roles,
      normalizeSimpleItem,
      page,
      pageSize,
    ),
    verificationStatuses: normalizePaginated(
      payload.verificationStatuses ?? payload.verification_statuses,
      normalizeSimpleItem,
      page,
      pageSize,
    ),
    claimStatuses: normalizePaginated(
      payload.claimStatuses ?? payload.claim_statuses,
      normalizeSimpleItem,
      page,
      pageSize,
    ),
    paymentStatuses: normalizePaginated(
      payload.paymentStatuses ?? payload.payment_statuses,
      normalizeSimpleItem,
      page,
      pageSize,
    ),
    subscriptionStatuses: normalizePaginated(
      payload.subscriptionStatuses ?? payload.subscription_statuses,
      normalizeSimpleItem,
      page,
      pageSize,
    ),
    notificationTypes: normalizePaginated(
      payload.notificationTypes ?? payload.notification_types,
      normalizeSimpleItem,
      page,
      pageSize,
    ),
    verificationLevels: normalizePaginated(
      payload.verificationLevels ?? payload.verification_levels,
      normalizeVerificationLevelItem,
      page,
      pageSize,
    ),
    verificationMethods: normalizePaginated(
      payload.verificationMethods ?? payload.verification_methods,
      normalizeVerificationMethodItem,
      page,
      pageSize,
    ),
    verificationRequestStatuses: normalizePaginated(
      payload.verificationRequestStatuses ??
        payload.verification_request_statuses,
      normalizeVerificationStatusItem,
      page,
      pageSize,
    ),
    verificationCheckStatuses: normalizePaginated(
      payload.verificationCheckStatuses ?? payload.verification_check_statuses,
      normalizeVerificationStatusItem,
      page,
      pageSize,
    ),
    verificationDocumentTypes: normalizePaginated(
      payload.verificationDocumentTypes ?? payload.verification_document_types,
      normalizeVerificationLevelItem,
      page,
      pageSize,
    ),
    verificationDocumentReviewStatuses: normalizePaginated(
      payload.verificationDocumentReviewStatuses ??
        payload.verification_document_review_statuses,
      normalizeVerificationStatusItem,
      page,
      pageSize,
    ),
  };
}

export async function getSettingsDashboard(input: SettingsListFilters = {}) {
  const filters = settingsListFiltersSchema.parse(input);
  const raw = await callBackofficeService<unknown>(
    "users",
    ADMIN_SETTINGS_PATH,
    {
      query: filters,
    },
  );

  return settingsDashboardDataSchema.parse(
    normalizeSettingsDashboard(raw, {
      page: filters.page,
      pageSize: filters.pageSize,
    }),
  );
}
