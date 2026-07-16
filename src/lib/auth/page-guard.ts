import { redirect } from "next/navigation";
import { getBackofficeContext } from "./backoffice-context";
import type { BackofficePermission } from "./permissions";
import { ROUTES } from "@/lib/constants/routes";

function getStatus(error: unknown): number | undefined {
  if (
    error &&
    typeof error === "object" &&
    "status" in error &&
    typeof (error as { status?: unknown }).status === "number"
  ) {
    return (error as { status: number }).status;
  }

  return undefined;
}

export async function requireBackofficePage(
  permission: BackofficePermission
) {
  try {
    return await getBackofficeContext(permission);
  } catch (error) {
    const status = getStatus(error);

    if (status === 401) {
      redirect(ROUTES.LOGIN);
    }

    if (status === 403) {
      redirect(`/forbidden?permission=${encodeURIComponent(permission)}`);
    }

    throw error;
  }
}
