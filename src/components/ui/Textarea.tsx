import * as React from "react";
import { cn } from "@/lib/utils/cn";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
  hint?: string;
};

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ label, error, hint, className, id, ...props }, ref) {
    const textareaId = id ?? props.name;
    return (
      <div className="space-y-1.5">
        {label ? <label htmlFor={textareaId} className="block text-xs font-bold text-slate-700 dark:text-slate-300">{label}</label> : null}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            "min-h-[120px] w-full rounded-xl border border-slate-200/90 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-[0_1px_2px_rgba(15,23,42,0.03)] outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/[0.09] dark:bg-white/[0.035] dark:text-white dark:placeholder:text-slate-600 dark:hover:border-white/15 dark:focus:border-indigo-400/60",
            error && "border-rose-400 focus:border-rose-400 focus:ring-rose-500/10",
            className
          )}
          {...props}
        />
        {error ? <p className="text-xs font-medium text-rose-600 dark:text-rose-300">{error}</p> : hint ? <p className="text-xs text-slate-500 dark:text-slate-400">{hint}</p> : null}
      </div>
    );
  }
);
