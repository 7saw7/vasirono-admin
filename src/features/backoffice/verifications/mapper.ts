import type {
  VerificationAddressMatch,
  VerificationAssignResult,
  VerificationCheck,
  VerificationDecisionResult,
  VerificationDetail,
  VerificationDocument,
  VerificationListItem,
  VerificationPublicContact,
  VerificationQueueSummary,
  VerificationTimelineItem,
  VerificationWhatsappItem,
} from "./types";

export type VerificationListRow = {
  verification_request_id: number | string;
  company_id: number | string;
  company_name: string;
  claim_request_id: number | string | null;
  requested_by_id: string;
  requested_by_name: string;
  requested_by_email: string;
  status_id: number | string | null;
  status_name: string | null;
  status_code: string | null;
  verification_level: string | null;
  assigned_reviewer_id: string | null;
  assigned_reviewer_name: string | null;
  started_at: Date | string;
  submitted_at: Date | string | null;
  reviewed_at: Date | string | null;
  expires_at: Date | string | null;
  completed_at: Date | string | null;
};

export type VerificationDetailRow = VerificationListRow & {
  approval_notes: string | null;
  rejection_reason: string | null;
  internal_notes: string | null;
  public_summary: string | null;
};

export type VerificationSummaryRow = {
  total_count: number | string;
  pending_count: number | string;
  in_review_count: number | string;
  approved_count: number | string;
  rejected_count: number | string;
};

export type VerificationDocumentRow = {
  verification_document_id: number | string;
  document_type: string | null;
  review_status: string | null;
  file_name: string;
  file_path: string;
  file_bucket: string;
  mime_type: string | null;
  uploaded_at: Date | string;
  reviewed_at: Date | string | null;
  reviewed_by_name: string | null;
  review_notes: string | null;
};

export type VerificationCheckRow = {
  verification_check_id: number | string;
  method_name: string | null;
  status_name: string | null;
  score: number | string | null;
  confidence_score: number | string | null;
  verified_at: Date | string | null;
  expires_at: Date | string | null;
  reviewed_by_name: string | null;
  notes: string | null;
};

export type VerificationTimelineRow = {
  audit_log_id: number | string;
  action: string;
  old_status_name: string | null;
  new_status_name: string | null;
  actor_name: string | null;
  created_at: Date | string;
};

export type VerificationPublicContactRow = {
  public_contact_verification_id: number | string;
  contact_source: string;
  contact_label: string | null;
  contact_value: string;
  normalized_contact_value: string | null;
  is_primary: boolean | null;
  matched_with_branch_contact: boolean | null;
  evidence_url: string | null;
  created_at: Date | string;
  verified_at: Date | string | null;
};

export type VerificationWhatsappRow = {
  whatsapp_verification_id: number | string;
  public_phone: string;
  normalized_phone: string;
  attempts_count: number | string | null;
  max_attempts: number | string | null;
  status: string;
  sent_at: Date | string | null;
  expires_at: Date | string | null;
  verified_at: Date | string | null;
  failure_reason: string | null;
  provider_name: string | null;
};

