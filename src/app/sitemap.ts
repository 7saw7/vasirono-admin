import type { MetadataRoute } from "next";
import { getBaseUrl } from "@/config/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getBaseUrl();
  const now = new Date();

  const routes = [
    "",
    "/login",
    "/recuperar-clave",
    "/dashboard",
    "/empresas",
    "/sucursales",
    "/claims",
    "/verificaciones",
    "/resenas",
    "/reportes-resenas",
    "/usuarios",
    "/analytics",
    "/taxonomias",
    "/planes",
    "/suscripciones",
    "/pagos",
    "/promociones",
    "/notificaciones",
    "/configuracion",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
    changeFrequency: route === "" ? "weekly" : "daily",
    priority: route === "" ? 1 : 0.7,
  }));
}