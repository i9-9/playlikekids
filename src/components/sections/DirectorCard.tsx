import Link from "next/link";
import { AspectMedia } from "@/components/ui/AspectMedia";
import { formatCreditLabel } from "@/lib/credits";
import type { Credit } from "@/lib/sanity/types";

export type DirectorCardData = {
  name: string;
  slug: string;
  order: number;
  credits: Credit[];
  thumbnailUrl: string | null;
  videoId: string | null;
};

type DirectorCardProps = {
  director: DirectorCardData;
  className?: string;
};

export function DirectorCard({ director, className = "" }: DirectorCardProps) {
  const primaryCredit = director.credits[0];
  const creditLabel = primaryCredit
    ? formatCreditLabel(primaryCredit)
    : undefined;

  return (
    <article className={`flex min-w-0 flex-col gap-2 ${className}`}>
      <Link href={`/directors/${director.slug}`} className="block">
        {director.thumbnailUrl && director.videoId ? (
          <AspectMedia
            kind="vimeo"
            videoId={director.videoId}
            thumbnailUrl={director.thumbnailUrl}
            title={director.name}
          />
        ) : director.thumbnailUrl ? (
          <AspectMedia
            kind="image"
            src={director.thumbnailUrl}
            alt={director.name}
          />
        ) : (
          <div className="aspect-video w-full bg-foreground/10" aria-hidden />
        )}
      </Link>

      <div className="font-roboto text-card-title uppercase leading-snug tracking-wide">
        <Link href={`/directors/${director.slug}`} className="font-bold">
          {director.name}
        </Link>
        {creditLabel ? (
          <p className="mt-0.5 font-normal text-muted">{creditLabel}</p>
        ) : null}
      </div>
    </article>
  );
}
