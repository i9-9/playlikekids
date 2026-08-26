import type { Metadata } from "next";
import { DirectorsGrid } from "@/components/sections/DirectorsGrid";
import { toDirectorCards } from "@/lib/directors/resolve-media";
import { getAllDirectors } from "@/lib/sanity/queries";
import { SITE_NAME } from "@/lib/site";

const DIRECTORS_DESCRIPTION =
  "Meet the directors of Play Like Kids — a creative production company in Mexico City producing film, advertising, and branded content.";

export const metadata: Metadata = {
  title: "Directors",
  description: DIRECTORS_DESCRIPTION,
  alternates: {
    canonical: "/directors",
  },
  openGraph: {
    type: "website",
    title: `Directors — ${SITE_NAME}`,
    description: DIRECTORS_DESCRIPTION,
    url: "/directors",
    images: [
      {
        url: "/ASSETS/LOGO_PNG/logo-tierra.png",
        width: 1585,
        height: 776,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `Directors — ${SITE_NAME}`,
    description: DIRECTORS_DESCRIPTION,
    images: ["/ASSETS/LOGO_PNG/logo-tierra.png"],
  },
};

export default async function DirectorsPage() {
  const directors = await getAllDirectors();
  const cards = toDirectorCards(directors);

  return (
    <main className="flex min-h-0 flex-1 flex-col">
      <DirectorsGrid directors={cards} />
    </main>
  );
}
