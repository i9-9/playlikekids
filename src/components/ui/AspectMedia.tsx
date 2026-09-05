"use client";

import Image from "next/image";
import { motion, type Transition } from "motion/react";
import type { ReactNode } from "react";
import { VideoPlayer } from "@/components/ui/VideoPlayer";

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
  /** When true, start the player immediately. */
  autoplay?: boolean;
  /** Click the poster to start playback. Ignored when autoplay is true. */
  playable?: boolean;
};

export type AspectMediaProps = (AspectMediaImage | AspectMediaVimeo) & {
  className?: string;
  aspectClassName?: string;
  sizes?: string;
  /** Drawn on the poster, inside the 16:9 frame. Hidden once playback starts. */
  overlay?: ReactNode;
  /** Shared-element id for thumbnail → player morph. */
  layoutId?: string;
  layoutTransition?: Transition;
  onLayoutAnimationComplete?: () => void;
};

/**
 * Consistent aspect-ratio media for images or Vimeo.
 * Thumbnail URLs and video IDs must be resolved by the caller (Server Components).
 */
export function AspectMedia(props: AspectMediaProps) {
  const aspect = props.aspectClassName ?? "aspect-video";
  const sizes = props.sizes ?? "(max-width: 768px) 100vw, 70vw";
  const frameClassName = `relative w-full overflow-hidden bg-foreground/5 ${aspect} ${props.className ?? ""}`;

  if (props.kind === "image") {
    const image = (
      <>
        <Image
          src={props.src}
          alt={props.alt}
          fill
          sizes={sizes}
          priority={props.priority}
          className="object-cover"
          unoptimized={props.src.startsWith("https://")}
        />
        {props.overlay}
      </>
    );

    if (!props.layoutId) {
      return <div className={frameClassName}>{image}</div>;
    }

    return (
      <motion.div
        layoutId={props.layoutId}
        className={frameClassName}
        transition={props.layoutTransition}
        onLayoutAnimationComplete={props.onLayoutAnimationComplete}
      >
        {image}
      </motion.div>
    );
  }

  return (
    <VideoPlayer
      videoId={props.videoId}
      privacyHash={props.privacyHash}
      thumbnailUrl={props.thumbnailUrl}
      title={props.title}
      autoplay={props.autoplay}
      playable={props.playable}
      overlay={props.overlay}
      sizes={sizes}
      className={frameClassName}
      layoutId={props.layoutId}
      layoutTransition={props.layoutTransition}
      onLayoutAnimationComplete={props.onLayoutAnimationComplete}
    />
  );
}
