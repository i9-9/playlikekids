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
      <div className="director-profile-credits flex flex-col gap-[var(--credit-name-gap)]">
        <h1 className="min-w-0 pr-[20%] text-right font-roboto text-director-name font-normal uppercase leading-none tracking-normal md:w-[var(--list-indent)] md:pr-0">
          {director.name}
        </h1>
        <ul className="flex w-1/2 flex-col items-end gap-[var(--credit-row-gap)] self-start font-roboto text-credit font-medium uppercase leading-none tracking-[0.2em] md:w-[var(--axis-credits-box)] md:self-auto">
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
                    className={`text-right uppercase tracking-[0.2em] ${
                      selected
                        ? "text-foreground"
                        : "text-foreground/45 hover:text-foreground"
                    }`}
                  >
                    <CreditLabel credit={film} />
                  </button>
                ) : (
                  <span className="text-right">
                    <CreditLabel credit={film} />
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      <div className="director-profile-player min-h-0 min-w-0">
        {media}
      </div>
    </>
  );
}
