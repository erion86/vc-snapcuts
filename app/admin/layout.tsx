"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { LayoutDashboard, Package, ShoppingCart, Star, ArrowLeft, Ticket } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const adminNav = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products",  label: "Products",  icon: Package },
  { href: "/admin/orders",    label: "Orders",    icon: ShoppingCart },
  { href: "/admin/coupons",   label: "Coupons",   icon: Ticket },
  { href: "/admin/reviews",   label: "Reviews",   icon: Star },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading, firebaseReady } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isAdmin = profile?.role === "admin";

  useEffect(() => {
    if (!loading && firebaseReady) {
      if (!user) {
        router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      } else if (profile && !isAdmin) {
        router.replace("/account");
      }
    }
  }, [user, profile, loading, firebaseReady, isAdmin, router, pathname]);

  if (loading || !user || !isAdmin) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="skeleton h-12 w-48 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <header className="border-b border-border bg-surface sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 flex h-14 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="inline-flex items-center gap-2 font-sans text-sm text-ink-soft hover:text-ink">
              <ArrowLeft className="h-4 w-4" />
              Store
            </Link>
            <span className="font-display text-lg text-ink">Admin</span>
          </div>
          <span className="font-sans text-xs text-ink-soft">{user.email}</span>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-5 gap-8">
          <aside className="lg:col-span-1">
            <nav className="flex lg:flex-col gap-1 overflow-x-auto">
              {adminNav.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "inline-flex items-center gap-2 font-sans text-sm font-medium px-3 py-2.5 rounded-xl whitespace-nowrap transition-colors",
                    pathname === href || pathname.startsWith(`${href}/`)
                      ? "bg-primary/10 text-ink"
                      : "text-ink-soft hover:bg-surface-alt hover:text-ink"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              ))}
            </nav>
          </aside>
          <main className="lg:col-span-4">{children}</main>
        </div>
      </div>
    </div>
  );
}
