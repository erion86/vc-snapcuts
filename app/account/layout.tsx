"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { useAuth } from "@/context/AuthProvider";
import { cn } from "@/lib/utils";

const accountNav = [
  { href: "/account", label: "Profile" },
  { href: "/account/orders", label: "Orders" },
  { href: "/account/wishlist", label: "Wishlist" },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, firebaseReady, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && firebaseReady && !user) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [user, loading, firebaseReady, router, pathname]);

  if (loading) {
    return (
      <>
        <Header />
        <main className="py-10"><Container><div className="skeleton h-64 rounded-2xl" /></Container></main>
        <Footer />
      </>
    );
  }

  if (!firebaseReady) {
    return (
      <>
        <Header />
        <main className="py-10">
          <Container size="narrow" className="text-center py-12">
            <p className="font-sans text-ink-soft mb-4">Configure Firebase to use your account.</p>
            <Link href="/login" className="font-sans text-sm font-semibold text-primary">Go to sign in</Link>
          </Container>
        </main>
        <Footer />
      </>
    );
  }

  if (!user) return null;

  return (
    <>
      <Header />
      <main className="py-10 md:py-14">
        <Container>
          <h1 className="font-display text-display-md text-ink mb-8">My Account</h1>
          <div className="grid lg:grid-cols-4 gap-10">
            <nav className="flex lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0">
              {accountNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "font-sans text-sm font-medium px-4 py-2.5 rounded-xl whitespace-nowrap transition-colors",
                    pathname === item.href
                      ? "bg-surface-alt text-ink"
                      : "text-ink-soft hover:bg-surface-alt hover:text-ink"
                  )}
                >
                  {item.label}
                </Link>
              ))}
              <button
                type="button"
                onClick={() => signOut().then(() => router.push("/"))}
                className="font-sans text-sm font-medium px-4 py-2.5 rounded-xl text-ink-soft hover:text-sale text-left"
              >
                Sign out
              </button>
            </nav>
            <div className="lg:col-span-3">{children}</div>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
