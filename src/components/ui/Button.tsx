import * as React from "react";
import { cn } from "@/lib/utils/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-[linear-gradient(135deg,#6d5dfc,#4f46e5)] text-white shadow-[0_9px_24px_rgba(79,70,229,0.24)] hover:-translate-y-0.5 hover:shadow-[0_13px_30px_rgba(79,70,229,0.34)] disabled:translate-y-0 disabled:opacity-55 disabled:shadow-none",
  secondary: "border border-slate-200 bg-white text-slate-700 shadow-sm hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-950 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:border-white/15 dark:hover:bg-white/[0.065] dark:hover:text-white",
  ghost: "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-white/[0.05] dark:hover:text-white",
  danger: "bg-rose-600 text-white shadow-[0_8px_20px_rgba(225,29,72,0.2)] hover:-translate-y-0.5 hover:bg-rose-500 disabled:opacity-55",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-xs",
  md: "h-10 px-4 text-xs",
  lg: "h-11 px-5 text-sm",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button({ className, children, variant = "primary", size = "md", loading = false, disabled, ...props }, ref) {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-xl font-bold transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/15 disabled:cursor-not-allowed",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
            Procesando...
          </>
        ) : children}
      </button>
    );
  }
);
