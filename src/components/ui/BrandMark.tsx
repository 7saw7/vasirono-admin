import { cn } from "@/lib/utils/cn";

type BrandMarkProps = {
  className?: string;
  compact?: boolean;
};

export function BrandMark({ className, compact = false }: BrandMarkProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span className="relative grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-[13px] bg-[linear-gradient(145deg,#7c3aed_0%,#5b5cf0_48%,#22d3ee_100%)] shadow-[0_10px_30px_rgba(99,102,241,0.3)]">
        <span className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-white/35 blur-sm" />
        <span className="relative h-4 w-4 rotate-45 rounded-[4px] border-2 border-white/90" />
      </span>
      {!compact ? (
        <span className="min-w-0">
          <span className="block truncate text-[15px] font-bold tracking-[-0.02em] text-slate-950 dark:text-white">
            Vasirono
          </span>
          <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
            Intelligence
          </span>
        </span>
      ) : null}
    </div>
  );
}
