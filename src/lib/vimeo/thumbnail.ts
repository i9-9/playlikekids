/**
 * Resolves the client-selected Vimeo thumbnail for a video via oEmbed.
 * No manual image field — always derived from the video ID / URL.
 */

export type VimeoThumbnail = {
  videoId: string;
  thumbnailUrl: string;
  title: string | null;
  width: number | null;
  height: number | null;
};

const VIMEO_ID_PATTERN = /^\d+$/;
const VIMEO_URL_PATTERN =
  /(?:https?:\/\/)?(?:www\.|player\.)?vimeo\.com\/(?:video\/)?(\d+)/i;

export function extractVimeoId(reel: string): string | null {
  const trimmed = reel.trim();
  if (!trimmed) return null;
  if (VIMEO_ID_PATTERN.test(trimmed)) return trimmed;

  const match = trimmed.match(VIMEO_URL_PATTERN);
  return match?.[1] ?? null;
}

export function toVimeoWatchUrl(videoId: string): string {
  return `https://vimeo.com/${videoId}`;
}

export function toVimeoEmbedUrl(videoId: string): string {
  return `https://player.vimeo.com/video/${videoId}`;
}

type OEmbedResponse = {
  title?: string;
  thumbnail_url?: string;
  thumbnail_width?: number;
  thumbnail_height?: number;
  width?: number;
  height?: number;
};

export async function getVimeoThumbnail(
  reel: string,
): Promise<VimeoThumbnail | null> {
  const videoId = extractVimeoId(reel);
  if (!videoId) return null;

  const oembedUrl = new URL("https://vimeo.com/api/oembed.json");
  oembedUrl.searchParams.set("url", toVimeoWatchUrl(videoId));
  oembedUrl.searchParams.set("width", "1280");

  try {
    const response = await fetch(oembedUrl.toString(), {
      next: { revalidate: 60 * 60 * 24, tags: [`vimeo:${videoId}`] },
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as OEmbedResponse;
    if (!data.thumbnail_url) {
      return null;
    }

    return {
      videoId,
      thumbnailUrl: data.thumbnail_url,
      title: data.title ?? null,
      width: data.thumbnail_width ?? data.width ?? null,
      height: data.thumbnail_height ?? data.height ?? null,
    };
  } catch {
    return null;
  }
}
