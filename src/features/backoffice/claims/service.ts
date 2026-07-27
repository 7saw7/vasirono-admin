import {
  claimDetailSchema,
  claimListFiltersSchema,
  claimListResultSchema,
} from "./schema";
import type { ClaimListFilters } from "./types";
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

const WORKFLOW_STATES = new Set([
  "submitted",
  "identity_pending",
  "channel_pending",
  "onsite_scheduled",
  "onsite_completed",
  "review_pending",
  "approved",
  "rejected",
  "changes_required",
]);

function asWorkflowState(value: unknown, fallback: unknown) {
  const candidate = String(value ?? fallback ?? "submitted").toLowerCase();
  return WORKFLOW_STATES.has(candidate) ? candidate : "submitted";
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
    claimantName: String(
      row.claimantName ??
        row.applicantName ??
        row.claimant_name ??
        row.applicant_name ??
        "Solicitante público",
    ),
    claimantEmail: String(
      row.claimantEmail ??
        row.applicantEmail ??
        row.claimant_email ??
        row.applicant_email ??
        "Sin correo registrado",
    ),
    claimantPhone:
      row.claimantPhone ??
      row.applicantPhone ??
      row.claimant_phone ??
      row.applicant_phone ??
      null,
    applicantRole: row.applicantRole ?? row.applicant_role ?? null,
    source: row.source ?? "public_web",
    declaredChannelType:
      row.declaredChannelType ?? row.declared_channel_type ?? null,
    declaredChannelValue:
      row.declaredChannelValue ?? row.declared_channel_value ?? null,
    preferredVerificationRoute:
      row.preferredVerificationRoute ??
      row.preferred_verification_route ??
      null,
    statusName: String(row.statusName ?? row.status_name ?? "Sin estado"),
    statusCode: String(
      row.statusCode ?? row.status_code ?? "unknown",
    ).toLowerCase(),
    workflowState: asWorkflowState(
      row.workflowState ?? row.workflow_state,
      row.statusCode ?? row.status_code,
    ),
    version: Math.max(1, asNumber(row.version ?? 1)),
    assignedReviewerId:
      row.assignedReviewerId ?? row.assigned_reviewer_id ?? null,
    firstReviewerId: row.firstReviewerId ?? row.first_reviewer_id ?? null,
    secondReviewerId: row.secondReviewerId ?? row.second_reviewer_id ?? null,
    sensitiveCase: Boolean(row.sensitiveCase ?? row.sensitive_case ?? false),
    otpChallengeId: row.otpChallengeId ?? row.otp_challenge_id ?? null,
    otpDestinationMasked:
      row.otpDestinationMasked ?? row.otp_destination_masked ?? null,
    otpExpiresAt: maybeIso(row.otpExpiresAt ?? row.otp_expires_at),
    submittedAt: asIso(row.submittedAt ?? row.submitted_at),
    reviewedAt: maybeIso(row.reviewedAt ?? row.reviewed_at),
    reviewedByName: row.reviewedByName ?? row.reviewed_by_name ?? null,
    notes: row.notes ?? null,
    evidenceUrl: row.evidenceUrl ?? row.evidence_url ?? null,
    hasVerificationRequest: Boolean(
      row.hasVerificationRequest ??
      row.has_verification_request ??
      row.verificationRequestId ??
      row.verification_request_id,
    ),
    professionalFlowMetadata:
      row.professionalFlowMetadata ?? row.professional_flow_metadata ?? null,
    invitationId: nullableNumber(row.invitationId ?? row.invitation_id),
    invitationStatus: row.invitationStatus ?? row.invitation_status ?? null,
  };
}

function normalizeClaimList(raw: any, page: number, pageSize: number) {
  const source = raw?.items ? raw : raw?.data?.items ? raw.data : raw;
  const pagination = source?.pagination ?? {};
  const items = Array.isArray(source?.items)
    ? source.items.map(normalizeClaimItem)
    : [];

  return {
    items,
    page: asNumber(source?.page ?? pagination.page ?? page),
    pageSize: asNumber(source?.pageSize ?? pagination.pageSize ?? pageSize),
    total: asNumber(source?.total ?? pagination.total ?? items.length),
  };
}

function normalizeClaimDetail(raw: any) {
  if (!raw) return null;
  const base = normalizeClaimItem(raw);
  return {
    ...base,
    branchPhone: raw.branchPhone ?? raw.branch_phone ?? null,
    branchEmail: raw.branchEmail ?? raw.branch_email ?? null,
    onsiteVisitScheduledAt:
      raw.onsiteVisitScheduledAt ?? raw.onsite_visit_scheduled_at ?? null,
    onsiteVisitAddress:
      raw.onsiteVisitAddress ?? raw.onsite_visit_address ?? null,
    onsiteContactPerson:
      raw.onsiteContactPerson ?? raw.onsite_contact_person ?? null,
    onsiteContactPhone:
      raw.onsiteContactPhone ?? raw.onsite_contact_phone ?? null,
    onsiteVisitNotes: raw.onsiteVisitNotes ?? raw.onsite_visit_notes ?? null,
    statusId: nullableNumber(raw.statusId ?? raw.status_id),
    reviewedById: raw.reviewedById ?? raw.reviewed_by_id ?? null,
    verificationRequestId: nullableNumber(
      raw.verificationRequestId ?? raw.verification_request_id,
    ),
    verificationStatusName:
      raw.verificationStatusName ?? raw.verification_status_name ?? null,
    verificationStatusCode:
      raw.verificationStatusCode ?? raw.verification_status_code ?? null,
    verificationLevel: raw.verificationLevel ?? raw.verification_level ?? null,
    professionalFlowMetadata:
      raw.professionalFlowMetadata ??
      raw.professional_flow_metadata ??
      base.professionalFlowMetadata ??
      null,
    invitationId: nullableNumber(
      raw.invitationId ?? raw.invitation_id ?? base.invitationId,
    ),
    invitationStatus:
      raw.invitationStatus ??
      raw.invitation_status ??
      base.invitationStatus ??
      null,
    invitationExpiresAt: maybeIso(
      raw.invitationExpiresAt ?? raw.invitation_expires_at,
    ),
    invitationAcceptedAt: maybeIso(
      raw.invitationAcceptedAt ?? raw.invitation_accepted_at,
    ),
  };
}

export async function getClaimsList(input: ClaimListFilters) {
  const filters = claimListFiltersSchema.parse(input);
  const raw = await callBackofficeService<unknown>(
    "verifications",
    "/api/backoffice/claims",
    {
      query: filters,
    },
  );
  return claimListResultSchema.parse(
    normalizeClaimList(raw, filters.page, filters.pageSize),
  );
}

export async function getClaimDetail(claimRequestId: number) {
  const raw = await callBackofficeService<unknown>(
    "verifications",
    `/api/backoffice/claims/${claimRequestId}`,
  );
  const normalized = normalizeClaimDetail(raw);
  return normalized ? claimDetailSchema.parse(normalized) : null;
}

export const CLAIM_WORKFLOW_COMMANDS = [
  "start-channel-verification",
  "schedule-visit",
  "complete-visit",
  "submit-review",
  "approve",
  "reject",
  "request-changes",
] as const;

export type ClaimWorkflowCommand = (typeof CLAIM_WORKFLOW_COMMANDS)[number];

export async function executeClaimWorkflowCommand(
  claimRequestId: number,
  command: ClaimWorkflowCommand,
  input: unknown,
) {
  return callBackofficeService<unknown>(
    "verifications",
    `/api/backoffice/claims/${claimRequestId}/commands/${command}`,
    { method: "POST", body: input },
  );
}
