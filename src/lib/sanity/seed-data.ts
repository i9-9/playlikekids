import type { Director, Hero } from "./types";

/**
 * Local seed used when Sanity is not configured yet, and as the source of
 * truth for the `npm run seed` script once a project exists.
 *
 * Do not seed hero frames from `public/ref design/` — those PNGs are layout
 * references only (they already bake in chrome) and must not ship as content.
 */
export const SEED_DIRECTORS: Omit<Director, "_id">[] = [
  {
    name: "Davide Vicari",
    slug: "davide-vicari",
    order: 1,
    credits: [
      { brand: "Ministry of Sports", project: "Kingdom of Saudi Arabia" },
      { brand: "Lamborghini", project: "The Barber" },
      { brand: "Adidas", project: "Roma" },
      { brand: "Puma", project: "Portugal National Team" },
      { brand: "Adidas", project: "Figo" },
    ],
    reel: null,
  },
  {
    name: "Gabriela Ortega",
    slug: "gabriela-ortega",
    order: 2,
    credits: [
      { brand: "Marga en el DF", project: "Trailer" },
      { brand: "Huella", project: "Teaser" },
    ],
    reel: null,
  },
  {
    name: "Mar del Corral",
    slug: "mar-del-corral",
    order: 3,
    credits: [
      { brand: "Reebok", project: "Lola Indigo" },
      { brand: "Grey Goose", project: "Idris Elba" },
      { brand: "Adidas", project: "US Soccer Foundation" },
      { brand: "Ministerio de Igualdad", project: "" },
      { brand: "Meet Cycle by Freda", project: "" },
    ],
    reel: null,
  },
  {
    name: "Matías Malet",
    slug: "matias-malet",
    order: 4,
    credits: [
      { brand: "Bravas", project: "Trailer" },
      { brand: "No corre el Viento", project: "Trailer" },
      { brand: "Cinépolis", project: "Skywalker" },
    ],
    reel: null,
  },
  {
    name: "Sage Bennett",
    slug: "sage-bennett",
    order: 5,
    credits: [
      { brand: "Placebo", project: "Trailer" },
      { brand: "Earth is for Lovers", project: "Trailer" },
      { brand: "Grandma Kitty's Ping Pong", project: "Trailer" },
      { brand: "Jim Beam", project: "" },
      { brand: "b:oost", project: "" },
      { brand: "Dior", project: "" },
    ],
    reel: null,
  },
];

/**
 * Local hero frames for development / until Sanity has a published hero doc.
 * Real photography only — never use `public/ref design/` mockups here.
 */
export const LOCAL_HERO_IMAGES: Hero["images"] = [
  {
    url: "/hero/childhomesick1.png",
    alt: "Play Like Kids — hero frame 1",
  },
  {
    url: "/hero/childhomesick2.png",
    alt: "Play Like Kids — hero frame 2",
  },
  {
    url: "/hero/childhomesick3.png",
    alt: "Play Like Kids — hero frame 3",
  },
];

export function toSeedDirectors(): Director[] {
  return SEED_DIRECTORS.map((director, index) => ({
    ...director,
    _id: `seed-director-${index + 1}`,
  }));
}
