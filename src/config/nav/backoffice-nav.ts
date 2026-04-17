import type { BackofficePermission } from "@/lib/auth/permissions";
import { BACKOFFICE_ROUTES } from "@/lib/constants/backoffice-routes";

export type BackofficeNavItem = {
  label: string;
  href: string;
  permission: BackofficePermission;
  isHidden?: boolean;
};

export const backofficeNav: BackofficeNavItem[] = [
  { label: "Dashboard", href: BACKOFFICE_ROUTES.dashboard, permission: "dashboard.read" },
  { label: "Empresas", href: BACKOFFICE_ROUTES.companies, permission: "companies.read" },
  { label: "Sucursales", href: BACKOFFICE_ROUTES.branches, permission: "branches.read" },
  { label: "Claims", href: BACKOFFICE_ROUTES.claims, permission: "claims.read" },
  { label: "Verificaciones", href: BACKOFFICE_ROUTES.verifications, permission: "verifications.read" },
  { label: "Reseñas", href: BACKOFFICE_ROUTES.reviews, permission: "reviews.read" },
  { label: "Reportes reseñas", href: BACKOFFICE_ROUTES.reviewReports, permission: "reviewReports.read" },
  { label: "Usuarios", href: BACKOFFICE_ROUTES.users, permission: "users.read" },
  { label: "Analytics", href: BACKOFFICE_ROUTES.analytics, permission: "analytics.read" },
  { label: "Taxonomías", href: BACKOFFICE_ROUTES.taxonomies, permission: "taxonomies.manage" },
  { label: "Planes", href: BACKOFFICE_ROUTES.plans, permission: "plans.manage" },
  { label: "Suscripciones", href: BACKOFFICE_ROUTES.subscriptions, permission: "subscriptions.read" },
  { label: "Pagos", href: BACKOFFICE_ROUTES.payments, permission: "payments.read" },
  { label: "Promociones", href: BACKOFFICE_ROUTES.promotions, permission: "promotions.manage" },
  { label: "Notificaciones", href: BACKOFFICE_ROUTES.notifications, permission: "notifications.manage" },
  { label: "Configuración", href: BACKOFFICE_ROUTES.settings, permission: "settings.manage" },
];