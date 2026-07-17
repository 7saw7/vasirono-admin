import type { PromotionStatus } from "@/features/backoffice/promotions/types";

const STATUS_META: Record<PromotionStatus, { label: string; className: string }> = {
  draft: {
    label: "Borrador",
    className: "bg-slate-100 text-slate-700 ring-slate-200 dark:bg-white/[0.06] dark:text-slate-300 dark:ring-white/10",
  },
  pending_review: {
    label: "Pendiente",
    className: "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/20",
  },
  approved: {
    label: "Aprobada",
    className: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-400/20",
  },
  paused: {
    label: "Pausada",
    className: "bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-400/10 dark:text-blue-300 dark:ring-blue-400/20",
  },
  rejected: {
    label: "Rechazada",
    className: "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-400/10 dark:text-rose-300 dark:ring-rose-400/20",
  },
  expired: {
    label: "Vencida",
    className: "bg-orange-50 text-orange-700 ring-orange-200 dark:bg-orange-400/10 dark:text-orange-300 dark:ring-orange-400/20",
  },
  deleted: {
    label: "Eliminada",
    className: "bg-neutral-100 text-neutral-600 ring-neutral-200 dark:bg-white/[0.04] dark:text-slate-500 dark:ring-white/10",
  },
};

export function PromotionStatusBadge({ status }: { status: PromotionStatus }) {
  const meta = STATUS_META[status] ?? STATUS_META.draft;
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${meta.className}`}>
      {meta.label}
    </span>
  );
}
