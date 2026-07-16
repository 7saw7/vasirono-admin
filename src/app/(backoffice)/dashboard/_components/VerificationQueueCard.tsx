import { AppIcon } from "@/components/ui/AppIcon";
import { formatNumber } from "@/lib/utils/numbers";
import type { QueueMetric } from "@/features/backoffice/dashboard/types";

type Props = { data: QueueMetric };

export function VerificationQueueCard({ data }: Props) {
  return <QueueCard title="Verificaciones" description="Validación de identidad empresarial" data={data} />;
}

function QueueCard({ title, description, data }: { title: string; description: string; data: QueueMetric }) {
  if (!data.available) return <Unavailable title={title} description={description} reason={data.unavailableReason} />;
  const pendingRate = data.total > 0 ? Math.min(100, Math.round((data.pending / data.total) * 100)) : 0;
  return (
    <article className="overflow-hidden rounded-[22px] border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.045)] dark:border-white/[0.075] dark:bg-[#101620]">
      <div className="h-1 bg-[linear-gradient(90deg,#6d5dfc,#22d3ee)]" />
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-[14px] bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300"><AppIcon name="shield" className="h-[18px] w-[18px]" /></span><div><h3 className="text-sm font-bold text-slate-900 dark:text-white">{title}</h3><p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">{description}</p></div></div>
          <p className="text-2xl font-extrabold tracking-[-0.05em] text-slate-950 dark:text-white">{formatNumber(data.total)}</p>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-2"><MiniMetric label="Pendientes" value={data.pending} /><MiniMetric label="En revisión" value={data.inReview} /><MiniMetric label="Aprobadas" value={data.approved ?? 0} /></div>
        <div className="mt-5 flex items-center justify-between text-[10px] font-semibold text-slate-400"><span>Carga pendiente</span><span>{pendingRate}%</span></div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-white/[0.07]"><div className="h-full rounded-full bg-[linear-gradient(90deg,#6d5dfc,#22d3ee)]" style={{ width: `${pendingRate}%` }} /></div>
      </div>
    </article>
  );
}

function Unavailable({ title, description, reason }: { title: string; description: string; reason?: string }) {
  return <article className="rounded-[22px] border border-dashed border-slate-300 bg-white p-5 dark:border-white/[0.12] dark:bg-[#101620]"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-[14px] bg-slate-100 text-slate-500 dark:bg-white/[0.06]"><AppIcon name="shield" className="h-[18px] w-[18px]" /></span><div><h3 className="text-sm font-bold text-slate-900 dark:text-white">{title}</h3><p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">{description}</p></div></div><p className="mt-5 text-xs font-semibold text-amber-600 dark:text-amber-300">Datos no disponibles</p><p className="mt-1 line-clamp-2 text-[10px] text-slate-500 dark:text-slate-400">{reason ?? "No se pudo consultar el servicio."}</p></article>;
}

function MiniMetric({ label, value }: { label: string; value: number }) {
  return <div className="rounded-xl bg-slate-50 p-2.5 dark:bg-white/[0.025]"><p className="truncate text-[8px] font-bold uppercase tracking-[0.08em] text-slate-400">{label}</p><p className="mt-1.5 text-sm font-extrabold text-slate-900 dark:text-white">{formatNumber(value)}</p></div>;
}
