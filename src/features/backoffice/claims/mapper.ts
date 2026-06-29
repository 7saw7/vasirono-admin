import type {
  ClaimDecisionResult,
  ClaimDetail,
  ClaimListItem,
  ClaimPublicContact,
  ClaimWhatsappVerification,
} from "./types";

export type ClaimListRow = {
  claim_request_id: number | string;
  company_id: number | string;
  company_name: string;
  branch_id: number | string | null;
  branch_name: string | null;
  branch_address: string | null;
  user_id: string | null;
  claimant_name: string | null;
  claimant_email: string | null;
  claimant_phone: string | null;
  applicant_role: string | null;
  source: string | null;
  declared_channel_type: string | null;
  declared_channel_value: string | null;
  preferred_verification_route: string | null;
  status_name: string | null;
  status_code: string | null;
  submitted_at: Date | string;
  reviewed_at: Date | string | null;
  reviewed_by_name: string | null;
  notes: string | null;
  evidence_url: string | null;
  has_verification_request: boolean | null;
  professional_flow_metadata?: Record<string, unknown> | null;
};

export type ClaimDetailRow = ClaimListRow & {
  branch_phone: string | null;
  branch_email: string | null;
  onsite_visit_scheduled_at: Date | string | null;
  onsite_visit_address: string | null;
  onsite_contact_person: string | null;
  onsite_contact_phone: string | null;
  onsite_visit_notes: string | null;
  status_id: number | string | null;
  reviewed_by_id: string | null;
  verification_request_id: number | string | null;
  verification_status_name: string | null;
  verification_status_code: string | null;
  verification_level: string | null;
};

export type ClaimPublicContactRow = {
  public_contact_verification_id: number | string;
  contact_source: string;
  contact_label: string | null;
  contact_value: string;
  normalized_contact_value: string | null;
  matched_with_branch_contact: boolean | null;
  evidence_url: string | null;
  verified_at: Date | string | null;
  verified_by_name: string | null;
  created_at: Date | string;
};

export type ClaimWhatsappVerificationRow = {
  whatsapp_verification_id: number | string;
  public_phone: string;
  normalized_phone: string;
  attempts_count: number | string;
  max_attempts: number | string;
  status: string;
  sent_at: Date | string | null;
  expires_at: Date | string | null;
  verified_at: Date | string | null;
  provider_name: string | null;
  failure_reason: string | null;
};

export type ClaimDecisionResultRow = {
  claimRequestId: number;
  statusName: string;
  verificationRequestId: number | null;
};

