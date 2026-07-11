import { AppIcon } from "@/components/ui/AppIcon";
import { formatNumber } from "@/lib/utils/numbers";
import type { QueueMetric } from "@/features/backoffice/dashboard/types";

type Props = { data: QueueMetric };

export function ClaimsQueueCard({ data }: Props) {
  const pendingRate = data.total > 0 ? Math.min(100, Math.round((data.pending / data.total) * 100)) : 0;
  return (
    <article className="overflow-hidden rounded-[22px] border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.045)] dark:border-white/[0.075] dark:bg-[#101620]">
      <div className="h-1 bg-[linear-gradient(90deg,#22c55e,#22d3ee)]" />
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-[14px] bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300"><AppIcon name="claims" className="h-[18px] w-[18px]" /></span><div><h3 className="text-sm font-bold text-slate-900 dark:text-white">Reclamos</h3><p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">Propiedad y control empresarial</p></div></div>
          <p className="text-2xl font-extrabold tracking-[-0.05em] text-slate-950 dark:text-white">{formatNumber(data.total)}</p>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-2"><MiniMetric label="Pendientes" value={data.pending} /><MiniMetric label="En revisión" value={data.inReview} /><MiniMetric label="Aprobadas" value={data.approved ?? 0} /></div>
        <div className="mt-5 flex items-center justify-between text-[10px] font-semibold text-slate-400"><span>Carga pendiente</span><span>{pendingRate}%</span></div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-white/[0.07]"><div className="h-full rounded-full bg-[linear-gradient(90deg,#22c55e,#22d3ee)]" style={{ width: `${pendingRate}%` }} /></div>
      </div>
    </article>
  );
}
function MiniMetric({ label, value }: { label: string; value: number }) { return <div className="rounded-xl bg-slate-50 p-2.5 dark:bg-white/[0.025]"><p className="truncate text-[8px] font-bold uppercase tracking-[0.08em] text-slate-400">{label}</p><p className="mt-1.5 text-sm font-extrabold text-slate-900 dark:text-white">{formatNumber(value)}</p></div>; }
