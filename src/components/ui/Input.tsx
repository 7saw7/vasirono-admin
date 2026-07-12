import * as React from "react";
import { cn } from "@/lib/utils/cn";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  hint?: string;
  leadingIcon?: React.ReactNode;
  trailingContent?: React.ReactNode;
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  function Input({ label, error, hint, className, id, leadingIcon, trailingContent, ...props }, ref) {
    const inputId = id ?? props.name;

    return (
      <div className="space-y-1.5">
        {label ? (
          <label htmlFor={inputId} className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            {label}
          </label>
        ) : null}

        <div className="relative">
          {leadingIcon ? (
            <span className="pointer-events-none absolute inset-y-0 left-0 flex w-11 items-center justify-center text-slate-400 dark:text-slate-500">
              {leadingIcon}
            </span>
          ) : null}

          <input
            ref={ref}
            id={inputId}
            className={cn(
              "h-11 w-full rounded-xl border border-slate-200/90 bg-white px-3 text-sm text-slate-900 shadow-[0_1px_2px_rgba(15,23,42,0.03)] outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/[0.09] dark:bg-white/[0.035] dark:text-white dark:placeholder:text-slate-600 dark:hover:border-white/15 dark:focus:border-indigo-400/60 dark:focus:ring-indigo-500/10",
              leadingIcon ? "pl-11" : undefined,
              trailingContent ? "pr-11" : undefined,
              error ? "border-rose-400 focus:border-rose-400 focus:ring-rose-500/10 dark:border-rose-400/70" : undefined,
              className
            )}
            {...props}
          />

          {trailingContent ? (
            <span className="absolute inset-y-0 right-0 flex w-11 items-center justify-center">
              {trailingContent}
            </span>
          ) : null}
        </div>

        {error ? (
          <p className="text-xs font-medium text-rose-600 dark:text-rose-300">{error}</p>
        ) : hint ? (
          <p className="text-xs text-slate-500 dark:text-slate-400">{hint}</p>
        ) : null}
      </div>
    );
  }
);
