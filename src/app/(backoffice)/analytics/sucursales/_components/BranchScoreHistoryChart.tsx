import { TrendChart } from "@/components/charts/TrendChart";
import type { AnalyticsSeriesPoint } from "@/features/backoffice/analytics/types";

type BranchScoreHistoryChartProps = {
  data: AnalyticsSeriesPoint[];
};

export function BranchScoreHistoryChart({
  data,
}: BranchScoreHistoryChartProps) {
  return (
    <TrendChart
      title="Tendencia histórica de score de sucursales"
      description="Promedio diario del final_score en analytics_branch_scores_history."
      data={data}
    />
  );
}