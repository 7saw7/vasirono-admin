"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { BackofficeNavGroup, BackofficeNavItem } from "@/config/nav/backoffice-nav";
import { cn } from "@/lib/utils/cn";
import { AppIcon } from "@/components/ui/AppIcon";
import { BrandMark } from "@/components/ui/BrandMark";

const GROUP_ORDER: BackofficeNavGroup[] = [
  "Overview",
  "Operación",
  "Inteligencia",
  "Monetización",
  "Sistema",
];

type BackofficeSidebarProps = {
  items: BackofficeNavItem[];
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
};

type SidebarContentProps = {
  items: BackofficeNavItem[];
  pathname: string;
  onNavigate?: () => void;
  showCloseButton?: boolean;
};

function SidebarContent({ items, pathname, onNavigate, showCloseButton = false }: SidebarContentProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-[72px] items-center justify-between border-b border-slate-200/80 px-5 dark:border-white/[0.07]">
        <Link href="/dashboard" onClick={onNavigate} className="rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40">
          <BrandMark />
        </Link>
        {showCloseButton ? (
          <button
            type="button"
            onClick={onNavigate}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:text-slate-900 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400 dark:hover:text-white"
            aria-label="Cerrar menú"
          >
            <AppIcon name="close" className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      <div className="mx-4 mt-4 rounded-2xl border border-indigo-100 bg-[linear-gradient(145deg,rgba(99,102,241,0.1),rgba(34,211,238,0.06))] p-3.5 dark:border-indigo-400/15 dark:bg-[linear-gradient(145deg,rgba(99,102,241,0.15),rgba(34,211,238,0.04))]">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-white text-indigo-600 shadow-sm dark:bg-white/[0.08] dark:text-indigo-300">
            <AppIcon name="sparkles" className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs font-bold text-slate-900 dark:text-white">Vasirono Control</p>
            <p className="mt-0.5 truncate text-[10px] font-medium text-slate-500 dark:text-slate-400">Workspace principal</p>
          </div>
          <AppIcon name="chevronDown" className="ml-auto h-4 w-4 text-slate-400" />
        </div>
      </div>

      <nav className="mt-3 flex-1 overflow-y-auto px-3 pb-5 scrollbar-thin">
        {GROUP_ORDER.map((group) => {
          const groupItems = items.filter((item) => item.group === group);
          if (groupItems.length === 0) return null;

          return (
            <section key={group} className="mt-5 first:mt-2">
              <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-600">
                {group}
              </p>
              <ul className="space-y-1">
                {groupItems.map((item) => {
                  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onNavigate}
                        className={cn(
                          "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-semibold transition-all duration-200",
                          active
                            ? "bg-slate-950 text-white shadow-[0_8px_25px_rgba(15,23,42,0.14)] dark:bg-white/[0.09] dark:text-white dark:shadow-none"
                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-white/[0.045] dark:hover:text-white"
                        )}
                      >
                        <span className={cn(
                          "grid h-7 w-7 shrink-0 place-items-center rounded-lg transition",
                          active
                            ? "bg-white/12 text-indigo-200"
                            : "bg-slate-100/80 text-slate-500 group-hover:bg-white group-hover:text-indigo-600 dark:bg-white/[0.04] dark:text-slate-500 dark:group-hover:bg-white/[0.07] dark:group-hover:text-indigo-300"
                        )}>
                          <AppIcon name={item.icon} className="h-[15px] w-[15px]" />
                        </span>
                        <span className="truncate">{item.label}</span>
                        {active ? <span className="ml-auto h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.9)]" /> : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </nav>

      <div className="border-t border-slate-200/80 p-3 dark:border-white/[0.07]">
        <div className="rounded-2xl border border-slate-200/80 bg-slate-50 p-3 dark:border-white/[0.07] dark:bg-white/[0.025]">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_9px_rgba(52,211,153,0.65)]" />
            Sistemas operativos
          </div>
          <p className="mt-1 pl-4 text-[10px] text-slate-400 dark:text-slate-500">Todos los servicios responden</p>
        </div>
      </div>
    </div>
  );
}

export function BackofficeSidebar({ items, isMobileOpen = false, onMobileClose }: BackofficeSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[264px] border-r border-slate-200/80 bg-white/95 backdrop-blur-xl dark:border-white/[0.07] dark:bg-[#0b0f17]/95 lg:block">
        <SidebarContent items={items} pathname={pathname} />
      </aside>

      {isMobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
            aria-label="Cerrar menú del backoffice"
            onClick={onMobileClose}
          />
          <aside className="relative h-full w-[min(20rem,calc(100vw-2rem))] border-r border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#0b0f17]">
            <SidebarContent items={items} pathname={pathname} onNavigate={onMobileClose} showCloseButton />
          </aside>
        </div>
      ) : null}
    </>
  );
}
