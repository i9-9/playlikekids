"use client";

import {
  motion,
  useMotionValue,
  useReducedMotion,
  type MotionValue,
} from "motion/react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { usePathname, useRouter } from "next/navigation";

export type TransitionAnchor =
  | { kind: "footer"; ref: RefObject<HTMLElement | null> }
  | { kind: "rect"; rect: DOMRectReadOnly };

export type WipeDirection = "forward" | "reverse";

export type WipeOptions = {
  href: string;
  /** Skip the left→right band (invisible on a white page) and rise immediately. */
  skipBand?: boolean;
  /** `reverse` plays rise then band backwards after the destination paints. */
  direction?: WipeDirection;
  anchor: TransitionAnchor;
  /** Override rise duration (e.g. shorter internal navigation). */
  riseDurationMs?: number;
};

export type WipeRect = {
  top: number;
  left: number;
  right: number;
  bottom: number;
};

type PageTransitionContextValue = {
  startWipe: (options: WipeOptions) => void;
  isWiping: boolean;
  /** Destination painted; white cover is dissolving. */
  isRevealing: boolean;
  finishReveal: () => void;
  skipBand: boolean;
  direction: WipeDirection;
  anchor: TransitionAnchor | null;
  bandDurationMs: number;
  riseDurationMs: number;
  /** 0 → 1 with the left-to-right band. Stays at 1 during the rise. */
  wipeProgress: MotionValue<number>;
  /** Viewport box of the white cover (band + rise). */
  wipeRect: MotionValue<WipeRect>;
};

function pathMatches(pathname: string, href: string) {
  const norm = (value: string) => value.replace(/\/+$/, "") || "/";
  return norm(pathname) === norm(href);
}

const EMPTY_WIPE_RECT: WipeRect = { top: 0, left: 0, right: 0, bottom: 0 };

function numericStyle(value: unknown, fallback: number): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

/** Cover box from Motion values — left-origin scaleX, no per-frame DOM measure. */
function publishWipeGeometry(
  latest: Record<string, unknown>,
  fallback: { top: number; height: number; width: number; scaleX: number },
  wipeProgress: MotionValue<number>,
  wipeRect: MotionValue<WipeRect>,
) {
  const scaleX = numericStyle(latest.scaleX, fallback.scaleX);
  const top = numericStyle(latest.top, fallback.top);
  const height = numericStyle(latest.height, fallback.height);
  wipeProgress.set(scaleX);
  wipeRect.set({
    top,
    left: 0,
    right: fallback.width * scaleX,
    bottom: top + height,
  });
}

const PageTransitionContext = createContext<PageTransitionContextValue | null>(
  null,
);

export const BAND_DURATION_MS = 700;
export const RISE_DURATION_MS = 650;
export const REVEAL_DURATION_MS = 480;
export const WIPE_EASE: [number, number, number, number] = [0.76, 0, 0.24, 1];

type PageTransitionProviderProps = {
  children: ReactNode;
};

function dismissWipe(
  destinationRef: { current: string | null },
  didPushRef: { current: boolean },
  setIsWiping: (value: boolean) => void,
  setIsRevealing: (value: boolean) => void,
  setSkipBand: (value: boolean) => void,
  setDirection: (direction: WipeDirection) => void,
  setAnchor: (anchor: TransitionAnchor | null) => void,
  setRiseDurationMs: (ms: number) => void,
) {
  destinationRef.current = null;
  didPushRef.current = false;
  setIsWiping(false);
  setIsRevealing(false);
  setSkipBand(false);
  setDirection("forward");
  setAnchor(null);
  setRiseDurationMs(RISE_DURATION_MS);
}

function readAnchorRect(anchor: TransitionAnchor): DOMRect | null {
  if (anchor.kind === "rect") {
    return anchor.rect;
  }
  return anchor.ref.current?.getBoundingClientRect() ?? null;
}

/**
 * Band geometry from anchor vertical center — extends to viewport bottom.
 * Rise always animates to full viewport height (not tied to card/poster height).
 */
export function bandGeometryFromAnchor(rect: DOMRect): {
  bandTop: number;
  bandHeight: number;
} {
  const center = rect.top + rect.height / 2;
  const half = window.innerHeight - center;
  const bandTop = Math.max(0, center - half);
  const bandHeight = Math.max(0, window.innerHeight - bandTop);
  return { bandTop, bandHeight };
}

