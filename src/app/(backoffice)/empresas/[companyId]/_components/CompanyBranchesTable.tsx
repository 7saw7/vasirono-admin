import Link from "next/link";
import { DataTable } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDateTime } from "@/lib/utils/dates";
import type { CompanyDetailBranch } from "@/features/backoffice/companies/types";

type CompanyBranchesTableProps = {
  branches: CompanyDetailBranch[];
};

export function CompanyBranchesTable({ branches }: CompanyBranchesTableProps) {
  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold text-neutral-950">Sucursales</h2>

      <DataTable
        columns={[
          {
            key: "name",
            title: "Sucursal",
            render: (row: CompanyDetailBranch) => (
              <div className="space-y-1">
                <Link
                  href={`/sucursales/${row.branchId}`}
                  className="font-medium text-neutral-950 hover:underline"
                >
                  {row.name}
                </Link>
                <p className="text-xs text-neutral-500">{row.address}</p>
              </div>
            ),
          },
          {
            key: "districtName",
            title: "Distrito",
            render: (row: CompanyDetailBranch) => (
              <span>{row.districtName ?? "—"}</span>
            ),
          },
          {
            key: "isMain",
            title: "Principal",
            render: (row: CompanyDetailBranch) =>
              row.isMain ? (
                <StatusBadge label="Principal" tone="info" />
              ) : (
                <span>—</span>
              ),
          },
          {
            key: "isActive",
            title: "Estado",
            render: (row: CompanyDetailBranch) => (
              <StatusBadge
                label={row.isActive ? "Activa" : "Inactiva"}
                tone={row.isActive ? "success" : "danger"}
              />
            ),
          },
          {
            key: "updatedAt",
            title: "Actualizada",
            render: (row: CompanyDetailBranch) => (
              <span>{formatDateTime(row.updatedAt)}</span>
            ),
          },
        ]}
        rows={branches}
        getRowKey={(row) => String(row.branchId)}
        emptyState={
          <EmptyState
            title="Esta empresa aún no tiene sucursales"
            description="Cuando existan locales vinculados aparecerán aquí."
          />
        }
      />
    </div>
  );
}