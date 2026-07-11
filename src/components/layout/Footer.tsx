"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandMark } from "@/components/ui/BrandMark";
import { siteConfig } from "@/config/site";
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

export function Footer() {
  const pathname = usePathname();
  const year = new Date().getFullYear();
  if (isBackofficePath(pathname)) return null;

  return (
    <footer className="border-t border-slate-200/70 bg-white dark:border-white/[0.07] dark:bg-[#080b12]">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-5 px-5 py-7 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-10">
        <div className="flex items-center gap-4">
          <BrandMark />
          <span className="hidden h-8 w-px bg-slate-200 dark:bg-white/10 sm:block" />
          <p className="max-w-md text-xs leading-5 text-slate-500 dark:text-slate-400">
            Centro de control interno para operar, moderar y supervisar el ecosistema Vasirono.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-slate-500 dark:text-slate-400">
          <span>© {year} {siteConfig.creator}</span>
          <Link href={ROUTES.LOGIN} className="transition hover:text-indigo-600 dark:hover:text-indigo-300">Acceder</Link>
          <Link href={ROUTES.RECOVER_PASSWORD} className="transition hover:text-indigo-600 dark:hover:text-indigo-300">Soporte de acceso</Link>
        </div>
      </div>
    </footer>
  );
}
