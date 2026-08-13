import type { Metadata } from "next";
import { drukHeavy, roboto } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Play Like Kids",
  description: "Play Like Kids — coming soon",
  icons: {
    icon: "/ASSETS/LOGO_PNG/logo-negro.png",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${drukHeavy.variable} ${roboto.variable}`}>
      <body className="min-h-screen bg-background font-druk text-foreground">
        {children}
      </body>
    </html>
  );
}
