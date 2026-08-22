import { AspectMedia } from "@/components/ui/AspectMedia";
import { formatCreditLabel } from "@/lib/credits";
import type { Credit } from "@/lib/sanity/types";

export type DirectorProfileData = {
  name: string;
  order: number;
  credits: Credit[];
  thumbnailUrl: string | null;
  videoId: string | null;
};

type DirectorProfileProps = {
  director: DirectorProfileData;
  className?: string;
};

export function DirectorProfile({
  director,
  className = "",
}: DirectorProfileProps) {
  const orderLabel = String(director.order).padStart(2, "0");

  return (
    <section
      className={`grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(12rem,0.9fr)_minmax(0,1.6fr)] lg:gap-10 ${className}`}
    >
      <div className="flex flex-col gap-6">
        <div>
          <p className="font-roboto text-meta uppercase tracking-wider">
            {orderLabel}
          </p>
          <h1 className="mt-2 font-druk text-director-name uppercase leading-none tracking-tight">
            {director.name}
          </h1>
        </div>

        <ul className="flex flex-col gap-1 text-right font-roboto text-credit uppercase tracking-wide lg:max-w-sm lg:self-end">
          {director.credits.map((credit) => (
            <li key={`${credit.brand}-${credit.project}`}>
              {formatCreditLabel(credit)}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-2">
        <p className="font-roboto text-meta uppercase tracking-wider lg:text-right">
          Directors
        </p>
        {director.thumbnailUrl && director.videoId ? (
          <AspectMedia
            kind="vimeo"
            videoId={director.videoId}
            thumbnailUrl={director.thumbnailUrl}
            title={`${director.name} reel`}
          />
        ) : director.thumbnailUrl ? (
          <AspectMedia
            kind="image"
            src={director.thumbnailUrl}
            alt={director.name}
            priority
          />
        ) : (
          <div className="aspect-video w-full bg-foreground/10" aria-hidden />
        )}
      </div>
    </section>
  );
}
