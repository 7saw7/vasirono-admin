import { DataTable } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { TableColumn } from "@/features/backoffice/shared/types";
import { formatDateTime } from "@/lib/utils/formatters";
import { formatNumber } from "@/lib/utils/numbers";

type CompanyScoreRow = {
  companyId: number;
  companyName: string;
  finalScore: number;
  popularityScore: number;
  engagementScore: number;
  conversionScore: number;
  trustScore: number;
  freshnessScore: number;
  activeBranchesCount: number;
  branchesWithScoreCount: number;
  reviews90d: number;
  avgRating90d: number;
  calculatedAt: string | null;
};

type CompanyScoreTableProps = {
  rows: CompanyScoreRow[];
  loading?: boolean;
};

const columns: TableColumn<CompanyScoreRow>[] = [
  {
    key: "companyName",
    title: "Empresa",
    render: (row) => (
      <div>
        <p className="font-medium text-neutral-900">{row.companyName}</p>
        <p className="text-xs text-neutral-500">ID {row.companyId}</p>
      </div>
    ),
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
    key: "activeBranchesCount",
    title: "Sucursales activas",
    render: (row) => formatNumber(row.activeBranchesCount, "es-PE", 0),
  },
  {
    key: "branchesWithScoreCount",
    title: "Sucursales con score",
    render: (row) => formatNumber(row.branchesWithScoreCount, "es-PE", 0),
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

export function CompanyScoreTable({
  rows,
  loading = false,
}: CompanyScoreTableProps) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white p-5 text-sm text-neutral-500 shadow-sm">
        Cargando score de empresas...
      </div>
    );
  }

  return (
    <DataTable
      columns={columns}
      rows={rows}
      getRowKey={(row) => String(row.companyId)}
      emptyState={
        <EmptyState
          title="No hay datos de score de empresas"
          description="Aún no existen registros para los filtros aplicados."
        />
      }
    />
  );
}