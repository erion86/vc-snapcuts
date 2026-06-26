import "server-only";

import { FieldValue, type DocumentData, type Transaction } from "firebase-admin/firestore";
import { getAdminFirestore } from "@/lib/firebase/admin";
import type { Coupon } from "@/types/coupon";

function mapCouponDoc(code: string, data: DocumentData): Coupon {
  const toIso = (value: unknown) => {
    if (value && typeof value === "object" && "toDate" in value) {
      return (value as { toDate: () => Date }).toDate().toISOString();
    }
    return typeof value === "string" ? value : new Date().toISOString();
  };

  return {
    code,
    type: data.type,
    value: Number(data.value ?? 0),
    minSpend: Number(data.minSpend ?? 0),
    usageLimit: Number(data.usageLimit ?? 0),
    usedCount: Number(data.usedCount ?? 0),
    perUserLimit: Number(data.perUserLimit ?? 1),
    startsAt: toIso(data.startsAt),
    expiresAt: toIso(data.expiresAt),
    appliesTo: data.appliesTo ?? "all",
    targetIds: (data.targetIds as string[]) ?? [],
    active: Boolean(data.active),
  };
}

/** Atomically increment coupon usage if still within limit. */
export async function redeemCouponAtomically(code: string): Promise<void> {
  const db = getAdminFirestore();
  if (!db) return;

  const normalized = code.trim().toUpperCase();
  if (!normalized) return;

  const ref = db.collection("coupons").doc(normalized);

  await db.runTransaction(async (tx) => {
    await assertAndRedeemCouponInTransaction(tx, normalized);
  });
}

/** Redeem coupon inside an existing transaction. */
export async function assertAndRedeemCouponInTransaction(
  tx: Transaction,
  code: string
): Promise<void> {
  const db = getAdminFirestore();
  if (!db) throw new Error("Firebase Admin not configured");

  const normalized = code.trim().toUpperCase();
  const ref = db.collection("coupons").doc(normalized);
  const snap = await tx.get(ref);

  if (!snap.exists) {
    throw new Error(`Coupon ${normalized} not found`);
  }

  const coupon = mapCouponDoc(normalized, snap.data()!);

  if (!coupon.active) {
    throw new Error(`Coupon ${normalized} is no longer active`);
  }

  const now = Date.now();
  if (now > new Date(coupon.expiresAt).getTime()) {
    throw new Error(`Coupon ${normalized} has expired`);
  }

  if (coupon.usedCount >= coupon.usageLimit) {
    throw new Error(`Coupon ${normalized} has reached its usage limit`);
  }

  tx.update(ref, {
    usedCount: FieldValue.increment(1),
    updatedAt: FieldValue.serverTimestamp(),
  });
}
