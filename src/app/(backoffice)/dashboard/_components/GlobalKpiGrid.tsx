import { StatCard } from "@/components/ui/StatCard";
import { formatNumber } from "@/lib/utils/numbers";
import type { BackofficeDashboardData } from "@/features/backoffice/dashboard/types";

type GlobalKpiGridProps = { kpis: BackofficeDashboardData["kpis"] };

export function GlobalKpiGrid({ kpis }: GlobalKpiGridProps) {
  const items = [
    { ...kpis.companies, icon: "building" as const, tone: "indigo" as const },
    { ...kpis.branches, icon: "branches" as const, tone: "cyan" as const },
    { ...kpis.users, icon: "users" as const, tone: "fuchsia" as const },
    { ...kpis.events7d, icon: "activity" as const, tone: "emerald" as const },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <StatCard key={item.label} title={item.label} value={formatNumber(item.value)} subtitle={item.subtitle} icon={item.icon} tone={item.tone} />
      ))}
    </div>
  );
}
