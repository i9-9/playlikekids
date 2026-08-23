"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { FooterSlotProvider, useFooterSlot } from "@/components/sections/FooterSlot";
import { SiteFooter } from "@/components/sections/SiteFooter";
import { SiteHeader } from "@/components/sections/SiteHeader";
import { usePageTransition } from "@/components/ui/PageTransitionWipe";

type SiteShellProps = {
  children: ReactNode;
};

/**
 * Persistent header + footer so logo / Directors never remount across routes.
 */
export function SiteShell({ children }: SiteShellProps) {
  const pathname = usePathname();

  if (pathname.startsWith("/studio")) {
    return children;
  }

  return (
    <FooterSlotProvider>
      <SiteShellFrame pathname={pathname}>{children}</SiteShellFrame>
    </FooterSlotProvider>
  );
}

function SiteShellFrame({
  pathname,
  children,
}: {
  pathname: string;
  children: ReactNode;
}) {
  const { isWiping } = usePageTransition();
  const { center } = useFooterSlot();
  const isHome = pathname === "/";
  const isDirectorProfile = pathname.startsWith("/directors/");
  const tone = isHome && !isWiping ? "light" : "dark";

  return (
    <div className="relative flex h-dvh min-h-0 flex-col overflow-hidden px-gutter py-chrome">
      <SiteHeader tone={tone} className="relative z-20 shrink-0" />
      <div className="scrollbar-none z-10 flex min-h-0 flex-1 flex-col overflow-y-auto">
        {children}
      </div>
      <SiteFooter
        tone={tone}
        wipeToDirectors={isHome || isDirectorProfile}
        wipeSkipBand={isDirectorProfile}
        center={center}
        underlay={isDirectorProfile}
        className="shrink-0"
      />
    </div>
  );
}
