"use client";

import Link from "next/link";
import { useCart } from "@/hooks/useCart";
import { formatPrice, cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { checkoutConfig } from "@/config/checkout";

interface CartSummaryProps {
  showCheckout?: boolean;
  compact?: boolean;
}

export function CartSummary({ showCheckout = true, compact = false }: CartSummaryProps) {
  const { totals, coupon } = useCart();

  return (
    <div className={cn("flex flex-col gap-4", !compact && "p-5 bg-surface-alt rounded-2xl border border-border")}>
      <div className="flex flex-col gap-2 font-sans text-sm">
        <div className="flex justify-between text-ink-soft">
          <span>Subtotal</span>
          <span className="tabular-nums text-ink">{formatPrice(totals.subtotal)}</span>
        </div>
        {totals.discount > 0 && (
          <div className="flex justify-between text-secondary-strong">
            <span>Discount{coupon ? ` (${coupon.code})` : ""}</span>
            <span className="tabular-nums">−{formatPrice(totals.discount)}</span>
          </div>
        )}
        <div className="flex justify-between text-ink-soft">
          <span>Shipping</span>
          <span className="tabular-nums text-ink">
            {totals.shippingFee === 0 ? "Free" : formatPrice(totals.shippingFee)}
          </span>
        </div>
        {totals.subtotal < checkoutConfig.freeShippingMin && totals.shippingFee > 0 && (
          <p className="text-xs text-ink-soft">
            Add {formatPrice(checkoutConfig.freeShippingMin - totals.subtotal)} more for free shipping
          </p>
        )}
        <div className="flex justify-between font-semibold text-ink pt-2 border-t border-border">
          <span>Total</span>
          <span className="tabular-nums text-base">{formatPrice(totals.total)}</span>
        </div>
      </div>

      {showCheckout && (
        <Button size="lg" className="w-full" asChild>
          <Link href="/checkout">Checkout</Link>
        </Button>
      )}
    </div>
  );
}
