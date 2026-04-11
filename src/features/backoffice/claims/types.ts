import type { PaginatedResult } from "@/features/backoffice/shared/types";

export type ClaimListFilters = {
  search?: string;
  status?: string;
  companyId?: number | string;
  page?: number | string;
  pageSize?: number | string;
};

export type ClaimListItem = {
  claimRequestId: number;
  companyId: number;
  companyName: string;
  userId: string;
  claimantName: string;
  claimantEmail: string;
  statusName: string;
  statusCode: string;
  submittedAt: string;
  reviewedAt: string | null;
  reviewedByName: string | null;
  notes: string | null;
  evidenceUrl: string | null;
  hasVerificationRequest: boolean;
};

export type ClaimListResult = PaginatedResult<ClaimListItem>;

export type ClaimDecisionInput = {
  decision: "approve" | "reject";
  notes?: string;
};

export type ClaimDetail = {
  claimRequestId: number;
  companyId: number;
  companyName: string;
  userId: string;
  claimantName: string;
  claimantEmail: string;
  statusId: number | null;
  statusName: string;
  statusCode: string;
  submittedAt: string;
  reviewedAt: string | null;
  reviewedById: string | null;
  reviewedByName: string | null;
  notes: string | null;
  evidenceUrl: string | null;
  verificationRequestId: number | null;
  verificationStatusName: string | null;
};

export type ClaimDecisionResult = {
  claimRequestId: number;
  statusName: string;
  verificationRequestId: number | null;
};