import type { Metadata } from "next";
import { cookies } from "next/headers";
import { HomeHero } from "@/components/sections/HomeHero";
import { UnderConstruction } from "@/components/sections/UnderConstruction";
import { resolveHomeHeroImages } from "@/lib/directors/resolve-media";
import { getAllDirectors } from "@/lib/sanity/queries";
import {
  SITE_PREVIEW_COOKIE,
  isUnderConstruction,
  shouldGatePublicSite,
} from "@/lib/site-mode";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: {
    absolute: SITE_NAME,
  },
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: "/",
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
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: ["/ASSETS/LOGO_PNG/logo-tierra.png"],
  },
};

export default async function HomePage() {
  if (
    isUnderConstruction() &&
    shouldGatePublicSite((await cookies()).get(SITE_PREVIEW_COOKIE)?.value)
  ) {
    return <UnderConstruction />;
  }

  const directors = await getAllDirectors();
  const images = await resolveHomeHeroImages(directors);

  return (
    <>
      <h1 className="sr-only">{SITE_NAME}</h1>
      <HomeHero images={images} />
    </>
  );
}
