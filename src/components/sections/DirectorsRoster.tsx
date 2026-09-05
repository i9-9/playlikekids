"use client";

import { motion, useReducedMotion } from "motion/react";
import { usePathname, useRouter } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { flushSync } from "react-dom";
import {
  NumberedList,
  NumberedListHeading,
  type NumberedListItem,
} from "@/components/ui/NumberedList";
import { WIPE_EASE, REVEAL_DURATION_MS, usePageTransition } from "@/components/ui/PageTransitionWipe";

type DirectorsRosterProps = {
  items: NumberedListItem[];
  children: ReactNode;
};

const SLOT_TRANSITION = {
  gridTemplateRows: { duration: 0.5, ease: WIPE_EASE },
  height: { duration: 0.5, ease: WIPE_EASE },
  opacity: { duration: 0.28, ease: WIPE_EASE },
};

function CollapseGhost({
  html,
  onGone,
}: {
  html: string;
  onGone: () => void;
}) {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const id = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => setOpen(false));
    });
    return () => window.cancelAnimationFrame(id);
  }, []);

  return (
    <motion.div
      className="directors-roster-slot"
      initial={false}
      animate={{
        gridTemplateRows: open ? "1fr" : "0fr",
        opacity: open ? 1 : 0,
      }}
      transition={SLOT_TRANSITION}
      onAnimationComplete={() => {
        if (!open) onGone();
      }}
    >
      <div
        className="directors-roster-slot-body pointer-events-none"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </motion.div>
  );
}

/**
 * Collapse can interpolate 1fr → 0fr because the slot already has height.
 * Expand cannot: 1fr of a 0-tall grid is still 0. Measure to `auto` instead.
 */
function ExpandSlot({
  animateIn,
  instant,
  children,
}: {
  animateIn: boolean;
  instant: boolean;
  children: ReactNode;
}) {
  const [clip, setClip] = useState(animateIn);

  return (
    <motion.div
      initial={animateIn ? { height: 0, opacity: 0 } : false}
      animate={{ height: "auto", opacity: 1 }}
      transition={instant ? { duration: 0 } : SLOT_TRANSITION}
      style={clip ? { overflow: "hidden" } : undefined}
      onAnimationComplete={() => setClip(false)}
    >
      {children}
    </motion.div>
  );
}

function isProfilePath(path: string) {
  return path.startsWith("/directors/");
}

function isDirectorsPath(path: string) {
  return path === "/directors" || path.startsWith("/directors/");
}

/**
 * Next.js replaces layout `children` in place, so React cannot keep the
 * outgoing director. Snapshot the middle DOM on click, collapse that
 * snapshot, then expand the new page.
 */
export function DirectorsRoster({ items, children }: DirectorsRosterProps) {
  const pathname = usePathname();
  const router = useRouter();
  const reduced = useReducedMotion();
  const { isWiping, isRevealing } = usePageTransition();
  const instant = Boolean(reduced || isWiping);
  const holdUnderWipe = Boolean(isWiping && !isRevealing && !reduced);
  const middleRef = useRef<HTMLDivElement>(null);
  const allowEnter = useRef(false);
  const [ghostHtml, setGhostHtml] = useState<string | null>(null);
  const [listHref, setListHref] = useState(
    isProfilePath(pathname) ? pathname : undefined,
  );

  const isIndex = pathname === "/directors";
  const isProfile = isProfilePath(pathname);
  const busy = ghostHtml !== null;

  useEffect(() => {
    if (instant) return;

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }
      if (ghostHtml) return;

      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (anchor.getAttribute("target") === "_blank") return;

      let url: URL;
      try {
        url = new URL(anchor.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;
      if (!isDirectorsPath(url.pathname) || !isDirectorsPath(pathname)) return;
      if (url.pathname === pathname) return;

      const source = middleRef.current;
      if (!source) return;

      event.preventDefault();
      event.stopPropagation();

      const html = source.innerHTML;
      flushSync(() => {
        setGhostHtml(html);
      });
      router.push(url.pathname);
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [pathname, instant, ghostHtml, router]);

  useEffect(() => {
    if (ghostHtml) return;
    setListHref(isProfilePath(pathname) ? pathname : undefined);
  }, [pathname, ghostHtml]);

  return (
    <motion.main
      className={`directors-roster ${isIndex ? "directors-roster--index" : "directors-roster--profile director-profile-page"}`}
      initial={false}
      animate={{ opacity: holdUnderWipe ? 0 : 1 }}
      transition={
        holdUnderWipe || reduced
          ? { duration: 0 }
          : { duration: REVEAL_DURATION_MS / 1000, ease: WIPE_EASE }
      }
    >
      <div className="directors-roster-end" aria-hidden />

      <div className="directors-roster-heading">
        <NumberedListHeading
          as={isIndex ? "h1" : "h2"}
          href={isProfile ? "/directors" : undefined}
        />
      </div>

      <div
        ref={middleRef}
        className="directors-roster-middle"
        style={busy ? { pointerEvents: "none" } : undefined}
      >
        {ghostHtml ? (
          <CollapseGhost
            html={ghostHtml}
            onGone={() => {
              allowEnter.current = true;
              setGhostHtml(null);
            }}
          />
        ) : (
          <ExpandSlot
            key={pathname}
            animateIn={allowEnter.current && !instant}
            instant={instant}
          >
            <div
              className={
                isProfilePath(pathname) ? "director-profile-stack" : undefined
              }
            >
              {children}
            </div>
          </ExpandSlot>
        )}
      </div>

      <div
        className="directors-roster-list"
        style={busy ? { pointerEvents: "none" } : undefined}
      >
        <NumberedList items={items} activeHref={listHref} />
      </div>

      <div className="directors-roster-end" aria-hidden />
    </motion.main>
  );
}
