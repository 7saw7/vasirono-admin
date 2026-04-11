import { redirect } from "next/navigation";
import { LoginView } from "./_components/LoginView";
import { getCurrentUser } from "@/features/auth/service";
import { ROUTES } from "@/lib/constants/routes";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const session = await getCurrentUser();

  if (session.user) {
    redirect(ROUTES.BACKOFFICE_DASHBOARD);
  }

  return <LoginView />;
}