import type { Metadata } from "next";
import { cookies } from "next/headers";
import { roboto } from "./fonts";
import { SiteShell } from "@/components/sections/SiteShell";
import {
  SITE_PREVIEW_COOKIE,
  isUnderConstruction,
  shouldGatePublicSite,
} from "@/lib/site-mode";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import { PageTransitionProvider } from "@/components/ui/PageTransitionWipe";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: "Ivan Nevares", url: "https://inevares.com" }],
  creator: "Ivan Nevares",
  publisher: SITE_NAME,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/ASSETS/LOGO_PNG/logo-tierra.png",
        width: 1585,
        height: 776,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: ["/ASSETS/LOGO_PNG/logo-tierra.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
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
    <html lang="en" className={roboto.variable}>
      <body className={`${roboto.className} min-h-screen bg-background font-roboto text-foreground`}>
        <PageTransitionProvider>
          {gated ? children : <SiteShell>{children}</SiteShell>}
        </PageTransitionProvider>
      </body>
    </html>
  );
}
