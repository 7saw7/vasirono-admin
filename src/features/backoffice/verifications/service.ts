import {
  getVerificationDetailQuery,
  getVerificationDocumentsQuery,
  getVerificationChecksQuery,
  getVerificationTimelineQuery,
} from "@/lib/db/queries/backoffice/verifications";

export async function getVerificationDetail(requestId: number) {
  const base = await getVerificationDetailQuery(requestId);
  if (!base) return null;

  const [documents, checks, timeline] = await Promise.all([
    getVerificationDocumentsQuery(requestId),
    getVerificationChecksQuery(requestId),
    getVerificationTimelineQuery(requestId),
  ]);

  return {
    verificationRequestId: base.verification_request_id,
    companyId: base.company_id,
    companyName: base.company_name,
    statusName: base.status_name,
    statusCode: base.status_code,
    verificationLevel: base.verification_level,
    requestedByName: base.requested_by_name,
    assignedReviewerName: base.assigned_reviewer_name,
    startedAt: base.started_at,
    submittedAt: base.submitted_at,
    reviewedAt: base.reviewed_at,
    completedAt: base.completed_at,
    documents,
    checks,
    timeline,
  };
}