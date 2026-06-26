import type { Coupon } from "@/types/coupon";

export type CouponRecord = Coupon;

export const seedCoupons: CouponRecord[] = [
  {
    code: "FIRST10",
    type: "percent",
    value: 10,
    minSpend: 0,
    usageLimit: 1000,
    usedCount: 0,
    perUserLimit: 1,
    startsAt: "2025-01-01T00:00:00.000Z",
    expiresAt: "2027-12-31T23:59:59.999Z",
    appliesTo: "all",
    targetIds: [],
    active: true,
  },
  {
    code: "FREESHIP",
    type: "free_shipping",
    value: 0,
    minSpend: 50000,
    usageLimit: 500,
    usedCount: 0,
    perUserLimit: 3,
    startsAt: "2025-01-01T00:00:00.000Z",
    expiresAt: "2027-12-31T23:59:59.999Z",
    appliesTo: "all",
    targetIds: [],
    active: true,
  },
];
