import { callBackofficeService } from "@/lib/microservices/backoffice-client";
import { paginatedPayload } from "@/features/backoffice/billing/service-helpers";
import {
  moderatePromotionSchema,
  promotionListFiltersSchema,
  updatePromotionStatusSchema,
} from "./schema";
import type {
  ModeratePromotionInput,
  PromotionDetail,
  PromotionListFilters,
  PromotionListItem,
  PromotionRedemption,
  PromotionSummary,
  PromotionsDashboardData,
  UpdatePromotionStatusInput,
} from "./types";

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
}

function nullableString(value: unknown): string | null {
  return value === undefined || value === null ? null : String(value);
}

function nullableNumber(value: unknown): number | null {
  if (value === undefined || value === null || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function mapPromotion(raw: unknown): PromotionListItem {
  const item = record(raw);
  const status = String(
    item.status ?? item.statusCode ?? "draft",
  ) as PromotionListItem["status"];

  return {
    id: Number(item.promotionId ?? item.id ?? 0),
    title: String(item.title ?? "Sin título"),
    description: nullableString(item.description),
    terms: nullableString(item.terms),
    discountPercent: nullableNumber(
      item.discountPercent ?? item.discount_percent,
    ),
    startDate: nullableString(item.startDate ?? item.start_date),
    endDate: nullableString(item.endDate ?? item.end_date),
    active: Boolean(item.active ?? status === "approved"),
    status,
    statusName: nullableString(item.statusName ?? item.status_name),
    isPubliclyAvailable: Boolean(
      item.isPubliclyAvailable ??
      item.is_publicly_available ??
      status === "approved",
    ),
    requiresStaffValidation: Boolean(
      item.requiresStaffValidation ?? item.requires_staff_validation ?? true,
    ),
    coverUrl: nullableString(item.coverUrl ?? item.cover_url),
    branchId: Number(item.branchId ?? item.branch_id ?? 0),
    branchName: String(item.branchName ?? item.branch_name ?? "Sin sucursal"),
    companyId: Number(item.companyId ?? item.company_id ?? 0),
    companyName: String(item.companyName ?? item.company_name ?? "Sin empresa"),
    districtId: nullableNumber(item.districtId ?? item.district_id),
    districtName: nullableString(item.districtName ?? item.district_name),
    redemptionsTotal: Number(
      item.redemptionsTotal ?? item.redeemedCount ?? item.redeemed_count ?? 0,
    ),
    issuedCount: Number(item.issuedCount ?? item.issued_count ?? 0),
    maxRedemptions: nullableNumber(item.maxRedemptions ?? item.max_redemptions),
    maxRedemptionsPerUser: Number(
      item.maxRedemptionsPerUser ?? item.max_redemptions_per_user ?? 1,
    ),
  };
}

function mapSummary(raw: unknown): PromotionSummary {
  const item = record(raw);
  return {
    totalPromotions: Number(item.totalPromotions ?? item.total_promotions ?? 0),
    pendingReviewPromotions: Number(
      item.pendingReviewPromotions ?? item.pending_review_promotions ?? 0,
    ),
    approvedPromotions: Number(
      item.approvedPromotions ?? item.approved_promotions ?? 0,
    ),
    pausedPromotions: Number(
      item.pausedPromotions ?? item.paused_promotions ?? 0,
    ),
    rejectedPromotions: Number(
      item.rejectedPromotions ?? item.rejected_promotions ?? 0,
    ),
    issuedRedemptions: Number(
      item.issuedRedemptions ?? item.issued_redemptions ?? 0,
    ),
    redeemedRedemptions: Number(
      item.redeemedRedemptions ?? item.redeemed_redemptions ?? 0,
    ),
  };
}

function mapRedemption(raw: unknown): PromotionRedemption {
  const item = record(raw);
  return {
    redemptionId: Number(item.redemptionId ?? item.redemption_id ?? 0),
    promotionId: Number(item.promotionId ?? item.promotion_id ?? 0),
    branchId: Number(item.branchId ?? item.branch_id ?? 0),
    companyId: Number(item.companyId ?? item.company_id ?? 0),
    userId: nullableString(item.userId ?? item.user_id),
    userName: nullableString(item.userName ?? item.user_name),
    userEmail: nullableString(item.userEmail ?? item.user_email),
    redemptionCode: String(item.redemptionCode ?? item.redemption_code ?? ""),
    status: String(item.status ?? item.statusCode ?? "unknown"),
    statusName: nullableString(item.statusName ?? item.status_name),
    issuedAt: nullableString(item.issuedAt ?? item.issued_at),
    redeemedAt: nullableString(item.redeemedAt ?? item.redeemed_at),
    cancelledAt: nullableString(item.cancelledAt ?? item.cancelled_at),
    expiresAt: nullableString(item.expiresAt ?? item.expires_at),
  };
}

function queryFromFilters(
  filters: PromotionListFilters,
): Record<string, unknown> {
  return {
    search: filters.search,
    companyId: filters.companyId,
    branchId: filters.branchId,
    districtId: filters.districtId,
    status: filters.status,
    active: filters.active,
    page: filters.page,
    pageSize: filters.pageSize,
  };
}

export async function getAdminPromotionsDashboard(
  input: PromotionListFilters = {},
): Promise<PromotionsDashboardData> {
  const filters = promotionListFiltersSchema.parse(input);
  const query = queryFromFilters(filters);

  const [listRaw, summaryRaw] = await Promise.all([
    callBackofficeService<unknown>("promotions", "/api/backoffice/promotions", {
      query,
    }),
    callBackofficeService<unknown>(
      "promotions",
      "/api/backoffice/promotions/dashboard",
      {
        query,
      },
    ),
  ]);

  const page = paginatedPayload(listRaw);
  return {
    promotions: {
      items: page.items.map(mapPromotion),
      page: page.page,
      pageSize: page.pageSize,
      total: page.total,
    },
    summary: mapSummary(summaryRaw),
  };
}

export async function getAdminPromotionDetail(
  promotionId: number,
): Promise<PromotionDetail> {
  const raw = await callBackofficeService<unknown>(
    "promotions",
    `/api/backoffice/promotions/${promotionId}`,
  );
  const payload = record(raw);
  const redemptions = Array.isArray(payload.redemptions)
    ? payload.redemptions.map(mapRedemption)
    : [];

  return {
    ...mapPromotion(payload),
    redemptions,
  };
}

export async function updateAdminPromotionStatus(
  promotionId: number,
  input: UpdatePromotionStatusInput,
) {
  const body = updatePromotionStatusSchema.parse(input);
  return callBackofficeService<unknown>(
    "promotions",
    `/api/backoffice/promotions/${promotionId}/status`,
    { method: "PATCH", body },
  );
}

export async function moderateAdminPromotion(
  promotionId: number,
  input: ModeratePromotionInput,
) {
  const body = moderatePromotionSchema.parse(input);
  return callBackofficeService<unknown>(
    "promotions",
    `/api/backoffice/promotions/${promotionId}/moderate`,
    { method: "PATCH", body },
  );
}
