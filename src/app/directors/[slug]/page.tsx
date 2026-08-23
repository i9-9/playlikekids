import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DirectorProfile } from "@/components/sections/DirectorProfile";
import { NumberedList, NumberedListHeading } from "@/components/ui/NumberedList";
import { resolveDirectorFilms } from "@/lib/directors/resolve-media";
import {
  getAllDirectors,
  getDirectorBySlug,
} from "@/lib/sanity/queries";

type DirectorPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const directors = await getAllDirectors();
  return directors.map((director) => ({ slug: director.slug }));
}

export async function generateMetadata({
  params,
}: DirectorPageProps): Promise<Metadata> {
  const { slug } = await params;
  const director = await getDirectorBySlug(slug);
  if (!director) return { title: "404" };
  return { title: director.name };
}

export default async function DirectorPage({ params }: DirectorPageProps) {
  const { slug } = await params;
  const [director, allDirectors] = await Promise.all([
    getDirectorBySlug(slug),
    getAllDirectors(),
  ]);

  if (!director) {
    notFound();
  }

  const films = await resolveDirectorFilms(director);
  const navItems = allDirectors.map((item) => ({
    number: String(item.order).padStart(2, "0"),
    label: item.name,
    href: `/directors/${item.slug}`,
  }));

  return (
    <main className="director-profile-page director-profile-grid flex min-h-0 flex-1 flex-col pt-8 md:h-full md:overflow-hidden md:pt-12">
      <NumberedListHeading className="director-profile-heading shrink-0" />
      <DirectorProfile
        director={{
          name: director.name,
          films,
          fallbackThumbnailUrl: films[0]?.thumbnailUrl ?? null,
        }}
      />
      <NumberedList
        items={navItems}
        activeHref={`/directors/${director.slug}`}
        className="director-profile-nav relative z-10 mt-auto shrink-0 pt-[var(--profile-list-gap)] md:mt-0"
      />
    </main>
  );
}
