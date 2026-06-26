"use client";

import Link from "next/link";
import { X, ShoppingBag } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { CartLineList } from "@/components/cart/CartLineItem";
import { CartSummary } from "@/components/cart/CartSummary";
import { Button } from "@/components/ui/Button";

export function CartDrawer() {
  const { isDrawerOpen, closeDrawer, items, itemCount, isHydrated } = useCart();

  if (!isHydrated || !isDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-ink/30 backdrop-blur-sm animate-fade-in"
        onClick={closeDrawer}
        aria-hidden="true"
      />

      <aside
        className="absolute right-0 top-0 h-full w-full max-w-md bg-surface shadow-drawer flex flex-col animate-slide-in-right"
        role="dialog"
        aria-label="Shopping cart"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="font-display text-display-sm text-ink">
            Your bag ({itemCount})
          </h2>
          <button
            type="button"
            onClick={closeDrawer}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl hover:bg-surface-alt"
            aria-label="Close cart"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
              <ShoppingBag className="h-12 w-12 text-ink-soft" strokeWidth={1.25} />
              <p className="font-sans text-ink-soft">Your bag is empty</p>
              <Button variant="outline" onClick={closeDrawer} asChild>
                <Link href="/shop">Continue shopping</Link>
              </Button>
            </div>
          ) : (
            <CartLineList />
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-border px-5 py-4 flex flex-col gap-3">
            <CartSummary compact showCheckout />
            <Button variant="ghost" size="sm" className="w-full" asChild>
              <Link href="/cart" onClick={closeDrawer}>
                View full cart
              </Link>
            </Button>
          </div>
        )}
      </aside>
    </div>
  );
}
