"use client";

import { useState } from "react";
import { flushSync } from "react-dom";
import { AspectMedia } from "@/components/ui/AspectMedia";
import { CreditLabel } from "@/components/ui/CreditLabel";
import { SundanceLockup } from "@/components/ui/SundanceLockup";
import { formatCreditLabel } from "@/lib/credits";
import type { ResolvedFilm } from "@/lib/directors/resolve-media";

export type DirectorProfileData = {
  slug: string;
  name: string;
  films: ResolvedFilm[];
};

type DirectorProfileProps = {
  director: DirectorProfileData;
};

function filmOverlay(film: ResolvedFilm) {
  return /sundance/i.test(film.festival?.name ?? "") ? (
    <SundanceLockup />
  ) : null;
}

function FilmTile({
  directorName,
  film,
  onPlay,
}: {
  directorName: string;
  film: ResolvedFilm;
  onPlay?: () => void;
}) {
  const title = `${directorName} — ${formatCreditLabel(film)}`;
  const overlay = filmOverlay(film);

  const media = film.thumbnailUrl ? (
    <AspectMedia
      kind="image"
      src={film.thumbnailUrl}
      alt={title}
      overlay={overlay}
      sizes="(max-width: 768px) 100vw, 22vw"
    />
  ) : (
    <div className="aspect-video w-full bg-foreground/10" aria-hidden />
  );

  const label = (
    <p className="min-w-0 font-roboto text-credit font-medium uppercase leading-snug tracking-[0.2em]">
      <CreditLabel credit={film} showFestival />
    </p>
  );

  if (!onPlay) {
    return (
      <article className="flex min-w-0 flex-col gap-2">
        {media}
        {label}
      </article>
    );
  }

  return (
    <button
      type="button"
      onClick={onPlay}
      className="group flex min-w-0 w-full flex-col gap-2 text-left"
    >
      {media}
      {label}
    </button>
  );
}

export function DirectorProfile({ director }: DirectorProfileProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const films = director.films;
  const active = films[activeIndex] ?? null;

  const selectFilm = (index: number) => {
    flushSync(() => {
      setActiveIndex(index);
      setPlaying(true);
    });
  };

  const title = active
    ? `${director.name} — ${formatCreditLabel(active)}`
    : director.name;

  return (
    <>
      <div
        key={director.slug}
        className="director-profile-credits flex flex-col gap-[var(--credit-name-gap)]"
      >
        <h1 className="min-w-0 w-full font-roboto text-director-name font-medium uppercase leading-none tracking-normal md:w-[var(--list-indent)] md:font-normal">
          {playing ? (
            <button
              type="button"
              onClick={() => setPlaying(false)}
              className="block w-full text-center uppercase tracking-inherit transition-opacity duration-200 ease-[cubic-bezier(0.76,0,0.24,1)] hover:opacity-70 motion-reduce:duration-0 md:text-right"
              aria-label={`Back to ${director.name} films`}
            >
              {director.name}
            </button>
          ) : (
            <span className="block w-full text-center md:text-right">
              {director.name}
            </span>
          )}
        </h1>
        {playing && films.length > 0 ? (
          <ul className="flex w-full flex-col items-end gap-[var(--credit-row-gap)] font-roboto text-credit uppercase leading-none tracking-[0.2em] md:w-[var(--axis-credits-box)]">
            {films.map((film, index) => {
              const selected = index === activeIndex;
              const canPlay = Boolean(film.videoId);

              return (
                <li key={`${film.brand}-${film.project}-${index}`}>
                  {canPlay ? (
                    <button
                      type="button"
                      onClick={() => selectFilm(index)}
                      aria-current={selected ? "true" : undefined}
                      aria-pressed={selected}
                      className={`text-right uppercase tracking-[0.2em] transition-opacity duration-200 ease-[cubic-bezier(0.76,0,0.24,1)] motion-reduce:duration-0 ${
                        selected
                          ? "font-black"
                          : "font-medium opacity-45 hover:opacity-100"
                      }`}
                    >
                      <CreditLabel credit={film} showFestival />
                    </button>
                  ) : (
                    <span className={`text-right ${selected ? "font-black" : "font-medium opacity-45"}`}>
                      <CreditLabel credit={film} showFestival />
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>

      {playing && active?.thumbnailUrl && active.videoId ? (
        <div className="director-profile-player min-w-0">
          <AspectMedia
            key={active.videoId}
            kind="vimeo"
            videoId={active.videoId}
            privacyHash={active.vimeoHash}
            thumbnailUrl={active.thumbnailUrl}
            title={title}
            autoplay
            playable
            overlay={filmOverlay(active)}
            sizes="(max-width: 768px) 100vw, 70vw"
          />
        </div>
      ) : films.length > 0 ? (
        <ul className="director-profile-player grid min-w-0 grid-cols-1 gap-4 md:grid-cols-3">
          {films.map((film, index) => (
            <li
              key={`${film.brand}-${film.project}-${index}`}
            >
              <FilmTile
                directorName={director.name}
                film={film}
                onPlay={film.videoId ? () => selectFilm(index) : undefined}
              />
            </li>
          ))}
        </ul>
      ) : (
        <div className="director-profile-player min-w-0" />
      )}
    </>
  );
}
