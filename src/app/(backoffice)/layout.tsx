import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { BackofficeShell } from "@/components/layout/BackofficeShell";
import { getBackofficeContext } from "@/lib/auth/backoffice-context";
import { ROUTES } from "@/lib/constants/routes";

type BackofficeLayoutProps = {
  children: ReactNode;
};

export const dynamic = "force-dynamic";

export default async function BackofficeLayout({
  children,
}: BackofficeLayoutProps) {
  try {
    const context = await getBackofficeContext();

    return (
      <BackofficeShell
        user={context.user}
        canAccess={context.hasPermission}
      >
        {children}
      </BackofficeShell>
    );
  } catch {
    redirect(ROUTES.LOGIN);
  }
}