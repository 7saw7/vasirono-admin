import type { PaginatedResult } from "@/features/backoffice/shared/types";

export type ClaimListFilters = {
  search?: string;
  status?: string;
  companyId?: number | string;
  page?: number | string;
  pageSize?: number | string;
};

export type ClaimListItem = {
  claimRequestId: number;
  companyId: number;
  companyName: string;
  branchId: number | null;
  branchName: string | null;
  branchAddress: string | null;
  userId: string | null;
  claimantName: string;
  claimantEmail: string;
  claimantPhone: string | null;
  applicantRole: string | null;
  source: string;
  declaredChannelType: string | null;
  declaredChannelValue: string | null;
  preferredVerificationRoute: string | null;
  statusName: string;
  statusCode: string;
  submittedAt: string;
  reviewedAt: string | null;
  reviewedByName: string | null;
  notes: string | null;
  evidenceUrl: string | null;
  hasVerificationRequest: boolean;
  professionalFlowMetadata?: Record<string, unknown> | null;
  invitationId?: number | null;
  invitationStatus?: string | null;
};

export type ClaimListResult = PaginatedResult<ClaimListItem>;

export type ClaimDecisionInput = {
  decision: "approve" | "reject";
  notes?: string;
};

export type OfficialChannelInput = {
  channelType:
    | "email"
    | "whatsapp"
    | "phone"
    | "website"
    | "instagram"
    | "facebook"
    | "tiktok"
    | "manual";
  channelValue: string;
  evidenceUrl?: string | null;
  reviewerNotes?: string | null;
  matchedWithBranchContact?: boolean;
};

export type OfficialChannelChallengeResult = {
  claimRequestId: number;
  verificationRequestId: number;
  verificationCheckId: number;
  channel: "email" | "whatsapp";
  to: string;
  codeExpiresAt: string;
  notification: {
    sent: boolean;
    prepared: boolean;
    manualActionRequired: boolean;
    provider?: string | null;
    deliveryMode?: string | null;
    manualSendUrl?: string | null;
    messageText?: string | null;
    error?: string | null;
  };
};

export type OnsiteRequiredInput = {
  scheduledAt?: string | null;
  visitAddress?: string | null;
  contactPerson?: string | null;
  contactPhone?: string | null;
  notes?: string | null;
};

export type OnsiteApprovalInput = {
  notes: string;
  documentsReviewed?: boolean;
  addressVerified?: boolean;
};

export type ClaimFlowActionResult = {
  claimRequestId: number;
  statusName: string;
  statusCode: string;
  verificationRequestId: number | null;
};

export type ClaimPublicContact = {
  publicContactVerificationId: number;
  contactSource: string;
  contactLabel: string | null;
  contactValue: string;
  normalizedContactValue: string | null;
  matchedWithBranchContact: boolean;
  evidenceUrl: string | null;
  verifiedAt: string | null;
  verifiedByName: string | null;
  createdAt: string;
};

export type ClaimWhatsappVerification = {
  whatsappVerificationId: number;
  publicPhone: string;
  normalizedPhone: string;
  attemptsCount: number;
  maxAttempts: number;
  status: string;
  sentAt: string | null;
  expiresAt: string | null;
  verifiedAt: string | null;
  providerName: string | null;
  failureReason: string | null;
};

export type ClaimDetail = {
  claimRequestId: number;
  companyId: number;
  companyName: string;
  branchId: number | null;
  branchName: string | null;
  branchAddress: string | null;
  branchPhone: string | null;
  branchEmail: string | null;
  userId: string | null;
  claimantName: string;
  claimantEmail: string;
  claimantPhone: string | null;
  applicantRole: string | null;
  source: string;
  declaredChannelType: string | null;
  declaredChannelValue: string | null;
  preferredVerificationRoute: string | null;
  onsiteVisitScheduledAt: string | null;
  onsiteVisitAddress: string | null;
  onsiteContactPerson: string | null;
  onsiteContactPhone: string | null;
  onsiteVisitNotes: string | null;
  statusId: number | null;
  statusName: string;
  statusCode: string;
  submittedAt: string;
  reviewedAt: string | null;
  reviewedById: string | null;
  reviewedByName: string | null;
  notes: string | null;
  evidenceUrl: string | null;
  verificationRequestId: number | null;
  verificationStatusName: string | null;
  verificationStatusCode: string | null;
  verificationLevel: string | null;
  publicContacts: ClaimPublicContact[];
  whatsappVerifications: ClaimWhatsappVerification[];
  professionalFlowMetadata: Record<string, unknown> | null;
  invitationId?: number | null;
  invitationStatus?: string | null;
  invitationExpiresAt?: string | null;
  invitationAcceptedAt?: string | null;
};

export type ClaimDecisionResult = {
  claimRequestId: number;
  statusName: string;
  verificationRequestId: number | null;
};
