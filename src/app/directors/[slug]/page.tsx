import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DirectorProfile } from "@/components/sections/DirectorProfile";
import { DirectorsSidebarNav } from "@/components/sections/DirectorsSidebarNav";
import { SiteFooter } from "@/components/sections/SiteFooter";
import { SiteHeader } from "@/components/sections/SiteHeader";
import { resolveDirectorMedia } from "@/lib/directors/resolve-media";
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
  if (!director) return { title: "Director" };
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

  const media = await resolveDirectorMedia(director);
  const navItems = allDirectors.map((item) => ({
    number: String(item.order).padStart(2, "0"),
    label: item.name,
    href: `/directors/${item.slug}`,
  }));

  return (
    <main className="flex min-h-screen flex-col px-gutter py-6 md:py-8">
      <SiteHeader />

      <div className="flex flex-1 flex-col py-section">
        <DirectorProfile
          director={{
            name: director.name,
            order: director.order,
            credits: director.credits,
            ...media,
          }}
        />
      </div>

      <SiteFooter
        wipeToDirectors={false}
        center={
          <DirectorsSidebarNav
            items={navItems}
            activeHref={`/directors/${director.slug}`}
          />
        }
      />
    </main>
  );
}
