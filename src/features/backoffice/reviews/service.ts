import {
  hideReviewInputSchema,
  hideReviewResultSchema,
  restoreReviewInputSchema,
  restoreReviewResultSchema,
  resolveReviewReportInputSchema,
  resolveReviewReportResultSchema,
  reviewDetailSchema,
  reviewsListFiltersSchema,
  reviewsListResultSchema,
} from "./schema";
import type {
  HideReviewInput,
  ResolveReviewReportInput,
  RestoreReviewInput,
  ReviewsListFilters,
} from "./types";
import { callBackofficeService } from "@/lib/microservices/backoffice-client";

function asRecord(value: unknown): Record<string, any> {
  return value && typeof value === "object"
    ? (value as Record<string, any>)
    : {};
}

function unwrapData(raw: unknown): unknown {
  const payload = asRecord(raw);
  if ("data" in payload) return payload.data;
  return raw;
}

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function toBoolean(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "string")
    return ["true", "1", "yes", "si", "sí"].includes(value.toLowerCase());
  return Boolean(value);
}

function toIsoString(value: unknown): string {
  if (typeof value === "string") {
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? new Date(0).toISOString()
      : date.toISOString();
  }
  if (value instanceof Date) return value.toISOString();
  return new Date(0).toISOString();
}

function toNullableIsoString(value: unknown): string | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function normalizeReviewItem(raw: unknown) {
  const item = asRecord(raw);
  return {
    reviewId: toNumber(item.reviewId ?? item.review_id ?? item.id),
    userId: String(item.userId ?? item.user_id ?? ""),
    userName: String(
      item.userName ?? item.user_name ?? item.user?.name ?? "Usuario",
    ),
    userEmail: String(
      item.userEmail ?? item.user_email ?? item.user?.email ?? "",
    ),
    companyId: toNumber(
      item.companyId ??
        item.company_id ??
        item.company?.companyId ??
        item.company?.id,
    ),
    companyName: String(
      item.companyName ??
        item.company_name ??
        item.company?.name ??
        "Sin empresa",
    ),
    branchId: toNumber(
      item.branchId ??
        item.branch_id ??
        item.branch?.branchId ??
        item.branch?.id,
    ),
    branchName: String(
      item.branchName ??
        item.branch_name ??
        item.branch?.name ??
        "Sin sucursal",
    ),
    rating: toNumber(item.rating),
    comment: item.comment ?? null,
    validated: toBoolean(item.validated),
    isHidden: toBoolean(item.isHidden ?? item.is_hidden),
    reportsCount: toNumber(item.reportsCount ?? item.reports_count),
    responseStatus: item.responseStatus ?? item.response_status ?? null,
    usefulnessScore: toNumber(item.usefulnessScore ?? item.usefulness_score),
    createdAt: toIsoString(item.createdAt ?? item.created_at),
  };
}

function normalizeReviewsList(raw: unknown) {
  const payload = asRecord(unwrapData(raw));
  const meta = asRecord(payload.meta ?? payload.pagination);
  const items = Array.isArray(payload.items) ? payload.items : [];
  const page = toNumber(payload.page ?? meta.page, 1);
  const pageSize = toNumber(payload.pageSize ?? meta.pageSize, 10);
  const total = toNumber(payload.total ?? meta.total, items.length);
  return {
    items: items.map(normalizeReviewItem),
    page,
    pageSize,
    total,
  };
}

function normalizeReviewMedia(raw: unknown) {
  const item = asRecord(raw);
  return {
    id: toNumber(item.id ?? item.mediaId ?? item.media_id),
    mediaType: item.mediaType ?? item.media_type ?? item.type ?? null,
    url: String(item.url ?? ""),
    isCover: toBoolean(item.isCover ?? item.is_cover),
    sortOrder: toNumber(item.sortOrder ?? item.sort_order, 1),
  };
}

function normalizeReviewResponse(raw: unknown) {
  if (!raw) return null;
  const item = asRecord(raw);
  return {
    id: toNumber(item.id),
    companyId: toNumber(item.companyId ?? item.company_id),
    responderUserId: String(
      item.responderUserId ?? item.responder_user_id ?? "",
    ),
    responderName: item.responderName ?? item.responder_name ?? null,
    statusName: item.statusName ?? item.status_name ?? null,
    responseText: String(item.responseText ?? item.response_text ?? ""),
    respondedAt: toIsoString(item.respondedAt ?? item.responded_at),
  };
}

