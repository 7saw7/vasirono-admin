import { VerificationRequestHeader } from "./VerificationRequestHeader";
import { VerificationChecksTable } from "./VerificationChecksTable";
import { VerificationDocumentsTable } from "./VerificationDocumentsTable";
import { VerificationTimeline } from "./VerificationTimeline";
import { VerificationDecisionForm } from "./VerificationDecisionForm";

export function VerificationRequestDetailView({ data }: any) {
  return (
    <div className="space-y-6">
      <VerificationRequestHeader data={data} />

      <div className="grid gap-6 xl:grid-cols-2">
        <VerificationDocumentsTable documents={data.documents} />
        <VerificationChecksTable checks={data.checks} />
      </div>

      <VerificationTimeline timeline={data.timeline} />

      <VerificationDecisionForm requestId={data.verificationRequestId} />
    </div>
  );
}