import type { Director, Hero } from "./types";

/**
 * Local seed used when Sanity is not configured yet, and as the source of
 * truth for the `npm run seed` script once a project exists.
 *
 * Film order is the on-site order. `vimeoHash` is only set for unlisted videos.
 *
 * Do not seed hero frames from `public/ref design/` — those PNGs are layout
 * references only (they already bake in chrome) and must not ship as content.
 */
export const SEED_DIRECTORS: Omit<Director, "_id">[] = [
  {
    name: "Davide Vicari",
    slug: "davide-vicari",
    order: 1,
    previewImageUrl: null,
    credits: [
      {
        brand: "Ministry of Sports",
        project: "Kindom of Saudi Arabia",
        vimeoId: "1216249852",
        vimeoHash: null,
      },
      {
        brand: "Lamborghini",
        project: "The Barber",
        vimeoId: "1216249815",
        vimeoHash: null,
      },
      {
        brand: "Adidas",
        project: "Roma",
        vimeoId: "1216249779",
        vimeoHash: null,
      },
      {
        brand: "Puma",
        project: "Portugal National Team",
        vimeoId: "1216249862",
        vimeoHash: null,
      },
      {
        brand: "Adidas",
        project: "Figo",
        vimeoId: "1216249778",
        vimeoHash: null,
      },
    ],
  },
  {
    name: "Gabriela Ortega",
    slug: "gabriela-ortega",
    order: 2,
    previewImageUrl: null,
    credits: [
      {
        brand: "Marga en el DF",
        project: "Trailer",
        vimeoId: "1217463372",
        vimeoHash: "26268705de",
      },
      {
        brand: "Huella",
        project: "Teaser",
        vimeoId: "1219901805",
        vimeoHash: null,
      },
    ],
  },
  {
    name: "Mar del Corral",
    slug: "mar-del-corral",
    order: 3,
    previewImageUrl: null,
    credits: [
      {
        brand: "Reebok",
        project: "Lola Indigo",
        vimeoId: "1216219830",
        vimeoHash: null,
      },
      {
        brand: "Grey Goose",
        project: "Idris Elba",
        vimeoId: "1216224427",
        vimeoHash: null,
      },
      {
        brand: "Adidas",
        project: "US Soccer Foundation",
        vimeoId: "1216219783",
        vimeoHash: null,
      },
      {
        brand: "Ministerio de Igualdad",
        project: "",
        vimeoId: "1219730449",
        vimeoHash: null,
      },
      {
        brand: "Meet Cycle by Freda",
        project: "",
        vimeoId: "1216219782",
        vimeoHash: null,
      },
    ],
  },
  {
    name: "Matías Malet",
    slug: "matias-malet",
    order: 4,
    previewImageUrl: null,
    credits: [
      {
        brand: "Bravas",
        project: "Trailer",
        vimeoId: "1219033818",
        vimeoHash: null,
      },
      {
        brand: "No corre el Viento",
        project: "Trailer",
        vimeoId: "1068970618",
        vimeoHash: null,
      },
      {
        brand: "Cinepolis",
        project: "Skywalker",
        vimeoId: "1002118478",
        vimeoHash: null,
      },
    ],
  },
  {
    name: "Sage Bennett",
    slug: "sage-bennett",
    order: 5,
    previewImageUrl: null,
    credits: [
      {
        brand: "Placebo",
        project: "Trailer",
        vimeoId: "1219748230",
        vimeoHash: null,
      },
      {
        brand: "Earth is for lovers",
        project: "Trailer",
        vimeoId: "1219073780",
        vimeoHash: null,
      },
      {
        brand: "Grandma kitty's Ping Pong",
        project: "Trailer",
        vimeoId: "1219073811",
        vimeoHash: null,
      },
      {
        brand: "Jim Beam",
        project: "",
        vimeoId: "1219073813",
        vimeoHash: null,
      },
      {
        brand: "b:oost",
        project: "",
        vimeoId: "1219073783",
        vimeoHash: null,
      },
      {
        brand: "Dior",
        project: "",
        vimeoId: "1219073784",
        vimeoHash: null,
      },
    ],
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
