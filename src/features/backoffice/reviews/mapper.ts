import type {
  HideReviewResult,
  ResolveReviewReportResult,
  RestoreReviewResult,
  ReviewDetail,
  ReviewListItem,
  ReviewMediaItem,
  ReviewModerationMeta,
  ReviewResponseItem,
  ReviewUsefulness,
} from "./types";

export type ReviewListRow = {
  review_id: number | string;
  user_id: string;
  user_name: string;
  user_email: string;
  company_id: number | string;
  company_name: string;
  branch_id: number | string;
  branch_name: string;
  rating: number | string;
  comment: string | null;
  validated: boolean | null;
  is_hidden: boolean | null;
  reports_count: number | string | null;
  response_status: string | null;
  usefulness_score: number | string | null;
  created_at: Date | string;
};

export type ReviewDetailRow = ReviewListRow;

export type ReviewMediaRow = {
  id: number | string;
  media_type: string | null;
  url: string;
  is_cover: boolean | null;
  sort_order: number | string | null;
};

export type ReviewResponseRow = {
  id: number | string;
  company_id: number | string;
  responder_user_id: string;
  responder_name: string | null;
  status_name: string | null;
  response_text: string;
  responded_at: Date | string;
};

export type ReviewUsefulnessRow = {
  likes_count: number | string | null;
  dislikes_count: number | string | null;
  reports_count: number | string | null;
  media_count: number | string | null;
  response_count: number | string | null;
  comment_length: number | string | null;
  has_comment: boolean | null;
  is_validated: boolean | null;
  usefulness_score: number | string | null;
  confidence_score: number | string | null;
  final_score: number | string | null;
  calculated_at: Date | string | null;
};

function toNumber(value: number | string | null | undefined): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function toIsoString(value: Date | string | null | undefined): string | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export function mapReviewListRow(row: ReviewListRow): ReviewListItem {
  return {
    reviewId: toNumber(row.review_id),
    userId: row.user_id,
    userName: row.user_name,
    userEmail: row.user_email,
    companyId: toNumber(row.company_id),
    companyName: row.company_name,
    branchId: toNumber(row.branch_id),
    branchName: row.branch_name,
    rating: toNumber(row.rating),
    comment: row.comment,
    validated: Boolean(row.validated),
    isHidden: Boolean(row.is_hidden),
    reportsCount: toNumber(row.reports_count),
    responseStatus: row.response_status,
    usefulnessScore: toNumber(row.usefulness_score),
    createdAt: toIsoString(row.created_at) ?? new Date(0).toISOString(),
  };
}

export function mapReviewMediaRow(row: ReviewMediaRow): ReviewMediaItem {
  return {
    id: toNumber(row.id),
    mediaType: row.media_type,
    url: row.url,
    isCover: Boolean(row.is_cover),
    sortOrder: toNumber(row.sort_order),
  };
}

export function mapReviewResponseRow(
  row: ReviewResponseRow | null | undefined
): ReviewResponseItem | null {
  if (!row) return null;

  return {
    id: toNumber(row.id),
    companyId: toNumber(row.company_id),
    responderUserId: row.responder_user_id,
    responderName: row.responder_name,
    statusName: row.status_name,
    responseText: row.response_text,
    respondedAt: toIsoString(row.responded_at) ?? new Date(0).toISOString(),
  };
}

export function mapReviewUsefulnessRow(
  row: ReviewUsefulnessRow | null | undefined
): ReviewUsefulness | null {
  if (!row) return null;

  return {
    likesCount: toNumber(row.likes_count),
    dislikesCount: toNumber(row.dislikes_count),
    reportsCount: toNumber(row.reports_count),
    mediaCount: toNumber(row.media_count),
    responseCount: toNumber(row.response_count),
    commentLength: toNumber(row.comment_length),
    hasComment: Boolean(row.has_comment),
    isValidated: Boolean(row.is_validated),
    usefulnessScore: toNumber(row.usefulness_score),
    confidenceScore: toNumber(row.confidence_score),
    finalScore: toNumber(row.final_score),
    calculatedAt: toIsoString(row.calculated_at),
  };
}

export function mapReviewDetailRow(
  row: ReviewDetailRow,
  input: {
    media: ReviewMediaRow[];
    response: ReviewResponseRow | null | undefined;
    usefulness: ReviewUsefulnessRow | null | undefined;
  }
): ReviewDetail {
  const base = mapReviewListRow(row);

  return {
    ...base,
    media: input.media.map(mapReviewMediaRow),
    response: mapReviewResponseRow(input.response),
    usefulness: mapReviewUsefulnessRow(input.usefulness),
  };
}

export type ReviewModerationRow = {
  id: number | string;
  is_hidden: boolean | null;
  hidden_at: Date | string | null;
  hidden_by: string | null;
  hidden_reason: string | null;
  moderation_updated_at: Date | string | null;
};

export type ReviewReportResolutionRow = {
  report_id: number | string;
  review_id: number | string;
  status_id: number | string;
  status_code: string;
  status_name: string;
  reviewed_at: Date | string | null;
  reviewed_by: string | null;
  resolution_notes: string | null;
};
export function mapReviewModerationRow(
  row: ReviewModerationRow
): ReviewModerationMeta {
  return {
    isHidden: Boolean(row.is_hidden),
    hiddenAt: toIsoString(row.hidden_at),
    hiddenBy: row.hidden_by,
    hiddenReason: row.hidden_reason,
    moderationUpdatedAt: toIsoString(row.moderation_updated_at),
  };
}

export function mapHideReviewResultRow(
  row: ReviewModerationRow
): HideReviewResult {
  return {
    reviewId: toNumber(row.id),
    ...mapReviewModerationRow(row),
  };
}

export function mapRestoreReviewResultRow(
  row: ReviewModerationRow
): RestoreReviewResult {
  return {
    reviewId: toNumber(row.id),
    ...mapReviewModerationRow(row),
  };
}

export function mapResolveReviewReportResultRow(
  row: ReviewReportResolutionRow
): ResolveReviewReportResult {
  return {
    reportId: toNumber(row.report_id),
    reviewId: toNumber(row.review_id),
    statusId: toNumber(row.status_id),
    statusCode: row.status_code,
    statusName: row.status_name,
    reviewedAt: toIsoString(row.reviewed_at),
    reviewedBy: row.reviewed_by,
    resolutionNotes: row.resolution_notes,
  };
}