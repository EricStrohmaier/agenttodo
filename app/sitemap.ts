import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://agentboard.dev";

  const staticPages = [
    { path: "", priority: 1 },
    { path: "/pricing", priority: 0.8 },
    { path: "/docs", priority: 0.9 },
    { path: "/docs/quickstart", priority: 0.8 },
    { path: "/docs/api", priority: 0.8 },
    { path: "/docs/concepts", priority: 0.7 },
    { path: "/docs/agents", priority: 0.8 },
  ];

  return staticPages.map(({ path, priority }) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority,
  }));
}
