"use client";

import { Button } from "@/components/ui/Button";
import { SectionCard } from "@/components/ui/SectionCard";
import { TaxonomyPagination } from "./TaxonomyPagination";
import { TaxonomyTableToolbar } from "./TaxonomyTableToolbar";
import type { CategoryListItem } from "@/features/backoffice/taxonomies/types";
import type { PaginatedResult } from "@/features/backoffice/shared/types";

type CategoriesTableProps = {
  data: PaginatedResult<CategoryListItem>;
  onCreate: () => void;
  onEdit: (item: CategoryListItem) => void;
};

export function CategoriesTable({
  data,
  onCreate,
  onEdit,
}: CategoriesTableProps) {
  return (
    <SectionCard
      title="Categorías"
      description={`Mostrando ${data.items.length} de ${data.total} registros.`}
    >
      <TaxonomyTableToolbar
        searchKey="catSearch"
        pageKey="catPage"
        searchPlaceholder="Buscar categoría..."
        createLabel="Nueva categoría"
        onCreate={onCreate}
      />

      {data.items.length === 0 ? (
        <EmptyState message="No se encontraron categorías." />
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50">
                <tr>
                  <HeaderCell>Nombre</HeaderCell>
                  <HeaderCell>Subcategorías</HeaderCell>
                  <HeaderCell>Empresas</HeaderCell>
                  <HeaderCell>Acciones</HeaderCell>
                </tr>
              </thead>

              <tbody className="divide-y divide-neutral-100 bg-white">
                {data.items.map((item) => (
                  <tr key={item.id} className="hover:bg-neutral-50">
                    <BodyCell>
                      <span className="font-medium text-neutral-900">
                        {item.name}
                      </span>
                    </BodyCell>
                    <BodyCell>{item.subcategoriesCount}</BodyCell>
                    <BodyCell>{item.companiesCount}</BodyCell>
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
            pageKey="catPage"
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