import { cn } from "@/lib/utils/cn";
import type { StatusTone } from "@/features/backoffice/shared/types";

type StatusBadgeProps = { label: string; tone?: StatusTone };

const toneClasses: Record<StatusTone, string> = {
  neutral: "border-slate-200 bg-slate-50 text-slate-600 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-300",
  info: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-400/20 dark:bg-blue-500/10 dark:text-blue-300",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-300",
  warning: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-400/20 dark:bg-amber-500/10 dark:text-amber-300",
  danger: "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-400/20 dark:bg-rose-500/10 dark:text-rose-300",
};

const dotClasses: Record<StatusTone, string> = {
  neutral: "bg-slate-400", info: "bg-blue-500", success: "bg-emerald-500", warning: "bg-amber-500", danger: "bg-rose-500",
};

export function StatusBadge({ label, tone = "neutral" }: StatusBadgeProps) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold", toneClasses[tone])}>
      <span className={cn("h-1.5 w-1.5 rounded-full", dotClasses[tone])} />
      {label}
    </span>
  );
}
