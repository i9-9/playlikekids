"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FooterCenter } from "@/components/sections/FooterSlot";
import type { HeroImage } from "@/lib/sanity/types";

type HomeHeroProps = {
  images: HeroImage[];
  /** Milliseconds each frame stays fully visible before the next transition. */
  intervalMs?: number;
  className?: string;
};

export type HeroTransition = "fade" | "cut" | "wipe";

const FADE_DURATION_S = 1.1;
const INTRO_DURATION_S = 0.8;
const WIPE_DURATION_S = 0.85;
const STORAGE_KEY = "plk-home-slide-transition";
const EASE_SITE = [0.76, 0, 0.24, 1] as const;

const TRANSITION_OPTIONS: { id: HeroTransition; label: string }[] = [
  { id: "fade", label: "Fundido" },
  { id: "cut", label: "Corte" },
  { id: "wipe", label: "Wipe" },
];

function isHeroTransition(value: string | null): value is HeroTransition {
  return value === "fade" || value === "cut" || value === "wipe";
}

/**
 * Full-bleed hero that auto-cycles director first-film posters.
 * Transition is client-selectable (preview) until one is locked in.
 */
export function HomeHero({
  images,
  intervalMs = 4200,
  className = "",
}: HomeHeroProps) {
  const frames = images;
  const [index, setIndex] = useState(0);
  const [intro, setIntro] = useState(true);
  const [transition, setTransition] = useState<HeroTransition>("fade");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isHeroTransition(stored)) setTransition(stored);
  }, []);

  useEffect(() => {
    const id = window.setTimeout(() => setIntro(false), INTRO_DURATION_S * 1000);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (frames.length < 2) return;

    let intervalId: number | undefined;

    const start = () => {
      if (intervalId !== undefined) return;
      intervalId = window.setInterval(() => {
        setIndex((current) => (current + 1) % frames.length);
      }, intervalMs);
    };

    const stop = () => {
      if (intervalId === undefined) return;
      window.clearInterval(intervalId);
      intervalId = undefined;
    };

    const onVisibility = () => {
      if (document.hidden) stop();
      else start();
    };

    if (!document.hidden) start();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [frames.length, intervalMs]);

  const chooseTransition = useCallback((next: HeroTransition) => {
    setTransition(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const picker = useMemo(
    () => (
      <HeroTransitionPicker value={transition} onChange={chooseTransition} />
    ),
    [transition, chooseTransition],
  );

  if (frames.length === 0) {
    return (
      <>
        <FooterCenter>{picker}</FooterCenter>
        <div
          className={`absolute inset-0 bg-foreground ${className}`}
          aria-hidden
        />
      </>
    );
  }

  const frame = frames[index];
  const slide = (
    <Image
      src={frame.url}
      alt={frame.alt}
      fill
      priority={index === 0}
      sizes="100vw"
      className="object-cover"
      unoptimized={frame.url.startsWith("https://")}
    />
  );

  return (
    <>
      <FooterCenter>{picker}</FooterCenter>
      <div
        className={`absolute inset-0 overflow-hidden ${transition === "wipe" ? "bg-foreground" : ""} ${className}`}
      >
        {transition === "cut" ? (
          <div key={frame.url} className="absolute inset-0">
            {slide}
          </div>
        ) : transition === "wipe" ? (
          <WipeTrack frames={frames} index={index} />
        ) : (
          <AnimatePresence mode="sync" initial={false}>
            <motion.div
              key={frame.url}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: intro ? INTRO_DURATION_S : FADE_DURATION_S,
                ease: "easeInOut",
              }}
            >
              {slide}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </>
  );
}

function HeroSlide({
  frame,
  priority = false,
}: {
  frame: HeroImage;
  priority?: boolean;
}) {
  return (
    <Image
      src={frame.url}
      alt={frame.alt}
      fill
      priority={priority}
      sizes="100vw"
      className="object-cover max-w-none"
      unoptimized={frame.url.startsWith("https://")}
    />
  );
}

/** Incoming and outgoing frames travel left together (push wipe). */
function WipeTrack({
  frames,
  index,
}: {
  frames: HeroImage[];
  index: number;
}) {
  const previousIndex = useRef(index);
  const [pair, setPair] = useState({
    from: index,
    to: index,
    sliding: false,
  });

  useEffect(() => {
    if (index === previousIndex.current) return;
    const from = previousIndex.current;
    previousIndex.current = index;
    setPair({ from, to: index, sliding: true });
  }, [index]);

  const current = frames[pair.sliding ? pair.from : pair.to];
  const incoming = frames[pair.to];

  if (!current) return null;

  return (
    <motion.div
      key={pair.sliding ? `${pair.from}-${pair.to}` : `still-${pair.to}`}
      className="absolute inset-0 flex h-full bg-foreground [backface-visibility:hidden]"
      initial={{ x: 0 }}
      animate={{ x: pair.sliding ? "-100%" : 0 }}
      transition={{
        duration: pair.sliding ? WIPE_DURATION_S : 0,
        ease: EASE_SITE,
      }}
      onAnimationComplete={() => {
        if (!pair.sliding) return;
        setPair({ from: pair.to, to: pair.to, sliding: false });
      }}
    >
      <div className="relative h-full w-full shrink-0 overflow-hidden bg-foreground">
        <HeroSlide frame={current} priority={pair.to === 0} />
      </div>
      {pair.sliding && incoming ? (
        <div className="relative h-full w-full shrink-0 overflow-hidden bg-foreground">
          <HeroSlide frame={incoming} />
        </div>
      ) : null}
    </motion.div>
  );
}

function HeroTransitionPicker({
  value,
  onChange,
}: {
  value: HeroTransition;
  onChange: (next: HeroTransition) => void;
}) {
  return (
    <div className="pointer-events-auto flex flex-col items-center gap-1.5 font-roboto text-meta font-bold uppercase leading-none tracking-wide text-background">
      <p className="font-medium tracking-[0.18em] opacity-70">
        Transición · preview
      </p>
      <div
        role="radiogroup"
        aria-label="Transición de las imágenes del home"
        className="flex items-center gap-3"
      >
        {TRANSITION_OPTIONS.map((option) => {
          const selected = option.id === value;
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(option.id)}
              className={`cursor-pointer tracking-wide transition-opacity duration-200 ease-[cubic-bezier(0.76,0,0.24,1)] ${
                selected ? "opacity-100" : "opacity-50 hover:opacity-80"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
