"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AuthUser } from "@/features/auth/types";
import { ROUTES } from "@/lib/constants/routes";

type BackofficeHeaderProps = {
  user: AuthUser;
  onMenuClick?: () => void;
};

function formatRoleLabel(role: AuthUser["role"]) {
  return role
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function BackofficeHeader({ user, onMenuClick }: BackofficeHeaderProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    if (isLoggingOut) return;

    try {
      setIsLoggingOut(true);

      const response = await fetch(ROUTES.API_LOGOUT, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("No se pudo cerrar la sesión.");
      }

      router.replace(ROUTES.LOGIN);
      router.refresh();
    } catch {
      setIsLoggingOut(false);
      window.alert("No se pudo cerrar la sesión. Intenta nuevamente.");
    }
  }

  return (
    <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/95 backdrop-blur">
      <div className="flex min-h-16 items-center justify-between gap-3 px-4 sm:px-5 md:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-neutral-200 text-neutral-700 transition hover:border-neutral-300 hover:bg-neutral-50 hover:text-neutral-950 lg:hidden"
            aria-label="Abrir menú del backoffice"
          >
            <span className="sr-only">Abrir menú</span>
            <span className="flex flex-col gap-1.5" aria-hidden="true">
              <span className="block h-0.5 w-5 rounded-full bg-current" />
              <span className="block h-0.5 w-5 rounded-full bg-current" />
              <span className="block h-0.5 w-5 rounded-full bg-current" />
            </span>
          </button>

          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-400 sm:text-xs">
              Panel interno
            </p>
            <p className="truncate text-sm font-medium text-neutral-900">
              Operación de catálogo y moderación
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <div className="hidden text-right md:block">
            <p className="text-sm font-semibold text-neutral-950">{user.name}</p>
            <p className="max-w-[18rem] truncate text-xs text-neutral-500">
              {formatRoleLabel(user.role)} · {user.email}
            </p>
          </div>

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-950 text-sm font-semibold text-white">
            {user.name.slice(0, 1).toUpperCase()}
          </div>

          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="rounded-xl border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-700 transition hover:border-neutral-300 hover:bg-neutral-50 hover:text-neutral-950 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoggingOut ? "Saliendo..." : "Salir"}
          </button>
        </div>
      </div>
    </header>
  );
}
