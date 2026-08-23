import Link from "next/link";
import { AspectMedia } from "@/components/ui/AspectMedia";
import { CreditLabel } from "@/components/ui/CreditLabel";
import { PlayMark } from "@/components/ui/PlayMark";
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

  return (
    <article className={`flex min-w-0 flex-col gap-2 ${className}`}>
      <Link href={`/directors/${director.slug}`} className="relative block">
        {director.thumbnailUrl ? (
          <AspectMedia
            kind="image"
            src={director.thumbnailUrl}
            alt={director.name}
          />
        ) : (
          <div className="aspect-video w-full bg-foreground/10" aria-hidden />
        )}
        {director.videoId ? <PlayMark /> : null}
      </Link>

      <div className="font-roboto text-card-title font-medium uppercase leading-snug tracking-wide">
        <Link href={`/directors/${director.slug}`} className="font-medium">
          {director.name}
        </Link>
        {primaryCredit ? (
          <p className="mt-0.5 font-medium">
            <CreditLabel credit={primaryCredit} />
          </p>
        ) : null}
      </div>
    </article>
  );
}
