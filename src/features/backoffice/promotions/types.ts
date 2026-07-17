import type { PaginatedResult } from "@/features/backoffice/shared/types";

export type PromotionStatus =
  | "draft"
  | "pending_review"
  | "approved"
  | "paused"
  | "rejected"
  | "expired"
  | "deleted";

export type PromotionListFilters = {
  search?: string;
  companyId?: string | number;
  branchId?: string | number;
  districtId?: string | number;
  status?: string;
  active?: string | boolean;
  page?: string | number;
  pageSize?: string | number;
};

export type PromotionListItem = {
  id: number;
  title: string;
  description: string | null;
  terms: string | null;
  discountPercent: number | null;
  startDate: string | null;
  endDate: string | null;
  active: boolean;
  status: PromotionStatus;
  statusName: string | null;
  isPubliclyAvailable: boolean;
  requiresStaffValidation: boolean;
  coverUrl: string | null;
  branchId: number;
  branchName: string;
  companyId: number;
  companyName: string;
  districtId: number | null;
  districtName: string | null;
  redemptionsTotal: number;
  issuedCount: number;
  maxRedemptions: number | null;
  maxRedemptionsPerUser: number;
};

export type PromotionsListResult = PaginatedResult<PromotionListItem>;

export type PromotionSummary = {
  totalPromotions: number;
  pendingReviewPromotions: number;
  approvedPromotions: number;
  pausedPromotions: number;
  rejectedPromotions: number;
  issuedRedemptions: number;
  redeemedRedemptions: number;
};

export type PromotionsDashboardData = {
  promotions: PromotionsListResult;
  summary: PromotionSummary;
};

export type PromotionRedemption = {
  redemptionId: number;
  promotionId: number;
  branchId: number;
  companyId: number;
  userId: string | null;
  userName: string | null;
  userEmail: string | null;
  redemptionCode: string;
  status: string;
  statusName: string | null;
  issuedAt: string | null;
  redeemedAt: string | null;
  cancelledAt: string | null;
  expiresAt: string | null;
};

export type PromotionDetail = PromotionListItem & {
  redemptions: PromotionRedemption[];
};

export type ModeratePromotionInput = {
  decision: "approved" | "rejected" | "requires_changes";
  reason?: string;
};

export type UpdatePromotionStatusInput = {
  status: "approved" | "paused";
  reason?: string;
};
