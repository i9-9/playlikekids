import Image from "next/image";
import type { ReactNode } from "react";

export type AspectStillProps = {
  src: string;
  alt: string;
  priority?: boolean;
  className?: string;
  aspectClassName?: string;
  sizes?: string;
  overlay?: ReactNode;
};

/**
 * 16:9 still. Server Component — no motion. For shared-element morph, use AspectMedia.
 */
export function AspectStill({
  src,
  alt,
  priority,
  className = "",
  aspectClassName = "aspect-video",
  sizes = "(max-width: 768px) 100vw, 70vw",
  overlay,
}: AspectStillProps) {
  return (
    <div
      className={`relative w-full overflow-hidden bg-foreground/5 ${aspectClassName} ${className}`}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover"
      />
      {overlay}
    </div>
  );
}
