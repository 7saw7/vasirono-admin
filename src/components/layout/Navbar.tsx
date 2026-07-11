"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandMark } from "@/components/ui/BrandMark";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { AppIcon } from "@/components/ui/AppIcon";
import { ROUTES } from "@/lib/constants/routes";

const backofficePrefixes = [
  "/dashboard", "/empresas", "/sucursales", "/claims", "/verificaciones",
  "/resenas", "/reseñas", "/reportes-resenas", "/reportes-reseñas", "/usuarios",
  "/analytics", "/taxonomias", "/planes", "/suscripciones", "/pagos",
  "/promociones", "/notificaciones", "/configuracion",
];

function isBackofficePath(pathname: string) {
  return backofficePrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function Navbar() {
  const pathname = usePathname();
  if (isBackofficePath(pathname)) return null;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur-2xl dark:border-white/[0.07] dark:bg-[#080b12]/80">
      <div className="mx-auto flex h-[72px] w-full max-w-[1440px] items-center justify-between gap-5 px-5 sm:px-8 lg:px-10">
        <Link href={ROUTES.HOME} className="rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30">
          <BrandMark />
        </Link>

        <nav className="flex items-center gap-1.5">
          <Link
            href={ROUTES.LOGIN}
            className="hidden rounded-xl px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/[0.05] dark:hover:text-white sm:inline-flex"
          >
            Acceder
          </Link>
          <Link
            href={ROUTES.RECOVER_PASSWORD}
            className="hidden rounded-xl px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/[0.05] dark:hover:text-white md:inline-flex"
          >
            Recuperar acceso
          </Link>
          <ThemeToggle />
          <Link
            href={ROUTES.LOGIN}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-[linear-gradient(135deg,#6d5dfc,#4f46e5)] px-4 text-xs font-bold text-white shadow-[0_9px_25px_rgba(79,70,229,0.3)] transition hover:-translate-y-0.5 hover:shadow-[0_13px_32px_rgba(79,70,229,0.38)]"
          >
            Abrir panel
            <AppIcon name="arrowUpRight" className="h-3.5 w-3.5" />
          </Link>
        </nav>
      </div>
    </header>
  );
}
