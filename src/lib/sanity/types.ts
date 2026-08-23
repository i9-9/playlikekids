/** Shared domain types for Sanity content. No `any`. */

export type Credit = {
  brand: string;
  project: string;
  /** Vimeo numeric ID. Null until a film is attached. */
  vimeoId: string | null;
  /** Privacy hash for unlisted videos (embed `?h=`). */
  vimeoHash: string | null;
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
  /** Still for /directors. Resolved to a CDN URL in queries. */
  previewImageUrl: string | null;
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
