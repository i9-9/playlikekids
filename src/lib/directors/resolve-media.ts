import {
  extractVimeoId,
  getVimeoThumbnail,
} from "@/lib/vimeo/thumbnail";
import type { Credit, Director, FestivalSelection } from "@/lib/sanity/types";
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

/** Live CMS docs may not have festival fields yet. Used for credit labels, not laurels. */
const FESTIVAL_FALLBACK: Record<string, Record<string, FestivalSelection>> = {
  "gabriela-ortega": {
    Huella: {
      name: "Sundance Film Festival",
      year: "2023",
      selection: "Official Selection",
    },
    "Marga en el DF": {
      name: "Sundance Film Festival",
      year: "2026",
      selection: "Official Selection",
    },
  },
};

function withFestival(director: Director, credit: Credit): Credit {
  if (credit.festival?.name) return credit;
  const fallback = FESTIVAL_FALLBACK[director.slug]?.[credit.brand] ?? null;
  return { ...credit, festival: fallback };
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
  return Promise.all(
    director.credits.map((credit) => resolveFilm(withFestival(director, credit))),
  );
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
