import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://tu-dominio.com";

  const routes = [
    {
      path: "/",
      priority: 1,
      changeFrequency: "yearly" as const,
    },
    {
      path: "/momentos",
      priority: 0.9,
      changeFrequency: "monthly" as const,
    },
    {
      path: "/historia",
      priority: 0.8,
      changeFrequency: "monthly" as const,
    },
    {
      path: "/mensaje",
      priority: 0.8,
      changeFrequency: "monthly" as const,
    },
  ];

  const now = new Date();

  return routes.map((route) => ({
    url: `${baseUrl}${route.path === "/" ? "" : route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}