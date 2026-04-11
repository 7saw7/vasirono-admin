"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { DataTable } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { formatDateTime } from "@/lib/utils/dates";
import type { CompanyListItem, CompanyListResult } from "@/features/backoffice/companies/types";
import { CompanyStatusBadge } from "./CompanyStatusBadge";
import { CompanyBulkActions } from "./CompanyBulkActions";

type CompaniesTableProps = {
  data: CompanyListResult;
};

export function CompaniesTable({ data }: CompaniesTableProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const selectedCount = selectedIds.length;

  const columns = useMemo(
    () => [
      {
        key: "select",
        title: "",
        headerClassName: "w-12",
        className: "w-12",
        render: (row: CompanyListItem) => (
          <input
            type="checkbox"
            checked={selectedIds.includes(row.companyId)}
            onChange={(event) => {
              setSelectedIds((current) =>
                event.target.checked
                  ? [...current, row.companyId]
                  : current.filter((id) => id !== row.companyId)
              );
            }}
          />
        ),
      },
      {
        key: "name",
        title: "Empresa",
        render: (row: CompanyListItem) => (
          <div className="space-y-1">
            <Link
              href={`/empresas/${row.companyId}`}
              className="font-medium text-neutral-950 hover:underline"
            >
              {row.name}
            </Link>
            <p className="text-xs text-neutral-500">
              {row.email ?? row.phone ?? "Sin contacto"}
            </p>
          </div>
        ),
      },
      {
        key: "verificationStatus",
        title: "Verificación",
        render: (row: CompanyListItem) => (
          <div className="space-y-1">
            <CompanyStatusBadge
              status={row.verificationStatus}
              code={row.verificationStatusCode}
            />
            <p className="text-xs text-neutral-500">
              Nivel: {row.verificationLevel ?? "—"} · Score: {row.verificationScore}
            </p>
          </div>
        ),
      },
      {
        key: "subscriptionStatus",
        title: "Plan",
        render: (row: CompanyListItem) => (
          <div className="space-y-1">
            <p className="font-medium text-neutral-900">{row.planName ?? "Sin plan"}</p>
            <p className="text-xs text-neutral-500">
              {row.subscriptionStatus ?? "Sin suscripción"}
            </p>
          </div>
        ),
      },
      {
        key: "branchesCount",
        title: "Sucursales",
        render: (row: CompanyListItem) => (
          <div className="space-y-1">
            <p className="font-medium text-neutral-900">{row.branchesCount}</p>
            <p className="text-xs text-neutral-500">
              {row.districtLabel ?? "Sin distrito principal"}
            </p>
          </div>
        ),
      },
      {
        key: "pendingClaimsCount",
        title: "Claims",
        render: (row: CompanyListItem) => (
          <span className="text-sm font-medium text-neutral-900">
            {row.pendingClaimsCount}
          </span>
        ),
      },
      {
        key: "updatedAt",
        title: "Actualizada",
        render: (row: CompanyListItem) => (
          <span className="text-sm text-neutral-600">
            {formatDateTime(row.updatedAt)}
          </span>
        ),
      },
    ],
    [selectedIds]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <CompanyBulkActions selectedCount={selectedCount} />
        <p className="text-sm text-neutral-500">
          Total: {data.total} empresa{data.total === 1 ? "" : "s"}
        </p>
      </div>

      <DataTable
        columns={columns}
        rows={data.items}
        getRowKey={(row) => String(row.companyId)}
        emptyState={
          <EmptyState
            title="No se encontraron empresas"
            description="Prueba ajustando los filtros o revisa si ya existen registros cargados."
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