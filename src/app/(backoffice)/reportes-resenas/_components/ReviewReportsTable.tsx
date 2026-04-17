"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { DataTable } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDateTime } from "@/lib/utils/dates";
import type {
  ReviewReportListItem,
  ReviewReportListResult,
} from "@/features/backoffice/review-reports/types";

type ReviewReportsTableProps = {
  data: ReviewReportListResult;
  onSelect: (row: ReviewReportListItem) => void;
};

export function ReviewReportsTable({
  data,
  onSelect,
}: ReviewReportsTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function changePage(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`/reportes-resenas?${params.toString()}`);
  }

  return (
    <div className="space-y-4">
      <DataTable
        columns={[
          {
            key: "report",
            title: "Reporte",
            render: (row) => (
              <button
                type="button"
                onClick={() => onSelect(row)}
                className="text-left"
              >
                <p className="font-medium text-neutral-900">#{row.reportId}</p>
                <p className="text-xs text-neutral-500">Review #{row.reviewId}</p>
              </button>
            ),
          },
          {
            key: "business",
            title: "Negocio",
            render: (row) => (
              <div>
                <p className="font-medium text-neutral-900">{row.companyName}</p>
                <p className="text-xs text-neutral-500">{row.branchName}</p>
              </div>
            ),
          },
          {
            key: "reporter",
            title: "Reporter",
            render: (row) => (
              <div>
                <p className="font-medium text-neutral-900">{row.reporterName}</p>
                <p className="text-xs text-neutral-500">{row.reason ?? "—"}</p>
              </div>
            ),
          },
          {
            key: "status",
            title: "Estado",
            render: (row) => (
              <StatusBadge
                label={row.statusName}
                tone={
                  row.statusCode === "hidden"
                    ? "danger"
                    : row.statusCode === "resolved"
                    ? "success"
                    : "warning"
                }
              />
            ),
          },
          {
            key: "createdAt",
            title: "Fecha",
            render: (row) => <span>{formatDateTime(row.createdAt)}</span>,
          },
        ]}
        rows={data.items}
        getRowKey={(row) => String(row.reportId)}
        emptyState={
          <EmptyState
            title="No hay reportes"
            description="No se encontraron reportes de reseñas con los filtros actuales."
          />
        }
      />

      <Pagination
        page={data.page}
        pageSize={data.pageSize}
        total={data.total}
        onPageChange={changePage}
      />
    </div>
  );
}