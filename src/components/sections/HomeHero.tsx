"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import type { HeroImage } from "@/lib/sanity/types";

type HomeHeroProps = {
  images: HeroImage[];
  /** Milliseconds each frame stays fully visible before crossfade. */
  intervalMs?: number;
  className?: string;
};

const FADE_DURATION_S = 1.1;
const INTRO_DURATION_S = 0.8;

/**
 * Full-bleed hero that auto-cycles three frames with a crossfade loop.
 * Animation is intentional here (core home experience); other motion stays deferred.
 */
export function HomeHero({
  images,
  intervalMs = 4200,
  className = "",
}: HomeHeroProps) {
  const frames = images.slice(0, 3);
  const [index, setIndex] = useState(0);
  const [intro, setIntro] = useState(true);

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

  // No content images yet — solid plane only (ref-design PNGs are not used here).
  if (frames.length === 0) {
    return (
      <div
        className={`absolute inset-0 bg-foreground ${className}`}
        aria-hidden
      />
    );
  }

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      <AnimatePresence mode="sync">
        <motion.div
          key={frames[index]?.url ?? index}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: intro ? INTRO_DURATION_S : FADE_DURATION_S,
            ease: "easeInOut",
          }}
        >
          <Image
            src={frames[index].url}
            alt={frames[index].alt}
            fill
            priority={index === 0}
            sizes="100vw"
            className="object-cover"
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
