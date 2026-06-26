"use client";

import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/lib/utils";
import { checkoutConfig } from "@/config/checkout";

export function OrderSummaryRail() {
  const { items, totals, coupon } = useCart();

  return (
    <div className="p-5 bg-surface-alt rounded-2xl border border-border sticky top-24">
      <h2 className="font-display text-display-sm text-ink mb-4">Order summary</h2>

      <ul className="flex flex-col gap-3 mb-4 max-h-48 overflow-y-auto">
        {items.map((item) => (
          <li
            key={`${item.productId}:${item.variantId ?? "default"}`}
            className="flex justify-between gap-2 font-sans text-sm"
          >
            <span className="text-ink-soft line-clamp-1">
              {item.qty}× {item.title}
              {item.variantName ? ` (${item.variantName})` : ""}
            </span>
            <span className="text-ink tabular-nums flex-shrink-0">
              {formatPrice(item.unitPrice * item.qty)}
            </span>
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-2 font-sans text-sm border-t border-border pt-4">
        <div className="flex justify-between text-ink-soft">
          <span>Subtotal</span>
          <span className="text-ink tabular-nums">{formatPrice(totals.subtotal)}</span>
        </div>
        {totals.discount > 0 && (
          <div className="flex justify-between text-secondary-strong">
            <span>Discount{coupon ? ` (${coupon.code})` : ""}</span>
            <span className="tabular-nums">−{formatPrice(totals.discount)}</span>
          </div>
        )}
        <div className="flex justify-between text-ink-soft">
          <span>Shipping</span>
          <span className="text-ink tabular-nums">
            {totals.shippingFee === 0 ? "Free" : formatPrice(totals.shippingFee)}
          </span>
        </div>
        {totals.subtotal < checkoutConfig.freeShippingMin && totals.shippingFee > 0 && (
          <p className="text-xs text-ink-soft">
            Free shipping on orders {formatPrice(checkoutConfig.freeShippingMin)}+
          </p>
        )}
        <div className="flex justify-between font-semibold text-ink pt-2">
          <span>Total</span>
          <span className="tabular-nums">{formatPrice(totals.total)}</span>
        </div>
      </div>
    </div>
  );
}
