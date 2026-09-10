"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { HeroImage } from "@/lib/sanity/types";

type HomeHeroProps = {
  images: HeroImage[];
  /** Milliseconds each frame stays visible before the next cut. */
  intervalMs?: number;
  className?: string;
};

/** Hard cut dwell — no crossfade overlap. */
const DEFAULT_INTERVAL_MS = 2200;
/** Full-bleed stills; default next/image q=75 looks soft at 100vw. */
const HERO_IMAGE_QUALITY = 90;

/**
 * Full-bleed hero that auto-cycles film stills with a hard cut.
 */
export function HomeHero({
  images,
  intervalMs = DEFAULT_INTERVAL_MS,
  className = "",
}: HomeHeroProps) {
  const frames = images;
  const [index, setIndex] = useState(0);

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
      {frames.map((frame, frameIndex) => (
        <div
          key={frame.url}
          className="absolute inset-0"
          style={{
            visibility: frameIndex === index ? "visible" : "hidden",
          }}
          aria-hidden={frameIndex !== index}
        >
          <Image
            src={frame.url}
            alt={frame.alt}
            fill
            priority={frameIndex === 0}
            sizes="100vw"
            quality={HERO_IMAGE_QUALITY}
            className="object-cover"
          />
        </div>
      ))}
    </div>
  );
}
