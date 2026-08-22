import {
  createImageUrlBuilder,
  type SanityImageSource,
} from "@sanity/image-url";
import { sanityClient } from "./client";

const builder = createImageUrlBuilder(sanityClient);

/** Builds CDN URLs for Sanity-hosted images only (not Vimeo thumbnails). */
export function urlForImage(source: SanityImageSource) {
  return builder.image(source);
}
