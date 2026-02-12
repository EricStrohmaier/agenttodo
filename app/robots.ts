import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://agenttodo.vercel.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/docs", "/docs/*", "/pricing"],
        disallow: ["/dashboard", "/api/", "/signin"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
