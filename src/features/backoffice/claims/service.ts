import {
  claimDecisionResultSchema,
  claimDecisionSchema,
  claimDetailSchema,
  claimFlowActionResultSchema,
  claimListFiltersSchema,
  claimListResultSchema,
  officialChannelChallengeResultSchema,
  officialChannelSchema,
  onsiteApprovalSchema,
  onsiteRequiredSchema,
} from "./schema";
import {
  mapClaimDecisionResult,
  mapClaimDetailRow,
  mapClaimListRow,
} from "./mapper";
import type {
  ClaimDecisionInput,
  ClaimListFilters,
  OfficialChannelInput,
  OnsiteApprovalInput,
  OnsiteRequiredInput,
} from "./types";
import {
  approveClaimQuery,
  approveOnsiteVerificationQuery,
  createOfficialChannelChallengeQuery,
  getClaimDetailQuery,
  getClaimPublicContactsQuery,
  getClaimWhatsappVerificationsQuery,
  listClaimsQuery,
  markClaimOnsiteRequiredQuery,
  rejectClaimQuery,
  requestMoreEvidenceClaimQuery,
} from "@/lib/db/queries/backoffice/claims";
import { sendBusinessChannelMessage } from "@/lib/integrations/notifications-service";

export async function getClaimsList(input: ClaimListFilters) {
  const filters = claimListFiltersSchema.parse(input);

  const result = await listClaimsQuery(filters);

  const mapped = {
    items: result.rows.map(mapClaimListRow),
    page: result.page,
    pageSize: result.pageSize,
    total: result.total,
  };

  return claimListResultSchema.parse(mapped);
}

export async function getClaimDetail(claimRequestId: number) {
  const row = await getClaimDetailQuery(claimRequestId);

  if (!row) return null;

  const [publicContacts, whatsappVerifications] = await Promise.all([
    getClaimPublicContactsQuery(claimRequestId),
    getClaimWhatsappVerificationsQuery(claimRequestId),
  ]);

  return claimDetailSchema.parse(
    mapClaimDetailRow(row, { publicContacts, whatsappVerifications })
  );
}

export async function sendOfficialChannelCode(
  claimRequestId: number,
  reviewerUserId: string,
  input: OfficialChannelInput
) {
  const parsed = officialChannelSchema.parse(input);

  const draft = await createOfficialChannelChallengeQuery({
    claimRequestId,
    reviewerUserId,
    officialChannel: parsed,
  });

  const notification = await sendBusinessChannelMessage({
    channel: draft.channel,
    to: draft.to,
    type: "business.onboarding.official_channel_validation",
    data: {
      businessName: draft.companyName,
      branchName: draft.branchName,
      requestType: "claim",
      requestId: draft.claimRequestId,
      verificationRequestId: draft.verificationRequestId,
      verificationCheckId: draft.verificationCheckId,
      officialChannel: draft.channel,
      officialChannelValue: draft.to,
      code: draft.code,
      expiresAt: draft.codeExpiresAt,
    },
  });

  return officialChannelChallengeResultSchema.parse({
    claimRequestId: draft.claimRequestId,
    verificationRequestId: draft.verificationRequestId,
    verificationCheckId: draft.verificationCheckId,
    channel: draft.channel,
    to: draft.to,
    codeExpiresAt: draft.codeExpiresAt,
    notification,
  });
}

export async function markClaimOnsiteRequired(
  claimRequestId: number,
  reviewerUserId: string,
  input: OnsiteRequiredInput
) {
  const parsed = onsiteRequiredSchema.parse(input);
  const result = await markClaimOnsiteRequiredQuery({
    claimRequestId,
    reviewerUserId,
    onsite: parsed,
  });

  return claimFlowActionResultSchema.parse(result);
}

export async function approveOnsiteVerification(
  claimRequestId: number,
  reviewerUserId: string,
  input: OnsiteApprovalInput
) {
  const parsed = onsiteApprovalSchema.parse(input);
  const result = await approveOnsiteVerificationQuery({
    claimRequestId,
    reviewerUserId,
    approval: parsed,
  });

  return claimFlowActionResultSchema.parse(result);
}

export async function requestMoreEvidenceClaim(
  claimRequestId: number,
  reviewerUserId: string,
  notes?: string | null
) {
  const result = await requestMoreEvidenceClaimQuery({
    claimRequestId,
    reviewerUserId,
    notes,
  });

  return claimFlowActionResultSchema.parse(result);
}

export async function approveClaim(
  claimRequestId: number,
  reviewerUserId: string,
  input: ClaimDecisionInput
) {
  const parsed = claimDecisionSchema.parse(input);

  const result = await approveClaimQuery({
    claimRequestId,
    reviewerUserId,
    notes: parsed.notes,
  });

  return claimDecisionResultSchema.parse(mapClaimDecisionResult(result));
}

export async function rejectClaim(
  claimRequestId: number,
  reviewerUserId: string,
  input: ClaimDecisionInput
) {
  const parsed = claimDecisionSchema.parse(input);

  const result = await rejectClaimQuery({
    claimRequestId,
    reviewerUserId,
    notes: parsed.notes,
  });

  return claimDecisionResultSchema.parse(mapClaimDecisionResult(result));
}
