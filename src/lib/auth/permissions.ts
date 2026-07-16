import type { AuthUser } from "@/features/auth/types";
import type { AppRole } from "@/lib/constants/roles";
import { APP_ROLES } from "@/lib/constants/roles";

export type BackofficePermission =
  | "dashboard.read"
  | "companies.read"
  | "companies.update"
  | "branches.read"
  | "branches.update"
  | "claims.read"
  | "claims.review"
  | "verifications.read"
  | "verifications.review"
  | "reviews.read"
  | "reviews.moderate"
  | "reviewReports.read"
  | "reviewReports.resolve"
  | "users.read"
  | "users.manage"
  | "analytics.read"
  | "taxonomies.read"
  | "taxonomies.manage"
  | "taxonomies.businessTypes.manage"
  | "taxonomies.categories.manage"
  | "taxonomies.subcategories.manage"
  | "taxonomies.services.manage"
  | "plans.read"
  | "plans.manage"
  | "subscriptions.read"
  | "payments.read"
  | "promotions.read"
  | "promotions.manage"
  | "notifications.read"
  | "notifications.manage"
  | "settings.read"
  | "settings.manage";

const ALL_PERMISSIONS: readonly BackofficePermission[] = [
  "dashboard.read",
  "companies.read",
  "companies.update",
  "branches.read",
  "branches.update",
  "claims.read",
  "claims.review",
  "verifications.read",
  "verifications.review",
  "reviews.read",
  "reviews.moderate",
  "reviewReports.read",
  "reviewReports.resolve",
  "users.read",
  "users.manage",
  "analytics.read",
  "taxonomies.read",
  "taxonomies.manage",
  "taxonomies.businessTypes.manage",
  "taxonomies.categories.manage",
  "taxonomies.subcategories.manage",
  "taxonomies.services.manage",
  "plans.read",
  "plans.manage",
  "subscriptions.read",
  "payments.read",
  "promotions.read",
  "promotions.manage",
  "notifications.read",
  "notifications.manage",
  "settings.read",
  "settings.manage",
];

/**
 * Matriz funcional del Web Admin. Esta matriz decide qué páginas y acciones
 * puede ver cada rol. La autorización definitiva sigue validándose en los
 * microservicios mediante los permisos backend enviados por Auth Service.
 */
const ROLE_PERMISSIONS: Record<AppRole, readonly BackofficePermission[]> = {
  [APP_ROLES.SUPER_ADMIN]: ALL_PERMISSIONS,
  [APP_ROLES.ADMIN]: ALL_PERMISSIONS,

  [APP_ROLES.MODERATOR]: [
    "dashboard.read",
    "companies.read",
    "branches.read",
    "claims.read",
    "claims.review",
    "verifications.read",
    "verifications.review",
    "reviews.read",
    "reviews.moderate",
    "reviewReports.read",
    "reviewReports.resolve",
    "users.read",
    "taxonomies.read",
    "plans.read",
    "promotions.read",
    "promotions.manage",
    "notifications.read",
    "settings.read",
  ],

  [APP_ROLES.ANALYST]: [
    "dashboard.read",
    "analytics.read",
    "companies.read",
    "branches.read",
    "users.read",
    "subscriptions.read",
    "payments.read",
    "taxonomies.read",
    "plans.read",
    "promotions.read",
    "notifications.read",
    "settings.read",
  ],

  [APP_ROLES.SUPPORT]: [
    "dashboard.read",
    "companies.read",
    "branches.read",
    "claims.read",
    "verifications.read",
    "reviews.read",
    "reviewReports.read",
    "users.read",
    "subscriptions.read",
    "payments.read",
    "notifications.read",
    "taxonomies.read",
    "settings.read",
  ],

  [APP_ROLES.COMPANY_OWNER]: [],
  [APP_ROLES.COMPANY_MANAGER]: [],
  [APP_ROLES.USER]: [],
};

export type BackendBackofficePermission = string;

/**
 * Relación entre capacidad visible en la interfaz y permisos exigidos por los
 * microservicios. Al comprobar ambos niveles evitamos mostrar una acción que
 * terminaría necesariamente en 403.
 */
const BACKEND_PERMISSIONS_BY_UI_PERMISSION: Record<
  BackofficePermission,
  readonly BackendBackofficePermission[]
