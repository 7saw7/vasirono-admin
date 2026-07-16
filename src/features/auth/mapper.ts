import type { AuthUser } from "./types";
import { normalizeRoleName } from "@/lib/constants/roles";
import { getBackendRolePermissions } from "@/lib/auth/permissions";

export type AuthRow = {
  id: string;
  name: string;
  email: string;
  verified: boolean | null;
  role_name: string;
};

export function mapAuthRowToUser(row: AuthRow): AuthUser {
  const normalizedRole = normalizeRoleName(row.role_name);

  if (!normalizedRole) {
    throw new Error(`Unsupported role received from database: ${row.role_name}`);
  }

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: normalizedRole,
    verified: Boolean(row.verified),
    permissions: Array.from(getBackendRolePermissions(normalizedRole)),
  };
}