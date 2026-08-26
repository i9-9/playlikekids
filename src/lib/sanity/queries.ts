import { isSanityConfigured, sanityFetch } from "./client";
import { urlForImage } from "./image";
import { LOCAL_HERO_IMAGES, toSeedDirectors } from "./seed-data";
import type { Director, Hero, HeroDocument, SanityImage } from "./types";

const LOCAL_HERO: Hero = { _id: "local-hero", images: LOCAL_HERO_IMAGES };

const REVALIDATE_SECONDS = 60;

type DirectorDocument = Omit<Director, "previewImageUrl" | "credits"> & {
  previewImage: (SanityImage & { alt?: string }) | null;
  credits: Array<{
    brand: string;
    project: string;
    vimeoId?: string | null;
    vimeoHash?: string | null;
  }> | null;
};

function toDirector(doc: DirectorDocument): Director {
  let previewImageUrl: string | null = null;
  if (doc.previewImage) {
    try {
      // Raw Sanity CDN URL — next/image handles resize + encode.
      previewImageUrl = urlForImage(doc.previewImage).url();
    } catch {
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
    })),
    previewImageUrl,
  };
}

const directorsProjection = /* groq */ `{
  _id,
  name,
  "slug": slug.current,
  order,
  credits[]{ brand, project, vimeoId, vimeoHash },
  previewImage
}`;

export const allDirectorsQuery = /* groq */ `
  *[_type == "director" && defined(slug.current)] | order(order asc) ${directorsProjection}
`;

export const directorBySlugQuery = /* groq */ `
  *[_type == "director" && slug.current == $slug][0] ${directorsProjection}
`;

export const heroQuery = /* groq */ `
  *[_type == "hero"][0]{
    _id,
    images[]{
      ...,
      alt
    }
  }
`;

export async function getAllDirectors(): Promise<Director[]> {
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
  } catch {
    return toSeedDirectors();
  }
}

export async function getDirectorBySlug(
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
  } catch {
    return toSeedDirectors().find((d) => d.slug === slug) ?? null;
  }
}

export async function getHero(): Promise<Hero> {
  if (!isSanityConfigured) {
    return LOCAL_HERO;
  }

  try {
    const doc = await sanityFetch<HeroDocument | null>({
      query: heroQuery,
      revalidate: REVALIDATE_SECONDS,
      tags: ["hero"],
    });

    const images =
      doc?.images
        ?.map((image, index) => {
          try {
            return {
              // Raw Sanity CDN URL — next/image handles resize + encode.
              url: urlForImage(image).url(),
              alt:
                image.alt?.trim() ||
                `Play Like Kids — hero frame ${index + 1}`,
            };
          } catch {
            return null;
          }
        })
        .filter((image): image is Hero["images"][number] => Boolean(image)) ??
      [];

    if (images.length === 3) {
      return { _id: doc?._id ?? "hero", images };
    }

    return LOCAL_HERO;
  } catch {
    return LOCAL_HERO;
  }
}
