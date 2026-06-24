import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { BackofficeShell } from "@/components/layout/BackofficeShell";
import { getBackofficeContext } from "@/lib/auth/backoffice-context";
import { ROUTES } from "@/lib/constants/routes";
import { backofficeNav } from "@/config/nav/backoffice-nav";

type BackofficeLayoutProps = {
  children: ReactNode;
};

export const dynamic = "force-dynamic";

export default async function BackofficeLayout({
  children,
}: BackofficeLayoutProps) {
  try {
    const context = await getBackofficeContext();

    const visibleNavItems = backofficeNav.filter(
      (item) => !item.isHidden && context.hasPermission(item.permission)
    );

    return (
      <BackofficeShell
        user={context.user}
        navItems={visibleNavItems}
      >
        {children}
      </BackofficeShell>
    );
  } catch {
    redirect(ROUTES.LOGIN);
  }
}