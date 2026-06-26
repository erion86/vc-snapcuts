import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";

/**
 * Fraunces — display / headline font
 * Warm soft serif, optical sizing makes it luxurious at large sizes
 * and approachable at small ones.
 */
export const fraunces = Fraunces({
  subsets: ["latin"],
  axes: ["SOFT", "WONK", "opsz"],   // enable optical size axis
  variable: "--font-fraunces",
  display: "swap",
  preload: true,
  fallback: ["Georgia", "Times New Roman", "serif"],
});

/**
 * Plus Jakarta Sans — body / UI font
 * Modern humanist sans, highly legible, slight warmth.
 */
export const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: true,
  fallback: ["system-ui", "Helvetica Neue", "sans-serif"],
});
