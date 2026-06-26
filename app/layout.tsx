import type { Metadata, Viewport } from "next";
import { fraunces, plusJakarta } from "@/lib/fonts";
import { AppProviders } from "@/components/providers/AppProviders";
import { siteConfig } from "@/config/site";
import "./globals.css";

// ── Metadata ───────────────────────────────────────────────────────────
export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default:  siteConfig.name,
    template: `%s — ${siteConfig.name}`,
  },
  description:   siteConfig.description,
  keywords:      ["handmade planner", "stickers philippines", "journal", "scrapbooking", "craft supplies", "undated planner"],
  authors:       [{ name: "V&C Snapcuts" }],
  creator:       "V&C Snapcuts",
  openGraph: {
    type:        "website",
    locale:      "en_PH",
    url:         siteConfig.url,
    title:       siteConfig.name,
    description: siteConfig.description,
    siteName:    siteConfig.name,
    images: [{ url: siteConfig.ogImage, width: 1200, height: 630 }],
  },
  twitter: {
    card:        "summary_large_image",
    title:       siteConfig.name,
    description: siteConfig.description,
    images:      [siteConfig.ogImage],
  },
  robots: {
    index:                  true,
    follow:                 true,
    googleBot: {
      index:                true,
      follow:               true,
      "max-video-preview":  -1,
      "max-image-preview":  "large",
      "max-snippet":        -1,
    },
  },
  icons: {
    icon:        "/favicon.ico",
    shortcut:    "/favicon-16x16.png",
    apple:       "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAF6EF" },
    { media: "(prefers-color-scheme: dark)",  color: "#1C1A17" },
  ],
  width:        "device-width",
  initialScale: 1,
  maximumScale: 5,
};

// ── Root Layout ────────────────────────────────────────────────────────
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      // next-themes adds/removes 'dark' here
      suppressHydrationWarning
      className={`${fraunces.variable} ${plusJakarta.variable}`}
    >
      <body className="min-h-screen bg-bg text-ink antialiased">
        <AppProviders>
          {/* Announcement bar lives here so it's global */}
          <div className="announcement-bar">
            🎉 Free shipping on orders ₱999+ &nbsp;·&nbsp; Use code{" "}
            <strong>FIRST10</strong> for 10% off your first order
          </div>

          {children}
        </AppProviders>
      </body>
    </html>
  );
}
