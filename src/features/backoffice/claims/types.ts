import type { PaginatedResult } from "@/features/backoffice/shared/types";

export type ClaimWorkflowState =
  | "submitted"
  | "identity_pending"
  | "channel_pending"
  | "onsite_scheduled"
  | "onsite_completed"
  | "review_pending"
  | "approved"
  | "rejected"
  | "changes_required";

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
  workflowState: ClaimWorkflowState;
  version: number;
  assignedReviewerId: string | null;
  firstReviewerId: string | null;
  secondReviewerId: string | null;
  sensitiveCase: boolean;
  otpChallengeId: string | null;
  otpDestinationMasked: string | null;
  otpExpiresAt: string | null;
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
  workflowState: ClaimWorkflowState;
  version: number;
  assignedReviewerId: string | null;
  firstReviewerId: string | null;
  secondReviewerId: string | null;
  sensitiveCase: boolean;
  otpChallengeId: string | null;
  otpDestinationMasked: string | null;
  otpExpiresAt: string | null;
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
  professionalFlowMetadata: Record<string, unknown> | null;
  invitationId?: number | null;
  invitationStatus?: string | null;
  invitationExpiresAt?: string | null;
  invitationAcceptedAt?: string | null;
};
