import type { Metadata } from "next";
import { DirectorsGrid } from "@/components/sections/DirectorsGrid";
import { SiteFooter } from "@/components/sections/SiteFooter";
import { SiteHeader } from "@/components/sections/SiteHeader";
import { toDirectorCards } from "@/lib/directors/resolve-media";
import { getAllDirectors } from "@/lib/sanity/queries";

export const metadata: Metadata = {
  title: "Directors",
};

export default async function DirectorsPage() {
  const directors = await getAllDirectors();
  const cards = await toDirectorCards(directors);

  return (
    <main className="flex min-h-screen flex-col px-gutter py-6 md:py-8">
      <SiteHeader />

      <div className="flex flex-1 flex-col justify-center py-section">
        <DirectorsGrid directors={cards} />
      </div>

      <SiteFooter wipeToDirectors={false} />
    </main>
  );
}
