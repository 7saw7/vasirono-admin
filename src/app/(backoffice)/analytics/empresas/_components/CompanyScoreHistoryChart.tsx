import { TrendChart } from "@/components/charts/TrendChart";
import type { AnalyticsSeriesPoint } from "@/features/backoffice/analytics/types";

type CompanyScoreHistoryChartProps = {
  data: AnalyticsSeriesPoint[];
};

export function CompanyScoreHistoryChart({
  data,
}: CompanyScoreHistoryChartProps) {
  return (
    <TrendChart
      title="Tendencia histórica de score de empresas"
      description="Promedio diario del final_score en analytics_company_scores_history."
      data={data}
    />
  );
}