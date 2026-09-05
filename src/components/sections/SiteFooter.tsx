"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, type MouseEvent, type ReactNode } from "react";
import { Logo } from "@/components/ui/Logo";
import { ProgressiveInvert } from "@/components/ui/ProgressiveInvert";
import { Wordmark } from "@/components/ui/Wordmark";
import {
  PageTransitionWipe,
  usePageTransition,
} from "@/components/ui/PageTransitionWipe";

type SiteFooterProps = {
  className?: string;
  tone?: "dark" | "light";
  /** When true, Directors wordmark plays the wipe before navigating to /directors. */
  wipeToDirectors?: boolean;
  /** Skip the invisible white band when leaving a light page (director profiles). */
  wipeSkipBand?: boolean;
  /** Optional center slot (e.g. DirectorsSidebarNav on profile pages). */
  center?: ReactNode;
  /** Sit behind the directors list on desktop — no fill, clicks pass through. */
  underlay?: boolean;
};

function isModifiedClick(event: MouseEvent<HTMLAnchorElement>) {
  return (
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey ||
    event.button !== 0
  );
}

export function SiteFooter({
  className = "",
  tone = "dark",
  wipeToDirectors = true,
  wipeSkipBand = false,
  center,
  underlay = false,
}: SiteFooterProps) {
  const pathname = usePathname();
  const footerRef = useRef<HTMLElement>(null);
  const { startWipe, isWiping, skipBand, anchor, bandDurationMs, riseDurationMs } =
    usePageTransition();
  const onDarkSurface = tone === "light";
  const logoVariant = onDarkSurface ? "white" : "black";
  const wordmarkColor = onDarkSurface ? "text-background" : "text-foreground";

  const handleLogoClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (pathname === "/") return;
    if (isModifiedClick(event)) return;
    event.preventDefault();
    if (isWiping) return;
    startWipe({
      href: "/",
      direction: "reverse",
      anchor: footerRef.current
        ? { kind: "rect", rect: footerRef.current.getBoundingClientRect() }
        : { kind: "footer", ref: footerRef },
    });
  };

  const handleDirectorsClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!wipeToDirectors) return;
    if (isModifiedClick(event)) return;
    event.preventDefault();
    if (isWiping) return;
    startWipe({
      href: "/directors",
      skipBand: wipeSkipBand,
      anchor: { kind: "footer", ref: footerRef },
    });
  };

  return (
    <footer
      ref={footerRef}
      className={`relative grid w-full grid-cols-2 items-center gap-3 bg-transparent pt-5 md:grid-cols-[1fr_auto_1fr] md:gap-4 md:pt-4 ${underlay ? "z-0 max-md:z-20 md:pointer-events-none" : "z-20"} ${className}`}
    >
      <PageTransitionWipe
        active={isWiping}
        skipBand={skipBand}
        bandDurationMs={bandDurationMs}
        riseDurationMs={riseDurationMs}
        anchor={anchor}
      />

      <Link
        href="/"
        aria-label="Play Like Kids home"
        onClick={handleLogoClick}
        className="link-logo relative z-30 min-w-0 justify-self-start pointer-events-auto"
      >
        <ProgressiveInvert
          className="h-lockup"
          light={
            <Logo variant={logoVariant} className="h-lockup w-auto max-w-full" />
          }
          dark={<Logo variant="black" className="h-lockup w-auto max-w-full" />}
        />
      </Link>

      {center ? (
        <div className="relative z-30 col-span-2 justify-self-center self-center md:col-span-1 md:col-start-2">
          {center}
        </div>
      ) : (
        <div className="relative z-30 hidden md:block" aria-hidden />
      )}

      <Link
        href="/directors"
        scroll={false}
        onClick={handleDirectorsClick}
        className={`link-wordmark relative z-30 flex h-lockup min-w-0 max-w-full items-start justify-self-end overflow-visible col-start-2 row-start-1 pointer-events-auto md:col-start-3 ${wordmarkColor}`}
        aria-label="Directors"
      >
        <ProgressiveInvert
          light={
            <Wordmark size="footer" className="wordmark-lockup block text-right" />
          }
          dark={
            <Wordmark
              size="footer"
              className="wordmark-lockup block text-right text-foreground"
            />
          }
        />
      </Link>
    </footer>
  );
}
