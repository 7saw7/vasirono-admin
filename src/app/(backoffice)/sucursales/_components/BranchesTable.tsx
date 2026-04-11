import Link from "next/link";
import { DataTable } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { formatDateTime } from "@/lib/utils/dates";
import { formatNumber } from "@/lib/utils/numbers";
import type { BranchListItem, BranchListResult } from "@/features/backoffice/branches/types";
import { BranchStatusBadge } from "./BranchStatusBadge";

type BranchesTableProps = {
  data: BranchListResult;
};

export function BranchesTable({ data }: BranchesTableProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <p className="text-sm text-neutral-500">
          Total: {data.total} sucursal{data.total === 1 ? "" : "es"}
        </p>
      </div>

      <DataTable
        columns={[
          {
            key: "name",
            title: "Sucursal",
            render: (row: BranchListItem) => (
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
            key: "companyName",
            title: "Empresa",
            render: (row: BranchListItem) => (
              <div className="space-y-1">
                <Link
                  href={`/empresas/${row.companyId}`}
                  className="font-medium text-neutral-900 hover:underline"
                >
                  {row.companyName}
                </Link>
                <p className="text-xs text-neutral-500">
                  Distrito: {row.districtName ?? "—"}
                </p>
              </div>
            ),
          },
          {
            key: "status",
            title: "Estado",
            render: (row: BranchListItem) => (
              <BranchStatusBadge isActive={row.isActive} isMain={row.isMain} />
            ),
          },
          {
            key: "metrics",
            title: "Métricas",
            render: (row: BranchListItem) => (
              <div className="space-y-1 text-sm">
                <p>Visitas: {formatNumber(row.visitsCount)}</p>
                <p>Reviews: {formatNumber(row.reviewsCount)}</p>
                <p>Score: {formatNumber(row.finalScore)}</p>
              </div>
            ),
          },
          {
            key: "structure",
            title: "Estructura",
            render: (row: BranchListItem) => (
              <div className="space-y-1 text-sm">
                <p>Contactos: {formatNumber(row.contactsCount)}</p>
                <p>Horarios: {formatNumber(row.schedulesCount)}</p>
                <p>Servicios: {formatNumber(row.servicesCount)}</p>
                <p>Media: {formatNumber(row.mediaCount)}</p>
              </div>
            ),
          },
          {
            key: "updatedAt",
            title: "Actualizada",
            render: (row: BranchListItem) => (
              <span className="text-sm text-neutral-600">
                {formatDateTime(row.updatedAt)}
              </span>
            ),
          },
        ]}
        rows={data.items}
        getRowKey={(row) => String(row.branchId)}
        emptyState={
          <EmptyState
            title="No se encontraron sucursales"
            description="Prueba ajustando los filtros o verifica si ya existen locales cargados."
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