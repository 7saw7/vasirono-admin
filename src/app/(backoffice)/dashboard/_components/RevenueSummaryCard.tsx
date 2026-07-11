import { SectionCard } from "@/components/ui/SectionCard";
import { AppIcon } from "@/components/ui/AppIcon";
import { formatCurrency } from "@/lib/utils/formatters";
import { formatNumber } from "@/lib/utils/numbers";
import type { RevenueSummary } from "@/features/backoffice/dashboard/types";

type RevenueSummaryCardProps = { data: RevenueSummary };

export function RevenueSummaryCard({ data }: RevenueSummaryCardProps) {
  const total = Math.max(1, data.paidCount + data.pendingCount + data.failedCount);
  const paidWidth = Math.round((data.paidCount / total) * 100);
  const pendingWidth = Math.round((data.pendingCount / total) * 100);
  const failedWidth = Math.max(0, 100 - paidWidth - pendingWidth);

  return (
    <SectionCard
      title="Rendimiento de pagos"
      description="Estado agregado de transacciones registradas."
      action={<span className="grid h-8 w-8 place-items-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300"><AppIcon name="wallet" className="h-4 w-4" /></span>}
    >
      <div className="rounded-2xl bg-[linear-gradient(145deg,#171c2c,#29224d)] p-5 text-white shadow-[0_18px_45px_rgba(58,45,120,0.25)] dark:bg-[linear-gradient(145deg,#151a29,#251e46)]">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-indigo-200/70">Monto total procesado</p>
        <p className="mt-3 text-3xl font-extrabold tracking-[-0.05em]">{formatCurrency(data.totalPayments)}</p>
        <div className="mt-5 flex h-2 overflow-hidden rounded-full bg-white/10">
          <span className="bg-emerald-400" style={{ width: `${paidWidth}%` }} />
          <span className="bg-amber-400" style={{ width: `${pendingWidth}%` }} />
          <span className="bg-rose-400" style={{ width: `${failedWidth}%` }} />
        </div>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-[9px] font-semibold text-white/60">
          <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Pagados {paidWidth}%</span>
          <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-amber-400" /> Pendientes {pendingWidth}%</span>
          <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-rose-400" /> Fallidos {failedWidth}%</span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2.5">
        <Metric label="Pagados" value={data.paidCount} tone="emerald" />
        <Metric label="Pendientes" value={data.pendingCount} tone="amber" />
        <Metric label="Fallidos" value={data.failedCount} tone="rose" />
      </div>
    </SectionCard>
  );
}

function Metric({ label, value, tone }: { label: string; value: number; tone: "emerald" | "amber" | "rose" }) {
  const dot = tone === "emerald" ? "bg-emerald-500" : tone === "amber" ? "bg-amber-500" : "bg-rose-500";
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-slate-50/55 p-3 dark:border-white/[0.065] dark:bg-white/[0.022]">
      <p className="flex items-center gap-1.5 text-[9px] font-semibold text-slate-500 dark:text-slate-400"><span className={`h-1.5 w-1.5 rounded-full ${dot}`} /> {label}</p>
      <p className="mt-2 text-lg font-extrabold tracking-[-0.035em] text-slate-950 dark:text-white">{formatNumber(value)}</p>
    </div>
  );
}
