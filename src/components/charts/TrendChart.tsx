import { SectionCard } from "@/components/ui/SectionCard";
import type { AnalyticsSeriesPoint } from "@/features/backoffice/analytics/types";

type TrendChartProps = {
  title: string;
  description?: string;
  data: AnalyticsSeriesPoint[];
};

export function TrendChart({
  title,
  description,
  data,
}: TrendChartProps) {
  const max = Math.max(...data.map((item) => item.value), 1);

  return (
    <SectionCard title={title} description={description}>
      {data.length === 0 ? (
        <p className="text-sm text-neutral-500">
          No hay datos suficientes para mostrar esta tendencia.
        </p>
      ) : (
        <div className="space-y-4">
          <div className="flex h-56 items-end gap-2">
            {data.map((item) => {
              const height = Math.max((item.value / max) * 100, 6);

              return (
                <div
                  key={item.label}
                  className="flex min-w-0 flex-1 flex-col items-center gap-2"
                >
                  <div className="text-[11px] font-medium text-neutral-500">
                    {item.value}
                  </div>
                  <div className="flex h-44 w-full items-end">
                    <div
                      className="w-full rounded-t-xl bg-neutral-900 transition-all"
                      style={{ height: `${height}%` }}
                      aria-hidden="true"
                    />
                  </div>
                  <div className="truncate text-[11px] text-neutral-500">
                    {item.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </SectionCard>
  );
}