function normalizeUsefulness(raw: unknown) {
  if (!raw) return null;
  const item = asRecord(raw);
  return {
    likesCount: toNumber(item.likesCount ?? item.likes_count),
    dislikesCount: toNumber(item.dislikesCount ?? item.dislikes_count),
    reportsCount: toNumber(item.reportsCount ?? item.reports_count),
    mediaCount: toNumber(item.mediaCount ?? item.media_count),
    responseCount: toNumber(item.responseCount ?? item.response_count),
    commentLength: toNumber(item.commentLength ?? item.comment_length),
    hasComment: toBoolean(item.hasComment ?? item.has_comment),
    isValidated: toBoolean(item.isValidated ?? item.is_validated),
    usefulnessScore: toNumber(item.usefulnessScore ?? item.usefulness_score),
    confidenceScore: toNumber(item.confidenceScore ?? item.confidence_score),
    finalScore: toNumber(item.finalScore ?? item.final_score),
    calculatedAt: toNullableIsoString(item.calculatedAt ?? item.calculated_at),
  };
}

function normalizeReviewDetail(raw: unknown) {
  const payload = asRecord(unwrapData(raw));
  return {
    ...normalizeReviewItem(payload.review ?? payload),
    media: Array.isArray(payload.media)
      ? payload.media.map(normalizeReviewMedia)
      : [],
    response: normalizeReviewResponse(payload.response),
    usefulness: normalizeUsefulness(payload.usefulness),
  };
}

function normalizeModerationResult(raw: unknown) {
  const payload = asRecord(unwrapData(raw));
  return {
    reviewId: toNumber(payload.reviewId ?? payload.review_id ?? payload.id),
    isHidden: toBoolean(payload.isHidden ?? payload.is_hidden),
    hiddenAt: toNullableIsoString(payload.hiddenAt ?? payload.hidden_at),
    hiddenBy: payload.hiddenBy ?? payload.hidden_by ?? null,
    hiddenReason: payload.hiddenReason ?? payload.hidden_reason ?? null,
    moderationUpdatedAt: toNullableIsoString(
      payload.moderationUpdatedAt ?? payload.moderation_updated_at,
    ),
  };
}

function normalizeReportResolution(raw: unknown) {
  const payload = asRecord(unwrapData(raw));
  return {
    reportId: toNumber(payload.reportId ?? payload.report_id),
    reviewId: toNumber(payload.reviewId ?? payload.review_id),
    statusId: toNumber(payload.statusId ?? payload.status_id),
    statusCode: String(payload.statusCode ?? payload.status_code ?? "resolved"),
    statusName: String(
      payload.statusName ??
        payload.status_name ??
        payload.statusCode ??
        "Resolved",
    ),
    reviewedAt: toNullableIsoString(payload.reviewedAt ?? payload.reviewed_at),
    reviewedBy: payload.reviewedBy ?? payload.reviewed_by ?? null,
    resolutionNotes:
      payload.resolutionNotes ?? payload.resolution_notes ?? null,
  };
}

export async function getReviewsList(input: ReviewsListFilters) {
  const filters = reviewsListFiltersSchema.parse(input);
  const raw = await callBackofficeService<unknown>(
    "reviews",
    "/api/backoffice/reviews",
    {
      query: filters,
    },
  );
  return reviewsListResultSchema.parse(normalizeReviewsList(raw));
}

export async function getReviewDetail(reviewId: number) {
  const raw = await callBackofficeService<unknown>(
    "reviews",
    `/api/backoffice/reviews/${reviewId}`,
  );
  const payload = unwrapData(raw);
  if (!payload) return null;
  return reviewDetailSchema.parse(normalizeReviewDetail(payload));
}

export async function hideReview(
  reviewId: number,
  _actorUserId: string,
  input: HideReviewInput,
) {
  const payload = hideReviewInputSchema.parse(input);
  const raw = await callBackofficeService<unknown>(
    "reviews",
    `/api/backoffice/reviews/${reviewId}/hide`,
    {
      method: "POST",
      body: payload,
    },
  );
  return hideReviewResultSchema.parse(normalizeModerationResult(raw));
}

export async function restoreReview(
  reviewId: number,
  _actorUserId: string,
  input: RestoreReviewInput = {},
) {
  restoreReviewInputSchema.parse(input);
  const raw = await callBackofficeService<unknown>(
    "reviews",
    `/api/backoffice/reviews/${reviewId}/restore`,
    {
      method: "POST",
      body: input,
    },
  );
  return restoreReviewResultSchema.parse(normalizeModerationResult(raw));
}

export async function resolveReviewReport(
  reportId: number,
  _actorUserId: string,
  input: ResolveReviewReportInput,
) {
  const payload = resolveReviewReportInputSchema.parse(input);
  const raw = await callBackofficeService<unknown>(
    "reviewReports",
    `/api/backoffice/review-reports/${reportId}/resolve`,
    {
      method: "POST",
      body: {
        resolution: payload.resolution,
        notes: payload.resolutionNotes ?? null,
      },
    },
  );
  return resolveReviewReportResultSchema.parse(normalizeReportResolution(raw));
}
