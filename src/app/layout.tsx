import type { Metadata } from "next";
import { roboto } from "./fonts";
import { PageTransitionProvider } from "@/components/ui/PageTransitionWipe";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Play Like Kids",
    template: "%s — Play Like Kids",
  },
  description: "Creative Production Company / Mexico City",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={roboto.variable}>
      <body className="min-h-screen bg-background font-roboto text-foreground">
        <PageTransitionProvider>{children}</PageTransitionProvider>
      </body>
    </html>
  );
}
