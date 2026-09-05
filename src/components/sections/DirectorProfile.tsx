"use client";

import { AnimatePresence, LayoutGroup, motion, useReducedMotion, type Transition } from "motion/react";
import { useEffect, useState } from "react";
import { AspectMedia } from "@/components/ui/AspectMedia";
import {
  LazyVideoPlayer,
  prefetchVideoPlayer,
} from "@/components/ui/LazyVideoPlayer";
import { CreditLabel } from "@/components/ui/CreditLabel";
import { SundanceLockup } from "@/components/ui/SundanceLockup";
import { WIPE_EASE } from "@/components/ui/PageTransitionWipe";
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

const FADE = { duration: 0.28, ease: WIPE_EASE } as const;
const LAYOUT = { duration: 0.5, ease: WIPE_EASE } as const;

function filmOverlay(film: ResolvedFilm) {
  return /sundance/i.test(film.festival?.name ?? "") ? (
    <SundanceLockup />
  ) : null;
}

function FilmTile({
  directorName,
  film,
  layoutId,
  layoutTransition,
  onLayoutAnimationComplete,
  onPlay,
}: {
  directorName: string;
  film: ResolvedFilm;
  layoutId?: string;
  layoutTransition?: Transition;
  onLayoutAnimationComplete?: () => void;
  onPlay?: () => void;
}) {
  const title = `${directorName} — ${formatCreditLabel(film)}`;
  const overlay = filmOverlay(film);

  const media = film.thumbnailUrl ? (
    <AspectMedia
      src={film.thumbnailUrl}
      alt={title}
      overlay={overlay}
      sizes="(max-width: 768px) 100vw, 22vw"
      layoutId={layoutId}
      layoutTransition={layoutTransition}
      onLayoutAnimationComplete={onLayoutAnimationComplete}
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
      onPointerEnter={prefetchVideoPlayer}
      className="group flex min-w-0 w-full flex-col gap-2 text-left"
    >
      {media}
      {label}
    </button>
  );
}

export function DirectorProfile({ director }: DirectorProfileProps) {
  const reduced = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);
  const [gridOpen, setGridOpen] = useState(true);
  const films = director.films;
  const active = films[activeIndex] ?? null;

  const instant = Boolean(reduced);
  const fadeTransition = instant ? { duration: 0 } : FADE;
  const layoutTransition = instant ? { duration: 0 } : LAYOUT;

  const filmLayoutId = (index: number) =>
    `director-film-${director.slug}-${index}`;

  const finishMorph = () => {
    setGridOpen(true);
    setPlayerReady(true);
  };

  const selectFilm = (index: number) => {
    prefetchVideoPlayer();
    const fromGrid = !playing;
    setActiveIndex(index);
    setPlaying(true);
    setPlayerReady(instant || !fromGrid);
    if (!instant && fromGrid) setGridOpen(false);
  };

  const closePlayer = () => {
    setPlaying(false);
    setPlayerReady(false);
    if (!instant) setGridOpen(false);
  };

  useEffect(() => {
    if (!playing || playerReady) return;
    const id = window.setTimeout(() => setPlayerReady(true), instant ? 0 : 520);
    return () => window.clearTimeout(id);
  }, [playing, playerReady, instant]);

  useEffect(() => {
    if (playing || gridOpen || instant) return;
    const id = window.setTimeout(() => setGridOpen(true), 520);
    return () => window.clearTimeout(id);
  }, [playing, gridOpen, instant]);

  const title = active
    ? `${director.name} — ${formatCreditLabel(active)}`
    : director.name;

  return (
    <LayoutGroup id={`director-${director.slug}`}>
      <div
        key={director.slug}
        className="director-profile-credits flex flex-col gap-[var(--credit-name-gap)]"
      >
        <h1 className="min-w-0 w-full font-roboto text-director-name font-medium uppercase leading-none tracking-normal md:w-[var(--list-indent)] md:font-normal">
          {playing ? (
            <button
              type="button"
              onClick={closePlayer}
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
        <AnimatePresence initial={false}>
          {playing && films.length > 0 ? (
            <motion.ul
              key="credits"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={fadeTransition}
              className="flex w-full flex-col items-end gap-[var(--credit-row-gap)] font-roboto text-credit uppercase leading-none tracking-[0.2em] md:w-[var(--axis-credits-box)]"
            >
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
            </motion.ul>
          ) : null}
        </AnimatePresence>
      </div>

      {films.length > 0 ? (
        <ul
          className={`director-profile-player isolate grid min-w-0 grid-cols-1 gap-4 ${
            playing ? "" : "md:grid-cols-3"
          }`}
        >
          {films.map((film, index) => {
            const selected = index === activeIndex;
            if (!selected && (playing || !gridOpen)) return null;

            const layoutId = film.thumbnailUrl
              ? filmLayoutId(index)
              : undefined;
            const showPlayer =
              playing &&
              selected &&
              Boolean(film.videoId && film.thumbnailUrl);

            return (
              <motion.li
                key={`${film.brand}-${film.project}-${index}`}
                initial={false}
                animate={{ opacity: 1 }}
                transition={fadeTransition}
                className={selected ? "relative z-10" : undefined}
              >
                {showPlayer ? (
                  <LazyVideoPlayer
                    videoId={film.videoId!}
                    privacyHash={film.vimeoHash}
                    thumbnailUrl={film.thumbnailUrl!}
                    title={title}
                    autoplay={playerReady}
                    playable
                    overlay={filmOverlay(film)}
                    sizes="(max-width: 768px) 100vw, 70vw"
                    className="relative w-full overflow-hidden bg-foreground/5 aspect-video"
                    layoutId={layoutId}
                    layoutTransition={layoutTransition}
                    onLayoutAnimationComplete={finishMorph}
                  />
                ) : (
                  <FilmTile
                    directorName={director.name}
                    film={film}
                    layoutId={layoutId}
                    layoutTransition={layoutTransition}
                    onLayoutAnimationComplete={
                      selected ? finishMorph : undefined
                    }
                    onPlay={film.videoId ? () => selectFilm(index) : undefined}
                  />
                )}
              </motion.li>
            );
          })}
        </ul>
      ) : (
        <div className="director-profile-player min-w-0" />
      )}
    </LayoutGroup>
  );
}
