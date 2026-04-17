import { TaxonomyManager } from "./TaxonomyManager";
import type { TaxonomiesDashboardData } from "@/features/backoffice/taxonomies/types";

type TaxonomiesViewProps = {
  data: TaxonomiesDashboardData;
};

export function TaxonomiesView({ data }: TaxonomiesViewProps) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-neutral-500">Backoffice</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-neutral-950">
          Taxonomías
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          Catálogos estructurales del sistema y su uso real en empresas y sucursales.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Tipos de negocio"
          value={String(data.summary.totalBusinessTypes)}
        />
        <SummaryCard
          label="Categorías"
          value={String(data.summary.totalCategories)}
        />
        <SummaryCard
          label="Subcategorías"
          value={String(data.summary.totalSubcategories)}
        />
        <SummaryCard
          label="Servicios"
          value={String(data.summary.totalServices)}
        />
      </div>

      <TaxonomyManager data={data} />
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-neutral-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-neutral-950">{value}</p>
    </div>
  );
}