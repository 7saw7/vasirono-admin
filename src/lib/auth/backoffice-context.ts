import { requireBackofficeUser } from "./guards";
import {
  userHasPermission,
  type BackofficePermission,
} from "./permissions";

export class BackofficeAccessError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: string,
    public readonly permission?: BackofficePermission
  ) {
    super(message);
    this.name = "BackofficeAccessError";
  }
}

export async function getBackofficeContext(
  requiredPermission?: BackofficePermission
) {
  const session = await requireBackofficeUser();

  if (
    requiredPermission &&
    !userHasPermission(session.user, requiredPermission)
  ) {
    throw new BackofficeAccessError(
      `Forbidden: missing permission ${requiredPermission}`,
      403,
      "BACKOFFICE_PERMISSION_DENIED",
      requiredPermission
    );
  }

  return {
    user: session.user,
    sessionId: session.sessionId,
    hasPermission: (permission: BackofficePermission) =>
      userHasPermission(session.user, permission),
  };
}
