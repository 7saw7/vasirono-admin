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
import type {
  ClaimDecisionInput,
  ClaimListFilters,
  OfficialChannelInput,
  OnsiteApprovalInput,
  OnsiteRequiredInput,
} from "./types";
import { callBackofficeService } from "@/lib/microservices/backoffice-client";

function asNumber(value: unknown): number {
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
}

function nullableNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function asIso(value: unknown): string {
  if (!value) return new Date(0).toISOString();
  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.getTime())
    ? new Date(0).toISOString()
    : date.toISOString();
}

function maybeIso(value: unknown): string | null {
  if (!value) return null;
  const d = new Date(String(value));
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function normalizeClaimItem(row: any) {
  return {
    claimRequestId: asNumber(row.claimRequestId ?? row.claim_request_id),
    companyId: asNumber(row.companyId ?? row.company_id),
    companyName: String(row.companyName ?? row.company_name ?? "Sin empresa"),
    branchId: nullableNumber(row.branchId ?? row.branch_id),
    branchName: row.branchName ?? row.branch_name ?? null,
    branchAddress: row.branchAddress ?? row.branch_address ?? null,
    userId: row.userId ?? row.user_id ?? null,
    claimantName: String(row.claimantName ?? row.applicantName ?? row.claimant_name ?? row.applicant_name ?? "Solicitante público"),
    claimantEmail: String(row.claimantEmail ?? row.applicantEmail ?? row.claimant_email ?? row.applicant_email ?? "Sin correo registrado"),
    claimantPhone: row.claimantPhone ?? row.applicantPhone ?? row.claimant_phone ?? row.applicant_phone ?? null,
    applicantRole: row.applicantRole ?? row.applicant_role ?? null,
    source: row.source ?? "public_web",
    declaredChannelType: row.declaredChannelType ?? row.declared_channel_type ?? null,
    declaredChannelValue: row.declaredChannelValue ?? row.declared_channel_value ?? null,
    preferredVerificationRoute: row.preferredVerificationRoute ?? row.preferred_verification_route ?? null,
    statusName: String(row.statusName ?? row.status_name ?? "Sin estado"),
    statusCode: String(row.statusCode ?? row.status_code ?? "unknown").toLowerCase(),
    submittedAt: asIso(row.submittedAt ?? row.submitted_at),
    reviewedAt: maybeIso(row.reviewedAt ?? row.reviewed_at),
    reviewedByName: row.reviewedByName ?? row.reviewed_by_name ?? null,
    notes: row.notes ?? null,
    evidenceUrl: row.evidenceUrl ?? row.evidence_url ?? null,
    hasVerificationRequest: Boolean(row.hasVerificationRequest ?? row.has_verification_request ?? row.verificationRequestId ?? row.verification_request_id),
    professionalFlowMetadata: row.professionalFlowMetadata ?? row.professional_flow_metadata ?? null,
    invitationId: nullableNumber(row.invitationId ?? row.invitation_id),
    invitationStatus: row.invitationStatus ?? row.invitation_status ?? null,
  };
}

function normalizeClaimList(raw: any, page: number, pageSize: number) {
  const source = raw?.items ? raw : raw?.data?.items ? raw.data : raw;
  const pagination = source?.pagination ?? {};
  const items = Array.isArray(source?.items) ? source.items.map(normalizeClaimItem) : [];

  return {
    items,
    page: asNumber(source?.page ?? pagination.page ?? page),
    pageSize: asNumber(source?.pageSize ?? pagination.pageSize ?? pageSize),
    total: asNumber(source?.total ?? pagination.total ?? items.length),
  };
}

function normalizePublicContact(row: any) {
  return {
    publicContactVerificationId: asNumber(row.publicContactVerificationId ?? row.public_contact_verification_id),
    contactSource: String(row.contactSource ?? row.contact_source ?? "manual"),
    contactLabel: row.contactLabel ?? row.contact_label ?? null,
    contactValue: String(row.contactValue ?? row.contact_value ?? ""),
    normalizedContactValue: row.normalizedContactValue ?? row.normalized_contact_value ?? null,
    matchedWithBranchContact: Boolean(row.matchedWithBranchContact ?? row.matched_with_branch_contact ?? false),
    evidenceUrl: row.evidenceUrl ?? row.evidence_url ?? null,
    verifiedAt: maybeIso(row.verifiedAt ?? row.verified_at),
    verifiedByName: row.verifiedByName ?? row.verified_by_name ?? null,
    createdAt: asIso(row.createdAt ?? row.created_at),
  };
}

function normalizeWhatsappVerification(row: any) {
  return {
    whatsappVerificationId: asNumber(row.whatsappVerificationId ?? row.whatsapp_verification_id),
    publicPhone: String(row.publicPhone ?? row.public_phone ?? ""),
    normalizedPhone: String(row.normalizedPhone ?? row.normalized_phone ?? ""),
    attemptsCount: asNumber(row.attemptsCount ?? row.attempts_count),
    maxAttempts: asNumber(row.maxAttempts ?? row.max_attempts ?? 5),
    status: String(row.status ?? "pending"),
    sentAt: maybeIso(row.sentAt ?? row.sent_at),
    expiresAt: maybeIso(row.expiresAt ?? row.expires_at),
    verifiedAt: maybeIso(row.verifiedAt ?? row.verified_at),
    providerName: row.providerName ?? row.provider_name ?? null,
    failureReason: row.failureReason ?? row.failure_reason ?? null,
  };
}

function normalizeClaimDetail(raw: any) {
  if (!raw) return null;
  const base = normalizeClaimItem(raw);
  return {
    ...base,
    branchPhone: raw.branchPhone ?? raw.branch_phone ?? null,
    branchEmail: raw.branchEmail ?? raw.branch_email ?? null,
    onsiteVisitScheduledAt: raw.onsiteVisitScheduledAt ?? raw.onsite_visit_scheduled_at ?? null,
    onsiteVisitAddress: raw.onsiteVisitAddress ?? raw.onsite_visit_address ?? null,
    onsiteContactPerson: raw.onsiteContactPerson ?? raw.onsite_contact_person ?? null,
    onsiteContactPhone: raw.onsiteContactPhone ?? raw.onsite_contact_phone ?? null,
    onsiteVisitNotes: raw.onsiteVisitNotes ?? raw.onsite_visit_notes ?? null,
    statusId: nullableNumber(raw.statusId ?? raw.status_id),
    reviewedById: raw.reviewedById ?? raw.reviewed_by_id ?? null,
    verificationRequestId: nullableNumber(raw.verificationRequestId ?? raw.verification_request_id),
    verificationStatusName: raw.verificationStatusName ?? raw.verification_status_name ?? null,
    verificationStatusCode: raw.verificationStatusCode ?? raw.verification_status_code ?? null,
    verificationLevel: raw.verificationLevel ?? raw.verification_level ?? null,
    publicContacts: Array.isArray(raw.publicContacts)
      ? raw.publicContacts.map(normalizePublicContact)
      : Array.isArray(raw.public_contacts)
        ? raw.public_contacts.map(normalizePublicContact)
        : [],
    whatsappVerifications: Array.isArray(raw.whatsappVerifications)
      ? raw.whatsappVerifications.map(normalizeWhatsappVerification)
      : Array.isArray(raw.whatsapp_verifications)
        ? raw.whatsapp_verifications.map(normalizeWhatsappVerification)
        : [],
    professionalFlowMetadata: raw.professionalFlowMetadata ?? raw.professional_flow_metadata ?? base.professionalFlowMetadata ?? null,
    invitationId: nullableNumber(raw.invitationId ?? raw.invitation_id ?? base.invitationId),
    invitationStatus: raw.invitationStatus ?? raw.invitation_status ?? base.invitationStatus ?? null,
    invitationExpiresAt: maybeIso(raw.invitationExpiresAt ?? raw.invitation_expires_at),
    invitationAcceptedAt: maybeIso(raw.invitationAcceptedAt ?? raw.invitation_accepted_at),
  };
}

export async function getClaimsList(input: ClaimListFilters) {
  const filters = claimListFiltersSchema.parse(input);
  const raw = await callBackofficeService<unknown>("verifications", "/api/verifications/admin/claims", {
    query: filters,
  });
  return claimListResultSchema.parse(normalizeClaimList(raw, filters.page, filters.pageSize));
}

export async function getClaimDetail(claimRequestId: number) {
  const raw = await callBackofficeService<unknown>("verifications", `/api/verifications/admin/claims/${claimRequestId}`);
  const normalized = normalizeClaimDetail(raw);
  return normalized ? claimDetailSchema.parse(normalized) : null;
}

export async function sendOfficialChannelCode(
  claimRequestId: number,
  reviewerUserId: string,
  input: OfficialChannelInput
) {
  const parsed = officialChannelSchema.parse(input);
  const raw = await callBackofficeService<unknown>("verifications", `/api/verifications/admin/claims/${claimRequestId}/official-channel`, {
    method: "PATCH",
    actorUserId: reviewerUserId,
    body: parsed,
  });
  return officialChannelChallengeResultSchema.parse(raw);
}

export async function markClaimOnsiteRequired(
  claimRequestId: number,
  reviewerUserId: string,
  input: OnsiteRequiredInput
) {
  const parsed = onsiteRequiredSchema.parse(input);
  const raw = await callBackofficeService<unknown>("verifications", `/api/verifications/admin/claims/${claimRequestId}/onsite-required`, {
    method: "PATCH",
    actorUserId: reviewerUserId,
    body: parsed,
  });
  return claimFlowActionResultSchema.parse(raw);
}

export async function approveOnsiteVerification(
  claimRequestId: number,
  reviewerUserId: string,
  input: OnsiteApprovalInput
) {
  const parsed = onsiteApprovalSchema.parse(input);
  const raw = await callBackofficeService<unknown>("verifications", `/api/verifications/admin/claims/${claimRequestId}/onsite-approve`, {
    method: "PATCH",
    actorUserId: reviewerUserId,
    body: parsed,
  });
  return claimFlowActionResultSchema.parse(raw);
}

export async function requestMoreEvidenceClaim(
  claimRequestId: number,
  reviewerUserId: string,
  notes?: string | null
) {
  const raw = await callBackofficeService<unknown>("verifications", `/api/verifications/admin/claims/${claimRequestId}/needs-more-evidence`, {
    method: "PATCH",
    actorUserId: reviewerUserId,
    body: { notes },
  });
  return claimFlowActionResultSchema.parse(raw);
}

export async function approveClaim(
  claimRequestId: number,
  reviewerUserId: string,
  input: ClaimDecisionInput
) {
  const parsed = claimDecisionSchema.parse(input);
  const raw = await callBackofficeService<unknown>("verifications", `/api/verifications/admin/claims/${claimRequestId}/approve`, {
    method: "PATCH",
    actorUserId: reviewerUserId,
    body: { notes: parsed.notes },
  });
  return claimDecisionResultSchema.parse({
    claimRequestId,
    statusName: (raw as any)?.statusName ?? (raw as any)?.status_name ?? "Aprobado",
    verificationRequestId: nullableNumber((raw as any)?.verificationRequestId ?? (raw as any)?.verification_request_id),
  });
}

export async function rejectClaim(
  claimRequestId: number,
  reviewerUserId: string,
  input: ClaimDecisionInput
) {
  const parsed = claimDecisionSchema.parse(input);
  const raw = await callBackofficeService<unknown>("verifications", `/api/verifications/admin/claims/${claimRequestId}/reject`, {
    method: "PATCH",
    actorUserId: reviewerUserId,
    body: { reason: parsed.notes ?? "Rechazado desde backoffice" },
  });
  return claimDecisionResultSchema.parse({
    claimRequestId,
    statusName: (raw as any)?.statusName ?? (raw as any)?.status_name ?? "Rechazado",
    verificationRequestId: nullableNumber((raw as any)?.verificationRequestId ?? (raw as any)?.verification_request_id),
  });
}
