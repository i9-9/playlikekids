import {
  extractVimeoId,
  getVimeoThumbnail,
} from "@/lib/vimeo/thumbnail";
import type { Director } from "@/lib/sanity/types";
import type { DirectorCardData } from "@/components/sections/DirectorCard";

export async function resolveDirectorMedia(
  director: Director,
): Promise<Pick<DirectorCardData, "thumbnailUrl" | "videoId">> {
  if (!director.reel) {
    return { thumbnailUrl: null, videoId: null };
  }

  const videoId = extractVimeoId(director.reel);
  if (!videoId) {
    return { thumbnailUrl: null, videoId: null };
  }

  const thumb = await getVimeoThumbnail(director.reel);
  return {
    videoId,
    thumbnailUrl: thumb?.thumbnailUrl ?? null,
  };
}

export async function toDirectorCards(
  directors: Director[],
): Promise<DirectorCardData[]> {
  return Promise.all(
    directors.map(async (director) => {
      const media = await resolveDirectorMedia(director);
      return {
        name: director.name,
        slug: director.slug,
        order: director.order,
        credits: director.credits,
        ...media,
      };
    }),
  );
}
