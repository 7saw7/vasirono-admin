"use client";

import { Button } from "@/components/ui/Button";
import { SectionCard } from "@/components/ui/SectionCard";
import { ServicesStatusBadge } from "./ServicesStatusBadge";
import { TaxonomyPagination } from "./TaxonomyPagination";
import { TaxonomyTableToolbar } from "./TaxonomyTableToolbar";
import type { ServiceListItem } from "@/features/backoffice/taxonomies/types";
import type { PaginatedResult } from "@/features/backoffice/shared/types";

type ServicesTableProps = {
  data: PaginatedResult<ServiceListItem>;
  onCreate: () => void;
  onEdit: (item: ServiceListItem) => void;
};

export function ServicesTable({
  data,
  onCreate,
  onEdit,
}: ServicesTableProps) {
  return (
    <SectionCard
      title="Servicios"
      description={`Mostrando ${data.items.length} de ${data.total} registros.`}
    >
      <TaxonomyTableToolbar
        searchKey="srvSearch"
        pageKey="srvPage"
        searchPlaceholder="Buscar servicio..."
        createLabel="Nuevo servicio"
        onCreate={onCreate}
        extraFilters={[
          {
            key: "srvActive",
            label: "Estado",
            value: "",
            options: [
              { label: "Todos", value: "" },
              { label: "Activos", value: "true" },
              { label: "Inactivos", value: "false" },
            ],
          },
        ]}
      />

      {data.items.length === 0 ? (
        <EmptyState message="No se encontraron servicios." />
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50">
                <tr>
                  <HeaderCell>Servicio</HeaderCell>
                  <HeaderCell>Código</HeaderCell>
                  <HeaderCell>Estado</HeaderCell>
                  <HeaderCell>Sucursales</HeaderCell>
                  <HeaderCell>Acciones</HeaderCell>
                </tr>
              </thead>

              <tbody className="divide-y divide-neutral-100 bg-white">
                {data.items.map((item) => (
                  <tr key={item.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-4 text-sm text-neutral-700">
                      <div>
                        <p className="font-medium text-neutral-900">{item.name}</p>
                        {item.description ? (
                          <p className="mt-1 line-clamp-2 text-xs text-neutral-500">
                            {item.description}
                          </p>
                        ) : null}
                      </div>
                    </td>
                    <BodyCell>{item.code}</BodyCell>
                    <BodyCell>
                      <ServicesStatusBadge isActive={item.isActive} />
                    </BodyCell>
                    <BodyCell>{item.branchesCount}</BodyCell>
                    <BodyCell>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => onEdit(item)}
                      >
                        Editar
                      </Button>
                    </BodyCell>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <TaxonomyPagination
            pageKey="srvPage"
            currentPage={data.page}
            pageSize={data.pageSize}
            total={data.total}
          />
        </>
      )}
    </SectionCard>
  );
}

function HeaderCell({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
      {children}
    </th>
  );
}

function BodyCell({ children }: { children: React.ReactNode }) {
  return <td className="px-4 py-4 text-sm text-neutral-700">{children}</td>;
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-8 text-center text-sm text-neutral-500">
      {message}
    </div>
  );
}