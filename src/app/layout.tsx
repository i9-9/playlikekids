import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const drukHeavy = localFont({
  src: "../../public/ASSETS/TIPOGRAFIA/Druk-Heavy-Trial.otf",
  variable: "--font-druk-heavy",
  display: "swap",
});

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-roboto",
  display: "swap",
});

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
      <body className="min-h-screen bg-background font-druk text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
