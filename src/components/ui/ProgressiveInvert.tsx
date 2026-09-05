"use client";

import { motion, useMotionValue, useMotionValueEvent } from "motion/react";
import {
  useCallback,
  useLayoutEffect,
  useRef,
  type ReactNode,
} from "react";
import {
  usePageTransition,
  type WipeRect,
} from "@/components/ui/PageTransitionWipe";

type ProgressiveInvertProps = {
  className?: string;
  /** Base layer (white on the dark hero). */
  light: ReactNode;
  /** Revealed layer as the white band reaches each pixel (black). */
  dark: ReactNode;
};

function clipFromWipe(el: DOMRect, wipe: WipeRect): string {
  const ix = Math.max(el.left, wipe.left);
  const iy = Math.max(el.top, wipe.top);
  const ir = Math.min(el.right, wipe.right);
  const ib = Math.min(el.bottom, wipe.bottom);

  if (ix >= ir || iy >= ib) {
    return "inset(0 100% 0 0)";
  }

  return `inset(${iy - el.top}px ${el.right - ir}px ${el.bottom - ib}px ${ix - el.left}px)`;
}

/**
 * Reveals `dark` where the white wipe currently covers this element.
 * Footer lockups invert left → right with the band; header items wait
 * until the rise actually reaches them.
 */
export function ProgressiveInvert({
  className = "",
  light,
  dark,
}: ProgressiveInvertProps) {
  const { isWiping, skipBand, wipeProgress, wipeRect } = usePageTransition();
  const active = isWiping && !skipBand;
  const ref = useRef<HTMLSpanElement>(null);
  const clipPath = useMotionValue("inset(0 100% 0 0)");

  const syncClip = useCallback(() => {
    const el = ref.current;
    if (!active || !el) {
      clipPath.set("inset(0 100% 0 0)");
      return;
    }

    clipPath.set(clipFromWipe(el.getBoundingClientRect(), wipeRect.get()));
  }, [active, clipPath, wipeRect]);

  useLayoutEffect(() => {
    syncClip();
    if (!active) return;
    window.addEventListener("resize", syncClip);
    return () => window.removeEventListener("resize", syncClip);
  }, [active, syncClip]);

  useMotionValueEvent(wipeProgress, "change", syncClip);
  useMotionValueEvent(wipeRect, "change", syncClip);

  return (
    <span ref={ref} className={`relative inline-grid max-w-full ${className}`}>
      <span className="col-start-1 row-start-1">{light}</span>
      {active ? (
        <motion.span
          className="col-start-1 row-start-1"
          style={{ clipPath }}
          aria-hidden
        >
          {dark}
        </motion.span>
      ) : null}
    </span>
  );
}
