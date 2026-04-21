import type { MetadataRoute } from "next";

const BASE_URL = "https://alpina-pulse.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/app/leads/", "/app/pipeline/"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