/**
 * Owns wipe state + navigation timing (band + rise, then push).
 * Cover stays opaque until the destination route has committed and painted.
 */
export function PageTransitionProvider({
  children,
}: PageTransitionProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const reduced = useReducedMotion();
  const [isWiping, setIsWiping] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);
  const [skipBand, setSkipBand] = useState(false);
  const [direction, setDirection] = useState<WipeDirection>("forward");
  const [anchor, setAnchor] = useState<TransitionAnchor | null>(null);
  const [riseDurationMs, setRiseDurationMs] = useState(RISE_DURATION_MS);
  const wipeProgress = useMotionValue(0);
  const wipeRect = useMotionValue<WipeRect>(EMPTY_WIPE_RECT);
  const destinationRef = useRef<string | null>(null);
  const didPushRef = useRef(false);

  const finishReveal = useCallback(() => {
    dismissWipe(
      destinationRef,
      didPushRef,
      setIsWiping,
      setIsRevealing,
      setSkipBand,
      setDirection,
      setAnchor,
      setRiseDurationMs,
    );
  }, []);

  const startWipe = useCallback(
    ({
      href,
      skipBand: nextSkipBand = false,
      direction: nextDirection = "forward",
      anchor: nextAnchor,
      riseDurationMs: nextRiseDurationMs = RISE_DURATION_MS,
    }: WipeOptions) => {
      if (isWiping) return;
      destinationRef.current = href;
      didPushRef.current = false;
      wipeProgress.set(nextDirection === "reverse" || nextSkipBand ? 1 : 0);
      if (nextDirection === "reverse") {
        wipeRect.set({
          top: 0,
          left: 0,
          right: window.innerWidth,
          bottom: window.innerHeight,
        });
      }
      setSkipBand(nextSkipBand);
      setDirection(nextDirection);
      setAnchor(nextAnchor);
      setRiseDurationMs(nextRiseDurationMs);
      setIsRevealing(false);
      setIsWiping(true);
      router.prefetch(href);
    },
    [isWiping, router],
  );

  useEffect(() => {
    if (!isWiping) {
      wipeProgress.set(0);
      wipeRect.set(EMPTY_WIPE_RECT);
      return;
    }
    if (skipBand || direction === "reverse") {
      wipeProgress.set(1);
    }
    if (direction === "reverse") {
      wipeRect.set({
        top: 0,
        left: 0,
        right: window.innerWidth,
        bottom: window.innerHeight,
      });
    }
  }, [isWiping, skipBand, direction, wipeProgress, wipeRect]);

  useEffect(() => {
    if (!isWiping) return;

    const totalMs =
      direction === "reverse"
        ? 0
        : (skipBand ? 0 : BAND_DURATION_MS) + riseDurationMs;
    const timer = window.setTimeout(() => {
      const href = destinationRef.current;
      if (!href) return;
      didPushRef.current = true;
      router.push(href);
    }, totalMs);

    return () => window.clearTimeout(timer);
  }, [isWiping, skipBand, direction, riseDurationMs, router]);

  useEffect(() => {
    if (!isWiping) return;
    const href = destinationRef.current;
    if (!href || !didPushRef.current) return;
    if (!pathMatches(pathname, href)) return;
    if (reduced) {
      finishReveal();
      return;
    }

    if (direction === "reverse") {
      setIsRevealing(true);
      return;
    }

    let inner = 0;
    const outer = window.requestAnimationFrame(() => {
      inner = window.requestAnimationFrame(() => {
        setIsRevealing(true);
      });
    });

    return () => {
      window.cancelAnimationFrame(outer);
      window.cancelAnimationFrame(inner);
    };
  }, [isWiping, pathname, reduced, direction, finishReveal]);

  useEffect(() => {
    if (!isRevealing) return;
    const timer = window.setTimeout(() => {
      finishReveal();
    }, direction === "reverse"
      ? riseDurationMs + (skipBand ? 0 : BAND_DURATION_MS) + 400
      : REVEAL_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [isRevealing, direction, skipBand, riseDurationMs, finishReveal]);

  useEffect(() => {
    if (!isWiping) return;

    const fallbackMs =
      (skipBand ? 0 : BAND_DURATION_MS) +
      riseDurationMs +
      (direction === "reverse" ? 0 : REVEAL_DURATION_MS) +
      8000;
    const timer = window.setTimeout(() => {
      finishReveal();
    }, fallbackMs);

    return () => window.clearTimeout(timer);
  }, [isWiping, skipBand, direction, riseDurationMs, finishReveal]);

  const value = useMemo(
    () => ({
      startWipe,
      isWiping,
      isRevealing,
      finishReveal,
      skipBand,
      direction,
      anchor,
      bandDurationMs: skipBand ? 0 : BAND_DURATION_MS,
      riseDurationMs,
      wipeProgress,
      wipeRect,
    }),
    [
      isWiping,
      isRevealing,
      finishReveal,
      skipBand,
      direction,
      anchor,
      riseDurationMs,
      startWipe,
      wipeProgress,
      wipeRect,
    ],
  );

  return (
    <PageTransitionContext.Provider value={value}>
      {children}
    </PageTransitionContext.Provider>
  );
}

export function usePageTransition(): PageTransitionContextValue {
  const ctx = useContext(PageTransitionContext);
  if (!ctx) {
    throw new Error(
      "usePageTransition must be used within PageTransitionProvider",
    );
  }
  return ctx;
}

type PageTransitionWipeProps = {
  active: boolean;
  skipBand?: boolean;
  bandDurationMs?: number;
  riseDurationMs?: number;
  anchor: TransitionAnchor | null;
  className?: string;
};

type WipePhase = "band" | "rise";

function coverFrame(viewportHeight: number) {
  return {
    top: 0,
    height: viewportHeight,
    scaleX: 1,
    scaleY: 1,
    opacity: 1,
  };
}

function ReverseBandShrink({
  bandTop,
  bandHeight,
  viewportWidth,
  durationMs,
  className,
  wipeProgress,
  wipeRect,
  onDone,
}: {
  bandTop: number;
  bandHeight: number;
  viewportWidth: number;
  durationMs: number;
  className: string;
  wipeProgress: MotionValue<number>;
  wipeRect: MotionValue<WipeRect>;
  onDone: () => void;
}) {
  const fallback = {
    top: bandTop,
    height: bandHeight,
    width: viewportWidth,
    scaleX: 1,
  };

  return (
    <motion.div
      className={`pointer-events-none fixed left-0 z-0 bg-wipe ${className}`}
      style={{
        top: bandTop,
        height: bandHeight,
        width: "100vw",
        transformOrigin: "left center",
      }}
      initial={{ scaleX: 1 }}
      animate={{ scaleX: 0 }}
      transition={{ duration: durationMs / 1000, ease: WIPE_EASE }}
      onUpdate={(latest) => {
        publishWipeGeometry(
          latest as Record<string, unknown>,
          fallback,
          wipeProgress,
          wipeRect,
        );
      }}
      onAnimationComplete={onDone}
      aria-hidden="true"
    />
  );
}

/**
 * Two-phase transition (z-behind logo / Directors):
 * Forward: band grows left → right, then rises bottom → top to cover.
 * Reverse: full cover falls back to the band, then the band shrinks right → left.
 */
export function PageTransitionWipe({
  active,
  skipBand = false,
  bandDurationMs = BAND_DURATION_MS,
  riseDurationMs = RISE_DURATION_MS,
  anchor,
  className = "",
}: PageTransitionWipeProps) {
  const { wipeProgress, wipeRect, isRevealing, direction, finishReveal } =
    usePageTransition();
  const reverse = direction === "reverse";
  const [phase, setPhase] = useState<WipePhase>(reverse ? "rise" : "band");
  const [bandTop, setBandTop] = useState(0);
  const [bandHeight, setBandHeight] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [viewportWidth, setViewportWidth] = useState(0);

  useLayoutEffect(() => {
    if (!active || !anchor) {
      setPhase("band");
      return;
    }

    if (!reverse && skipBand) setPhase("rise");

    const sync = () => {
      setViewportHeight(window.innerHeight);
      setViewportWidth(window.innerWidth);
      const rect = readAnchorRect(anchor);
      if (!rect) return;
      const { bandTop: top, bandHeight: height } = bandGeometryFromAnchor(rect);
      setBandTop(top);
      setBandHeight(height);
    };

    sync();
    window.addEventListener("resize", sync);
    window.addEventListener("scroll", sync, { passive: true });
    return () => {
      window.removeEventListener("resize", sync);
      window.removeEventListener("scroll", sync);
    };
  }, [active, anchor, skipBand, reverse]);

  const reverseBandTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active) {
      if (reverseBandTimerRef.current != null) {
        window.clearTimeout(reverseBandTimerRef.current);
        reverseBandTimerRef.current = null;
      }
      setPhase("band");
      return;
    }

    if (reverse) {
      if (!isRevealing) {
        setPhase("rise");
        return;
      }
      if (reverseBandTimerRef.current != null) return;
      setPhase("rise");
      reverseBandTimerRef.current = window.setTimeout(() => {
        reverseBandTimerRef.current = null;
        setPhase("band");
      }, riseDurationMs);
      return;
    }

    if (skipBand) {
      setPhase("rise");
      return;
    }

    const toRise = window.setTimeout(() => {
      setPhase("rise");
    }, bandDurationMs);

    return () => window.clearTimeout(toRise);
  }, [active, bandDurationMs, skipBand, reverse, isRevealing, riseDurationMs]);

  const isRise = phase === "rise";
  const uncovering = reverse && isRevealing && bandHeight > 0;
  const cover = coverFrame(viewportHeight || bandHeight);

  if (!active || !anchor) return null;
  if (!reverse && bandHeight <= 0) return null;

  if (reverse && uncovering && !isRise && viewportWidth > 0) {
    return (
      <ReverseBandShrink
        bandTop={bandTop}
        bandHeight={bandHeight}
        viewportWidth={viewportWidth}
        durationMs={bandDurationMs}
        className={className}
        wipeProgress={wipeProgress}
        wipeRect={wipeRect}
        onDone={finishReveal}
      />
    );
  }

  const bandOpen = {
    top: bandTop,
    height: bandHeight,
    scaleX: 1,
    scaleY: 1,
    opacity: 1,
  };

  const origin = isRise || reverse ? "bottom center" : "left center";

  const animate = reverse
    ? !uncovering
      ? cover
      : bandOpen
    : isRevealing
      ? {
          top: 0,
          height: viewportHeight || bandHeight,
          scaleX: 1,
          scaleY: 1,
          opacity: 0,
        }
      : isRise
        ? cover
        : bandOpen;

  const transition = reverse
    ? !uncovering
      ? { duration: 0 }
      : {
          duration: riseDurationMs / 1000,
          ease: WIPE_EASE,
          opacity: { duration: 0 },
        }
    : isRevealing
      ? {
          opacity: { duration: REVEAL_DURATION_MS / 1000, ease: WIPE_EASE },
          top: { duration: 0 },
          height: { duration: 0 },
          scaleX: { duration: 0 },
          scaleY: { duration: 0 },
        }
      : isRise
        ? {
            duration: riseDurationMs / 1000,
            ease: WIPE_EASE,
            opacity: { duration: 0 },
          }
        : {
            scaleX: {
              duration: bandDurationMs / 1000,
              ease: WIPE_EASE,
            },
            top: { duration: 0 },
            height: { duration: 0 },
            scaleY: { duration: 0 },
            opacity: { duration: 0 },
          };

  return (
    <motion.div
      className={`pointer-events-none fixed left-0 z-0 bg-wipe ${className}`}
      style={{
        width: "100vw",
        transformOrigin: origin,
      }}
      initial={
        reverse
          ? cover
          : {
              top: bandTop,
              height: bandHeight,
              scaleX: skipBand ? 1 : 0,
              scaleY: 1,
              opacity: 1,
            }
      }
      animate={animate}
      transition={transition}
      onUpdate={(latest) => {
        publishWipeGeometry(
          latest as Record<string, unknown>,
          {
            top: bandTop,
            height: bandHeight,
            width: viewportWidth,
            scaleX: isRise || reverse ? 1 : 0,
          },
          wipeProgress,
          wipeRect,
        );
      }}
      aria-hidden="true"
    />
  );
}
