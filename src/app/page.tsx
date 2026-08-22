import { SiteFooter } from "@/components/sections/SiteFooter";
import { SiteHeader } from "@/components/sections/SiteHeader";
import { HomeHero } from "@/components/sections/HomeHero";
import { getHero } from "@/lib/sanity/queries";

export default async function HomePage() {
  const hero = await getHero();

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden">
      <HomeHero images={hero.images} />

      <div className="relative z-10 flex min-h-screen flex-col justify-between px-gutter py-6 md:py-8">
        <SiteHeader tone="light" />
        <SiteFooter tone="light" wipeToDirectors />
      </div>
    </main>
  );
}
