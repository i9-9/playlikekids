"use client";

import Link from "next/link";
import type { MouseEvent, ReactNode } from "react";
import { Logo } from "@/components/ui/Logo";
import { Wordmark } from "@/components/ui/Wordmark";
import { usePageTransition } from "@/components/ui/PageTransitionWipe";

type SiteFooterProps = {
  className?: string;
  tone?: "dark" | "light";
  /** When true, Directors wordmark triggers the wipe transition to /directors. */
  wipeToDirectors?: boolean;
  /** Optional center slot (e.g. DirectorsSidebarNav on profile pages). */
  center?: ReactNode;
};

export function SiteFooter({
  className = "",
  tone = "dark",
  wipeToDirectors = true,
  center,
}: SiteFooterProps) {
  const { startWipe, isWiping } = usePageTransition();
  const logoVariant = tone === "light" ? "white" : "black";
  const wordmarkColor =
    tone === "light" ? "text-background" : "text-foreground";

  const handleDirectorsClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!wipeToDirectors) return;
    event.preventDefault();
    if (isWiping) return;
    startWipe({ href: "/directors" });
  };

  return (
    <footer
      className={`grid w-full grid-cols-[1fr_auto_1fr] items-end gap-4 ${className}`}
    >
      <Link
        href="/"
        aria-label="Play Like Kids home"
        className="justify-self-start"
      >
        <Logo variant={logoVariant} className="h-12 w-auto md:h-16 lg:h-20" />
      </Link>

      <div className="justify-self-center">{center}</div>

      <Link
        href="/directors"
        onClick={handleDirectorsClick}
        className={`justify-self-end ${wordmarkColor}`}
        aria-label="Directors"
      >
        <Wordmark size="footer" />
      </Link>
    </footer>
  );
}
