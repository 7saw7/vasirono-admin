export type VerificationDetail = {
  verificationRequestId: number;
  companyId: number;
  companyName: string;
  statusName: string;
  statusCode: string;
  verificationLevel: string | null;

  requestedByName: string;
  assignedReviewerName: string | null;

  startedAt: string;
  submittedAt: string | null;
  reviewedAt: string | null;
  completedAt: string | null;

  documents: VerificationDocument[];
  checks: VerificationCheck[];
  timeline: VerificationTimelineItem[];
};

export type VerificationDocument = {
  id: number;
  type: string | null;
  fileUrl: string | null;
  status: string | null;
};

export type VerificationCheck = {
  id: number;
  checkType: string;
  status: string;
  notes: string | null;
};

export type VerificationTimelineItem = {
  id: number;
  eventType: string;
  createdAt: string;
  actorName: string | null;
  metadata: unknown;
};

export type VerificationDecisionInput = {
  decision: "approve" | "reject";
  notes?: string;
};