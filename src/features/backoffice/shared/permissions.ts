import type { BackofficePermission } from "@/lib/auth/permissions";
import type { AppRole } from "@/lib/constants/roles";

/**
 * Deprecated compatibility helpers.
 *
 * Permissions must never be reconstructed from a role. These helpers remain
 * only so an old checkout cannot fail TypeScript compilation after an overlay;
 * they deliberately fail closed. New code must call userHasPermission() with
 * the authenticated user's explicit permission array.
 */
export function can(
  _role: AppRole,
  _permission: BackofficePermission,
): boolean {
  return false;
}

export function canSome(
  _role: AppRole,
  _permissions: BackofficePermission[],
): boolean {
  return false;
}

export function canAll(
  _role: AppRole,
  _permissions: BackofficePermission[],
): boolean {
  return false;
}
