import Link from "next/link";
import { GlobalKpiGrid } from "./GlobalKpiGrid";
import { PlatformHealthCard } from "./PlatformHealthCard";
import { VerificationQueueCard } from "./VerificationQueueCard";
import { ModerationQueueCard } from "./ModerationQueueCard";
import { ClaimsQueueCard } from "./ClaimsQueueCard";
import { RevenueSummaryCard } from "./RevenueSummaryCard";
import { RecentActivityFeed } from "./RecentActivityFeed";
import type { BackofficeDashboardData } from "@/features/backoffice/dashboard/types";
import { AppIcon } from "@/components/ui/AppIcon";
import { BACKOFFICE_ROUTES } from "@/lib/constants/backoffice-routes";

type BackofficeDashboardViewProps = { data: BackofficeDashboardData };

export function BackofficeDashboardView({ data }: BackofficeDashboardViewProps) {
  const dateLabel = new Intl.DateTimeFormat("es-PE", { day: "2-digit", month: "short", year: "numeric" }).format(new Date());

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-600 dark:text-indigo-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_9px_rgba(52,211,153,0.7)]" />
            Operación en tiempo real
          </div>
          <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.045em] text-slate-950 dark:text-white sm:text-[34px]">Centro de control</h1>
          <p className="mt-2 max-w-2xl text-xs leading-5 text-slate-500 dark:text-slate-400 sm:text-sm">
            Una vista consolidada de empresas, actividad, moderación, verificaciones e ingresos de la plataforma.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200/90 bg-white px-3.5 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-indigo-300 hover:text-indigo-600 dark:border-white/[0.09] dark:bg-white/[0.035] dark:text-slate-300 dark:hover:border-indigo-400/35 dark:hover:text-indigo-300">
            <AppIcon name="calendar" className="h-4 w-4" /> {dateLabel}
          </button>
          <button type="button" className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200/90 bg-white px-3.5 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-indigo-300 hover:text-indigo-600 dark:border-white/[0.09] dark:bg-white/[0.035] dark:text-slate-300 dark:hover:border-indigo-400/35 dark:hover:text-indigo-300">
            <AppIcon name="filter" className="h-4 w-4" /> Filtros
          </button>
          <Link href={BACKOFFICE_ROUTES.analytics} className="inline-flex h-10 items-center gap-2 rounded-xl bg-[linear-gradient(135deg,#6d5dfc,#4f46e5)] px-4 text-xs font-bold text-white shadow-[0_9px_24px_rgba(79,70,229,0.25)] transition hover:-translate-y-0.5 hover:shadow-[0_13px_30px_rgba(79,70,229,0.34)]">
            Ver analytics <AppIcon name="arrowUpRight" className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <GlobalKpiGrid kpis={data.kpis} />

      <div className="grid gap-5 xl:grid-cols-[1.32fr_0.88fr]">
        <PlatformHealthCard items={data.platformHealth} />
        <RevenueSummaryCard data={data.revenueSummary} />
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">Flujos críticos</p>
            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Carga actual de las colas operativas.</p>
          </div>
          <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-slate-500">Live</span>
        </div>
        <div className="grid gap-5 xl:grid-cols-3">
          <VerificationQueueCard data={data.verificationQueue} />
          <ModerationQueueCard data={data.moderationQueue} />
          <ClaimsQueueCard data={data.claimsQueue} />
        </div>
      </div>

      <RecentActivityFeed items={data.recentActivity} />
    </div>
  );
}
