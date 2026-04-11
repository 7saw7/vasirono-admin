import type {
  CompanyDetail,
  CompanyDetailAuditItem,
  CompanyDetailBranch,
  CompanyDetailClaim,
  CompanyDetailMediaItem,
  CompanyDetailPayment,
  CompanyDetailSubscription,
  CompanyDetailVerification,
} from "./types";

export type CompanyDetailRow = {
  company_id: number | string;
  name: string;
  description: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  lat: number | string | null;
  lon: number | string | null;
  verification_status: string | null;
  created_at: Date | string;
  updated_at: Date | string;
};

export type CompanyDetailBranchRow = {
  branch_id: number | string;
  name: string;
  address: string;
  district_name: string | null;
  phone: string | null;
  email: string | null;
  is_main: boolean | null;
  is_active: boolean | null;
  created_at: Date | string;
  updated_at: Date | string;
};

export type CompanyDetailMediaRow = {
  media_id: number | string;
  media_type: string | null;
  url: string;
  created_at: Date | string | null;
};

export type CompanyDetailVerificationRow = {
  status_label: string | null;
  profile_level: string | null;
  verification_score: number | string | null;
  is_identity_verified: boolean | null;
  is_whatsapp_verified: boolean | null;
  is_address_verified: boolean | null;
  is_document_verified: boolean | null;
  is_manual_review_completed: boolean | null;
  verified_at: Date | string | null;
  expires_at: Date | string | null;
  latest_request_id: number | string | null;
  latest_request_status: string | null;
  latest_request_submitted_at: Date | string | null;
};

export type CompanyDetailSubscriptionRow = {
  subscription_id: number | string | null;
  plan_name: string | null;
  status_name: string | null;
  start_date: Date | string | null;
  end_date: Date | string | null;
};

export type CompanyDetailPaymentRow = {
  payment_id: number | string;
  amount: number | string;
  status_name: string | null;
  payment_method_name: string | null;
  created_at: Date | string;
};

export type CompanyDetailClaimRow = {
  claim_request_id: number | string;
  status_name: string | null;
  submitted_at: Date | string;
  reviewed_at: Date | string | null;
  notes: string | null;
  evidence_url: string | null;
};

export type CompanyDetailAuditRow = {
  audit_log_id: number | string;
  action: string;
  old_status_name: string | null;
  new_status_name: string | null;
  actor_name: string | null;
  created_at: Date | string;
};

function toNumber(value: number | string | null | undefined): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function toNullableNumber(value: number | string | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  const parsed = toNumber(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toIsoString(value: Date | string | null | undefined): string | null {
  if (!value) return null;
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

export function mapCompanyDetailBranchRow(row: CompanyDetailBranchRow): CompanyDetailBranch {
  return {
    branchId: toNumber(row.branch_id),
    name: row.name,
    address: row.address,
    districtName: row.district_name,
    phone: row.phone,
    email: row.email,
    isMain: Boolean(row.is_main),
    isActive: Boolean(row.is_active),
    createdAt: toIsoString(row.created_at) ?? new Date(0).toISOString(),
    updatedAt: toIsoString(row.updated_at) ?? new Date(0).toISOString(),
  };
}

export function mapCompanyDetailMediaRow(row: CompanyDetailMediaRow): CompanyDetailMediaItem {
  return {
    mediaId: toNumber(row.media_id),
    mediaType: row.media_type,
    url: row.url,
    createdAt: toIsoString(row.created_at),
  };
}

export function mapCompanyDetailVerificationRow(
  row: CompanyDetailVerificationRow | undefined
): CompanyDetailVerification {
  return {
    statusLabel: row?.status_label ?? "Sin estado",
    profileLevel: row?.profile_level ?? null,
    verificationScore: toNumber(row?.verification_score),
    isIdentityVerified: Boolean(row?.is_identity_verified),
    isWhatsappVerified: Boolean(row?.is_whatsapp_verified),
    isAddressVerified: Boolean(row?.is_address_verified),
    isDocumentVerified: Boolean(row?.is_document_verified),
    isManualReviewCompleted: Boolean(row?.is_manual_review_completed),
    verifiedAt: toIsoString(row?.verified_at),
    expiresAt: toIsoString(row?.expires_at),
    latestRequestId: toNullableNumber(row?.latest_request_id),
    latestRequestStatus: row?.latest_request_status ?? null,
    latestRequestSubmittedAt: toIsoString(row?.latest_request_submitted_at),
  };
}

export function mapCompanyDetailSubscriptionRow(
  row: CompanyDetailSubscriptionRow | undefined
): CompanyDetailSubscription {
  return {
    subscriptionId: toNullableNumber(row?.subscription_id),
    planName: row?.plan_name ?? null,
    statusName: row?.status_name ?? null,
    startDate: toIsoString(row?.start_date),
    endDate: toIsoString(row?.end_date),
  };
}

export function mapCompanyDetailPaymentRow(row: CompanyDetailPaymentRow): CompanyDetailPayment {
  return {
    paymentId: toNumber(row.payment_id),
    amount: toNumber(row.amount),
    statusName: row.status_name,
    paymentMethodName: row.payment_method_name,
    createdAt: toIsoString(row.created_at) ?? new Date(0).toISOString(),
  };
}

export function mapCompanyDetailClaimRow(row: CompanyDetailClaimRow): CompanyDetailClaim {
  return {
    claimRequestId: toNumber(row.claim_request_id),
    statusName: row.status_name,
    submittedAt: toIsoString(row.submitted_at) ?? new Date(0).toISOString(),
    reviewedAt: toIsoString(row.reviewed_at),
    notes: row.notes,
    evidenceUrl: row.evidence_url,
  };
}

export function mapCompanyDetailAuditRow(row: CompanyDetailAuditRow): CompanyDetailAuditItem {
  return {
    auditLogId: toNumber(row.audit_log_id),
    action: row.action,
    oldStatusName: row.old_status_name,
    newStatusName: row.new_status_name,
    actorName: row.actor_name,
    createdAt: toIsoString(row.created_at) ?? new Date(0).toISOString(),
  };
}

export function mapCompanyDetailRow(
  row: CompanyDetailRow,
  input: {
    branches: CompanyDetailBranchRow[];
    media: CompanyDetailMediaRow[];
    verification: CompanyDetailVerificationRow | undefined;
    subscription: CompanyDetailSubscriptionRow | undefined;
    payments: CompanyDetailPaymentRow[];
    claims: CompanyDetailClaimRow[];
    audit: CompanyDetailAuditRow[];
  }
): CompanyDetail {
  return {
    companyId: toNumber(row.company_id),
    name: row.name,
    description: row.description,
    address: row.address,
    phone: row.phone,
    email: row.email,
    website: row.website,
    lat: toNullableNumber(row.lat),
    lon: toNullableNumber(row.lon),
    verificationStatus: row.verification_status ?? "Sin estado",
    createdAt: toIsoString(row.created_at) ?? new Date(0).toISOString(),
    updatedAt: toIsoString(row.updated_at) ?? new Date(0).toISOString(),
    branches: input.branches.map(mapCompanyDetailBranchRow),
    media: input.media.map(mapCompanyDetailMediaRow),
    verification: mapCompanyDetailVerificationRow(input.verification),
    subscription: mapCompanyDetailSubscriptionRow(input.subscription),
    payments: input.payments.map(mapCompanyDetailPaymentRow),
    claims: input.claims.map(mapCompanyDetailClaimRow),
    audit: input.audit.map(mapCompanyDetailAuditRow),
  };
}