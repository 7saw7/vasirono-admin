import Link from "next/link";
import { DataTable } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDateTime } from "@/lib/utils/dates";
import type { ClaimListItem, ClaimListResult } from "@/features/backoffice/claims/types";
import { ClaimReviewDrawer } from "./ClaimReviewDrawer";

type ClaimRequestsTableProps = {
  data: ClaimListResult;
};

function mapTone(statusCode: string) {
  if (["approved", "accepted", "approved_basic_access", "official_channel_verified", "onsite_review_passed"].includes(statusCode)) return "success" as const;
  if (["pending", "submitted", "in_review", "reviewing", "received", "pending_public_contact_review", "otp_pending", "visit_required", "visit_scheduled", "needs_more_evidence"].includes(statusCode)) {
    return "warning" as const;
  }
  if (["rejected", "denied"].includes(statusCode)) return "danger" as const;
  return "neutral" as const;
}

export function ClaimRequestsTable({ data }: ClaimRequestsTableProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <p className="text-sm text-neutral-500">
          Total: {data.total} reclamo{data.total === 1 ? "" : "s"}
        </p>
      </div>

      <DataTable
        columns={[
          {
            key: "companyName",
            title: "Empresa",
            render: (row: ClaimListItem) => (
              <div className="space-y-1">
                <Link
                  href={`/empresas/${row.companyId}`}
                  className="font-medium text-neutral-950 hover:underline"
                >
                  {row.companyName}
                </Link>
                <p className="text-xs text-neutral-500">
                  Reclamo #{row.claimRequestId}{row.branchName ? ` · ${row.branchName}` : ""}
                </p>
                {row.branchAddress ? (
                  <p className="text-xs text-neutral-400">{row.branchAddress}</p>
                ) : null}
              </div>
            ),
          },
          {
            key: "claimantName",
            title: "Solicitante",
            render: (row: ClaimListItem) => (
              <div className="space-y-1">
                <p className="font-medium text-neutral-900">{row.claimantName}</p>
                <p className="text-xs text-neutral-500">{row.claimantEmail}</p>
                {row.claimantPhone ? (
                  <p className="text-xs text-neutral-400">{row.claimantPhone}</p>
                ) : null}
                {row.applicantRole ? (
                  <p className="text-xs text-neutral-400">Rol: {row.applicantRole}</p>
                ) : null}
              </div>
            ),
          },

          {
            key: "declaredChannel",
            title: "Canal declarado",
            render: (row: ClaimListItem) => (
              <div className="space-y-1 text-sm text-neutral-600">
                <p>{row.declaredChannelType ?? "—"}</p>
                <p className="text-xs text-neutral-500">{row.declaredChannelValue ?? "Sin valor"}</p>
                {row.preferredVerificationRoute ? (
                  <p className="text-xs text-neutral-400">Ruta: {row.preferredVerificationRoute}</p>
                ) : null}
              </div>
            ),
          },
          {
            key: "statusName",
            title: "Estado",
            render: (row: ClaimListItem) => (
              <StatusBadge
                label={row.statusName}
                tone={mapTone(row.statusCode)}
              />
            ),
          },
          {
            key: "submittedAt",
            title: "Fechas",
            render: (row: ClaimListItem) => (
              <div className="space-y-1 text-sm text-neutral-600">
                <p>Enviado: {formatDateTime(row.submittedAt)}</p>
                <p>Revisado: {formatDateTime(row.reviewedAt)}</p>
              </div>
            ),
          },
          {
            key: "verification",
            title: "Verificación",
            render: (row: ClaimListItem) => (
              <StatusBadge
                label={row.hasVerificationRequest ? "Generada" : "No generada"}
                tone={row.hasVerificationRequest ? "info" : "neutral"}
              />
            ),
          },
          {
            key: "actions",
            title: "Acciones",
            render: (row: ClaimListItem) => <ClaimReviewDrawer claim={row} />,
          },
        ]}
        rows={data.items}
        getRowKey={(row) => String(row.claimRequestId)}
        emptyState={
          <EmptyState
            title="No se encontraron reclamos"
            description="Prueba ajustando filtros o verifica si existen solicitudes registradas."
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