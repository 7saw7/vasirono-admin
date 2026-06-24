import {
  verificationAssignResultSchema,
  verificationAssignSchema,
  verificationDetailSchema,
  verificationListFiltersSchema,
  verificationListResultSchema,
  verificationDecisionInputSchema,
} from "./schema";
import type {
  VerificationAssignInput,
  VerificationDecisionInput,
  VerificationListFilters,
  VerificationDecisionResult,
} from "./types";
import { callBackofficeService } from "@/lib/microservices/backoffice-client";

function unwrapList(raw: any) {
  return raw?.items ? raw : raw?.data?.items ? raw.data : raw;
}

export async function getVerificationRequestsList(input: VerificationListFilters) {
  const filters = verificationListFiltersSchema.parse(input);
  const raw = await callBackofficeService<unknown>("verifications", "/api/admin/verifications", {
    query: filters,
  });
  return verificationListResultSchema.parse(unwrapList(raw));
}

export async function getVerificationDetail(requestId: number) {
  const raw = await callBackofficeService<unknown>("verifications", `/api/admin/verifications/${requestId}`);
  if (!raw) return null;
  return verificationDetailSchema.parse(raw);
}

export async function assignVerificationReviewer(
  requestId: number,
  input: VerificationAssignInput
) {
  const parsed = verificationAssignSchema.parse(input);
  const raw = await callBackofficeService<unknown>("verifications", `/api/admin/verifications/${requestId}/assign`, {
    method: "PATCH",
    body: parsed,
  });
  return verificationAssignResultSchema.parse(raw);
}

export async function decideVerificationRequest(
  requestId: number,
  reviewerUserId: string,
  input: VerificationDecisionInput
): Promise<VerificationDecisionResult> {
  const payload = verificationDecisionInputSchema.parse(input);
  const path = payload.decision === "approved" ? "approve" : "reject";
  const raw = await callBackofficeService<unknown>("verifications", `/api/admin/verifications/${requestId}/${path}`, {
    method: "PATCH",
    actorUserId: reviewerUserId,
    body: payload,
  });
  return raw as VerificationDecisionResult;
}
