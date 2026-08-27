"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState, type ReactNode } from "react";
import { PlayMark } from "@/components/ui/PlayMark";
import { toVimeoEmbedUrl } from "@/lib/vimeo/thumbnail";

type AspectMediaImage = {
  kind: "image";
  src: string;
  alt: string;
  priority?: boolean;
};

type AspectMediaVimeo = {
  kind: "vimeo";
  videoId: string;
  privacyHash?: string | null;
  thumbnailUrl: string;
  title?: string;
  /** When true, start the Vimeo player immediately. */
  autoplay?: boolean;
  /** Click the poster to start playback. Ignored when autoplay is true. */
  playable?: boolean;
};

export type AspectMediaProps = (AspectMediaImage | AspectMediaVimeo) & {
  className?: string;
  aspectClassName?: string;
  /** Poster overlay (hidden while a Vimeo player is running). */
  overlay?: ReactNode;
};

/**
 * Consistent aspect-ratio media for images or Vimeo.
 * Thumbnail URLs and video IDs must be resolved by the caller (Server Components).
 */
export function AspectMedia(props: AspectMediaProps) {
  const aspect = props.aspectClassName ?? "aspect-video";
  const frameClassName = `relative w-full overflow-hidden bg-foreground/5 ${aspect} ${props.className ?? ""}`;

  if (props.kind === "image") {
    return (
      <div className={frameClassName}>
        <Image
          src={props.src}
          alt={props.alt}
          fill
          sizes="(max-width: 768px) 100vw, 70vw"
          priority={props.priority}
          className="object-cover"
        />
        {props.overlay}
      </div>
    );
  }

  return (
    <VimeoFrame
      videoId={props.videoId}
      privacyHash={props.privacyHash}
      thumbnailUrl={props.thumbnailUrl}
      title={props.title}
      autoplay={props.autoplay}
      playable={props.playable}
      overlay={props.overlay}
      frameClassName={frameClassName}
    />
  );
}

function VimeoFrame({
  videoId,
  privacyHash,
  thumbnailUrl,
  title,
  autoplay = false,
  playable = false,
  overlay,
  frameClassName,
}: {
  videoId: string;
  privacyHash?: string | null;
  thumbnailUrl: string;
  title?: string;
  autoplay?: boolean;
  playable?: boolean;
  overlay?: ReactNode;
  frameClassName: string;
}) {
  const reduced = useReducedMotion();
  const fadeDuration = reduced ? 0 : 0.28;
  const posterHoldMs = reduced ? 0 : 200;
  const [playing, setPlaying] = useState(autoplay);
  const [posterVisible, setPosterVisible] = useState(true);
  const [leaving, setLeaving] = useState(false);
  const label = title ?? "Vimeo reel";
  const canClickToPlay = playable && !playing;

  useEffect(() => {
    setPlaying(autoplay);
    setLeaving(false);
  }, [autoplay, videoId]);

  useEffect(() => {
    if (!leaving) return;

    const id = window.setTimeout(() => {
      setPlaying(true);
    }, 160);

    return () => window.clearTimeout(id);
  }, [leaving]);

  useEffect(() => {
    setPosterVisible(true);
    if (!playing) return;

    const id = window.setTimeout(() => {
      setPosterVisible(false);
    }, posterHoldMs);

    return () => window.clearTimeout(id);
  }, [playing, videoId, posterHoldMs]);

  const poster = (
    <AnimatePresence mode="sync" initial={false}>
      {posterVisible ? (
        <motion.div
          key={videoId || thumbnailUrl}
          className="pointer-events-none absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: fadeDuration,
            ease: [0.76, 0, 0.24, 1],
          }}
        >
          <Image
            src={thumbnailUrl}
            alt={label}
            fill
            sizes="(max-width: 768px) 100vw, 70vw"
            className="object-cover"
            unoptimized
          />
          {!playing ? (
            <PlayMark
              className={`transition-[transform,opacity] duration-[160ms] ease-[cubic-bezier(0.76,0,0.24,1)] ${
                leaving ? "scale-[0.92] opacity-0" : ""
              }`}
            />
          ) : null}
          {overlay}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );

  if (canClickToPlay) {
    return (
      <button
        type="button"
        onClick={() => {
          if (leaving) return;
          if (reduced) {
            setPlaying(true);
            return;
          }
          setLeaving(true);
        }}
        className={`${frameClassName} cursor-pointer text-left`}
        aria-label={`Play ${label}`}
      >
        {poster}
      </button>
    );
  }

  return (
    <div className={frameClassName}>
      {playing ? (
        <iframe
          key={videoId}
          src={toVimeoEmbedUrl(videoId, privacyHash, { autoplay: true })}
          title={label}
          className="absolute inset-0 h-full w-full border-0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      ) : null}
      {poster}
    </div>
  );
}
