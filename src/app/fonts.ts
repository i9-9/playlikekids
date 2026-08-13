import { Roboto } from "next/font/google";
import localFont from "next/font/local";

export const drukHeavy = localFont({
  src: "../../public/ASSETS/TIPOGRAFIA/Druk-Heavy-Trial.otf",
  variable: "--font-druk-heavy",
  display: "swap",
});

export const roboto = Roboto({
  subsets: ["latin"],
  weight: "700",
  variable: "--font-roboto",
  display: "swap",
});
