import Link from "next/link";
import { Instagram, Facebook } from "lucide-react";
import { siteConfig, footerLinks } from "@/config/site";
import { Container } from "@/components/ui/Container";
import { NewsletterForm } from "@/components/layout/NewsletterForm";

// ── TikTok icon (not in lucide) ────────────────────────────────────────
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z" />
    </svg>
  );
}

// ── Main Footer ─────────────────────────────────────────────────────────
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-surface border-t border-border">
      {/* ── Main grid ── */}
      <Container className="py-14 md:py-20">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5">

          {/* Brand column — wider */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            {/* Logo */}
            <div>
              <p className="font-display text-xl font-[500] text-ink">
                v&amp;c snapcuts
              </p>
              <p className="font-sans text-[10px] uppercase tracking-[0.18em] text-ink-soft mt-0.5">
                handmade with love
              </p>
            </div>

            <p className="font-sans text-sm text-ink-soft leading-relaxed max-w-xs">
              Handmade planners, stickers, and journals crafted for dreamers,
              makers, and everyday creatives. Shipped from the Philippines
              with care.
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-2">
              <a
                href={siteConfig.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="inline-flex items-center justify-center h-9 w-9 rounded-xl bg-surface-alt hover:bg-primary/20 text-ink-soft hover:text-primary transition-colors"
              >
                <Instagram className="h-4 w-4" strokeWidth={1.75} />
              </a>
              <a
                href={siteConfig.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="inline-flex items-center justify-center h-9 w-9 rounded-xl bg-surface-alt hover:bg-primary/20 text-ink-soft hover:text-primary transition-colors"
              >
                <Facebook className="h-4 w-4" strokeWidth={1.75} />
              </a>
              <a
                href={siteConfig.social.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="inline-flex items-center justify-center h-9 w-9 rounded-xl bg-surface-alt hover:bg-primary/20 text-ink-soft hover:text-primary transition-colors"
              >
                <TikTokIcon className="h-4 w-4" />
              </a>
            </div>

            {/* Newsletter — client component */}
            <div>
              <p className="font-sans text-sm font-semibold text-ink">
                Get 10% off your first order
              </p>
              <p className="font-sans text-xs text-ink-soft mt-0.5">
                Join our mailing list for new drops &amp; exclusive deals.
              </p>
              <NewsletterForm />
            </div>
          </div>

          {/* Link columns */}
          {footerLinks.map((col) => (
            <div key={col.heading} className="flex flex-col gap-3">
              <h3 className="font-sans text-xs font-bold uppercase tracking-widest text-ink-soft">
                {col.heading}
              </h3>
              <ul className="flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="font-sans text-sm text-ink-soft hover:text-ink transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Container>

      {/* ── Bottom bar ── */}
      <div className="border-t border-border">
        <Container className="py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="font-sans text-xs text-ink-soft">
              © {year} V&amp;C Snapcuts. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <Link href="/privacy" className="font-sans text-xs text-ink-soft hover:text-ink transition-colors">Privacy</Link>
              <Link href="/terms"   className="font-sans text-xs text-ink-soft hover:text-ink transition-colors">Terms</Link>
              <span className="font-sans text-xs text-ink-soft">GCash · Maya · Visa · Mastercard</span>
            </div>
          </div>
        </Container>
      </div>
    </footer>
  );
}
