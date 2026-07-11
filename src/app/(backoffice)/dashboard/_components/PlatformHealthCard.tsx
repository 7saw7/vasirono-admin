import { SectionCard } from "@/components/ui/SectionCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { AppIcon } from "@/components/ui/AppIcon";
import type { BackofficeDashboardData } from "@/features/backoffice/dashboard/types";

type PlatformHealthCardProps = { items: BackofficeDashboardData["platformHealth"] };

function mapTone(status: "healthy" | "warning" | "critical") {
  if (status === "healthy") return "success" as const;
  if (status === "warning") return "warning" as const;
  return "danger" as const;
}

const iconByIndex = ["shield", "reviews", "claims", "activity"] as const;

export function PlatformHealthCard({ items }: PlatformHealthCardProps) {
  const healthyCount = items.filter((item) => item.status === "healthy").length;
  const score = items.length ? Math.round((healthyCount / items.length) * 100) : 100;

  return (
    <SectionCard
      title="Salud operativa"
      description="Señales clave para anticipar cuellos de botella en la plataforma."
      action={<span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> {score}% estable</span>}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((item, index) => {
          const progress = item.status === "healthy" ? 88 : item.status === "warning" ? 58 : 28;
          const bar = item.status === "healthy" ? "bg-emerald-500" : item.status === "warning" ? "bg-amber-500" : "bg-rose-500";
          return (
            <article key={item.label} className="rounded-2xl border border-slate-200/70 bg-slate-50/55 p-4 transition hover:border-indigo-200 hover:bg-white dark:border-white/[0.065] dark:bg-white/[0.022] dark:hover:border-indigo-400/20 dark:hover:bg-white/[0.035]">
              <div className="flex items-start gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-indigo-600 shadow-sm dark:bg-white/[0.06] dark:text-indigo-300">
                  <AppIcon name={iconByIndex[index % iconByIndex.length]} className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{item.label}</p>
                      <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-slate-500 dark:text-slate-400">{item.helpText}</p>
                    </div>
                    <p className="text-xl font-extrabold tracking-[-0.04em] text-slate-950 dark:text-white">{item.value}</p>
                  </div>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200/70 dark:bg-white/[0.07]"><div className={`h-full rounded-full ${bar}`} style={{ width: `${progress}%` }} /></div>
                  <div className="mt-2"><StatusBadge label={item.status === "healthy" ? "Saludable" : item.status === "warning" ? "Atención" : "Crítico"} tone={mapTone(item.status)} /></div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </SectionCard>
  );
}
