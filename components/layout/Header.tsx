"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { ShoppingBag, Heart, Search, Menu, X, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { navLinks, siteConfig } from "@/config/site";

import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { AccountLink } from "@/components/layout/AccountLink";

function CartButton() {
  const { itemCount, openDrawer, isHydrated } = useCart();

  return (
    <button
      type="button"
      onClick={openDrawer}
      className="relative inline-flex items-center justify-center h-9 w-9 rounded-xl hover:bg-surface-alt transition-colors"
      aria-label={`Cart, ${itemCount} items`}
    >
      <ShoppingBag className="h-5 w-5 text-ink" strokeWidth={1.75} />
      {isHydrated && itemCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-white text-[10px] font-bold leading-none animate-cart-bump">
          {itemCount > 9 ? "9+" : itemCount}
        </span>
      )}
    </button>
  );
}

// ── Theme toggle ────────────────────────────────────────────────────────
function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="h-9 w-9" />;

  return (
    <button
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="inline-flex items-center justify-center h-9 w-9 rounded-xl hover:bg-surface-alt transition-colors"
      aria-label="Toggle theme"
    >
      {resolvedTheme === "dark" ? (
        <Sun  className="h-4.5 w-4.5 text-ink" strokeWidth={1.75} />
      ) : (
        <Moon className="h-4.5 w-4.5 text-ink" strokeWidth={1.75} />
      )}
    </button>
  );
}

// ── Wordmark / Logo ─────────────────────────────────────────────────────
function Logo() {
  return (
    <Link href="/" className="flex flex-col leading-none" aria-label="V&C Snapcuts home">
      <span className="font-display text-lg font-[500] text-ink tracking-tight">
        v&amp;c snapcuts
      </span>
      <span className="font-sans text-[9px] uppercase tracking-[0.18em] text-ink-soft -mt-0.5">
        handmade with love
      </span>
    </Link>
  );
}

// ── Desktop Nav link ────────────────────────────────────────────────────
function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + "?");

  return (
    <Link
      href={href}
      className={cn(
        "font-sans text-sm font-medium px-3 py-1.5 rounded-lg transition-colors",
        isActive
          ? "text-ink bg-surface-alt"
          : "text-ink-soft hover:text-ink hover:bg-surface-alt"
      )}
    >
      {label}
    </Link>
  );
}

// ── Main Header ─────────────────────────────────────────────────────────
export function Header() {
  const [scrolled,    setScrolled]    = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [searchOpen,  setSearchOpen]  = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  // Add shadow when scrolled
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 w-full bg-bg/90 backdrop-blur-md",
          "border-b border-border/60",
          "transition-shadow duration-250",
          scrolled && "shadow-sticky"
        )}
      >
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">

            {/* ── Mobile: hamburger ── */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="inline-flex items-center justify-center h-9 w-9 rounded-xl hover:bg-surface-alt transition-colors md:hidden"
              aria-label="Open menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen
                ? <X    className="h-5 w-5 text-ink" strokeWidth={1.75} />
                : <Menu className="h-5 w-5 text-ink" strokeWidth={1.75} />
              }
            </button>

            {/* ── Logo (centered on mobile, left on desktop) ── */}
            <div className="absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0">
              <Logo />
            </div>

            {/* ── Desktop nav ── */}
            <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
              {navLinks.map((link) => (
                <NavLink key={link.href} {...link} />
              ))}
            </nav>

            {/* ── Right icons ── */}
            <div className="flex items-center gap-0.5">
              {/* Search */}
              <button
                onClick={() => setSearchOpen(true)}
                className="inline-flex items-center justify-center h-9 w-9 rounded-xl hover:bg-surface-alt transition-colors"
                aria-label="Search"
              >
                <Search className="h-5 w-5 text-ink" strokeWidth={1.75} />
              </button>

              {/* Account / Sign in */}
              <AccountLink />

              {/* Wishlist — hidden on mobile to keep header lean */}
              <Link
                href="/account/wishlist"
                className="hidden sm:inline-flex items-center justify-center h-9 w-9 rounded-xl hover:bg-surface-alt transition-colors"
                aria-label="Wishlist"
              >
                <Heart className="h-5 w-5 text-ink" strokeWidth={1.75} />
              </Link>

              {/* Theme toggle */}
              <ThemeToggle />

              {/* Cart */}
              <CartButton />
            </div>
          </div>
        </div>

        {/* ── Mobile nav menu (slides down) ── */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border bg-bg animate-fade-in">
            <nav className="px-4 py-4 flex flex-col gap-1" aria-label="Mobile navigation">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="font-sans text-base font-medium text-ink py-3 px-3 rounded-xl hover:bg-surface-alt transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              {/* Extras in mobile menu */}
              <div className="mt-3 pt-3 border-t border-border flex flex-col gap-1">
                {!user ? (
                  <Link href="/login" className="font-sans text-sm text-ink py-2 px-3 rounded-xl hover:bg-surface-alt transition-colors">Sign in</Link>
                ) : (
                  <>
                    <Link href="/account" className="font-sans text-sm text-ink-soft py-2 px-3 rounded-xl hover:bg-surface-alt transition-colors">My Account</Link>
                    <Link href="/account/orders" className="font-sans text-sm text-ink-soft py-2 px-3 rounded-xl hover:bg-surface-alt transition-colors">Order History</Link>
                    <Link href="/account/wishlist" className="font-sans text-sm text-ink-soft py-2 px-3 rounded-xl hover:bg-surface-alt transition-colors">Wishlist</Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* ── Search overlay (placeholder for Phase 1) ── */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-50 bg-ink/30 backdrop-blur-sm animate-fade-in"
          onClick={() => setSearchOpen(false)}
          aria-modal="true"
          role="dialog"
          aria-label="Search"
        >
          <div
            className="mx-auto mt-20 max-w-xl px-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-surface rounded-2xl shadow-card-hover p-4 flex items-center gap-3 animate-scale-in">
              <Search className="h-5 w-5 text-ink-soft flex-shrink-0" />
              <input
                autoFocus
                type="search"
                placeholder="Search planners, stickers, journals…"
                className="flex-1 bg-transparent font-sans text-base text-ink placeholder:text-ink-soft outline-none"
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="text-ink-soft hover:text-ink transition-colors"
                aria-label="Close search"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
