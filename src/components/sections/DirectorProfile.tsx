"use client";

import { useState } from "react";
import { AspectMedia } from "@/components/ui/AspectMedia";
import { CreditLabel } from "@/components/ui/CreditLabel";
import { formatCreditLabel } from "@/lib/credits";
import type { ResolvedFilm } from "@/lib/directors/resolve-media";

export type DirectorProfileData = {
  name: string;
  films: ResolvedFilm[];
  fallbackThumbnailUrl: string | null;
};

type DirectorProfileProps = {
  director: DirectorProfileData;
};

export function DirectorProfile({
  director,
}: DirectorProfileProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [playing, setPlaying] = useState(false);

  const films = director.films;
  const active = films[activeIndex] ?? null;
  const videoId = active?.videoId ?? null;
  const thumbnailUrl =
    active?.thumbnailUrl ?? director.fallbackThumbnailUrl;
  const privacyHash = active?.vimeoHash ?? null;
  const title = active
    ? `${director.name} — ${formatCreditLabel(active)}`
    : director.name;

  const media =
    thumbnailUrl && videoId ? (
      <AspectMedia
        key={videoId}
        kind="vimeo"
        videoId={videoId}
        privacyHash={privacyHash}
        thumbnailUrl={thumbnailUrl}
        title={title}
        autoplay={playing}
        playable
      />
    ) : thumbnailUrl ? (
      <AspectMedia
        kind="image"
        src={thumbnailUrl}
        alt={director.name}
        priority
      />
    ) : (
      <div className="aspect-video w-full bg-foreground/10" aria-hidden />
    );

  return (
    <>
      <div className="director-profile-credits mt-6 flex flex-col gap-[var(--credit-row-gap)] md:mt-0">
        <h1 className="min-w-0 font-roboto text-director-name font-normal uppercase leading-none tracking-normal md:w-[var(--list-indent)] md:text-right">
          {director.name}
        </h1>
        <ul className="flex w-full flex-col items-start gap-[var(--credit-row-gap)] font-roboto text-credit font-normal uppercase leading-none tracking-[0.2em] md:w-[var(--axis-credits-box)] md:items-end">
          {films.map((film, index) => {
            const selected = index === activeIndex;
            const canPlay = Boolean(film.videoId);

            return (
              <li key={`${film.brand}-${film.project}-${index}`}>
                {canPlay ? (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveIndex(index);
                      setPlaying(true);
                    }}
                    aria-pressed={selected}
                    className={`text-left uppercase tracking-[0.2em] md:text-right ${
                      selected
                        ? "text-foreground"
                        : "text-foreground/45 hover:text-foreground"
                    }`}
                  >
                    <CreditLabel credit={film} />
                  </button>
                ) : (
                  <span>
                    <CreditLabel credit={film} />
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      <div className="director-profile-player mt-6 min-h-0 min-w-0 md:mt-0">
        {media}
      </div>
    </>
  );
}
