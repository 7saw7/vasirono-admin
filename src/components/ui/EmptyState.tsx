import { Button } from "./Button";
import { AppIcon } from "./AppIcon";

type EmptyStateProps = {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="rounded-[22px] border border-dashed border-slate-300 bg-slate-50/60 p-9 text-center dark:border-white/10 dark:bg-white/[0.02]">
      <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
        <AppIcon name="search" className="h-5 w-5" />
      </span>
      <div className="mx-auto mt-4 max-w-md space-y-2">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">{title}</h3>
        {description ? <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">{description}</p> : null}
        {actionLabel && onAction ? <div className="pt-3"><Button type="button" onClick={onAction}>{actionLabel}</Button></div> : null}
      </div>
    </div>
  );
}
