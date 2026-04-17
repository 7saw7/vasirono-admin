import type { PaginatedResult } from "@/features/backoffice/shared/types";

export type VerificationListFilters = {
  search?: string;
  status?: string;
  level?: string;
  assignedReviewerId?: string;
  companyId?: number | string;
  page?: number | string;
  pageSize?: number | string;
};

export type VerificationListItem = {
  verificationRequestId: number;
  companyId: number;
  companyName: string;
  claimRequestId: number | null;
  requestedById: string;
  requestedByName: string;
  requestedByEmail: string;
  statusId: number | null;
  statusName: string;
  statusCode: string;
  verificationLevel: string | null;
  assignedReviewerId: string | null;
  assignedReviewerName: string | null;
  startedAt: string;
  submittedAt: string | null;
  reviewedAt: string | null;
  expiresAt: string | null;
  completedAt: string | null;
};

export type VerificationQueueSummary = {
  total: number;
  pending: number;
  inReview: number;
  approved: number;
  rejected: number;
};

export type VerificationListResult = PaginatedResult<VerificationListItem> & {
  summary: VerificationQueueSummary;
};

export type VerificationDocument = {
  verificationDocumentId: number;
  documentType: string | null;
  reviewStatus: string | null;
  fileName: string;
  filePath: string;
  fileBucket: string;
  mimeType: string | null;
  uploadedAt: string;
  reviewedAt: string | null;
  reviewedByName: string | null;
  reviewNotes: string | null;
};

export type VerificationCheck = {
  verificationCheckId: number;
  methodName: string | null;
  statusName: string | null;
  score: number;
  confidenceScore: number;
  verifiedAt: string | null;
  expiresAt: string | null;
  reviewedByName: string | null;
  notes: string | null;
};

export type VerificationTimelineItem = {
  auditLogId: number;
  action: string;
  oldStatusName: string | null;
  newStatusName: string | null;
  actorName: string | null;
  createdAt: string;
};

export type VerificationPublicContact = {
  publicContactVerificationId: number;
  contactSource: string;
  contactLabel: string | null;
  contactValue: string;
  normalizedContactValue: string | null;
  isPrimary: boolean;
  matchedWithBranchContact: boolean;
  evidenceUrl: string | null;
  createdAt: string;
  verifiedAt: string | null;
};

export type VerificationWhatsappItem = {
  whatsappVerificationId: number;
  publicPhone: string;
  normalizedPhone: string;
  attemptsCount: number;
  maxAttempts: number;
  status: string;
  sentAt: string | null;
  expiresAt: string | null;
  verifiedAt: string | null;
  failureReason: string | null;
  providerName: string | null;
};

export type VerificationAddressMatch = {
  addressVerificationId: number;
  sourceType: string;
  declaredAddress: string | null;
  branchAddress: string | null;
  extractedAddress: string | null;
  distanceMeters: number | null;
  matched: boolean;
  confidenceScore: number;
  manualOverride: boolean;
  verifiedAt: string | null;
  notes: string | null;
};

export type VerificationDetail = {
  verificationRequestId: number;
  companyId: number;
  companyName: string;
  claimRequestId: number | null;
  statusId: number | null;
  statusName: string;
  statusCode: string;
  verificationLevel: string | null;
  requestedById: string;
  requestedByName: string;
  requestedByEmail: string;
  assignedReviewerId: string | null;
  assignedReviewerName: string | null;
  startedAt: string;
  submittedAt: string | null;
  reviewedAt: string | null;
  expiresAt: string | null;
  completedAt: string | null;
  approvalNotes: string | null;
  rejectionReason: string | null;
  internalNotes: string | null;
  publicSummary: string | null;
  documents: VerificationDocument[];
  checks: VerificationCheck[];
  timeline: VerificationTimelineItem[];
  publicContacts: VerificationPublicContact[];
  whatsappVerifications: VerificationWhatsappItem[];
  addressMatches: VerificationAddressMatch[];
};

export type VerificationAssignInput = {
  reviewerUserId: string;
};

export type VerificationAssignResult = {
  verificationRequestId: number;
  assignedReviewerId: string;
};

export type VerificationDecisionInput = {
  decision: "approved" | "rejected";
  approvalNotes?: string | null;
  rejectionReason?: string | null;
};

export type VerificationDecisionResult = {
  verificationRequestId: number;
  companyId: number;
  requestStatusCode: string;
  requestStatusName: string;
  companyVerificationStatusId: number | null;
  profileUpdated: boolean;
  reviewedAt: string | null;
  completedAt: string | null;
};