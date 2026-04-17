import type { PaginatedResult } from "@/features/backoffice/shared/types";

export type ReviewsListFilters = {
  search?: string;
  validated?: string | boolean;
  hidden?: string | boolean;
  branchId?: string | number;
  companyId?: string | number;
  page?: string | number;
  pageSize?: string | number;
};

export type ReviewListItem = {
  reviewId: number;
  userId: string;
  userName: string;
  userEmail: string;
  companyId: number;
  companyName: string;
  branchId: number;
  branchName: string;
  rating: number;
  comment: string | null;
  validated: boolean;
  isHidden: boolean;
  reportsCount: number;
  responseStatus: string | null;
  usefulnessScore: number;
  createdAt: string;
};

export type ReviewsListResult = PaginatedResult<ReviewListItem>;

export type ReviewMediaItem = {
  id: number;
  mediaType: string | null;
  url: string;
  isCover: boolean;
  sortOrder: number;
};

export type ReviewResponseItem = {
  id: number;
  companyId: number;
  responderUserId: string;
  responderName: string | null;
  statusName: string | null;
  responseText: string;
  respondedAt: string;
};

export type ReviewUsefulness = {
  likesCount: number;
  dislikesCount: number;
  reportsCount: number;
  mediaCount: number;
  responseCount: number;
  commentLength: number;
  hasComment: boolean;
  isValidated: boolean;
  usefulnessScore: number;
  confidenceScore: number;
  finalScore: number;
  calculatedAt: string | null;
};

export type ReviewDetail = {
  reviewId: number;
  userId: string;
  userName: string;
  userEmail: string;
  companyId: number;
  companyName: string;
  branchId: number;
  branchName: string;
  rating: number;
  comment: string | null;
  validated: boolean;
  isHidden: boolean;
  reportsCount: number;
  createdAt: string;
  media: ReviewMediaItem[];
  response: ReviewResponseItem | null;
  usefulness: ReviewUsefulness | null;
};

export type ReviewModerationMeta = {
  isHidden: boolean;
  hiddenAt: string | null;
  hiddenBy: string | null;
  hiddenReason: string | null;
  moderationUpdatedAt: string | null;
};

export type HideReviewInput = {
  reason: string;
};

export type RestoreReviewInput = {
  reason?: string | null;
};

export type HideReviewResult = {
  reviewId: number;
  isHidden: boolean;
  hiddenAt: string | null;
  hiddenBy: string | null;
  hiddenReason: string | null;
  moderationUpdatedAt: string | null;
};

export type RestoreReviewResult = {
  reviewId: number;
  isHidden: boolean;
  hiddenAt: string | null;
  hiddenBy: string | null;
  hiddenReason: string | null;
  moderationUpdatedAt: string | null;
};

export type ResolveReviewReportInput = {
  resolution: "resolved" | "dismissed";
  resolutionNotes?: string | null;
};

export type ResolveReviewReportResult = {
  reportId: number;
  reviewId: number;
  statusId: number;
  statusCode: string;
  statusName: string;
  reviewedAt: string | null;
  reviewedBy: string | null;
  resolutionNotes: string | null;
};