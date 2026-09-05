import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DirectorProfile } from "@/components/sections/DirectorProfile";
import { resolveDirectorFilms } from "@/lib/directors/resolve-media";
import { getAllDirectors, getDirectorBySlug } from "@/lib/sanity/queries";
import { SITE_NAME } from "@/lib/site";

type DirectorPageProps = {
  params: Promise<{ slug: string }>;
};

function directorDescription(name: string): string {
  return `${name} — director at Play Like Kids, a creative production company in Mexico City. Watch selected films and commercials.`;
}

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

  const description = directorDescription(director.name);
  const path = `/directors/${director.slug}`;

  return {
    title: director.name,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      type: "profile",
      title: `${director.name} — ${SITE_NAME}`,
      description,
      url: path,
      images: [
        {
          url: "/ASSETS/LOGO_PNG/logo-tierra.png",
          width: 1585,
          height: 776,
          alt: director.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${director.name} — ${SITE_NAME}`,
      description,
      images: ["/ASSETS/LOGO_PNG/logo-tierra.png"],
    },
  };
}

export default async function DirectorPage({ params }: DirectorPageProps) {
  const { slug } = await params;
  const director = await getDirectorBySlug(slug);

  if (!director) {
    notFound();
  }

  const films = await resolveDirectorFilms(director);

  return (
    <DirectorProfile
      key={director.slug}
      director={{
        slug: director.slug,
        name: director.name,
        films,
      }}
    />
  );
}
