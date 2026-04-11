import { requireBackofficeUser } from "./guards";
import {
  hasPermission,
  type BackofficePermission,
} from "./permissions";

export async function getBackofficeContext(
  requiredPermission?: BackofficePermission
) {
  const session = await requireBackofficeUser();

  if (
    requiredPermission &&
    !hasPermission(session.user.role, requiredPermission)
  ) {
    const error = new Error(`Forbidden: missing permission ${requiredPermission}`);
    Object.assign(error, { status: 403 });
    throw error;
  }

  return {
    user: session.user,
    sessionId: session.sessionId,
    hasPermission: (permission: BackofficePermission) =>
      hasPermission(session.user.role, permission),
  };
}