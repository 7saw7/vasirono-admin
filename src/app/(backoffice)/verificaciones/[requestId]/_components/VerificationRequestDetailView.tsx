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
import type { VerificationDetail } from "@/features/backoffice/verifications/types";

type VerificationRequestDetailViewProps = {
  data: VerificationDetail;
  canReview: boolean;
};

export function VerificationRequestDetailView({
  data,
  canReview,
}: VerificationRequestDetailViewProps) {
  return (
    <div className="space-y-6">
      <VerificationRequestHeader data={data} />

      <div className="grid gap-6 xl:grid-cols-2">
        <VerificationDocumentsTable documents={data.documents} />
        <VerificationChecksTable checks={data.checks} />
      </div>

      {canReview ? (
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
      {canReview ? (
        <VerificationDecisionForm requestId={data.verificationRequestId} />
      ) : (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Tienes acceso de consulta. La asignación, revisión documental y decisión final requieren permisos de revisión.
        </div>
      )}
    </div>
  );
}