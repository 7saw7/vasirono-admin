import Link from "next/link";
import { DataTable } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDateTime } from "@/lib/utils/dates";
import type {
  VerificationListItem,
  VerificationListResult,
} from "@/features/backoffice/verifications/types";

type VerificationRequestsTableProps = {
  data: VerificationListResult;
};

function mapTone(statusCode: string) {
  if (["approved", "verified", "completed"].includes(statusCode)) {
    return "success" as const;
  }
  if (["pending", "submitted", "in_review", "under_review", "assigned"].includes(statusCode)) {
    return "warning" as const;
  }
  if (["rejected", "failed", "cancelled"].includes(statusCode)) {
    return "danger" as const;
  }
  return "neutral" as const;
}

export function VerificationRequestsTable({
  data,
}: VerificationRequestsTableProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <p className="text-sm text-neutral-500">
          Total: {data.total} request{data.total === 1 ? "" : "s"}
        </p>
      </div>

      <DataTable
        columns={[
          {
            key: "verificationRequestId",
            title: "Request",
            render: (row: VerificationListItem) => (
              <div className="space-y-1">
                <Link
                  href={`/verificaciones/${row.verificationRequestId}`}
                  className="font-medium text-neutral-950 hover:underline"
                >
                  Verification #{row.verificationRequestId}
                </Link>
                <p className="text-xs text-neutral-500">
                  Claim: {row.claimRequestId ? `#${row.claimRequestId}` : "—"}
                </p>
              </div>
            ),
          },
          {
            key: "companyName",
            title: "Empresa",
            render: (row: VerificationListItem) => (
              <div className="space-y-1">
                <Link
                  href={`/empresas/${row.companyId}`}
                  className="font-medium text-neutral-900 hover:underline"
                >
                  {row.companyName}
                </Link>
                <p className="text-xs text-neutral-500">
                  Nivel: {row.verificationLevel ?? "—"}
                </p>
              </div>
            ),
          },
          {
            key: "requestedByName",
            title: "Requester",
            render: (row: VerificationListItem) => (
              <div className="space-y-1">
                <p className="font-medium text-neutral-900">
                  {row.requestedByName}
                </p>
                <p className="text-xs text-neutral-500">
                  {row.requestedByEmail}
                </p>
              </div>
            ),
          },
          {
            key: "statusName",
            title: "Estado",
            render: (row: VerificationListItem) => (
              <StatusBadge
                label={row.statusName}
                tone={mapTone(row.statusCode)}
              />
            ),
          },
          {
            key: "assignedReviewerName",
            title: "Reviewer",
            render: (row: VerificationListItem) => (
              <span className="text-sm text-neutral-700">
                {row.assignedReviewerName ?? "Sin asignar"}
              </span>
            ),
          },
          {
            key: "dates",
            title: "Fechas",
            render: (row: VerificationListItem) => (
              <div className="space-y-1 text-sm text-neutral-600">
                <p>Start: {formatDateTime(row.startedAt)}</p>
                <p>Submitted: {formatDateTime(row.submittedAt)}</p>
                <p>Reviewed: {formatDateTime(row.reviewedAt)}</p>
              </div>
            ),
          },
        ]}
        rows={data.items}
        getRowKey={(row) => String(row.verificationRequestId)}
        emptyState={
          <EmptyState
            title="No se encontraron verificaciones"
            description="Prueba ajustando los filtros o verifica si ya existen requests generados."
          />
        }
      />

      <Pagination
        page={data.page}
        pageSize={data.pageSize}
        total={data.total}
      />
    </div>
  );
}