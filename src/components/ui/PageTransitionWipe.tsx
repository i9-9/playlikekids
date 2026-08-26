"use client";

import { motion } from "motion/react";
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
} from "react";
import { usePathname, useRouter } from "next/navigation";

type WipeOptions = {
  href: string;
  /** Skip the left→right band (invisible on a white page) and rise immediately. */
  skipBand?: boolean;
};

type PageTransitionContextValue = {
  startWipe: (options: WipeOptions) => void;
  isWiping: boolean;
  skipBand: boolean;
  bandDurationMs: number;
  riseDurationMs: number;
};

const PageTransitionContext = createContext<PageTransitionContextValue | null>(
  null,
);

export const BAND_DURATION_MS = 700;
export const RISE_DURATION_MS = 650;

type PageTransitionProviderProps = {
  children: ReactNode;
};

function dismissWipe(
  destinationRef: { current: string | null },
  didPushRef: { current: boolean },
  setIsWiping: (value: boolean) => void,
  setSkipBand: (value: boolean) => void,
) {
  destinationRef.current = null;
  didPushRef.current = false;
  setIsWiping(false);
  setSkipBand(false);
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
  const destinationRef = useRef<string | null>(null);
  const didPushRef = useRef(false);

  const startWipe = useCallback(
    ({ href, skipBand: nextSkipBand = false }: WipeOptions) => {
      if (isWiping) return;
      destinationRef.current = href;
      didPushRef.current = false;
      setSkipBand(nextSkipBand);
      setIsWiping(true);
      router.prefetch(href);
    },
    [isWiping, router],
  );

  useEffect(() => {
    if (!isWiping) return;

    const totalMs = (skipBand ? 0 : BAND_DURATION_MS) + RISE_DURATION_MS;
    const timer = window.setTimeout(() => {
      const href = destinationRef.current;
      if (!href) return;
      didPushRef.current = true;
      router.push(href);
    }, totalMs);

    return () => window.clearTimeout(timer);
  }, [isWiping, skipBand, router]);

  useEffect(() => {
    if (!isWiping) return;
    const href = destinationRef.current;
    if (!href || !didPushRef.current) return;
    if (pathname !== href) return;

    let inner = 0;
    const outer = window.requestAnimationFrame(() => {
      inner = window.requestAnimationFrame(() => {
        dismissWipe(destinationRef, didPushRef, setIsWiping, setSkipBand);
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
      (skipBand ? 0 : BAND_DURATION_MS) + RISE_DURATION_MS + 8000;
    const timer = window.setTimeout(() => {
      dismissWipe(destinationRef, didPushRef, setIsWiping, setSkipBand);
    }, fallbackMs);

    return () => window.clearTimeout(timer);
  }, [isWiping, skipBand]);

  const value = useMemo(
    () => ({
      startWipe,
      isWiping,
      skipBand,
      bandDurationMs: skipBand ? 0 : BAND_DURATION_MS,
      riseDurationMs: RISE_DURATION_MS,
    }),
    [isWiping, skipBand, startWipe],
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
  /** Footer row whose vertical center the first-phase band is symmetric around. */
  anchorRef: React.RefObject<HTMLElement | null>;
  className?: string;
};

type WipePhase = "band" | "rise";

/**
 * Two-phase transition (z-behind logo / Directors):
 * 1) White band grows left → right, vertically centered on the footer row
 *    and extending equally up and down (down to the viewport bottom).
 * 2) That white then rises bottom → top until the full screen is covered.
 */
export function PageTransitionWipe({
  active,
  skipBand = false,
  bandDurationMs = BAND_DURATION_MS,
  riseDurationMs = RISE_DURATION_MS,
  anchorRef,
  className = "",
}: PageTransitionWipeProps) {
  const [phase, setPhase] = useState<WipePhase>("band");
  const [bandTop, setBandTop] = useState(0);
  const [bandHeight, setBandHeight] = useState(0);

  useLayoutEffect(() => {
    if (!active) {
      setPhase("band");
      return;
    }

    if (skipBand) setPhase("rise");

    const sync = () => {
      const el = anchorRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const half = window.innerHeight - center;
      const top = Math.max(0, center - half);
      setBandTop(top);
      setBandHeight(Math.max(0, window.innerHeight - top));
    };

    sync();
    window.addEventListener("resize", sync);
    window.addEventListener("scroll", sync, { passive: true });
    return () => {
      window.removeEventListener("resize", sync);
      window.removeEventListener("scroll", sync);
    };
  }, [active, anchorRef, skipBand]);

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

  if (!active || bandHeight <= 0) return null;

  return (
    <motion.div
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
              ease: [0.76, 0, 0.24, 1],
            }
          : {
              scaleX: {
                duration: bandDurationMs / 1000,
                ease: [0.76, 0, 0.24, 1],
              },
              top: { duration: 0 },
              height: { duration: 0 },
              scaleY: { duration: 0 },
            }
      }
      aria-hidden="true"
    />
  );
}
