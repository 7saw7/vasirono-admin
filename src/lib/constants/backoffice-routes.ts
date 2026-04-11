import { ROUTES } from "./routes";

export const BACKOFFICE_ROUTE_KEYS = [
  "dashboard",
  "companies",
  "branches",
  "claims",
  "verifications",
  "reviews",
  "reviewReports",
  "users",
  "analytics",
  "taxonomies",
  "plans",
  "subscriptions",
  "payments",
  "promotions",
  "notifications",
  "settings",
] as const;

export type BackofficeRouteKey = (typeof BACKOFFICE_ROUTE_KEYS)[number];

export const BACKOFFICE_ROUTES: Record<BackofficeRouteKey, string> = {
  dashboard: ROUTES.BACKOFFICE_DASHBOARD,
  companies: ROUTES.BACKOFFICE_COMPANIES,
  branches: ROUTES.BACKOFFICE_BRANCHES,
  claims: ROUTES.BACKOFFICE_CLAIMS,
  verifications: ROUTES.BACKOFFICE_VERIFICATIONS,
  reviews: ROUTES.BACKOFFICE_REVIEWS,
  reviewReports: ROUTES.BACKOFFICE_REVIEW_REPORTS,
  users: ROUTES.BACKOFFICE_USERS,
  analytics: ROUTES.BACKOFFICE_ANALYTICS,
  taxonomies: ROUTES.BACKOFFICE_TAXONOMIES,
  plans: ROUTES.BACKOFFICE_PLANS,
  subscriptions: ROUTES.BACKOFFICE_SUBSCRIPTIONS,
  payments: ROUTES.BACKOFFICE_PAYMENTS,
  promotions: ROUTES.BACKOFFICE_PROMOTIONS,
  notifications: ROUTES.BACKOFFICE_NOTIFICATIONS,
  settings: ROUTES.BACKOFFICE_SETTINGS,
};