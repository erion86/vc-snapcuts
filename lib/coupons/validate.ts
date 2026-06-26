import { fetchCouponByCodeFromFirestore } from "@/lib/db/firestore-coupons";
import { seedCoupons } from "@/lib/data/seed-coupons";
import type { Coupon } from "@/types/coupon";
import { validateCouponRecord, type CouponValidationResult } from "@/lib/coupons/validate-record";

export type { CouponValidationResult } from "@/lib/coupons/validate-record";

function seedToCoupon(record: (typeof seedCoupons)[number]): Coupon {
  return {
    code: record.code,
    type: record.type,
    value: record.value,
    minSpend: record.minSpend,
    usageLimit: record.usageLimit,
    usedCount: record.usedCount,
    perUserLimit: record.perUserLimit,
    startsAt: record.startsAt,
    expiresAt: record.expiresAt,
    appliesTo: record.appliesTo,
    targetIds: record.targetIds,
    active: record.active,
  };
}

export async function validateCoupon(
  code: string,
  subtotal: number
): Promise<CouponValidationResult> {
  const normalized = code.trim().toUpperCase();
  if (!normalized) {
    return { valid: false, error: "Enter a coupon code" };
  }

  const fromFirestore = await fetchCouponByCodeFromFirestore(normalized);
  if (fromFirestore) {
    return validateCouponRecord(fromFirestore, subtotal);
  }

  const seed = seedCoupons.find((c) => c.code === normalized);
  if (!seed) {
    return { valid: false, error: "Invalid coupon code" };
  }

  return validateCouponRecord(seedToCoupon(seed), subtotal);
}
