import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { AppIcon, type IconName } from "./AppIcon";

type StatCardTone = "indigo" | "cyan" | "fuchsia" | "emerald";

type StatCardProps = {
  title: string;
  value: ReactNode;
  subtitle?: string;
  action?: ReactNode;
  icon?: IconName;
  tone?: StatCardTone;
  eyebrow?: string;
};

const tones: Record<StatCardTone, { icon: string; glow: string; line: string }> = {
  indigo: { icon: "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300", glow: "from-indigo-500/12", line: "bg-indigo-500" },
  cyan: { icon: "bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-300", glow: "from-cyan-500/12", line: "bg-cyan-500" },
  fuchsia: { icon: "bg-fuchsia-50 text-fuchsia-600 dark:bg-fuchsia-500/10 dark:text-fuchsia-300", glow: "from-fuchsia-500/12", line: "bg-fuchsia-500" },
  emerald: { icon: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300", glow: "from-emerald-500/12", line: "bg-emerald-500" },
};

export function StatCard({ title, value, subtitle, action, icon = "activity", tone = "indigo", eyebrow = "En vivo" }: StatCardProps) {
  const palette = tones[tone];
  return (
    <section className="group relative overflow-hidden rounded-[22px] border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.045)] transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-[0_16px_42px_rgba(79,70,229,0.1)] dark:border-white/[0.075] dark:bg-[#101620] dark:hover:border-indigo-400/20 dark:hover:shadow-[0_18px_50px_rgba(0,0,0,0.28)]">
      <div className={cn("pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b to-transparent opacity-60", palette.glow)} />
      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="truncate text-xs font-semibold text-slate-500 dark:text-slate-400">{title}</p>
            <span className="inline-flex items-center gap-1 rounded-full border border-slate-200/70 bg-slate-50 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-[0.08em] text-slate-400 dark:border-white/[0.07] dark:bg-white/[0.025] dark:text-slate-500">
              <span className={cn("h-1 w-1 rounded-full", palette.line)} /> {eyebrow}
            </span>
          </div>
          <div className="mt-4 text-[30px] font-extrabold leading-none tracking-[-0.05em] text-slate-950 dark:text-white">{value}</div>
          {subtitle ? <p className="mt-3 line-clamp-2 text-[11px] leading-5 text-slate-500 dark:text-slate-400">{subtitle}</p> : null}
        </div>
        <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-[14px] transition-transform duration-200 group-hover:scale-105", palette.icon)}>
          <AppIcon name={icon} className="h-[18px] w-[18px]" />
        </span>
        {action ? <div>{action}</div> : null}
      </div>
      <div className="relative mt-4 flex h-6 items-end gap-1 opacity-65" aria-hidden="true">
        {[36, 52, 41, 68, 59, 78, 70, 92, 84, 100].map((height, index) => (
          <span key={index} className={cn("flex-1 rounded-t-[3px] opacity-20", palette.line)} style={{ height: `${height}%` }} />
        ))}
      </div>
    </section>
  );
}
