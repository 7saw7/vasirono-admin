import { VerificationRequestHeader } from "./VerificationRequestHeader";
import { VerificationChecksTable } from "./VerificationChecksTable";
import { VerificationDocumentsTable } from "./VerificationDocumentsTable";
import { VerificationTimeline } from "./VerificationTimeline";
import { VerificationDecisionForm } from "./VerificationDecisionForm";
import { VerificationAddressMatchesPanel } from "./VerificationAddressMatchesPanel";
import { VerificationPublicContactsPanel } from "./VerificationPublicContactsPanel";
import { VerificationWhatsappPanel } from "./VerificationWhatsappPanel";
import { VerificationDocumentReviewPanel } from "./VerificationDocumentReviewPanel";
import { VerificationDocumentActionsPanel } from "./VerificationDocumentActionsPanel";
import { VerificationAssignmentPanel } from "./VerificationAssignmentPanel";
import type { VerificationDetail } from "@/features/backoffice/verifications/types";

type VerificationRequestDetailViewProps = {
  data: VerificationDetail;
  currentUserId: string;
  canAssign: boolean;
  canReviewDocuments: boolean;
  canDecide: boolean;
};

const TERMINAL_STATUSES = new Set([
  "approved",
  "verified",
  "completed",
  "rejected",
  "failed",
  "cancelled",
  "expired",
]);

export function VerificationRequestDetailView({
  data,
  currentUserId,
  canAssign,
  canReviewDocuments,
  canDecide,
}: VerificationRequestDetailViewProps) {
  const isTerminal = TERMINAL_STATUSES.has(data.statusCode.toLowerCase());
  return (
    <div className="space-y-6">
      <VerificationRequestHeader data={data} />

      <div className="grid gap-6 xl:grid-cols-2">
        <VerificationDocumentsTable documents={data.documents} />
        <VerificationChecksTable checks={data.checks} />
      </div>

      {canAssign && !isTerminal ? (
        <VerificationAssignmentPanel
          requestId={data.verificationRequestId}
          currentUserId={currentUserId}
          assignedReviewerId={data.assignedReviewerId}
          assignedReviewerName={data.assignedReviewerName}
        />
      ) : null}

      {canReviewDocuments && !isTerminal ? (
        <VerificationDocumentActionsPanel
          requestId={data.verificationRequestId}
          documents={data.documents}
        />
      ) : null}

      <VerificationDocumentReviewPanel documents={data.documents} />

      <div className="grid gap-6 xl:grid-cols-2">
        <VerificationPublicContactsPanel items={data.publicContacts} />
        <VerificationWhatsappPanel items={data.whatsappVerifications} />
      </div>

      <VerificationAddressMatchesPanel items={data.addressMatches} />
      <VerificationTimeline timeline={data.timeline} />

      {isTerminal ? (
        <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-700">
          Esta solicitud está finalizada. Las acciones de asignación, carga,
          revisión documental y decisión quedaron bloqueadas para preservar la
          trazabilidad.
        </div>
      ) : canDecide ? (
        <VerificationDecisionForm requestId={data.verificationRequestId} />
      ) : (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Tienes acceso de consulta. La decisión final requiere el permiso
          específico de aprobación o rechazo.
        </div>
      )}
    </div>
  );
}