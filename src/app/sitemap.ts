import type { MetadataRoute } from "next";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    { path: "", priority: 1, changeFrequency: "weekly" as const },
    { path: "/speisekarte", priority: 0.9, changeFrequency: "weekly" as const },
    { path: "/kontakt", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/impressum", priority: 0.3, changeFrequency: "yearly" as const },
    { path: "/datenschutz", priority: 0.3, changeFrequency: "yearly" as const },
  ];

  return routes.map(({ path, priority, changeFrequency }) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }));
}
