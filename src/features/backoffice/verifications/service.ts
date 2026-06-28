import {
  verificationAssignResultSchema,
  verificationAssignSchema,
  verificationDetailSchema,
  verificationListFiltersSchema,
  verificationListResultSchema,
  verificationDecisionInputSchema,
  verificationDocumentConfirmInputSchema,
  verificationDocumentConfirmResultSchema,
  verificationDocumentReviewInputSchema,
  verificationDocumentReviewResultSchema,
  verificationDocumentUploadUrlInputSchema,
  verificationDocumentUploadUrlResultSchema,
  verificationDocumentViewUrlResultSchema,
} from "./schema";
import type {
  VerificationAssignInput,
  VerificationDecisionInput,
  VerificationListFilters,
  VerificationDecisionResult,
  VerificationDocumentConfirmInput,
  VerificationDocumentReviewInput,
  VerificationDocumentUploadUrlInput,
} from "./types";
import { callBackofficeService } from "@/lib/microservices/backoffice-client";

function asNumber(value: unknown, fallback = 0): number {
  const n = Number(value ?? fallback);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeSummary(raw: any) {
  const source = raw && typeof raw === "object" ? raw : {};

  return {
    total: asNumber(source.total ?? source.totalCount),
    pending: asNumber(source.pending ?? source.pendingCount),
    inReview: asNumber(source.inReview ?? source.inReviewCount),
    approved: asNumber(source.approved ?? source.approvedCount),
    rejected: asNumber(source.rejected ?? source.rejectedCount),
  };
}

function normalizeList(raw: any, page: number, pageSize: number) {
  const source = raw?.items ? raw : raw?.data?.items ? raw.data : raw;
  const pagination = source?.pagination ?? {};
  const items = Array.isArray(source?.items) ? source.items : [];

  return {
    items,
    page: asNumber(source?.page ?? pagination.page, page),
    pageSize: asNumber(source?.pageSize ?? pagination.pageSize, pageSize),
    total: asNumber(source?.total ?? pagination.total, items.length),
    summary: normalizeSummary(source?.summary),
  };
}

function unwrapDetail(raw: any) {
  const source = raw?.data ?? raw;
  if (!source) return source;

  if (source.verification && typeof source.verification === "object") {
    return {
      ...source.verification,
      documents: Array.isArray(source.documents) ? source.documents : [],
      checks: Array.isArray(source.checks) ? source.checks : [],
      timeline: Array.isArray(source.timeline) ? source.timeline : [],
      publicContacts: Array.isArray(source.publicContacts) ? source.publicContacts : [],
      whatsappVerifications: Array.isArray(source.whatsappVerifications)
        ? source.whatsappVerifications
        : Array.isArray(source.whatsapp)
          ? source.whatsapp
          : [],
      addressMatches: Array.isArray(source.addressMatches) ? source.addressMatches : [],
    };
  }

  return source;
}

export async function getVerificationRequestsList(input: VerificationListFilters) {
  const filters = verificationListFiltersSchema.parse(input);
  const raw = await callBackofficeService<unknown>("verifications", "/api/verifications/admin/verifications", {
    query: filters,
  });
  return verificationListResultSchema.parse(normalizeList(raw, filters.page, filters.pageSize));
}

export async function getVerificationDetail(requestId: number) {
  const raw = await callBackofficeService<unknown>("verifications", `/api/verifications/admin/verifications/${requestId}`);
  const payload = unwrapDetail(raw);
  if (!payload) return null;
  return verificationDetailSchema.parse(payload);
}

export async function assignVerificationReviewer(
  requestId: number,
  input: VerificationAssignInput
) {
  const parsed = verificationAssignSchema.parse(input);
  const raw = await callBackofficeService<unknown>("verifications", `/api/verifications/admin/verifications/${requestId}/assign`, {
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

  const body =
    payload.decision === "approved"
      ? {
          notes: payload.approvalNotes ?? undefined,
        }
      : {
          reason: payload.rejectionReason ?? "Rechazado desde backoffice.",
        };

  const raw = await callBackofficeService<unknown>("verifications", `/api/verifications/admin/verifications/${requestId}/${path}`, {
    method: "PATCH",
    actorUserId: reviewerUserId,
    body,
  });
  return raw as VerificationDecisionResult;
}


export async function requestVerificationDocumentUploadUrl(
  requestId: number,
  input: VerificationDocumentUploadUrlInput
) {
  const payload = verificationDocumentUploadUrlInputSchema.parse(input);
  const raw = await callBackofficeService<unknown>(
    "verifications",
    `/api/verifications/admin/verifications/${requestId}/documents/upload-url`,
    {
      method: "POST",
      body: payload,
    }
  );

  return verificationDocumentUploadUrlResultSchema.parse(raw);
}

export async function confirmVerificationDocumentUpload(
  requestId: number,
  input: VerificationDocumentConfirmInput
) {
  const payload = verificationDocumentConfirmInputSchema.parse(input);
  const raw = await callBackofficeService<unknown>(
    "verifications",
    `/api/verifications/admin/verifications/${requestId}/documents/confirm`,
    {
      method: "POST",
      body: payload,
    }
  );

  return verificationDocumentConfirmResultSchema.parse(raw);
}

export async function getVerificationDocumentViewUrl(
  requestId: number,
  documentId: number
) {
  const raw = await callBackofficeService<unknown>(
    "verifications",
    `/api/verifications/admin/verifications/${requestId}/documents/${documentId}/view-url`
  );

  return verificationDocumentViewUrlResultSchema.parse(raw);
}

export async function reviewVerificationDocument(
  requestId: number,
  documentId: number,
  input: VerificationDocumentReviewInput
) {
  const payload = verificationDocumentReviewInputSchema.parse(input);
  const raw = await callBackofficeService<unknown>(
    "verifications",
    `/api/verifications/admin/verifications/${requestId}/documents/${documentId}/review`,
    {
      method: "PATCH",
      body: payload,
    }
  );

  return verificationDocumentReviewResultSchema.parse(raw);
}
