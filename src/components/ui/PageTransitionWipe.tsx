"use client";

import { motion, useMotionValue, type MotionValue } from "motion/react";
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

export type WipeOptions = {
  href: string;
  /** Skip the left→right band (invisible on a white page) and rise immediately. */
  skipBand?: boolean;
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
  skipBand: boolean;
  anchor: TransitionAnchor | null;
  bandDurationMs: number;
  riseDurationMs: number;
  /** 0 → 1 with the left-to-right band. Stays at 1 during the rise. */
  wipeProgress: MotionValue<number>;
  /** Viewport box of the white cover (band + rise). */
  wipeRect: MotionValue<WipeRect>;
};

const EMPTY_WIPE_RECT: WipeRect = { top: 0, left: 0, right: 0, bottom: 0 };

const PageTransitionContext = createContext<PageTransitionContextValue | null>(
  null,
);

export const BAND_DURATION_MS = 700;
export const RISE_DURATION_MS = 650;
export const WIPE_EASE: [number, number, number, number] = [0.76, 0, 0.24, 1];

type PageTransitionProviderProps = {
  children: ReactNode;
};

function dismissWipe(
  destinationRef: { current: string | null },
  didPushRef: { current: boolean },
  setIsWiping: (value: boolean) => void,
  setSkipBand: (value: boolean) => void,
  setAnchor: (anchor: TransitionAnchor | null) => void,
  setRiseDurationMs: (ms: number) => void,
) {
  destinationRef.current = null;
  didPushRef.current = false;
  setIsWiping(false);
  setSkipBand(false);
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
  const [isWiping, setIsWiping] = useState(false);
  const [skipBand, setSkipBand] = useState(false);
  const [anchor, setAnchor] = useState<TransitionAnchor | null>(null);
  const [riseDurationMs, setRiseDurationMs] = useState(RISE_DURATION_MS);
  const wipeProgress = useMotionValue(0);
  const wipeRect = useMotionValue<WipeRect>(EMPTY_WIPE_RECT);
  const destinationRef = useRef<string | null>(null);
  const didPushRef = useRef(false);

  const startWipe = useCallback(
    ({
      href,
      skipBand: nextSkipBand = false,
      anchor: nextAnchor,
      riseDurationMs: nextRiseDurationMs = RISE_DURATION_MS,
    }: WipeOptions) => {
      if (isWiping) return;
      destinationRef.current = href;
      didPushRef.current = false;
      wipeProgress.set(nextSkipBand ? 1 : 0);
      setSkipBand(nextSkipBand);
      setAnchor(nextAnchor);
      setRiseDurationMs(nextRiseDurationMs);
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
    if (skipBand) {
      wipeProgress.set(1);
    }
  }, [isWiping, skipBand, wipeProgress, wipeRect]);

  useEffect(() => {
    if (!isWiping) return;

    const totalMs = (skipBand ? 0 : BAND_DURATION_MS) + riseDurationMs;
    const timer = window.setTimeout(() => {
      const href = destinationRef.current;
      if (!href) return;
      didPushRef.current = true;
      router.push(href);
    }, totalMs);

    return () => window.clearTimeout(timer);
  }, [isWiping, skipBand, riseDurationMs, router]);

  useEffect(() => {
    if (!isWiping) return;
    const href = destinationRef.current;
    if (!href || !didPushRef.current) return;
    if (pathname !== href) return;

    let inner = 0;
    const outer = window.requestAnimationFrame(() => {
      inner = window.requestAnimationFrame(() => {
        dismissWipe(
          destinationRef,
          didPushRef,
          setIsWiping,
          setSkipBand,
          setAnchor,
          setRiseDurationMs,
        );
      });
    });

    return () => {
      window.cancelAnimationFrame(outer);
      window.cancelAnimationFrame(inner);
    };
  }, [isWiping, pathname]);

  useEffect(() => {
    if (!isWiping) return;

    const fallbackMs =
      (skipBand ? 0 : BAND_DURATION_MS) + riseDurationMs + 8000;
    const timer = window.setTimeout(() => {
      dismissWipe(
        destinationRef,
        didPushRef,
        setIsWiping,
        setSkipBand,
        setAnchor,
        setRiseDurationMs,
      );
    }, fallbackMs);

    return () => window.clearTimeout(timer);
  }, [isWiping, skipBand, riseDurationMs]);

  const value = useMemo(
    () => ({
      startWipe,
      isWiping,
      skipBand,
      anchor,
      bandDurationMs: skipBand ? 0 : BAND_DURATION_MS,
      riseDurationMs,
      wipeProgress,
      wipeRect,
    }),
    [isWiping, skipBand, anchor, riseDurationMs, startWipe, wipeProgress, wipeRect],
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

/**
 * Two-phase transition (z-behind logo / Directors):
 * 1) White band grows left → right, vertically centered on the anchor
 *    and extending equally up and down (down to the viewport bottom).
 * 2) That white then rises bottom → top until the full screen is covered.
 */
export function PageTransitionWipe({
  active,
  skipBand = false,
  bandDurationMs = BAND_DURATION_MS,
  riseDurationMs = RISE_DURATION_MS,
  anchor,
  className = "",
}: PageTransitionWipeProps) {
  const { wipeProgress, wipeRect } = usePageTransition();
  const wipeRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<WipePhase>("band");
  const [bandTop, setBandTop] = useState(0);
  const [bandHeight, setBandHeight] = useState(0);

  useLayoutEffect(() => {
    if (!active || !anchor) {
      setPhase("band");
      return;
    }

    if (skipBand) setPhase("rise");

    const sync = () => {
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
  }, [active, anchor, skipBand]);

  useEffect(() => {
    if (!active) {
      setPhase("band");
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
  }, [active, bandDurationMs, skipBand]);

  const isRise = phase === "rise";

  useEffect(() => {
    if (!active) return;

    let frame = 0;
    const publish = () => {
      const el = wipeRef.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        wipeRect.set({
          top: rect.top,
          left: rect.left,
          right: rect.right,
          bottom: rect.bottom,
        });
      }
      frame = window.requestAnimationFrame(publish);
    };

    frame = window.requestAnimationFrame(publish);
    return () => window.cancelAnimationFrame(frame);
  }, [active, wipeRect]);

  if (!active || !anchor || bandHeight <= 0) return null;

  return (
    <motion.div
      ref={wipeRef}
      className={`pointer-events-none fixed left-0 z-0 bg-wipe ${className}`}
      style={{
        width: "100vw",
        transformOrigin: isRise ? "bottom center" : "left center",
      }}
      initial={{
        top: bandTop,
        height: bandHeight,
        scaleX: skipBand ? 1 : 0,
        scaleY: 1,
      }}
      animate={
        isRise
          ? {
              top: 0,
              height: "100vh",
              scaleX: 1,
              scaleY: 1,
            }
          : {
              top: bandTop,
              height: bandHeight,
              scaleX: 1,
              scaleY: 1,
            }
      }
      transition={
        isRise
          ? {
              duration: riseDurationMs / 1000,
              ease: WIPE_EASE,
            }
          : {
              scaleX: {
                duration: bandDurationMs / 1000,
                ease: WIPE_EASE,
              },
              top: { duration: 0 },
              height: { duration: 0 },
              scaleY: { duration: 0 },
            }
      }
      onUpdate={(latest) => {
        if (typeof latest.scaleX === "number") {
          wipeProgress.set(latest.scaleX);
        }
      }}
      aria-hidden="true"
    />
  );
}
