import { cookies } from "next/headers";
import { HomeHero } from "@/components/sections/HomeHero";
import { UnderConstruction } from "@/components/sections/UnderConstruction";
import { getHero } from "@/lib/sanity/queries";
import {
  SITE_PREVIEW_COOKIE,
  isUnderConstruction,
  shouldGatePublicSite,
} from "@/lib/site-mode";

export default async function HomePage() {
  if (
    isUnderConstruction() &&
    shouldGatePublicSite((await cookies()).get(SITE_PREVIEW_COOKIE)?.value)
  ) {
    return <UnderConstruction />;
  }

  const hero = await getHero();

  return <HomeHero images={hero.images} />;
}
