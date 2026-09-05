import type { MetadataRoute } from "next";
import { getAllDirectors } from "@/lib/sanity/queries";
import { SITE_URL } from "@/lib/site";
import { isUnderConstruction } from "@/lib/site-mode";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (isUnderConstruction()) {
    return [];
  }

  const directors = await getAllDirectors();
  const lastModified = new Date();

  return [
    {
      url: SITE_URL,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/directors`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...directors.map((director) => ({
      url: `${SITE_URL}/directors/${director.slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
