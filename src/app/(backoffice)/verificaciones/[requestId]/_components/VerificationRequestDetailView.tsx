import { VerificationRequestHeader } from "./VerificationRequestHeader";
import { VerificationChecksTable } from "./VerificationChecksTable";
import { VerificationDocumentsTable } from "./VerificationDocumentsTable";
import { VerificationTimeline } from "./VerificationTimeline";
import { VerificationDecisionForm } from "./VerificationDecisionForm";
import { VerificationAddressMatchesPanel } from "./VerificationAddressMatchesPanel";
import { VerificationPublicContactsPanel } from "./VerificationPublicContactsPanel";
import { VerificationWhatsappPanel } from "./VerificationWhatsappPanel";
import { VerificationDocumentReviewPanel } from "./VerificationDocumentReviewPanel";
import type { VerificationDetail } from "@/features/backoffice/verifications/types";

type VerificationRequestDetailViewProps = {
  data: VerificationDetail;
};

export function VerificationRequestDetailView({
  data,
}: VerificationRequestDetailViewProps) {
  return (
    <div className="space-y-6">
      <VerificationRequestHeader data={data} />

      <div className="grid gap-6 xl:grid-cols-2">
        <VerificationDocumentsTable documents={data.documents} />
        <VerificationChecksTable checks={data.checks} />
      </div>

      <VerificationDocumentReviewPanel documents={data.documents} />

      <div className="grid gap-6 xl:grid-cols-2">
        <VerificationPublicContactsPanel items={data.publicContacts} />
        <VerificationWhatsappPanel items={data.whatsappVerifications} />
      </div>

      <VerificationAddressMatchesPanel items={data.addressMatches} />
      <VerificationTimeline timeline={data.timeline} />
      <VerificationDecisionForm requestId={data.verificationRequestId} />
    </div>
  );
}