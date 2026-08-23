import type { Metadata } from "next";
import { cookies } from "next/headers";
import { roboto } from "./fonts";
import { SiteShell } from "@/components/sections/SiteShell";
import {
  SITE_PREVIEW_COOKIE,
  isUnderConstruction,
  shouldGatePublicSite,
} from "@/lib/site-mode";
import { PageTransitionProvider } from "@/components/ui/PageTransitionWipe";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Play Like Kids",
    template: "%s — Play Like Kids",
  },
  description: "Creative Production Company / Mexico City",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gated = isUnderConstruction()
    ? shouldGatePublicSite((await cookies()).get(SITE_PREVIEW_COOKIE)?.value)
    : false;

  return (
    <html lang="es" className={roboto.variable}>
      <body className={`${roboto.className} min-h-screen bg-background font-roboto text-foreground`}>
        <PageTransitionProvider>
          {gated ? children : <SiteShell>{children}</SiteShell>}
        </PageTransitionProvider>
      </body>
    </html>
  );
}
