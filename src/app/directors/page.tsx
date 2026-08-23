import type { Metadata } from "next";
import { DirectorsGrid } from "@/components/sections/DirectorsGrid";
import { toDirectorCards } from "@/lib/directors/resolve-media";
import { getAllDirectors } from "@/lib/sanity/queries";

export const metadata: Metadata = {
  title: "Directors",
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
