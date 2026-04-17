import {
  verificationAssignResultSchema,
  verificationAssignSchema,
  verificationDetailSchema,
  verificationListFiltersSchema,
  verificationListResultSchema,
} from "./schema";
import {
  mapVerificationAssignResult,
  mapVerificationDetailRow,
  mapVerificationListRow,
  mapVerificationSummaryRow,
} from "./mapper";
import type {
  VerificationAssignInput,
  VerificationDecisionInput,
  VerificationListFilters,
  VerificationDecisionResult,
} from "./types";
import {
  assignVerificationReviewerQuery,
  getVerificationAddressMatchesQuery,
  getVerificationChecksQuery,
  getVerificationDetailQuery,
  getVerificationDocumentsQuery,
  getVerificationPublicContactsQuery,
  getVerificationTimelineQuery,
  getVerificationWhatsappQuery,
  listVerificationsQuery,
  getVerificationRequestForDecisionQuery,
  getVerificationRequestStatusByCodeQuery,
  insertVerificationAuditLogQuery,
  syncCompanyVerificationStatusFromProfileQuery,
  updateVerificationDecisionQuery,
  upsertCompanyVerificationProfileFromRequestQuery,  
} from "@/lib/db/queries/backoffice/verifications";

import { withTransaction } from "@/lib/db/server";
import { verificationDecisionInputSchema } from "./schema";
import { AppError } from "@/lib/errors/app-error";

export async function getVerificationRequestsList(input: VerificationListFilters) {
  const filters = verificationListFiltersSchema.parse(input);
  const result = await listVerificationsQuery(filters);

  const mapped = {
    items: result.rows.map(mapVerificationListRow),
    page: result.page,
    pageSize: result.pageSize,
    total: result.total,
    summary: mapVerificationSummaryRow(result.summary),
  };

  return verificationListResultSchema.parse(mapped);
}

export async function getVerificationDetail(requestId: number) {
  const base = await getVerificationDetailQuery(requestId);
  if (!base) return null;

  const [
    documents,
    checks,
    timeline,
    publicContacts,
    whatsappVerifications,
    addressMatches,
  ] = await Promise.all([
    getVerificationDocumentsQuery(requestId),
    getVerificationChecksQuery(requestId),
    getVerificationTimelineQuery(requestId),
    getVerificationPublicContactsQuery(requestId),
    getVerificationWhatsappQuery(requestId),
    getVerificationAddressMatchesQuery(requestId),
  ]);

  const mapped = mapVerificationDetailRow(base, {
    documents,
    checks,
    timeline,
    publicContacts,
    whatsappVerifications,
    addressMatches,
  });

  return verificationDetailSchema.parse(mapped);
}

export async function assignVerificationReviewer(
  requestId: number,
  input: VerificationAssignInput
) {
  const parsed = verificationAssignSchema.parse(input);
  const result = await assignVerificationReviewerQuery({
    requestId,
    reviewerUserId: parsed.reviewerUserId,
  });

  return verificationAssignResultSchema.parse(
    mapVerificationAssignResult(result)
  );
}

export async function decideVerificationRequest(
  requestId: number,
  reviewerUserId: string,
  input: VerificationDecisionInput
): Promise<VerificationDecisionResult> {
  const payload = verificationDecisionInputSchema.parse(input);

  return withTransaction(async (client) => {
    const current = await getVerificationRequestForDecisionQuery(requestId, client);

    if (!current) {
      throw new AppError(
        "La solicitud de verificación no existe.",
        404,
        "VERIFICATION_REQUEST_NOT_FOUND"
      );
    }

    const nextCode =
      payload.decision === "approved" ? "approved" : "rejected";

    const nextStatus = await getVerificationRequestStatusByCodeQuery(
      nextCode,
      client
    );

    if (!nextStatus) {
      throw new AppError(
        `No existe el estado de verificación requerido: ${nextCode}.`,
        500,
        "VERIFICATION_STATUS_NOT_FOUND"
      );
    }

    const oldStatusId = Number(current.current_status_id);
    const newStatusId = Number(nextStatus.id);

    const updated = await updateVerificationDecisionQuery(
      requestId,
      newStatusId,
      {
        approvalNotes: payload.approvalNotes ?? null,
        rejectionReason: payload.rejectionReason ?? null,
      },
      reviewerUserId,
      client
    );

    if (!updated) {
      throw new AppError(
        "No se pudo actualizar la solicitud de verificación.",
        500,
        "VERIFICATION_REQUEST_UPDATE_FAILED"
      );
    }

    const approved = payload.decision === "approved";

    await upsertCompanyVerificationProfileFromRequestQuery(
      {
        companyId: Number(updated.company_id),
        requestId: Number(updated.verification_request_id),
        verificationLevelId:
          updated.verification_level_id !== null &&
          updated.verification_level_id !== undefined
            ? Number(updated.verification_level_id)
            : null,
        approved,
        notes: approved
          ? payload.approvalNotes ?? null
          : payload.rejectionReason ?? null,
      },
      client
    );

    const companySync = await syncCompanyVerificationStatusFromProfileQuery(
      Number(updated.company_id),
      approved,
      client
    );

    await insertVerificationAuditLogQuery(
      {
        verificationRequestId: Number(updated.verification_request_id),
        actorUserId: reviewerUserId,
        action: approved ? "request_approved" : "request_rejected",
        oldStatusId,
        newStatusId,
        details: {
          decision: payload.decision,
          approvalNotes: payload.approvalNotes ?? null,
          rejectionReason: payload.rejectionReason ?? null,
          companyVerificationStatusId: companySync.verificationStatusId,
        },
      },
      client
    );

    return {
      verificationRequestId: Number(updated.verification_request_id),
      companyId: Number(updated.company_id),
      requestStatusCode: updated.current_status_code,
      requestStatusName: updated.current_status_name,
      companyVerificationStatusId: companySync.verificationStatusId,
      profileUpdated: true,
      reviewedAt: updated.reviewed_at,
      completedAt: updated.completed_at,
    };
  });
}