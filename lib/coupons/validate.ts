import { calculateDiscount } from "@/lib/cart/calculate";
import { seedCoupons } from "@/lib/data/seed-coupons";
import type { AppliedCoupon } from "@/types/cart";

export interface CouponValidationResult {
  valid: boolean;
  coupon?: AppliedCoupon;
  error?: string;
}

export function validateCoupon(code: string, subtotal: number): CouponValidationResult {
  const normalized = code.trim().toUpperCase();
  if (!normalized) {
    return { valid: false, error: "Enter a coupon code" };
  }

  const record = seedCoupons.find((c) => c.code === normalized);
  if (!record) {
    return { valid: false, error: "Invalid coupon code" };
  }

  if (!record.active) {
    return { valid: false, error: "This coupon is no longer active" };
  }

  const now = Date.now();
  if (now < new Date(record.startsAt).getTime()) {
    return { valid: false, error: "This coupon is not valid yet" };
  }
  if (now > new Date(record.expiresAt).getTime()) {
    return { valid: false, error: "This coupon has expired" };
  }

  if (record.usedCount >= record.usageLimit) {
    return { valid: false, error: "This coupon has reached its usage limit" };
  }

  if (subtotal < record.minSpend) {
    return {
      valid: false,
      error: `Minimum spend of ₱${(record.minSpend / 100).toFixed(0)} required`,
    };
  }

  const applied: AppliedCoupon = {
    code: record.code,
    type: record.type,
    value: record.value,
    discountAmount:
      record.type === "free_shipping"
        ? 0
        : calculateDiscount(subtotal, {
            code: record.code,
            type: record.type,
            value: record.value,
            discountAmount: 0,
          }),
  };

  return { valid: true, coupon: applied };
}
