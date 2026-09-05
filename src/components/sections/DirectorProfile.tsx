"use client";

import { AnimatePresence, LayoutGroup, motion, useReducedMotion, type Transition } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
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
import {
  CLOSE_DIRECTOR_PLAYER_EVENT,
  useDirectorPlayerChrome,
} from "@/components/sections/director-profile-events";

export type DirectorProfileData = {
  slug: string;
  name: string;
  films: ResolvedFilm[];
};

type DirectorProfileProps = {
  director: DirectorProfileData;
};

const FADE = { duration: 0.36, ease: WIPE_EASE } as const;
/** Starts moving immediately — wipe ease holds too long for a shrink morph. */
const LAYOUT_EASE = [0.22, 0.61, 0.36, 1] as const;
const LAYOUT = { duration: 0.64, ease: LAYOUT_EASE } as const;
const MORPH_FALLBACK_MS = 700;

const TILE_LABEL_CLASS =
  "min-w-0 font-roboto text-credit font-medium uppercase leading-snug tracking-[0.2em]";

function filmOverlay(film: ResolvedFilm) {
  return /sundance/i.test(film.festival?.name ?? "") ? (
    <SundanceLockup />
  ) : null;
}

function FilmTile({
  directorName,
  film,
  layoutId,
  layout,
  layoutTransition,
  onLayoutAnimationComplete,
  onPlay,
  showLabel = true,
  priority = false,
}: {
  directorName: string;
  film: ResolvedFilm;
  layoutId?: string;
  layout?: boolean;
  layoutTransition?: Transition;
  onLayoutAnimationComplete?: () => void;
  onPlay?: () => void;
  showLabel?: boolean;
  priority?: boolean;
}) {
  const title = `${directorName} — ${formatCreditLabel(film)}`;
  const overlay = filmOverlay(film);

  const media = film.thumbnailUrl ? (
    <AspectMedia
      src={film.thumbnailUrl}
      alt={title}
      overlay={overlay}
      sizes="(max-width: 768px) 100vw, 22vw"
      priority={priority}
      layoutId={layoutId}
      layout={layout}
      layoutTransition={layoutTransition}
      onLayoutAnimationComplete={onLayoutAnimationComplete}
    />
  ) : (
    <div className="aspect-video w-full bg-foreground/10" aria-hidden />
  );

  const label = (
    <p
      className={`${TILE_LABEL_CLASS} ${showLabel ? "" : "invisible"}`}
      aria-hidden={!showLabel}
    >
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

function FilmSlotPlaceholder({ film }: { film: ResolvedFilm }) {
  return (
    <li className="pointer-events-none invisible" aria-hidden>
      <div className="flex min-w-0 flex-col gap-2">
        <div className="aspect-video w-full" />
        <p className={TILE_LABEL_CLASS}>
          <CreditLabel credit={film} showFestival />
        </p>
      </div>
    </li>
  );
}

export function DirectorProfile({ director }: DirectorProfileProps) {
  const reduced = useReducedMotion();
  const chrome = useDirectorPlayerChrome();
  const [activeIndex, setActiveIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [closing, setClosing] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);
  const [gridOpen, setGridOpen] = useState(true);
  const films = director.films;
  const active = films[activeIndex] ?? null;

  const instant = Boolean(reduced);
  const fadeTransition = instant ? { duration: 0 } : FADE;
  const layoutTransition = instant ? { duration: 0 } : LAYOUT;
  const inPlayer = playing || closing;

  const ignorePlayerLayout = useRef(false);

  const filmLayoutId = (index: number) =>
    `director-film-${director.slug}-${index}`;

  const finishMorph = useCallback(() => {
    ignorePlayerLayout.current = false;
    setClosing(false);
    setGridOpen(true);
    setPlayerReady(true);
  }, []);

  const onPlayerLayoutComplete = () => {
    if (ignorePlayerLayout.current) return;
    finishMorph();
  };

  const selectFilm = (index: number) => {
    prefetchVideoPlayer();
    const fromGrid = !playing;
    ignorePlayerLayout.current = false;
    setClosing(false);
    setActiveIndex(index);
    setPlaying(true);
    chrome?.setPlayerOpen(true);
    setPlayerReady(instant || !fromGrid);
    if (!instant && fromGrid) setGridOpen(false);
  };

  const closePlayer = useCallback(() => {
    if (!playing) return;
    setPlaying(false);
    chrome?.setPlayerOpen(false);
    setPlayerReady(false);
    if (instant) {
      ignorePlayerLayout.current = false;
      setClosing(false);
      setGridOpen(true);
      return;
    }
    ignorePlayerLayout.current = true;
    setClosing(true);
    setGridOpen(false);
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        ignorePlayerLayout.current = false;
      });
    });
  }, [playing, instant, chrome]);

  useEffect(() => {
    window.addEventListener(CLOSE_DIRECTOR_PLAYER_EVENT, closePlayer);
    return () => {
      window.removeEventListener(CLOSE_DIRECTOR_PLAYER_EVENT, closePlayer);
    };
  }, [closePlayer]);

  useEffect(() => {
    if (!playing || playerReady) return;
    const id = window.setTimeout(
      () => setPlayerReady(true),
      instant ? 0 : MORPH_FALLBACK_MS,
    );
    return () => window.clearTimeout(id);
  }, [playing, playerReady, instant]);

  useEffect(() => {
    if (!closing || instant) return;
    const id = window.setTimeout(finishMorph, MORPH_FALLBACK_MS);
    return () => window.clearTimeout(id);
  }, [closing, instant, finishMorph]);

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
          {inPlayer && films.length > 0 ? (
            <motion.ul
              key="credits"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={
                instant ? fadeTransition : { duration: 0.42, ease: WIPE_EASE }
              }
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
            if (!selected && playing) return null;
            if (!selected && !gridOpen) {
              return (
                <FilmSlotPlaceholder
                  key={`${film.brand}-${film.project}-${index}`}
                  film={film}
                />
              );
            }

            const layoutId = film.thumbnailUrl
              ? filmLayoutId(index)
              : undefined;
            const showPlayer =
              inPlayer &&
              selected &&
              Boolean(film.videoId && film.thumbnailUrl);

            return (
              <motion.li
                key={`${film.brand}-${film.project}-${index}`}
                initial={selected || instant ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={
                  selected || instant
                    ? fadeTransition
                    : { ...FADE, delay: 0.08 }
                }
                className={selected ? "relative z-10" : undefined}
              >
                {showPlayer ? (
                  <LazyVideoPlayer
                    videoId={film.videoId!}
                    privacyHash={film.vimeoHash}
                    thumbnailUrl={film.thumbnailUrl!}
                    title={title}
                    autoplay={playerReady && !closing}
                    playable={!closing}
                    overlay={filmOverlay(film)}
                    sizes="(max-width: 768px) 100vw, 70vw"
                    className="relative w-full overflow-hidden bg-foreground/5 aspect-video"
                    layout
                    retiring={closing}
                    layoutId={layoutId}
                    layoutTransition={layoutTransition}
                    onLayoutAnimationComplete={onPlayerLayoutComplete}
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
                    showLabel={gridOpen}
                    priority={index < 3}
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
