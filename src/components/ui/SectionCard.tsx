import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type SectionCardProps = {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  action?: ReactNode;
};

export function SectionCard({ title, description, children, className, contentClassName, action }: SectionCardProps) {
  return (
    <section className={cn(
      "overflow-hidden rounded-[22px] border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.045)] transition-colors dark:border-white/[0.075] dark:bg-[#101620] dark:shadow-[0_12px_38px_rgba(0,0,0,0.16)]",
      className
    )}>
      {title || description || action ? (
        <header className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 dark:border-white/[0.065] sm:px-6">
          <div className="min-w-0">
            {title ? <h2 className="text-sm font-bold tracking-[-0.015em] text-slate-900 dark:text-white">{title}</h2> : null}
            {description ? <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">{description}</p> : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </header>
      ) : null}
      <div className={cn("p-5 sm:p-6", contentClassName)}>{children}</div>
    </section>
  );
}
