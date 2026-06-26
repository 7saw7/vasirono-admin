export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  RECOVER_PASSWORD: "/recuperar-clave",

  BACKOFFICE_ROOT: "/dashboard",
  BACKOFFICE_DASHBOARD: "/dashboard",
  BACKOFFICE_COMPANIES: "/empresas",
  BACKOFFICE_BRANCHES: "/sucursales",
  BACKOFFICE_CLAIMS: "/claims",
  BACKOFFICE_VERIFICATIONS: "/verificaciones",
  // Canonical URLs stay ASCII to avoid Next route mismatches and broken deep links.
  // Labels shown in the UI can keep accents (see backoffice-nav.ts).
  BACKOFFICE_REVIEWS: "/resenas",
  BACKOFFICE_REVIEW_REPORTS: "/reportes-resenas",
  BACKOFFICE_USERS: "/usuarios",
  BACKOFFICE_ANALYTICS: "/analytics",
  BACKOFFICE_TAXONOMIES: "/taxonomias",
  BACKOFFICE_PLANS: "/planes",
  BACKOFFICE_SUBSCRIPTIONS: "/suscripciones",
  BACKOFFICE_PAYMENTS: "/pagos",
  BACKOFFICE_PROMOTIONS: "/promociones",
  BACKOFFICE_NOTIFICATIONS: "/notificaciones",
  BACKOFFICE_SETTINGS: "/configuracion",

  API_LOGIN: "/api/auth/login",
  API_LOGOUT: "/api/auth/logout",
  API_ME: "/api/auth/me",
} as const;
