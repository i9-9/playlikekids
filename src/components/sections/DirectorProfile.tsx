"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { AspectMedia } from "@/components/ui/AspectMedia";
import { CreditLabel } from "@/components/ui/CreditLabel";
import { formatCreditLabel } from "@/lib/credits";
import type { ResolvedFilm } from "@/lib/directors/resolve-media";

export type DirectorProfileData = {
  slug: string;
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

  const reduced = useReducedMotion();
  const fadeDuration = reduced ? 0 : 0.28;
  const films = director.films;
  const active = films[activeIndex] ?? null;
  const videoId = active?.videoId ?? null;
  const thumbnailUrl =
    active?.thumbnailUrl ?? director.fallbackThumbnailUrl;
  const privacyHash = active?.vimeoHash ?? null;
  const title = active
    ? `${director.name} — ${formatCreditLabel(active)}`
    : director.name;
  const posterKey = videoId ?? thumbnailUrl ?? "empty";
  const fadeTransition = {
    duration: fadeDuration,
    ease: [0.76, 0, 0.24, 1] as const,
  };

  const selectFilm = (index: number, play: boolean) => {
    setActiveIndex(index);
    setPlaying(play);
  };

  const media =
    thumbnailUrl && videoId ? (
      <AspectMedia
        kind="vimeo"
        videoId={videoId}
        privacyHash={privacyHash}
        thumbnailUrl={thumbnailUrl}
        title={title}
        autoplay={playing}
        playable
      />
    ) : thumbnailUrl ? (
      <AnimatePresence mode="sync" initial={false}>
        <motion.div
          key={posterKey}
          className="relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={fadeTransition}
        >
          <AspectMedia
            kind="image"
            src={thumbnailUrl}
            alt={director.name}
            priority
          />
        </motion.div>
      </AnimatePresence>
    ) : (
      <div className="aspect-video w-full bg-foreground/10" aria-hidden />
    );

  return (
    <>
      <motion.div
        key={director.slug}
        className="director-profile-credits flex flex-col gap-[var(--credit-name-gap)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={fadeTransition}
      >
        <h1 className="min-w-0 w-full text-center font-roboto text-director-name font-medium uppercase leading-none tracking-normal md:w-[var(--list-indent)] md:text-right md:font-normal">
          {director.name}
        </h1>
        {films.length > 0 ? (
          <ul className="flex w-full flex-col items-end gap-[var(--credit-row-gap)] font-roboto text-credit font-medium uppercase leading-none tracking-[0.2em] md:w-[var(--axis-credits-box)]">
            {films.map((film, index) => {
              const selected = index === activeIndex;
              const canPlay = Boolean(film.videoId);

              return (
                <li key={`${film.brand}-${film.project}-${index}`}>
                  {canPlay ? (
                    <button
                      type="button"
                      onClick={() => selectFilm(index, true)}
                      aria-pressed={selected}
                      className={`text-right uppercase tracking-[0.2em] transition-[color,font-weight] duration-200 ease-[cubic-bezier(0.76,0,0.24,1)] motion-reduce:duration-0 ${
                        selected
                          ? "font-bold text-foreground"
                          : "font-medium text-foreground/45 hover:text-foreground"
                      }`}
                    >
                      <CreditLabel credit={film} showFestival />
                    </button>
                  ) : (
                    <span className="text-right">
                      <CreditLabel credit={film} showFestival />
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        ) : null}
      </motion.div>

      <div className="director-profile-player min-w-0 md:min-h-0">
        {media}
      </div>
    </>
  );
}
