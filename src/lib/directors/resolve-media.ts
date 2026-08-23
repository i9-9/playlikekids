import {
  extractVimeoId,
  getVimeoThumbnail,
} from "@/lib/vimeo/thumbnail";
import type { Credit, Director } from "@/lib/sanity/types";
import type { DirectorCardData } from "@/components/sections/DirectorCard";

export type ResolvedFilm = Credit & {
  videoId: string | null;
  thumbnailUrl: string | null;
};

/**
 * Stills in `public/images-directors/` for the /directors grid.
 * Named by last name. Independent from Vimeo film posters.
 */
const LOCAL_DIRECTOR_IMAGES: Record<string, string> = {
  "davide-vicari": "/images-directors/vicari.jpg",
  "gabriela-ortega": "/images-directors/ortega.jpg",
  "mar-del-corral": "/images-directors/del_corral.jpg",
  "matias-malet": "/images-directors/malet.jpg",
  "sage-bennett": "/images-directors/bennett.jpg",
};

function localDirectorImage(slug: string): string | null {
  return LOCAL_DIRECTOR_IMAGES[slug] ?? null;
}

async function resolveFilm(credit: Credit): Promise<ResolvedFilm> {
  const videoId = credit.vimeoId ? extractVimeoId(credit.vimeoId) : null;
  if (!videoId) {
    return { ...credit, videoId: null, thumbnailUrl: null };
  }

  const thumb = await getVimeoThumbnail(videoId, credit.vimeoHash);
  return {
    ...credit,
    videoId,
    thumbnailUrl: thumb?.thumbnailUrl ?? null,
  };
}

export async function resolveDirectorFilms(
  director: Director,
): Promise<ResolvedFilm[]> {
  return Promise.all(director.credits.map(resolveFilm));
}

export function toDirectorCards(directors: Director[]): DirectorCardData[] {
  return directors.map((director) => ({
    name: director.name,
    slug: director.slug,
    order: director.order,
    credits: director.credits,
    videoId: null,
    thumbnailUrl:
      localDirectorImage(director.slug) ?? director.previewImageUrl,
  }));
}
