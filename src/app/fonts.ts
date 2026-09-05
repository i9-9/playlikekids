import { Roboto } from "next/font/google";
import localFont from "next/font/local";

export const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  variable: "--font-roboto",
  display: "swap",
});

export const druk = localFont({
  src: "../../public/fonts/Druk-Heavy.woff2",
  weight: "900",
  style: "normal",
  display: "swap",
  variable: "--font-druk",
  preload: true,
});
