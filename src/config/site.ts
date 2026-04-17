export const siteConfig = {
  name: "Vasirono Admin",
  shortName: "Vasirono",
  description:
    "Panel administrativo de Vasirono para gestionar empresas, sucursales, reseñas, analytics, verificaciones, pagos, suscripciones y operación interna.",
  applicationName: "Vasirono Admin",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  locale: "es-PE",
  themeColor: "#0a0a0a",
  creator: "Vasirono",
  keywords: [
    "Vasirono",
    "Vasirono Admin",
    "backoffice",
    "panel administrativo",
    "empresas",
    "sucursales",
    "claims",
    "verificaciones",
    "reseñas",
    "analytics",
    "pagos",
    "suscripciones",
    "promociones",
    "notificaciones",
  ],
  links: {
    github: "https://github.com/7saw7/vasirono-admin",
  },
} as const;

export function getBaseUrl() {
  return siteConfig.url.replace(/\/+$/, "");
}