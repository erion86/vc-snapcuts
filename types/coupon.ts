export type CouponType = "percent" | "fixed" | "free_shipping";
export type CouponAppliesTo = "all" | "category" | "product";

export interface Coupon {
  code: string;
  type: CouponType;
  value: number;
  minSpend: number;
  usageLimit: number;
  usedCount: number;
  perUserLimit: number;
  startsAt: string;
  expiresAt: string;
  appliesTo: CouponAppliesTo;
  targetIds: string[];
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CouponInput {
  code: string;
  type: CouponType;
  value: number;
  minSpend: number;
  usageLimit: number;
  perUserLimit: number;
  startsAt: string;
  expiresAt: string;
  appliesTo: CouponAppliesTo;
  targetIds: string[];
  active: boolean;
}