> = {
  "dashboard.read": ["analytics.backoffice.read"],

  "companies.read": ["backoffice.companies.read"],
  "companies.update": ["backoffice.companies.manage"],

  "branches.read": ["backoffice.branches.read"],
  // Branch Service todavía no expone una capacidad backoffice de escritura.
  // Se mantiene la capacidad funcional para el Grupo 2, sin fabricar un
  // permiso backend inexistente.
  "branches.update": [],

  "claims.read": [
    "verifications.claims.list",
    "verifications.claims.read",
  ],
  "claims.review": ["verifications.claims.decide"],

  "verifications.read": [
    "verifications.admin.list",
    "verifications.admin.read",
  ],
  "verifications.review": [
    "verifications.admin.assign",
    "verifications.admin.decide",
  ],

  "reviews.read": ["reviews.admin.read"],
  "reviews.moderate": ["reviews.admin.moderate"],
  "reviewReports.read": ["reviews.admin.reports.read"],
  "reviewReports.resolve": ["reviews.admin.reports.resolve"],

  "users.read": ["admin:users:read", "admin:users:detail"],
  "users.manage": [
    "admin:users:update-role",
    "admin:users:verify",
    "admin:users:activate",
    "admin:users:deactivate",
  ],

  "analytics.read": ["analytics.backoffice.read"],

  "taxonomies.read": ["backoffice.taxonomies.read"],
  "taxonomies.manage": ["backoffice.taxonomies.manage"],
  "taxonomies.businessTypes.manage": ["backoffice.taxonomies.manage"],
  "taxonomies.categories.manage": ["backoffice.taxonomies.manage"],
  "taxonomies.subcategories.manage": ["backoffice.taxonomies.manage"],
  "taxonomies.services.manage": ["backoffice.taxonomies.manage"],

  "plans.read": ["billing.admin.plans.read"],
  "plans.manage": ["billing.admin.plans.write"],
  "subscriptions.read": ["billing.admin.subscriptions.read"],
  "payments.read": ["billing.admin.payments.read"],

  // La lista actual usa Billing y el flujo de moderación usa Promotions.
  "promotions.read": [
    "billing.admin.promotions.read",
    "promotions:admin:read",
  ],
  "promotions.manage": [
    "promotions:admin:update-status",
    "promotions:admin:moderate",
  ],

  "notifications.read": ["notifications:read:all"],
  // El módulo actual es de lectura; el permiso manage queda preparado para el
  // Grupo 5 y no concede una escritura backend que aún no existe.
  "notifications.manage": ["notifications:read:all"],

  "settings.read": ["admin:settings:read"],
  "settings.manage": ["admin:settings:manage"],
};

const EXTRA_BACKEND_PERMISSIONS_BY_ROLE: Partial<
  Record<AppRole, readonly BackendBackofficePermission[]>
> = {
  [APP_ROLES.SUPER_ADMIN]: [
    "media:company:read",
    "media:branch:read",
    "media:catalog-item:read",
    "media:review:read",
    "media:types:read",
    "media:company:write",
    "media:branch:write",
    "media:catalog-item:write",
    "media:review:write",
    "media:company:delete",
    "media:branch:delete",
    "media:catalog-item:delete",
    "media:review:delete",
  ],
  [APP_ROLES.ADMIN]: [
    "media:company:read",
    "media:branch:read",
    "media:catalog-item:read",
    "media:review:read",
    "media:types:read",
    "media:company:write",
    "media:branch:write",
    "media:catalog-item:write",
    "media:review:write",
    "media:company:delete",
    "media:branch:delete",
    "media:catalog-item:delete",
    "media:review:delete",
  ],
  [APP_ROLES.MODERATOR]: [
    "media:company:read",
    "media:branch:read",
    "media:catalog-item:read",
    "media:review:read",
    "media:types:read",
  ],
  [APP_ROLES.ANALYST]: [
    "media:company:read",
    "media:branch:read",
    "media:catalog-item:read",
    "media:review:read",
    "media:types:read",
  ],
  [APP_ROLES.SUPPORT]: [
    "media:company:read",
    "media:branch:read",
    "media:catalog-item:read",
    "media:review:read",
    "media:types:read",
  ],
};

export function getRolePermissions(role: AppRole): Set<BackofficePermission> {
  return new Set(ROLE_PERMISSIONS[role] ?? []);
}

export function getBackendPermissionsForUiPermission(
  permission: BackofficePermission
): readonly BackendBackofficePermission[] {
  return BACKEND_PERMISSIONS_BY_UI_PERMISSION[permission];
}

export function getBackendRolePermissions(
  role: AppRole
): Set<BackendBackofficePermission> {
  const permissions = ROLE_PERMISSIONS[role] ?? [];
  const backendPermissions = permissions.flatMap(
    (permission) => BACKEND_PERMISSIONS_BY_UI_PERMISSION[permission]
  );

  return new Set([
    ...backendPermissions,
    ...(EXTRA_BACKEND_PERMISSIONS_BY_ROLE[role] ?? []),
  ]);
}

export function hasPermission(
  role: AppRole,
  permission: BackofficePermission
): boolean {
  return getRolePermissions(role).has(permission);
}

export function userHasPermission(
  user: Pick<AuthUser, "role" | "permissions">,
  permission: BackofficePermission
): boolean {
  if (!hasPermission(user.role, permission)) return false;

  const requiredBackendPermissions =
    BACKEND_PERMISSIONS_BY_UI_PERMISSION[permission];

  if (requiredBackendPermissions.length === 0) return true;

  const granted = new Set(user.permissions ?? []);
  return requiredBackendPermissions.every((item) => granted.has(item));
}

export function assertPermission(
  user: Pick<AuthUser, "role" | "permissions">,
  permission: BackofficePermission
): void {
  if (!userHasPermission(user, permission)) {
    const error = new Error(`Forbidden: missing permission ${permission}`);
    Object.assign(error, {
      status: 403,
      code: "BACKOFFICE_PERMISSION_DENIED",
      permission,
    });
    throw error;
  }
}
