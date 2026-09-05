"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { useEffect, useState, type ComponentType } from "react";
import type { VideoPlayerProps } from "@/components/ui/VideoPlayer";

type VideoPlayerComponent = ComponentType<VideoPlayerProps>;

let cachedVideoPlayer: VideoPlayerComponent | null = null;

export function prefetchVideoPlayer() {
  if (cachedVideoPlayer) return;
  void import("@/components/ui/VideoPlayer").then((mod) => {
    cachedVideoPlayer = mod.VideoPlayer;
  });
}

/** Loads VideoPlayer on demand so the directors grid never ships the Vimeo SDK. */
export function LazyVideoPlayer(props: VideoPlayerProps) {
  const [Player, setPlayer] = useState<VideoPlayerComponent | null>(
    () => cachedVideoPlayer,
  );

  useEffect(() => {
    if (Player) return;
    void import("@/components/ui/VideoPlayer").then((mod) => {
      cachedVideoPlayer = mod.VideoPlayer;
      setPlayer(() => mod.VideoPlayer);
    });
  }, [Player]);

  if (!Player) {
    return (
      <motion.div
        layoutId={props.layoutId}
        className={`${props.className} z-10`}
        style={{ zIndex: 10 }}
        transition={props.layoutTransition}
        onLayoutAnimationComplete={props.onLayoutAnimationComplete}
      >
        <Image
          src={props.thumbnailUrl}
          alt={props.title ?? ""}
          fill
          sizes={props.sizes}
          quality={90}
          className="object-cover"
        />
        {props.overlay}
      </motion.div>
    );
  }

  return <Player {...props} />;
}
