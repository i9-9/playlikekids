import {
  extractVimeoId,
  getVimeoThumbnail,
} from "@/lib/vimeo/thumbnail";
import type { Credit, Director, HeroImage } from "@/lib/sanity/types";
import type { DirectorCardData } from "@/components/sections/DirectorCard";
import { SITE_LOGO_PATH } from "@/lib/site";

export type ResolvedFilm = Credit & {
  videoId: string | null;
  thumbnailUrl: string | null;
};

/**
 * Local stills in `public/images-directors/` — fallback if a Vimeo poster
 * cannot be resolved for the /directors grid.
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

function withVimeoThumbWidth(url: string, width: number): string {
  return url.replace(/-d_\d+/, `-d_${width}`);
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

async function resolveFirstFilm(
  director: Director,
): Promise<ResolvedFilm | null> {
  const firstCredit = director.credits[0];
  if (!firstCredit) return null;
  return resolveFilm(firstCredit);
}

export async function resolveDirectorFilms(
  director: Director,
): Promise<ResolvedFilm[]> {
  return Promise.all(director.credits.map((credit) => resolveFilm(credit)));
}

const HERO_THUMB_WIDTH = 1920;

/** Home hero: Vimeo poster of each director's first film, in roster order. */
export async function resolveHomeHeroImages(
  directors: Director[],
): Promise<HeroImage[]> {
  const frames = await Promise.all(
    directors.map(async (director) => {
      const firstCredit = director.credits[0];
      const videoId = firstCredit?.vimeoId
        ? extractVimeoId(firstCredit.vimeoId)
        : null;
      if (!videoId || !firstCredit) return null;

      const thumb = await getVimeoThumbnail(videoId, firstCredit.vimeoHash, {
        width: HERO_THUMB_WIDTH,
      });
      if (!thumb?.thumbnailUrl) return null;

      const title = [firstCredit.brand, firstCredit.project]
        .filter(Boolean)
        .join(" — ");

      return {
        url: withVimeoThumbWidth(thumb.thumbnailUrl, HERO_THUMB_WIDTH),
        alt: title ? `${director.name} — ${title}` : director.name,
      };
    }),
  );

  return frames.filter((frame): frame is HeroImage => Boolean(frame));
}

const OG_THUMB_WIDTH = 1280;
const OG_THUMB_HEIGHT = 720;

export type ShareImage = {
  url: string;
  width: number;
  height: number;
  alt: string;
};

/** First-film still for social cards. Falls back to local art, then the site logo. */
export async function resolveDirectorOgImage(
  director: Director,
): Promise<ShareImage> {
  const film = await resolveFirstFilm(director);
  if (film?.thumbnailUrl) {
    return {
      url: withVimeoThumbWidth(film.thumbnailUrl, OG_THUMB_WIDTH),
      width: OG_THUMB_WIDTH,
      height: OG_THUMB_HEIGHT,
      alt: director.name,
    };
  }

  const fallback =
    localDirectorImage(director.slug) ??
    director.previewImageUrl ??
    SITE_LOGO_PATH;

  const isLogo = fallback === SITE_LOGO_PATH;

  return {
    url: fallback,
    width: isLogo ? 1585 : OG_THUMB_WIDTH,
    height: isLogo ? 776 : OG_THUMB_HEIGHT,
    alt: director.name,
  };
}

export async function toDirectorCards(
  directors: Director[],
): Promise<DirectorCardData[]> {
  return Promise.all(
    directors.map(async (director) => {
      const film = await resolveFirstFilm(director);

      return {
        name: director.name,
        slug: director.slug,
        order: director.order,
        credits: director.credits,
        videoId: null,
        thumbnailUrl:
          film?.thumbnailUrl ??
          localDirectorImage(director.slug) ??
          director.previewImageUrl,
      };
    }),
  );
}
