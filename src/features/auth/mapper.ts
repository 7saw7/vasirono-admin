import type { AuthUser } from "./types";
import { normalizeRoleName } from "@/lib/constants/roles";

/**
 * Legacy compatibility mapper.
 *
 * It intentionally does not derive permissions from a role. Any caller that
 * still uses this mapper must provide the explicit permissions issued by Auth
 * Service; otherwise access fails closed.
 */
export type AuthRow = {
  id: string;
  name: string;
  email: string;
  verified: boolean | null;
  role_name: string;
  permissions?: unknown;
};

function normalizeExplicitPermissions(value: unknown): string[] {
  if (!Array.isArray(value)) {
    const error = new Error("AUTH_PERMISSIONS_MISSING");
    Object.assign(error, { status: 403, code: "AUTH_PERMISSIONS_MISSING" });
    throw error;
  }

  const permissions: string[] = [];
  for (const item of value) {
    if (typeof item !== "string" || !item.trim()) {
      const error = new Error("AUTH_PERMISSIONS_INVALID");
      Object.assign(error, { status: 403, code: "AUTH_PERMISSIONS_INVALID" });
      throw error;
    }
    permissions.push(item.trim());
  }

  return [...new Set(permissions)];
}

export function mapAuthRowToUser(row: AuthRow): AuthUser {
  const normalizedRole = normalizeRoleName(row.role_name);

  if (!normalizedRole) {
    const error = new Error(`Unsupported role received: ${row.role_name}`);
    Object.assign(error, { status: 403, code: "AUTH_ROLE_UNSUPPORTED" });
    throw error;
  }

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: normalizedRole,
    verified: Boolean(row.verified),
    permissions: normalizeExplicitPermissions(row.permissions),
  };
}
