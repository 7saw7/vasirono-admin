"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { backofficeNav } from "@/config/nav/backoffice-nav";
import { cn } from "@/lib/utils/cn";
import type { BackofficePermission } from "@/lib/auth/permissions";

type BackofficeSidebarProps = {
  canAccess: (permission: BackofficePermission) => boolean;
};

export function BackofficeSidebar({
  canAccess,
}: BackofficeSidebarProps) {
  const pathname = usePathname();

  const visibleItems = backofficeNav.filter((item) =>
    canAccess(item.permission)
  );

  return (
    <aside className="hidden w-72 shrink-0 border-r border-neutral-200 bg-white lg:flex lg:flex-col">
      <div className="border-b border-neutral-100 px-6 py-5">
        <Link href="/dashboard" className="block">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
            Vasirono
          </p>
          <h1 className="mt-1 text-xl font-semibold text-neutral-950">
            Backoffice
          </h1>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-4">
        <ul className="space-y-1.5">
          {visibleItems.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition",
                    active
                      ? "bg-neutral-950 text-white"
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
    </aside>
  );
}