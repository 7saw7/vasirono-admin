"use client";

import { useEffect, useState } from "react";
import { AppIcon } from "./AppIcon";
import { cn } from "@/lib/utils/cn";

type ThemeToggleProps = {
  className?: string;
};

type Theme = "light" | "dark";

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
  window.localStorage.setItem("vasirono-theme", theme);
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem("vasirono-theme") as Theme | null;
    const resolved = stored ?? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setTheme(resolved);
    applyTheme(resolved);
    setMounted(true);
  }, []);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/80 bg-white/80 text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 hover:text-indigo-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:border-indigo-400/40 dark:hover:text-indigo-300",
        className
      )}
      aria-label={mounted && theme === "dark" ? "Activar tema claro" : "Activar tema oscuro"}
      title={mounted && theme === "dark" ? "Tema claro" : "Tema oscuro"}
    >
      <AppIcon name={mounted && theme === "dark" ? "sun" : "moon"} className="h-[18px] w-[18px]" />
    </button>
  );
}
