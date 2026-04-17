import { DataTable } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { TableColumn } from "@/features/backoffice/shared/types";
import { formatDateTime } from "@/lib/utils/formatters";
import { formatNumber } from "@/lib/utils/numbers";

type BranchScoreRow = {
  branchId: number;
  branchName: string;
  companyId: number;
  companyName: string;
  districtName: string | null;
  finalScore: number;
  popularityScore: number;
  engagementScore: number;
  conversionScore: number;
  trustScore: number;
  freshnessScore: number;
  visits30d: number;
  favorites30d: number;
  contactClicks30d: number;
  reviews90d: number;
  avgRating90d: number;
  calculatedAt: string | null;
};

type BranchScoreTableProps = {
  rows: BranchScoreRow[];
  loading?: boolean;
};

const columns: TableColumn<BranchScoreRow>[] = [
  {
    key: "branchName",
    title: "Sucursal",
    render: (row) => (
      <div>
        <p className="font-medium text-neutral-900">{row.branchName}</p>
        <p className="text-xs text-neutral-500">
          {row.companyName} · ID {row.branchId}
        </p>
      </div>
    ),
  },
  {
    key: "districtName",
    title: "Distrito",
    render: (row) => row.districtName ?? "—",
  },
  {
    key: "finalScore",
    title: "Score final",
    render: (row) => (
      <StatusBadge
        label={formatNumber(row.finalScore)}
        tone={row.finalScore >= 70 ? "success" : row.finalScore >= 40 ? "warning" : "neutral"}
      />
    ),
  },
  {
    key: "popularityScore",
    title: "Popularity",
    render: (row) => formatNumber(row.popularityScore),
  },
  {
    key: "engagementScore",
    title: "Engagement",
    render: (row) => formatNumber(row.engagementScore),
  },
  {
    key: "conversionScore",
    title: "Conversion",
    render: (row) => formatNumber(row.conversionScore),
  },
  {
    key: "trustScore",
    title: "Trust",
    render: (row) => formatNumber(row.trustScore),
  },
  {
    key: "freshnessScore",
    title: "Freshness",
    render: (row) => formatNumber(row.freshnessScore),
  },
  {
    key: "visits30d",
    title: "Visitas 30d",
    render: (row) => formatNumber(row.visits30d, "es-PE", 0),
  },
  {
    key: "favorites30d",
    title: "Favoritos 30d",
    render: (row) => formatNumber(row.favorites30d, "es-PE", 0),
  },
  {
    key: "contactClicks30d",
    title: "Clicks contacto 30d",
    render: (row) => formatNumber(row.contactClicks30d, "es-PE", 0),
  },
  {
    key: "reviews90d",
    title: "Reviews 90d",
    render: (row) => formatNumber(row.reviews90d, "es-PE", 0),
  },
  {
    key: "avgRating90d",
    title: "Rating 90d",
    render: (row) => formatNumber(row.avgRating90d),
  },
  {
    key: "calculatedAt",
    title: "Calculado",
    render: (row) => formatDateTime(row.calculatedAt),
  },
];

export function BranchScoreTable({
  rows,
  loading = false,
}: BranchScoreTableProps) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white p-5 text-sm text-neutral-500 shadow-sm">
        Cargando score de sucursales...
      </div>
    );
  }

  return (
    <DataTable
      columns={columns}
      rows={rows}
      getRowKey={(row) => String(row.branchId)}
      emptyState={
        <EmptyState
          title="No hay datos de score de sucursales"
          description="Aún no existen registros para los filtros aplicados."
        />
      }
    />
  );
}