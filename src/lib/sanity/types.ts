/** Shared domain types for Sanity content. No `any`. */

export type Credit = {
  brand: string;
  project: string;
};

export type SanityImage = {
  _type: "image";
  asset: {
    _ref: string;
    _type: "reference";
  };
  alt?: string;
  hotspot?: {
    x: number;
    y: number;
    height: number;
    width: number;
  };
};

export type Director = {
  _id: string;
  name: string;
  slug: string;
  order: number;
  credits: Credit[];
  /** Vimeo video ID or URL. Thumbnail is resolved via /lib/vimeo. */
  reel: string | null;
};

export type HeroImage = {
  url: string;
  alt: string;
};

export type Hero = {
  _id: string;
  images: HeroImage[];
};

/** Raw Sanity hero document before image URL resolution. */
export type HeroDocument = {
  _id: string;
  images: Array<SanityImage & { alt?: string }> | null;
};
