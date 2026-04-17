import {
  reviewReportDecisionResultSchema,
  reviewReportDecisionSchema,
  reviewReportDetailSchema,
  reviewReportListFiltersSchema,
  reviewReportListResultSchema,
} from "./schema";
import {
  mapReviewReportDecisionResult,
  mapReviewReportDetailRow,
  mapReviewReportRow,
} from "./mapper";
import type {
  ReviewReportDecisionInput,
  ReviewReportListFilters,
} from "./types";
import {
  getReviewReportDetailQuery,
  listReviewReportsQuery,
  resolveReviewReportQuery,
} from "@/lib/db/queries/backoffice/review-reports";

export async function getReviewReportsList(input: ReviewReportListFilters) {
  const filters = reviewReportListFiltersSchema.parse(input);
  const result = await listReviewReportsQuery(filters);

  return reviewReportListResultSchema.parse({
    items: result.rows.map(mapReviewReportRow),
    page: result.page,
    pageSize: result.pageSize,
    total: result.total,
  });
}

export async function getReviewReportDetail(reportId: number) {
  const row = await getReviewReportDetailQuery(reportId);
  if (!row) return null;

  return reviewReportDetailSchema.parse(mapReviewReportDetailRow(row));
}

export async function resolveReviewReport(
  reportId: number,
  actorUserId: string,
  input: ReviewReportDecisionInput
) {
  const parsed = reviewReportDecisionSchema.parse(input);
  const result = await resolveReviewReportQuery({
    reportId,
    actorUserId,
    status: parsed.status,
    resolutionNotes: parsed.resolutionNotes,
  });

  return reviewReportDecisionResultSchema.parse(
    mapReviewReportDecisionResult(result)
  );
}