"use client";

import { useReducedMotion } from "motion/react";
import { useRouter } from "next/navigation";
import { useCallback, type MouseEvent } from "react";
import {
  DIRECTOR_RISE_DURATION_MS,
  usePageTransition,
} from "@/components/ui/PageTransitionWipe";

type DirectorTransitionTarget = HTMLElement;

/** True when the click should use native navigation (new tab, etc.). */
export function isModifiedNavigationClick(
  event: Pick<MouseEvent, "metaKey" | "ctrlKey" | "shiftKey" | "altKey" | "button">,
): boolean {
  return (
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey ||
    event.button !== 0
  );
}

/**
 * /directors → /directors/[slug] navigation with rect-anchored wipe.
 * Caller must attach `navigateToDirector` to the anchor element's onClick.
 */
export function useDirectorTransition() {
  const router = useRouter();
  const reduced = useReducedMotion();
  const { startWipe, isWiping } = usePageTransition();

  const navigateToDirector = useCallback(
    (
      event: MouseEvent<DirectorTransitionTarget>,
      href: string,
      anchorEl?: HTMLElement | null,
    ) => {
      if (isModifiedNavigationClick(event)) return;

      if (isWiping) {
        event.preventDefault();
        return;
      }

      const anchor = anchorEl ?? event.currentTarget;

      if (reduced) {
        event.preventDefault();
        router.push(href);
        return;
      }

      event.preventDefault();
      const rect = anchor.getBoundingClientRect();

      startWipe({
        href,
        skipBand: true,
        anchor: { kind: "rect", rect },
        riseDurationMs: DIRECTOR_RISE_DURATION_MS,
      });
    },
    [isWiping, reduced, router, startWipe],
  );

  return { navigateToDirector, isWiping, reduced };
}
