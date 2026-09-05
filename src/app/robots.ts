import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { isUnderConstruction } from "@/lib/site-mode";

export default function robots(): MetadataRoute.Robots {
  if (isUnderConstruction()) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
      host: SITE_URL,
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/studio", "/studio/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
