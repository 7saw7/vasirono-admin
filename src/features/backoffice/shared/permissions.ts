import type { BackofficePermission } from "@/lib/auth/permissions";
import { hasPermission } from "@/lib/auth/permissions";
import type { AppRole } from "@/lib/constants/roles";

export function can(role: AppRole, permission: BackofficePermission): boolean {
  return hasPermission(role, permission);
}

export function canSome(
  role: AppRole,
  permissions: BackofficePermission[]
): boolean {
  return permissions.some((permission) => hasPermission(role, permission));
}

export function canAll(
  role: AppRole,
  permissions: BackofficePermission[]
): boolean {
    return permissions.every((permission) => hasPermission(role, permission));
}