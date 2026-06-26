"use client";

import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { CartLineList } from "@/components/cart/CartLineItem";
import { CartSummary } from "@/components/cart/CartSummary";
import { CouponInput } from "@/components/cart/CouponInput";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/Button";
import { ShoppingBag } from "lucide-react";

export default function CartPage() {
  const { items, isHydrated } = useCart();

  return (
    <>
      <Header />
      <main className="py-10 md:py-14">
        <Container size="narrow">
          <h1 className="font-display text-display-md text-ink mb-8">Your Cart</h1>

          {!isHydrated ? (
            <div className="skeleton h-40 rounded-2xl" />
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <ShoppingBag className="h-14 w-14 text-ink-soft" strokeWidth={1.25} />
              <p className="font-sans text-ink-soft">Your cart is empty</p>
              <Button asChild>
                <Link href="/shop">Shop the collection</Link>
              </Button>
            </div>
          ) : (
            <div className="grid lg:grid-cols-5 gap-10">
              <div className="lg:col-span-3">
                <CartLineList />
              </div>
              <div className="lg:col-span-2 flex flex-col gap-6 min-w-0">
                <div className="p-5 bg-surface rounded-2xl border border-border min-w-0 overflow-hidden">
                  <h2 className="font-sans text-sm font-semibold text-ink mb-3">Coupon</h2>
                  <CouponInput />
                </div>
                <CartSummary />
                <Button variant="outline" asChild>
                  <Link href="/shop">Continue shopping</Link>
                </Button>
              </div>
            </div>
          )}
        </Container>
      </main>
      <Footer />
    </>
  );
}
