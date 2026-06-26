"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { BackofficeNavItem } from "@/config/nav/backoffice-nav";
import { cn } from "@/lib/utils/cn";

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

function SidebarContent({
  items,
  pathname,
  onNavigate,
  showCloseButton = false,
}: SidebarContentProps) {
  return (
    <>
      <div className="border-b border-neutral-100 px-6 py-5">
        <div className="flex items-start justify-between gap-4">
          <Link href="/dashboard" className="block min-w-0" onClick={onNavigate}>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
              Vasirono
            </p>
            <h1 className="mt-1 truncate text-xl font-semibold text-neutral-950">
              Backoffice
            </h1>
          </Link>

          {showCloseButton ? (
            <button
              type="button"
              onClick={onNavigate}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-neutral-200 text-xl leading-none text-neutral-600 transition hover:border-neutral-300 hover:bg-neutral-50 hover:text-neutral-950"
              aria-label="Cerrar menú"
            >
              ×
            </button>
          ) : null}
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-4">
        <ul className="space-y-1.5">
          {items.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition",
                    active
                      ? "bg-neutral-950 text-white shadow-sm"
                      : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950"
                  )}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}

export function BackofficeSidebar({
  items,
  isMobileOpen = false,
  onMobileClose,
}: BackofficeSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      <aside className="hidden w-72 shrink-0 border-r border-neutral-200 bg-white lg:flex lg:flex-col">
        <SidebarContent items={items} pathname={pathname} />
      </aside>

      {isMobileOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            className="absolute inset-0 bg-neutral-950/45 backdrop-blur-[2px]"
            aria-label="Cerrar menú del backoffice"
            onClick={onMobileClose}
          />

          <aside className="relative flex h-full w-[min(20rem,calc(100vw-2rem))] flex-col border-r border-neutral-200 bg-white shadow-2xl">
            <SidebarContent
              items={items}
              pathname={pathname}
              onNavigate={onMobileClose}
              showCloseButton
            />
          </aside>
        </div>
      ) : null}
    </>
  );
}
