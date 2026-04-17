import { DataTable } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import type { TableColumn } from "@/features/backoffice/shared/types";
import { formatNumber } from "@/lib/utils/numbers";

type BranchSourceBreakdownRow = {
  source: string;
  visitsCount: number;
  favoritesCount: number;
  contactClicks: number;
  reviewsCount: number;
};

type BranchSourceBreakdownTableProps = {
  rows: BranchSourceBreakdownRow[];
  loading?: boolean;
};

const columns: TableColumn<BranchSourceBreakdownRow>[] = [
  {
    key: "source",
    title: "Fuente",
    render: (row) => row.source,
  },
  {
    key: "visitsCount",
    title: "Visitas",
    render: (row) => formatNumber(row.visitsCount, "es-PE", 0),
  },
  {
    key: "favoritesCount",
    title: "Favoritos",
    render: (row) => formatNumber(row.favoritesCount, "es-PE", 0),
  },
  {
    key: "contactClicks",
    title: "Clicks contacto",
    render: (row) => formatNumber(row.contactClicks, "es-PE", 0),
  },
  {
    key: "reviewsCount",
    title: "Reviews",
    render: (row) => formatNumber(row.reviewsCount, "es-PE", 0),
  },
];

export function BranchSourceBreakdownTable({
  rows,
  loading = false,
}: BranchSourceBreakdownTableProps) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white p-5 text-sm text-neutral-500 shadow-sm">
        Cargando breakdown de fuentes...
      </div>
    );
  }

  return (
    <DataTable
      columns={columns}
      rows={rows}
      getRowKey={(row) => row.source}
      emptyState={
        <EmptyState
          title="No hay breakdown de fuentes"
          description="Todavía no hay datos agregados en analytics_branch_daily_sources."
        />
      }
    />
  );
}