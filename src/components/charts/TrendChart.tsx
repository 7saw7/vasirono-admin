import { SectionCard } from "@/components/ui/SectionCard";
import type { AnalyticsSeriesPoint } from "@/features/backoffice/analytics/types";

type TrendChartProps = { title: string; description?: string; data: AnalyticsSeriesPoint[] };

export function TrendChart({ title, description, data }: TrendChartProps) {
  const max = Math.max(...data.map((item) => item.value), 1);
  return (
    <SectionCard title={title} description={description}>
      {data.length === 0 ? (
        <p className="text-xs text-slate-500 dark:text-slate-400">No hay datos suficientes para mostrar esta tendencia.</p>
      ) : (
        <div className="space-y-4">
          <div className="flex h-64 items-end gap-2 rounded-2xl bg-[linear-gradient(180deg,rgba(99,102,241,0.04),transparent)] px-3 pt-4 dark:bg-[linear-gradient(180deg,rgba(99,102,241,0.08),transparent)]">
            {data.map((item) => {
              const height = Math.max((item.value / max) * 100, 6);
              return (
                <div key={item.label} className="group flex min-w-0 flex-1 flex-col items-center gap-2">
                  <div className="text-[10px] font-bold text-slate-400 opacity-0 transition group-hover:opacity-100">{item.value}</div>
                  <div className="flex h-48 w-full items-end">
                    <div className="w-full rounded-t-lg bg-[linear-gradient(180deg,#6d5dfc,#4f46e5)] opacity-80 transition-all group-hover:opacity-100" style={{ height: `${height}%` }} aria-hidden="true" />
                  </div>
                  <div className="max-w-full truncate text-[10px] font-medium text-slate-400">{item.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </SectionCard>
  );
}
