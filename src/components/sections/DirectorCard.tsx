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
    <article className={`min-w-0 ${className}`}>
      <Link
        href={`/directors/${director.slug}`}
        className="link-poster group flex flex-col gap-2"
      >
        <div className="relative">
          {director.thumbnailUrl ? (
            <AspectMedia
              kind="image"
              src={director.thumbnailUrl}
              alt={`${director.name}${primaryCredit ? ` — ${primaryCredit.brand} ${primaryCredit.project}` : ""}`}
            />
          ) : (
            <div className="aspect-video w-full overflow-hidden bg-foreground/10" aria-hidden />
          )}
          {director.videoId ? (
            <PlayMark className="transition-transform duration-200 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100" />
          ) : null}
        </div>

        <div className="min-w-0 font-roboto text-card-title font-medium uppercase leading-snug tracking-wide">
          <span className="font-medium transition-opacity ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:opacity-70">
            {director.name}
          </span>
          {primaryCredit ? (
            <p className="mt-0.5 font-medium">
              <CreditLabel credit={primaryCredit} />
            </p>
          ) : null}
        </div>
      </Link>
    </article>
  );
}
