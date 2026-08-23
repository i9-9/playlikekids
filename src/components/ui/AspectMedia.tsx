"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
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
  frameClassName,
}: {
  videoId: string;
  privacyHash?: string | null;
  thumbnailUrl: string;
  title?: string;
  autoplay?: boolean;
  playable?: boolean;
  frameClassName: string;
}) {
  const [playing, setPlaying] = useState(autoplay);
  const label = title ?? "Vimeo reel";

  useEffect(() => {
    setPlaying(autoplay);
  }, [autoplay, videoId]);

  if (playing) {
    return (
      <div className={frameClassName}>
        <iframe
          key={videoId}
          src={toVimeoEmbedUrl(videoId, privacyHash, { autoplay: true })}
          title={label}
          className="absolute inset-0 h-full w-full border-0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  const poster = (
    <Image
      src={thumbnailUrl}
      alt={label}
      fill
      sizes="(max-width: 768px) 100vw, 70vw"
      className="object-cover"
      unoptimized
    />
  );

  if (!playable) {
    return (
      <div className={frameClassName}>
        {poster}
        <PlayMark />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      className={`${frameClassName} cursor-pointer text-left`}
      aria-label={`Play ${label}`}
    >
      {poster}
      <PlayMark />
    </button>
  );
}
