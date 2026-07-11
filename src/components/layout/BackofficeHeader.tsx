"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { AuthUser } from "@/features/auth/types";
import type { BackofficeNavItem } from "@/config/nav/backoffice-nav";
import { ROUTES } from "@/lib/constants/routes";
import { AppIcon } from "@/components/ui/AppIcon";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

type BackofficeHeaderProps = {
  user: AuthUser;
  items: BackofficeNavItem[];
  onMenuClick?: () => void;
};

function formatRoleLabel(role: AuthUser["role"]) {
  return role
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function BackofficeHeader({ user, items, onMenuClick }: BackofficeHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const currentItem = useMemo(
    () => items.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`)),
    [items, pathname]
  );

  async function handleLogout() {
    if (isLoggingOut) return;

    try {
      setIsLoggingOut(true);
      const response = await fetch(ROUTES.API_LOGOUT, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });

      if (!response.ok) throw new Error("No se pudo cerrar la sesión.");
      router.replace(ROUTES.LOGIN);
      router.refresh();
    } catch {
      setIsLoggingOut(false);
      window.alert("No se pudo cerrar la sesión. Intenta nuevamente.");
    }
  }

  return (
    <header className="sticky top-0 z-30 h-[72px] border-b border-slate-200/80 bg-white/80 backdrop-blur-2xl dark:border-white/[0.07] dark:bg-[#080b12]/80">
      <div className="flex h-full items-center justify-between gap-3 px-4 sm:px-6 xl:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-indigo-300 hover:text-indigo-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 lg:hidden"
            aria-label="Abrir menú del backoffice"
          >
            <AppIcon name="menu" className="h-[18px] w-[18px]" />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400 dark:text-slate-500">
              <span>Vasirono</span>
              <AppIcon name="chevronRight" className="h-3 w-3" />
              <span className="truncate">{currentItem?.group ?? "Backoffice"}</span>
            </div>
            <p className="mt-0.5 truncate text-[15px] font-bold tracking-[-0.02em] text-slate-950 dark:text-white">
              {currentItem?.label ?? "Panel administrativo"}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <div
            className="hidden h-10 min-w-[220px] items-center gap-2 rounded-xl border border-slate-200/90 bg-slate-50/80 px-3 text-left text-xs font-medium text-slate-400 dark:border-white/[0.08] dark:bg-white/[0.025] dark:text-slate-500 xl:flex"
            aria-hidden="true"
          >
            <AppIcon name="search" className="h-4 w-4" />
            <span className="flex-1">Buscar en Vasirono...</span>
            <span className="rounded-md border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-[10px] text-slate-400 dark:border-white/10 dark:bg-white/[0.04]">⌘ K</span>
          </div>

          <button
            type="button"
            onClick={() => router.push(ROUTES.BACKOFFICE_COMPANIES)}
            className="hidden h-10 items-center gap-2 rounded-xl bg-[linear-gradient(135deg,#6d5dfc,#4f46e5)] px-3.5 text-xs font-bold text-white shadow-[0_8px_22px_rgba(79,70,229,0.28)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(79,70,229,0.36)] sm:inline-flex"
          >
            <AppIcon name="plus" className="h-4 w-4" />
            Ver empresas
          </button>

          <button
            type="button"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/80 bg-white/80 text-slate-500 shadow-sm transition hover:border-indigo-300 hover:text-indigo-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400 dark:hover:text-indigo-300"
            aria-label="Notificaciones"
          >
            <AppIcon name="notifications" className="h-[18px] w-[18px]" />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-fuchsia-500 ring-2 ring-white dark:ring-[#111722]" />
          </button>

          <ThemeToggle />

          <div className="relative">
            <button
              type="button"
              onClick={() => setProfileOpen((open) => !open)}
              className="flex h-10 items-center gap-2 rounded-xl border border-slate-200/80 bg-white/80 pl-1.5 pr-2.5 text-left shadow-sm transition hover:border-slate-300 dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-white/15"
              aria-expanded={profileOpen}
            >
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-[linear-gradient(145deg,#111827,#4f46e5)] text-[11px] font-bold text-white">
                {user.name.slice(0, 1).toUpperCase()}
              </span>
              <span className="hidden max-w-[120px] sm:block">
                <span className="block truncate text-[11px] font-bold text-slate-900 dark:text-white">{user.name}</span>
                <span className="block truncate text-[9px] font-medium text-slate-400">{formatRoleLabel(user.role)}</span>
              </span>
              <AppIcon name="chevronDown" className="hidden h-3.5 w-3.5 text-slate-400 sm:block" />
            </button>

            {profileOpen ? (
              <div className="absolute right-0 mt-2 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_18px_60px_rgba(15,23,42,0.18)] dark:border-white/10 dark:bg-[#111722] dark:shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
                <div className="rounded-xl bg-slate-50 p-3 dark:bg-white/[0.04]">
                  <p className="truncate text-xs font-bold text-slate-900 dark:text-white">{user.name}</p>
                  <p className="mt-1 truncate text-[11px] text-slate-500 dark:text-slate-400">{user.email}</p>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-rose-50 hover:text-rose-600 disabled:opacity-60 dark:text-slate-300 dark:hover:bg-rose-500/10 dark:hover:text-rose-300"
                >
                  <AppIcon name="logout" className="h-4 w-4" />
                  {isLoggingOut ? "Cerrando sesión..." : "Cerrar sesión"}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
