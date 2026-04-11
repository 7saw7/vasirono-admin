import { StatCard } from "@/components/ui/StatCard";
import { formatNumber } from "@/lib/utils/numbers";
import type { BackofficeDashboardData } from "@/features/backoffice/dashboard/types";

type GlobalKpiGridProps = {
  kpis: BackofficeDashboardData["kpis"];
};

export function GlobalKpiGrid({ kpis }: GlobalKpiGridProps) {
  const items = [
    kpis.companies,
    kpis.branches,
    kpis.users,
    kpis.events7d,
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <StatCard
          key={item.label}
          title={item.label}
          value={formatNumber(item.value)}
          subtitle={item.subtitle}
        />
      ))}
    </div>
  );
}