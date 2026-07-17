import {
  userDetailSchema,
  usersListFiltersSchema,
  usersListResultSchema,
} from "./schema";
import type {
  UsersListFilters,
  UpdateAdminUserRoleInput,
  UpdateAdminUserVerificationInput,
  UpdateAdminUserActiveInput,
} from "./types";
import {
  BackofficeServiceError,
  callBackofficeService,
} from "@/lib/microservices/backoffice-client";

const ADMIN_USERS_PATH = "/api/users/admin/users";

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

function toStringValue(value: unknown, fallback = ""): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return fallback;
}

function toNullableString(value: unknown): string | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return null;
}

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
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

function toIsoString(value: unknown, fallback = new Date(0).toISOString()): string {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString();
    return value;
  }
  return fallback;
}

function normalizeUserListItem(value: unknown) {
  const item = asRecord(value);

  return {
    id: toStringValue(item.id),
    name: toStringValue(item.name, "Sin nombre"),
    email: toStringValue(item.email),
    phone: toNullableString(item.phone),
    roleId: toNumber(item.roleId ?? item.role_id),
    roleName: toStringValue(item.roleName ?? item.role_name, "user"),
    verified: toBoolean(item.verified),
    isActive: toBoolean(item.isActive ?? item.is_active, true),
    reviewsCount: toNumber(item.reviewsCount ?? item.reviews_count),
    sessionsCount: toNumber(item.sessionsCount ?? item.sessions_count),
    lastSessionAt:
      item.lastSessionAt || item.last_session_at
        ? toIsoString(item.lastSessionAt ?? item.last_session_at)
        : null,
    createdAt: toIsoString(item.createdAt ?? item.created_at),
  };
}

function normalizeUsersList(value: unknown) {
  const payload = asRecord(unwrapPayload(value));
  const pagination = asRecord(payload.pagination ?? payload.meta);
  const rawItems = Array.isArray(payload.items)
    ? payload.items
    : Array.isArray(payload.rows)
      ? payload.rows
      : [];

  const page = toNumber(payload.page ?? pagination.page, 1);
  const pageSize = toNumber(payload.pageSize ?? payload.page_size ?? pagination.pageSize ?? pagination.page_size, 10);
  const total = toNumber(payload.total ?? pagination.total ?? rawItems.length, rawItems.length);

  return {
    items: rawItems.map(normalizeUserListItem),
    page,
    pageSize,
    total,
  };
}

function normalizeArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function normalizeSession(value: unknown) {
  const item = asRecord(value);
  return {
    id: toNumber(item.id),
    revoked: toBoolean(item.revoked),
    createdAt: toIsoString(item.createdAt ?? item.created_at),
    updatedAt: toIsoString(item.updatedAt ?? item.updated_at),
    expiresAt: toIsoString(item.expiresAt ?? item.expires_at),
  };
}

function normalizeNotification(value: unknown) {
  const item = asRecord(value);
  return {
    id: toNumber(item.id),
    title: toNullableString(item.title),
    message: toNullableString(item.message),
    read: toBoolean(item.read),
    createdAt: toIsoString(item.createdAt ?? item.created_at),
  };
}

function normalizeFavorite(value: unknown) {
  const item = asRecord(value);
  return {
    branchId: toNumber(item.branchId ?? item.branch_id),
    branchName: toStringValue(item.branchName ?? item.branch_name, "Sucursal"),
    companyName: toStringValue(item.companyName ?? item.company_name, "Empresa"),
    createdAt: toIsoString(item.createdAt ?? item.created_at),
  };
}

function normalizeRecentView(value: unknown) {
  const item = asRecord(value);
  return {
    viewId: toNumber(item.viewId ?? item.view_id),
    companyName: toNullableString(item.companyName ?? item.company_name),
    branchName: toNullableString(item.branchName ?? item.branch_name),
    viewedAt: toIsoString(item.viewedAt ?? item.viewed_at),
  };
}

function normalizeBadge(value: unknown) {
  const item = asRecord(value);
  return {
    id: toNumber(item.id),
    badgeName: toStringValue(item.badgeName ?? item.badge_name, "Badge"),
    points: toNumber(item.points),
    earnedAt:
      item.earnedAt || item.earned_at
        ? toIsoString(item.earnedAt ?? item.earned_at)
        : null,
  };
}

function normalizeReview(value: unknown) {
  const item = asRecord(value);
  return {
    reviewId: toNumber(item.reviewId ?? item.review_id ?? item.id),
    branchName: toStringValue(item.branchName ?? item.branch_name, "Sucursal"),
    rating: toNumber(item.rating),
    comment: toNullableString(item.comment),
    createdAt: toIsoString(item.createdAt ?? item.created_at),
  };
}

function normalizeUserDetail(value: unknown) {
  const payload = asRecord(unwrapPayload(value));
  const user = asRecord(payload.user ?? payload);
  const createdAt = toIsoString(user.createdAt ?? user.created_at);

  return {
    id: toStringValue(user.id),
    name: toStringValue(user.name, "Sin nombre"),
    email: toStringValue(user.email),
    phone: toNullableString(user.phone),
    roleId: toNumber(user.roleId ?? user.role_id),
    roleName: toStringValue(user.roleName ?? user.role_name, "user"),
    verified: toBoolean(user.verified),
    isActive: toBoolean(user.isActive ?? user.is_active, true),
    createdAt,
    updatedAt: toIsoString(user.updatedAt ?? user.updated_at, createdAt),
    sessions: normalizeArray(payload.sessions).map(normalizeSession),
    notifications: normalizeArray(payload.notifications).map(normalizeNotification),
    favorites: normalizeArray(payload.favorites).map(normalizeFavorite),
    recentViews: normalizeArray(payload.recentViews ?? payload.recent_views).map(normalizeRecentView),
    badges: normalizeArray(payload.badges).map(normalizeBadge),
    reviews: normalizeArray(payload.reviews).map(normalizeReview),
  };
}

export async function getUsersList(input: UsersListFilters) {
  const filters = usersListFiltersSchema.parse(input);
  const raw = await callBackofficeService<unknown>("users", ADMIN_USERS_PATH, {
    query: filters,
  });

  return usersListResultSchema.parse(normalizeUsersList(raw));
}

export async function getUserDetail(userId: string) {
  try {
    const raw = await callBackofficeService<unknown>(
      "users",
      `${ADMIN_USERS_PATH}/${encodeURIComponent(userId)}`
    );

    return userDetailSchema.parse(normalizeUserDetail(raw));
  } catch (error) {
    if (error instanceof BackofficeServiceError && error.status === 404) {
      return null;
    }

    throw error;
  }
}


export async function updateAdminUserRole(
  userId: string,
  input: UpdateAdminUserRoleInput,
) {
  return callBackofficeService<unknown>(
    "users",
    `${ADMIN_USERS_PATH}/${encodeURIComponent(userId)}/role`,
    { method: "PATCH", body: input },
  );
}

export async function updateAdminUserVerification(
  userId: string,
  input: UpdateAdminUserVerificationInput,
) {
  return callBackofficeService<unknown>(
    "users",
    `${ADMIN_USERS_PATH}/${encodeURIComponent(userId)}/verification`,
    { method: "PATCH", body: input },
  );
}

export async function updateAdminUserActive(
  userId: string,
  input: UpdateAdminUserActiveInput,
) {
  return callBackofficeService<unknown>(
    "users",
    `${ADMIN_USERS_PATH}/${encodeURIComponent(userId)}/active`,
    { method: "PATCH", body: input },
  );
}