export type VerificationAddressMatchRow = {
  address_verification_id: number | string;
  source_type: string;
  declared_address: string | null;
  branch_address: string | null;
  extracted_address: string | null;
  distance_meters: number | string | null;
  matched: boolean | null;
  confidence_score: number | string | null;
  manual_override: boolean | null;
  verified_at: Date | string | null;
  notes: string | null;
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

export function mapVerificationListRow(
  row: VerificationListRow
): VerificationListItem {
  return {
    verificationRequestId: toNumber(row.verification_request_id),
    companyId: toNumber(row.company_id),
    companyName: row.company_name,
    claimRequestId: toNullableNumber(row.claim_request_id),
    requestedById: row.requested_by_id,
    requestedByName: row.requested_by_name,
    requestedByEmail: row.requested_by_email,
    statusId: toNullableNumber(row.status_id),
    statusName: row.status_name ?? "Sin estado",
    statusCode: (row.status_code ?? "unknown").toLowerCase(),
    verificationLevel: row.verification_level,
    assignedReviewerId: row.assigned_reviewer_id,
    assignedReviewerName: row.assigned_reviewer_name,
    startedAt: toIsoString(row.started_at) ?? new Date(0).toISOString(),
    submittedAt: toIsoString(row.submitted_at),
    reviewedAt: toIsoString(row.reviewed_at),
    expiresAt: toIsoString(row.expires_at),
    completedAt: toIsoString(row.completed_at),
  };
}

export function mapVerificationSummaryRow(
  row: VerificationSummaryRow | undefined
): VerificationQueueSummary {
  return {
    total: toNumber(row?.total_count),
    pending: toNumber(row?.pending_count),
    inReview: toNumber(row?.in_review_count),
    approved: toNumber(row?.approved_count),
    rejected: toNumber(row?.rejected_count),
  };
}

export function mapVerificationDocumentRow(
  row: VerificationDocumentRow
): VerificationDocument {
  return {
    verificationDocumentId: toNumber(row.verification_document_id),
    documentType: row.document_type,
    reviewStatus: row.review_status,
    fileName: row.file_name,
    filePath: row.file_path,
    fileBucket: row.file_bucket,
    mimeType: row.mime_type,
    uploadedAt: toIsoString(row.uploaded_at) ?? new Date(0).toISOString(),
    reviewedAt: toIsoString(row.reviewed_at),
    reviewedByName: row.reviewed_by_name,
    reviewNotes: row.review_notes,
  };
}

export function mapVerificationCheckRow(
  row: VerificationCheckRow
): VerificationCheck {
  return {
    verificationCheckId: toNumber(row.verification_check_id),
    methodName: row.method_name,
    statusName: row.status_name,
    score: toNumber(row.score),
    confidenceScore: toNumber(row.confidence_score),
    verifiedAt: toIsoString(row.verified_at),
    expiresAt: toIsoString(row.expires_at),
    reviewedByName: row.reviewed_by_name,
    notes: row.notes,
  };
}

export function mapVerificationTimelineRow(
  row: VerificationTimelineRow
): VerificationTimelineItem {
  return {
    auditLogId: toNumber(row.audit_log_id),
    action: row.action,
    oldStatusName: row.old_status_name,
    newStatusName: row.new_status_name,
    actorName: row.actor_name,
    createdAt: toIsoString(row.created_at) ?? new Date(0).toISOString(),
  };
}

export function mapVerificationPublicContactRow(
  row: VerificationPublicContactRow
): VerificationPublicContact {
  return {
    publicContactVerificationId: toNumber(row.public_contact_verification_id),
    contactSource: row.contact_source,
    contactLabel: row.contact_label,
    contactValue: row.contact_value,
    normalizedContactValue: row.normalized_contact_value,
    isPrimary: Boolean(row.is_primary),
    matchedWithBranchContact: Boolean(row.matched_with_branch_contact),
    evidenceUrl: row.evidence_url,
    createdAt: toIsoString(row.created_at) ?? new Date(0).toISOString(),
    verifiedAt: toIsoString(row.verified_at),
  };
}

export function mapVerificationWhatsappRow(
  row: VerificationWhatsappRow
): VerificationWhatsappItem {
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
    failureReason: row.failure_reason,
    providerName: row.provider_name,
  };
}

export function mapVerificationAddressMatchRow(
  row: VerificationAddressMatchRow
): VerificationAddressMatch {
  return {
    addressVerificationId: toNumber(row.address_verification_id),
    sourceType: row.source_type,
    declaredAddress: row.declared_address,
    branchAddress: row.branch_address,
    extractedAddress: row.extracted_address,
    distanceMeters: toNullableNumber(row.distance_meters),
    matched: Boolean(row.matched),
    confidenceScore: toNumber(row.confidence_score),
    manualOverride: Boolean(row.manual_override),
    verifiedAt: toIsoString(row.verified_at),
    notes: row.notes,
  };
}

export function mapVerificationDetailRow(
  row: VerificationDetailRow,
  input: {
    documents: VerificationDocumentRow[];
    checks: VerificationCheckRow[];
    timeline: VerificationTimelineRow[];
    publicContacts: VerificationPublicContactRow[];
    whatsappVerifications: VerificationWhatsappRow[];
    addressMatches: VerificationAddressMatchRow[];
  }
): VerificationDetail {
  const base = mapVerificationListRow(row);

  return {
    ...base,
    approvalNotes: row.approval_notes,
    rejectionReason: row.rejection_reason,
    internalNotes: row.internal_notes,
    publicSummary: row.public_summary,
    documents: input.documents.map(mapVerificationDocumentRow),
    checks: input.checks.map(mapVerificationCheckRow),
    timeline: input.timeline.map(mapVerificationTimelineRow),
    publicContacts: input.publicContacts.map(mapVerificationPublicContactRow),
    whatsappVerifications: input.whatsappVerifications.map(
      mapVerificationWhatsappRow
    ),
    addressMatches: input.addressMatches.map(mapVerificationAddressMatchRow),
  };
}

export function mapVerificationDecisionResult(input: {
  verificationRequestId: number | string;
  companyId: number | string;
  requestStatusCode: string | null;
  requestStatusName: string | null;
  companyVerificationStatusId: number | string | null;
  profileUpdated: boolean | null;
  reviewedAt: Date | string | null;
  completedAt: Date | string | null;
}): VerificationDecisionResult {
  return {
    verificationRequestId: toNumber(input.verificationRequestId),
    companyId: toNumber(input.companyId),
    requestStatusCode: (input.requestStatusCode ?? "unknown").toLowerCase(),
    requestStatusName: input.requestStatusName ?? "Sin estado",
    companyVerificationStatusId: toNullableNumber(
      input.companyVerificationStatusId
    ),
    profileUpdated: Boolean(input.profileUpdated),
    reviewedAt: toIsoString(input.reviewedAt),
    completedAt: toIsoString(input.completedAt),
  };
}

export function mapVerificationAssignResult(input: {
  verificationRequestId: number;
  assignedReviewerId: string;
}): VerificationAssignResult {
  return {
    verificationRequestId: input.verificationRequestId,
    assignedReviewerId: input.assignedReviewerId,
  };
}