import type { ReactNode } from "react";
import { BackofficeHeader } from "./BackofficeHeader";
import { BackofficeSidebar } from "./BackofficeSidebar";
import type { AuthUser } from "@/features/auth/types";
import type { BackofficeNavItem } from "@/config/nav/backoffice-nav";

type BackofficeShellProps = {
  user: AuthUser;
  navItems: BackofficeNavItem[];
  children: ReactNode;
};

export function BackofficeShell({
  user,
  navItems,
  children,
}: BackofficeShellProps) {
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-950">
      <div className="flex min-h-screen">
        <BackofficeSidebar items={navItems} />

        <div className="flex min-w-0 flex-1 flex-col">
          <BackofficeHeader user={user} />

          <main className="flex-1 px-4 py-6 md:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}