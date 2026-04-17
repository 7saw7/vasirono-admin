import { redirect } from "next/navigation";
import { getCurrentSessionUser } from "@/lib/auth/session";
import { isBackofficeRole } from "@/lib/constants/roles";
import { ROUTES } from "@/lib/constants/routes";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await getCurrentSessionUser();

  if (!session.user) {
    redirect(ROUTES.LOGIN);
  }

  if (!isBackofficeRole(session.user.role)) {
    redirect(ROUTES.LOGIN);
  }

  redirect(ROUTES.BACKOFFICE_ROOT);
}