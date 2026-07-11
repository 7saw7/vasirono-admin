import * as React from "react";
import { cn } from "@/lib/utils/cn";

export type SelectOption = { label: string; value: string | number };

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string;
  hint?: string;
  options: SelectOption[];
  placeholder?: string;
};

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  function Select({ label, error, hint, className, id, options, placeholder, ...props }, ref) {
    const selectId = id ?? props.name;
    return (
      <div className="space-y-1.5">
        {label ? <label htmlFor={selectId} className="block text-xs font-bold text-slate-700 dark:text-slate-300">{label}</label> : null}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            "h-11 w-full rounded-xl border border-slate-200/90 bg-white px-3 text-sm text-slate-900 shadow-[0_1px_2px_rgba(15,23,42,0.03)] outline-none transition hover:border-slate-300 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/[0.09] dark:bg-white/[0.035] dark:text-white dark:hover:border-white/15 dark:focus:border-indigo-400/60",
            error && "border-rose-400 focus:border-rose-400 focus:ring-rose-500/10",
            className
          )}
          {...props}
        >
          {placeholder ? <option value="">{placeholder}</option> : null}
          {options.map((option) => <option key={String(option.value)} value={option.value}>{option.label}</option>)}
        </select>
        {error ? <p className="text-xs font-medium text-rose-600 dark:text-rose-300">{error}</p> : hint ? <p className="text-xs text-slate-500 dark:text-slate-400">{hint}</p> : null}
      </div>
    );
  }
);
