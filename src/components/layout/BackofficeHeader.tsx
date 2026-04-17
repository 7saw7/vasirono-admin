"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AuthUser } from "@/features/auth/types";
import { ROUTES } from "@/lib/constants/routes";

type BackofficeHeaderProps = {
  user: AuthUser;
};

function formatRoleLabel(role: AuthUser["role"]) {
  return role
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function BackofficeHeader({ user }: BackofficeHeaderProps) {
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
    <header className="sticky top-0 z-20 border-b border-neutral-200 bg-white/95 backdrop-blur">
      <div className="flex min-h-16 items-center justify-between gap-4 px-4 md:px-6 lg:px-8">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
            Panel interno
          </p>
          <p className="truncate text-sm font-medium text-neutral-900">
            Operación de catálogo y moderación
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-neutral-950">{user.name}</p>
            <p className="text-xs text-neutral-500">
              {formatRoleLabel(user.role)} · {user.email}
            </p>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-950 text-sm font-semibold text-white">
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