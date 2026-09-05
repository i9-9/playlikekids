"use client";

import Image from "next/image";
import { motion, type Transition } from "motion/react";
import type { ReactNode } from "react";

export type AspectMediaProps = {
  src: string;
  alt: string;
  priority?: boolean;
  className?: string;
  aspectClassName?: string;
  sizes?: string;
  /** Drawn on the poster, inside the 16:9 frame. */
  overlay?: ReactNode;
  /** Shared-element id for thumbnail → player morph. */
  layoutId?: string;
  layout?: boolean;
  layoutTransition?: Transition;
  onLayoutAnimationComplete?: () => void;
};

/**
 * Consistent 16:9 still. Thumbnail URLs must be resolved by the caller.
 */
export function AspectMedia(props: AspectMediaProps) {
  const aspect = props.aspectClassName ?? "aspect-video";
  const sizes = props.sizes ?? "(max-width: 768px) 100vw, 70vw";
  const frameClassName = `relative w-full overflow-hidden bg-foreground/5 ${aspect} ${props.className ?? ""}`;

  const image = (
    <>
      <Image
        src={props.src}
        alt={props.alt}
        fill
        sizes={sizes}
        priority={props.priority}
        fetchPriority={props.priority ? "high" : undefined}
        className="object-cover"
      />
      {props.overlay}
    </>
  );

  if (!props.layoutId) {
    return <div className={frameClassName}>{image}</div>;
  }

  return (
    <motion.div
      layout={props.layout}
      layoutId={props.layoutId}
      className={`${frameClassName} z-10`}
      style={{ zIndex: 10 }}
      transition={props.layoutTransition}
      onLayoutAnimationComplete={props.onLayoutAnimationComplete}
    >
      {image}
    </motion.div>
  );
}