function toNumber(value: number | string | null | undefined): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function toNullableNumber(
  value: number | string | null | undefined
): number | null {
  if (value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toIsoString(value: Date | string | null | undefined): string | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function publicClaimantName(row: { claimant_name: string | null }): string {
  return row.claimant_name?.trim() || "Solicitante público";
}

function publicClaimantEmail(row: { claimant_email: string | null }): string {
  return row.claimant_email?.trim() || "Sin correo registrado";
}

export function mapClaimListRow(row: ClaimListRow): ClaimListItem {
  return {
    claimRequestId: toNumber(row.claim_request_id),
    companyId: toNumber(row.company_id),
    companyName: row.company_name,
    branchId: toNullableNumber(row.branch_id),
    branchName: row.branch_name,
    branchAddress: row.branch_address,
    userId: row.user_id,
    claimantName: publicClaimantName(row),
    claimantEmail: publicClaimantEmail(row),
    claimantPhone: row.claimant_phone,
    applicantRole: row.applicant_role,
    source: row.source ?? "public_web",
    declaredChannelType: row.declared_channel_type,
    declaredChannelValue: row.declared_channel_value,
    preferredVerificationRoute: row.preferred_verification_route,
    statusName: row.status_name ?? "Sin estado",
    statusCode: (row.status_code ?? "unknown").toLowerCase(),
    submittedAt: toIsoString(row.submitted_at) ?? new Date(0).toISOString(),
    reviewedAt: toIsoString(row.reviewed_at),
    reviewedByName: row.reviewed_by_name,
    notes: row.notes,
    evidenceUrl: row.evidence_url,
    hasVerificationRequest: Boolean(row.has_verification_request),
    professionalFlowMetadata: row.professional_flow_metadata ?? null,
  };
}

export function mapClaimPublicContactRow(
  row: ClaimPublicContactRow
): ClaimPublicContact {
  return {
    publicContactVerificationId: toNumber(row.public_contact_verification_id),
    contactSource: row.contact_source,
    contactLabel: row.contact_label,
    contactValue: row.contact_value,
    normalizedContactValue: row.normalized_contact_value,
    matchedWithBranchContact: Boolean(row.matched_with_branch_contact),
    evidenceUrl: row.evidence_url,
    verifiedAt: toIsoString(row.verified_at),
    verifiedByName: row.verified_by_name,
    createdAt: toIsoString(row.created_at) ?? new Date(0).toISOString(),
  };
}

export function mapClaimWhatsappVerificationRow(
  row: ClaimWhatsappVerificationRow
): ClaimWhatsappVerification {
  return {
    whatsappVerificationId: toNumber(row.whatsapp_verification_id),
    publicPhone: row.public_phone,
    normalizedPhone: row.normalized_phone,
    attemptsCount: toNumber(row.attempts_count),
    maxAttempts: toNumber(row.max_attempts),
    status: row.status,
    sentAt: toIsoString(row.sent_at),
    expiresAt: toIsoString(row.expires_at),
    verifiedAt: toIsoString(row.verified_at),
    providerName: row.provider_name,
    failureReason: row.failure_reason,
  };
}

export function mapClaimDetailRow(
  row: ClaimDetailRow,
  relations: {
    publicContacts: ClaimPublicContactRow[];
    whatsappVerifications: ClaimWhatsappVerificationRow[];
  } = { publicContacts: [], whatsappVerifications: [] }
): ClaimDetail {
  return {
    claimRequestId: toNumber(row.claim_request_id),
    companyId: toNumber(row.company_id),
    companyName: row.company_name,
    branchId: toNullableNumber(row.branch_id),
    branchName: row.branch_name,
    branchAddress: row.branch_address,
    branchPhone: row.branch_phone,
    branchEmail: row.branch_email,
    userId: row.user_id,
    claimantName: publicClaimantName(row),
    claimantEmail: publicClaimantEmail(row),
    claimantPhone: row.claimant_phone,
    applicantRole: row.applicant_role,
    source: row.source ?? "public_web",
    declaredChannelType: row.declared_channel_type,
    declaredChannelValue: row.declared_channel_value,
    preferredVerificationRoute: row.preferred_verification_route,
    onsiteVisitScheduledAt: toIsoString(row.onsite_visit_scheduled_at),
    onsiteVisitAddress: row.onsite_visit_address,
    onsiteContactPerson: row.onsite_contact_person,
    onsiteContactPhone: row.onsite_contact_phone,
    onsiteVisitNotes: row.onsite_visit_notes,
    statusId: toNullableNumber(row.status_id),
    statusName: row.status_name ?? "Sin estado",
    statusCode: (row.status_code ?? "unknown").toLowerCase(),
    submittedAt: toIsoString(row.submitted_at) ?? new Date(0).toISOString(),
    reviewedAt: toIsoString(row.reviewed_at),
    reviewedById: row.reviewed_by_id,
    reviewedByName: row.reviewed_by_name,
    notes: row.notes,
    evidenceUrl: row.evidence_url,
    verificationRequestId: toNullableNumber(row.verification_request_id),
    verificationStatusName: row.verification_status_name,
    verificationStatusCode: row.verification_status_code,
    verificationLevel: row.verification_level,
    professionalFlowMetadata: row.professional_flow_metadata ?? null,
    publicContacts: relations.publicContacts.map(mapClaimPublicContactRow),
    whatsappVerifications: relations.whatsappVerifications.map(
      mapClaimWhatsappVerificationRow
    ),
  };
}

export function mapClaimDecisionResult(
  row: ClaimDecisionResultRow
): ClaimDecisionResult {
  return {
    claimRequestId: row.claimRequestId,
    statusName: row.statusName,
    verificationRequestId: row.verificationRequestId,
  };
}
