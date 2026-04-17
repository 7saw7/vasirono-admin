import { redirect } from "next/navigation";
import { RecoverPasswordView } from "./_components/RecoverPasswordView";
import { getCurrentUser } from "@/features/auth/service";
import { ROUTES } from "@/lib/constants/routes";

export const dynamic = "force-dynamic";

export default async function RecoverPasswordPage() {
  const session = await getCurrentUser();

  if (session.user) {
    redirect(ROUTES.BACKOFFICE_DASHBOARD);
  }

  return <RecoverPasswordView />;
}