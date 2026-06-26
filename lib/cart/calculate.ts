import { checkoutConfig } from "@/config/checkout";
import type { AppliedCoupon, CartItem, CartTotals } from "@/types/cart";

export function getCartItemKey(productId: string, variantId: string | null): string {
  return `${productId}:${variantId ?? "default"}`;
}

export function calculateSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.unitPrice * item.qty, 0);
}

export function calculateItemCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.qty, 0);
}

export function calculateDiscount(subtotal: number, coupon: AppliedCoupon | null): number {
  if (!coupon) return 0;
  if (coupon.type === "free_shipping") return 0;
  if (coupon.type === "percent") {
    return Math.round(subtotal * (coupon.value / 100));
  }
  return Math.min(coupon.value, subtotal);
}

export function calculateShippingFee(
  subtotal: number,
  coupon: AppliedCoupon | null,
  courierFee = checkoutConfig.standardShippingFee
): number {
  if (subtotal >= checkoutConfig.freeShippingMin) return 0;
  if (coupon?.type === "free_shipping") return 0;
  return courierFee;
}

export function calculateCartTotals(
  items: CartItem[],
  coupon: AppliedCoupon | null = null
): CartTotals {
  const subtotal = calculateSubtotal(items);
  const discount = coupon?.discountAmount ?? calculateDiscount(subtotal, coupon);
  const shippingFee = calculateShippingFee(subtotal, coupon);
  const total = Math.max(0, subtotal - discount + shippingFee);

  return {
    subtotal,
    discount,
    shippingFee,
    total,
    itemCount: calculateItemCount(items),
  };
}
