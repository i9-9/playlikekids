/**
 * Resolves Vimeo thumbnails via oEmbed and builds watch / embed URLs.
 * Unlisted videos need the privacy hash (`vimeoHash`) on both oEmbed and embed.
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
  /(?:https?:\/\/)?(?:www\.|player\.)?vimeo\.com\/(?:video\/)?(\d+)(?:\/([a-f0-9]+))?/i;

export function extractVimeoId(reel: string): string | null {
  const trimmed = reel.trim();
  if (!trimmed) return null;
  if (VIMEO_ID_PATTERN.test(trimmed)) return trimmed;

  const match = trimmed.match(VIMEO_URL_PATTERN);
  return match?.[1] ?? null;
}

export function extractVimeoHash(reel: string): string | null {
  const match = reel.trim().match(VIMEO_URL_PATTERN);
  return match?.[2] ?? null;
}

export function toVimeoWatchUrl(videoId: string, hash?: string | null): string {
  return hash
    ? `https://vimeo.com/${videoId}/${hash}`
    : `https://vimeo.com/${videoId}`;
}

export function toVimeoEmbedUrl(
  videoId: string,
  hash?: string | null,
  options: { autoplay?: boolean; controls?: boolean; muted?: boolean } = {},
): string {
  const url = new URL(`https://player.vimeo.com/video/${videoId}`);
  if (hash) url.searchParams.set("h", hash);
  url.searchParams.set("title", "0");
  url.searchParams.set("byline", "0");
  url.searchParams.set("portrait", "0");
  url.searchParams.set("dnt", "1");
  url.searchParams.set("playsinline", "1");
  url.searchParams.set("keyboard", "0");
  url.searchParams.set("pip", "1");
  url.searchParams.set("transparent", "0");
  url.searchParams.set("controls", options.controls === true ? "1" : "0");
  if (options.autoplay) url.searchParams.set("autoplay", "1");
  // Browsers block unmuted autoplay once the click handler yields (Vimeo ready).
  if (options.muted || options.autoplay) url.searchParams.set("muted", "1");
  return url.toString();
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
  videoId: string,
  hash?: string | null,
): Promise<VimeoThumbnail | null> {
  const id = extractVimeoId(videoId);
  if (!id) return null;

  const oembedUrl = new URL("https://vimeo.com/api/oembed.json");
  oembedUrl.searchParams.set("url", toVimeoWatchUrl(id, hash));
  oembedUrl.searchParams.set("width", "1280");

  try {
    const response = await fetch(oembedUrl.toString(), {
      next: { revalidate: 60 * 60 * 24, tags: [`vimeo:${id}`] },
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as OEmbedResponse;
    if (!data.thumbnail_url) {
      return null;
    }

    return {
      videoId: id,
      thumbnailUrl: data.thumbnail_url,
      title: data.title ?? null,
      width: data.thumbnail_width ?? data.width ?? null,
      height: data.thumbnail_height ?? data.height ?? null,
    };
  } catch {
    return null;
  }
}
