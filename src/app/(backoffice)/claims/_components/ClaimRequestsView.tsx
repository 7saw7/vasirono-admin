import { ClaimFilters } from "./ClaimFilters";
import { ClaimRequestsTable } from "./ClaimRequestsTable";
import type { ClaimListResult } from "@/features/backoffice/claims/types";

type ClaimRequestsViewProps = {
  data: ClaimListResult;
};

export function ClaimRequestsView({ data }: ClaimRequestsViewProps) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-neutral-500">Claims</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-neutral-950">
          Solicitudes de claim
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          Revisa solicitudes de ownership empresarial y su relación con flujos
          posteriores de verificación.
        </p>
      </div>

      <ClaimFilters />

      <ClaimRequestsTable data={data} />
    </div>
  );
}