"use client";

import { AnimatePresence, motion } from "motion/react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";

type WipeOptions = {
  href: string;
  durationMs?: number;
};

type PageTransitionContextValue = {
  startWipe: (options: WipeOptions) => void;
  isWiping: boolean;
};

const PageTransitionContext = createContext<PageTransitionContextValue | null>(
  null,
);

const DEFAULT_DURATION_MS = 700;

type PageTransitionProviderProps = {
  children: ReactNode;
};

export function PageTransitionProvider({
  children,
}: PageTransitionProviderProps) {
  const router = useRouter();
  const [isWiping, setIsWiping] = useState(false);
  const [durationMs, setDurationMs] = useState(DEFAULT_DURATION_MS);
  const pendingHrefRef = useRef<string | null>(null);

  const startWipe = useCallback(
    ({ href, durationMs: nextDuration = DEFAULT_DURATION_MS }: WipeOptions) => {
      if (isWiping) return;
      setDurationMs(nextDuration);
      pendingHrefRef.current = href;
      setIsWiping(true);
    },
    [isWiping],
  );

  const onWipeComplete = useCallback(() => {
    const href = pendingHrefRef.current;
    if (!href) return;
    pendingHrefRef.current = null;
    router.push(href);
    window.setTimeout(() => {
      setIsWiping(false);
    }, 140);
  }, [router]);

  const value = useMemo(
    () => ({
      startWipe,
      isWiping,
    }),
    [isWiping, startWipe],
  );

  return (
    <PageTransitionContext.Provider value={value}>
      {children}
      <PageTransitionWipe
        active={isWiping}
        durationMs={durationMs}
        onComplete={onWipeComplete}
      />
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
  durationMs?: number;
  /** Fires once the wipe has covered the full viewport — run router.push here. */
  onComplete: () => void;
};

/**
 * Full-viewport white wipe left → right.
 * Grows scaleX 0→1 from the left edge so the bar actually covers the screen
 * (not a thin line). Real navigation belongs in `onComplete`.
 */
export function PageTransitionWipe({
  active,
  durationMs = DEFAULT_DURATION_MS,
  onComplete,
}: PageTransitionWipeProps) {
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // Fire exactly when the cover animation finishes — avoids exit-callback races.
  useEffect(() => {
    if (!active) return;
    const timer = window.setTimeout(() => {
      onCompleteRef.current();
    }, durationMs);
    return () => window.clearTimeout(timer);
  }, [active, durationMs]);

  return (
    <AnimatePresence>
      {active ? (
        <motion.div
          key="page-wipe"
          className="pointer-events-none fixed inset-0 z-[100] origin-left bg-wipe"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: durationMs / 1000,
            ease: [0.76, 0, 0.24, 1],
          }}
          aria-hidden="true"
        />
      ) : null}
    </AnimatePresence>
  );
}
