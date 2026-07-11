import type { BackofficePermission } from "@/lib/auth/permissions";
import { BACKOFFICE_ROUTES } from "@/lib/constants/backoffice-routes";
import type { IconName } from "@/components/ui/AppIcon";

export type BackofficeNavGroup =
  | "Overview"
  | "Operación"
  | "Inteligencia"
  | "Monetización"
  | "Sistema";

export type BackofficeNavItem = {
  label: string;
  href: string;
  permission: BackofficePermission;
  icon: IconName;
  group: BackofficeNavGroup;
  isHidden?: boolean;
};

export const backofficeNav: BackofficeNavItem[] = [
  { label: "Dashboard", href: BACKOFFICE_ROUTES.dashboard, permission: "dashboard.read", icon: "dashboard", group: "Overview" },
  { label: "Empresas", href: BACKOFFICE_ROUTES.companies, permission: "companies.read", icon: "building", group: "Operación" },
  { label: "Sucursales", href: BACKOFFICE_ROUTES.branches, permission: "branches.read", icon: "branches", group: "Operación" },
  { label: "Reclamos", href: BACKOFFICE_ROUTES.claims, permission: "claims.read", icon: "claims", group: "Operación" },
  { label: "Verificaciones", href: BACKOFFICE_ROUTES.verifications, permission: "verifications.read", icon: "shield", group: "Operación" },
  { label: "Reseñas", href: BACKOFFICE_ROUTES.reviews, permission: "reviews.read", icon: "reviews", group: "Operación" },
  { label: "Reportes reseñas", href: BACKOFFICE_ROUTES.reviewReports, permission: "reviewReports.read", icon: "flag", group: "Operación" },
  { label: "Usuarios", href: BACKOFFICE_ROUTES.users, permission: "users.read", icon: "users", group: "Operación" },
  { label: "Analytics", href: BACKOFFICE_ROUTES.analytics, permission: "analytics.read", icon: "analytics", group: "Inteligencia" },
  { label: "Taxonomías", href: BACKOFFICE_ROUTES.taxonomies, permission: "taxonomies.manage", icon: "layers", group: "Inteligencia" },
  { label: "Planes", href: BACKOFFICE_ROUTES.plans, permission: "plans.manage", icon: "plans", group: "Monetización" },
  { label: "Suscripciones", href: BACKOFFICE_ROUTES.subscriptions, permission: "subscriptions.read", icon: "subscriptions", group: "Monetización" },
  { label: "Pagos", href: BACKOFFICE_ROUTES.payments, permission: "payments.read", icon: "payments", group: "Monetización" },
  { label: "Promociones", href: BACKOFFICE_ROUTES.promotions, permission: "promotions.manage", icon: "promotions", group: "Monetización" },
  { label: "Notificaciones", href: BACKOFFICE_ROUTES.notifications, permission: "notifications.manage", icon: "notifications", group: "Sistema" },
  { label: "Configuración", href: BACKOFFICE_ROUTES.settings, permission: "settings.manage", icon: "settings", group: "Sistema" },
];
