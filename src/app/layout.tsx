import type { Metadata } from "next";
import { druk, roboto } from "./fonts";
import {
  SITE_DESCRIPTION,
  SITE_LOGO_HEIGHT,
  SITE_LOGO_PATH,
  SITE_LOGO_WIDTH,
  SITE_NAME,
  SITE_URL,
} from "@/lib/site";
import { isUnderConstruction } from "@/lib/site-mode";
import { siteGraphJsonLd } from "@/lib/json-ld";
import { JsonLd } from "@/components/seo/JsonLd";
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
        url: SITE_LOGO_PATH,
        width: SITE_LOGO_WIDTH,
        height: SITE_LOGO_HEIGHT,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [SITE_LOGO_PATH],
  },
  robots: isUnderConstruction()
    ? { index: false, follow: false }
    : { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${roboto.variable} ${druk.variable}`}>
      <body className={`${roboto.className} min-h-screen bg-background font-roboto text-foreground`}>
        <JsonLd data={siteGraphJsonLd()} />
        <PageTransitionProvider>{children}</PageTransitionProvider>
      </body>
    </html>
  );
}
