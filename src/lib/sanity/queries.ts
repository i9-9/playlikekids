import { isSanityConfigured, sanityFetch } from "./client";
import { urlForImage } from "./image";
import { LOCAL_HERO_IMAGES, toSeedDirectors } from "./seed-data";
import type { Director, Hero, HeroDocument } from "./types";

const LOCAL_HERO: Hero = { _id: "local-hero", images: LOCAL_HERO_IMAGES };

const REVALIDATE_SECONDS = 60;

const directorsProjection = /* groq */ `{
  _id,
  name,
  "slug": slug.current,
  order,
  credits[]{ brand, project },
  reel
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
    const directors = await sanityFetch<Director[]>({
      query: allDirectorsQuery,
      revalidate: REVALIDATE_SECONDS,
      tags: ["directors"],
    });

    if (!directors?.length) {
      return toSeedDirectors();
    }

    return directors.filter(
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
    const director = await sanityFetch<Director | null>({
      query: directorBySlugQuery,
      params: { slug },
      revalidate: REVALIDATE_SECONDS,
      tags: ["directors", `director:${slug}`],
    });

    return director;
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
        ?.map((image) => {
          try {
            return {
              url: urlForImage(image).width(2400).quality(85).url(),
              alt: image.alt?.trim() || "Home hero",
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
