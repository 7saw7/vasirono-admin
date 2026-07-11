"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { BackofficeHeader } from "./BackofficeHeader";
import { BackofficeSidebar } from "./BackofficeSidebar";
import type { AuthUser } from "@/features/auth/types";
import type { BackofficeNavItem } from "@/config/nav/backoffice-nav";

type BackofficeShellProps = {
  user: AuthUser;
  navItems: BackofficeNavItem[];
  children: ReactNode;
};

export function BackofficeShell({ user, navItems, children }: BackofficeShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="bo-theme min-h-screen bg-[#f6f7fb] text-slate-950 transition-colors dark:bg-[#080b12] dark:text-slate-100">
      <div className="flex min-h-screen">
        <BackofficeSidebar
          items={navItems}
          isMobileOpen={isSidebarOpen}
          onMobileClose={() => setIsSidebarOpen(false)}
        />

        <div className="flex min-w-0 flex-1 flex-col lg:pl-[264px]">
          <BackofficeHeader
            user={user}
            items={navItems}
            onMenuClick={() => setIsSidebarOpen(true)}
          />

          <main className="relative flex-1 overflow-hidden px-4 py-5 sm:px-6 sm:py-6 xl:px-8 xl:py-7">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_20%_0%,rgba(124,58,237,0.09),transparent_42%),radial-gradient(circle_at_85%_5%,rgba(34,211,238,0.07),transparent_35%)] dark:bg-[radial-gradient(circle_at_20%_0%,rgba(124,58,237,0.14),transparent_42%),radial-gradient(circle_at_85%_5%,rgba(34,211,238,0.08),transparent_35%)]" />
            <div className="relative mx-auto w-full max-w-[1680px]">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
