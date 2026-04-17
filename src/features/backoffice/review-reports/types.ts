import type { PaginatedResult } from "@/features/backoffice/shared/types";

export type ReviewReportListFilters = {
  search?: string;
  status?: string;
  companyId?: string | number;
  page?: string | number;
  pageSize?: string | number;
};

export type ReviewReportListItem = {
  reportId: number;
  reviewId: number;
  companyId: number;
  companyName: string;
  branchName: string;
  reporterUserId: string;
  reporterName: string;
  statusName: string;
  statusCode: string;
  reason: string | null;
  details: string | null;
  createdAt: string;
  reviewedAt: string | null;
  reviewedByName: string | null;
};

export type ReviewReportListResult = PaginatedResult<ReviewReportListItem>;

export type ReviewReportDecisionInput = {
  status: "resolved" | "hidden";
  resolutionNotes?: string;
};

export type ReviewReportDecisionResult = {
  reportId: number;
  statusName: string;
};

export type ReviewReportDetail = ReviewReportListItem & {
  reviewComment: string | null;
  reviewRating: number;
  reviewCreatedAt: string;
};