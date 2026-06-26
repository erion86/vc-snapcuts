import "server-only";

import { calculateCartTotals } from "@/lib/cart/calculate";
import { validateCoupon } from "@/lib/coupons/validate";
import { validateCartStockAvailability } from "@/lib/inventory/validate-cart-stock";
import type { AppliedCoupon, CartItem } from "@/types/cart";

export interface CheckoutValidationResult {
  valid: boolean;
  errors: string[];
  coupon: AppliedCoupon | null;
  totals: ReturnType<typeof calculateCartTotals>;
}

export async function validateCheckoutCart(
  items: CartItem[],
  couponCode: string | null | undefined
): Promise<CheckoutValidationResult> {
  const errors: string[] = [];

  if (!Array.isArray(items) || items.length === 0) {
    return {
      valid: false,
      errors: ["Your cart is empty"],
      coupon: null,
      totals: calculateCartTotals([], null),
    };
  }

  const stockError = await validateCartStockAvailability(items);
  if (stockError) errors.push(stockError);

  let coupon: AppliedCoupon | null = null;
  if (couponCode) {
    const subtotal = items.reduce((s, i) => s + i.unitPrice * i.qty, 0);
    const couponResult = await validateCoupon(couponCode, subtotal);
    if (!couponResult.valid) {
      errors.push(couponResult.error ?? "Invalid coupon");
    } else {
      coupon = couponResult.coupon ?? null;
    }
  }

  const totals = calculateCartTotals(items, coupon);

  return {
    valid: errors.length === 0,
    errors,
    coupon,
    totals,
  };
}
