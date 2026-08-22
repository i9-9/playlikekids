import Image from "next/image";

type AspectMediaImage = {
  kind: "image";
  src: string;
  alt: string;
  priority?: boolean;
};

type AspectMediaVimeo = {
  kind: "vimeo";
  videoId: string;
  thumbnailUrl: string;
  title?: string;
  /** When true, render the Vimeo player iframe instead of the poster. */
  autoplay?: boolean;
};

export type AspectMediaProps = (AspectMediaImage | AspectMediaVimeo) & {
  className?: string;
  aspectClassName?: string;
};

/**
 * Consistent aspect-ratio media for images or Vimeo.
 * Thumbnail URLs and video IDs must be resolved by the caller (Server Components).
 *
 * TODO: Confirm whether the Vimeo folder allows public embed (domain whitelist)
 * or remains restricted — embed may fail until the client configures player privacy.
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

  if (props.autoplay) {
    return (
      <div className={frameClassName}>
        <iframe
          src={`https://player.vimeo.com/video/${props.videoId}?autoplay=1&title=0&byline=0&portrait=0`}
          title={props.title ?? "Vimeo reel"}
          className="absolute inset-0 h-full w-full border-0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <div className={frameClassName}>
      <Image
        src={props.thumbnailUrl}
        alt={props.title ?? "Vimeo thumbnail"}
        fill
        sizes="(max-width: 768px) 100vw, 70vw"
        className="object-cover"
        unoptimized
      />
    </div>
  );
}
