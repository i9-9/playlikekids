import { cache } from "react";
import { isSanityConfigured, sanityFetch } from "./client";
import { urlForImage } from "./image";
import { toSeedDirectors } from "./seed-data";
import { logFallback } from "@/lib/log";
import type { Director, SanityImage } from "./types";

const REVALIDATE_SECONDS = 60;

type DirectorDocument = Omit<Director, "previewImageUrl" | "credits"> & {
  previewImage: (SanityImage & { alt?: string }) | null;
  credits: Array<{
    brand: string;
    project: string;
    vimeoId?: string | null;
    vimeoHash?: string | null;
    festival?: {
      name?: string | null;
      year?: string | null;
      selection?: string | null;
    } | null;
  }> | null;
};

function toDirector(doc: DirectorDocument): Director {
  let previewImageUrl: string | null = null;
  if (doc.previewImage) {
    try {
      // Raw Sanity CDN URL — next/image handles resize + encode.
      previewImageUrl = urlForImage(doc.previewImage).url();
    } catch (error) {
      logFallback(`urlForImage failed for director ${doc._id}`, error);
      previewImageUrl = null;
    }
  }

  return {
    _id: doc._id,
    name: doc.name,
    slug: doc.slug,
    order: doc.order,
    credits: (doc.credits ?? []).map((credit) => ({
      brand: credit.brand,
      project: credit.project,
      vimeoId: credit.vimeoId ?? null,
      vimeoHash: credit.vimeoHash ?? null,
      festival:
        credit.festival?.name && credit.festival?.year
          ? {
              name: credit.festival.name,
              year: credit.festival.year,
              selection: credit.festival.selection?.trim() || "Official Selection",
            }
          : null,
    })),
    previewImageUrl,
  };
}

const directorsProjection = /* groq */ `{
  _id,
  name,
  "slug": slug.current,
  order,
  credits[]{ brand, project, vimeoId, vimeoHash, festival },
  previewImage
}`;

export const allDirectorsQuery = /* groq */ `
  *[_type == "director" && defined(slug.current)] | order(order asc) ${directorsProjection}
`;

export const directorBySlugQuery = /* groq */ `
  *[_type == "director" && slug.current == $slug][0] ${directorsProjection}
`;

export const getAllDirectors = cache(async function getAllDirectors(): Promise<Director[]> {
  if (!isSanityConfigured) {
    return toSeedDirectors();
  }

  try {
    const docs = await sanityFetch<DirectorDocument[]>({
      query: allDirectorsQuery,
      revalidate: REVALIDATE_SECONDS,
      tags: ["directors"],
    });

    if (!docs?.length) {
      logFallback("getAllDirectors: CMS returned no directors, using seed");
      return toSeedDirectors();
    }

    return docs
      .map(toDirector)
      .filter(
        (director) =>
          Boolean(director.name) &&
          Boolean(director.slug) &&
          Array.isArray(director.credits) &&
          director.credits.length > 0,
      );
  } catch (error) {
    logFallback("getAllDirectors: fetch failed, using seed", error);
    return toSeedDirectors();
  }
});

export const getDirectorBySlug = cache(async function getDirectorBySlug(
  slug: string,
): Promise<Director | null> {
  if (!isSanityConfigured) {
    return toSeedDirectors().find((d) => d.slug === slug) ?? null;
  }

  try {
    const doc = await sanityFetch<DirectorDocument | null>({
      query: directorBySlugQuery,
      params: { slug },
      revalidate: REVALIDATE_SECONDS,
      tags: ["directors", `director:${slug}`],
    });

    return doc ? toDirector(doc) : null;
  } catch (error) {
    logFallback(`getDirectorBySlug(${slug}): fetch failed, using seed`, error);
    return toSeedDirectors().find((d) => d.slug === slug) ?? null;
  }
});

