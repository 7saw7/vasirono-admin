import { VerificationFilters } from "./VerificationFilters";
import { VerificationQueueSummary } from "./VerificationQueueSummary";
import { VerificationRequestsTable } from "./VerificationRequestsTable";
import type { VerificationListResult } from "@/features/backoffice/verifications/types";

type VerificationRequestsViewProps = {
  data: VerificationListResult;
};

export function VerificationRequestsView({
  data,
}: VerificationRequestsViewProps) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-neutral-500">Verificaciones</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-neutral-950">
          Solicitudes de verificación
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          Gestiona la cola operativa de requests creados desde claims y otros
          flujos de verificación empresarial.
        </p>
      </div>

      <VerificationQueueSummary summary={data.summary} />
      <VerificationFilters />
      <VerificationRequestsTable data={data} />
    </div>
  );
}