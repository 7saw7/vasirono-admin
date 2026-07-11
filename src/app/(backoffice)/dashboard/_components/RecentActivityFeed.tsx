import { SectionCard } from "@/components/ui/SectionCard";
import { AppIcon, type IconName } from "@/components/ui/AppIcon";
import { formatDateTime } from "@/lib/utils/dates";
import type { RecentActivityItem } from "@/features/backoffice/dashboard/types";

type RecentActivityFeedProps = { items: RecentActivityItem[] };

function resolveIcon(type: string): IconName {
  const value = type.toLowerCase();
  if (value.includes("verification")) return "shield";
  if (value.includes("review")) return "reviews";
  if (value.includes("claim")) return "claims";
  if (value.includes("payment")) return "payments";
  if (value.includes("user")) return "users";
  return "activity";
}

export function RecentActivityFeed({ items }: RecentActivityFeedProps) {
  return (
    <SectionCard
      title="Actividad reciente"
      description="Últimos eventos relevantes detectados en el ecosistema."
      action={<button type="button" className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 transition hover:text-indigo-500 dark:text-indigo-300"><span>Ver historial</span><AppIcon name="arrowUpRight" className="h-3 w-3" /></button>}
      contentClassName="p-0 sm:p-0"
    >
      {items.length === 0 ? (
        <div className="px-5 py-8 text-center text-xs text-slate-500 dark:text-slate-400">Aún no hay actividad reciente para mostrar.</div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-white/[0.06]">
          {items.map((item, index) => (
            <article key={item.id} className="group flex items-start gap-3 px-5 py-4 transition hover:bg-indigo-50/35 dark:hover:bg-indigo-500/[0.04] sm:px-6">
              <div className="relative">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-slate-200/80 bg-white text-indigo-600 shadow-sm dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-indigo-300">
                  <AppIcon name={resolveIcon(item.type)} className="h-4 w-4" />
                </span>
                {index < items.length - 1 ? <span className="absolute left-1/2 top-10 h-5 w-px -translate-x-1/2 bg-slate-200 dark:bg-white/[0.08]" /> : null}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-slate-900 dark:text-white">{item.title}</p>
                    <p className="mt-1 line-clamp-2 text-[11px] leading-5 text-slate-500 dark:text-slate-400">{item.description}</p>
                  </div>
                  <span className="shrink-0 whitespace-nowrap text-[10px] font-medium text-slate-400 dark:text-slate-500">{formatDateTime(item.occurredAt)}</span>
                </div>
              </div>
              <AppIcon name="chevronRight" className="mt-2 h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-indigo-500 dark:text-slate-700 dark:group-hover:text-indigo-300" />
            </article>
          ))}
        </div>
      )}
    </SectionCard>
  );
}
