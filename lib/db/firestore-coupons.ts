import "server-only";

import { FieldValue, type DocumentData } from "firebase-admin/firestore";
import { getAdminFirestore } from "@/lib/firebase/admin";
import type { Coupon } from "@/types/coupon";

function tsToIso(value: unknown): string {
  if (value && typeof value === "object" && "toDate" in value) {
    return (value as { toDate: () => Date }).toDate().toISOString();
  }
  return typeof value === "string" ? value : new Date().toISOString();
}

function mapDocToCoupon(code: string, data: DocumentData): Coupon {
  return {
    code,
    type: data.type ?? "percent",
    value: Number(data.value ?? 0),
    minSpend: Number(data.minSpend ?? 0),
    usageLimit: Number(data.usageLimit ?? 0),
    usedCount: Number(data.usedCount ?? 0),
    perUserLimit: Number(data.perUserLimit ?? 1),
    startsAt: tsToIso(data.startsAt),
    expiresAt: tsToIso(data.expiresAt),
    appliesTo: data.appliesTo ?? "all",
    targetIds: (data.targetIds as string[]) ?? [],
    active: Boolean(data.active),
    createdAt: data.createdAt ? tsToIso(data.createdAt) : undefined,
    updatedAt: data.updatedAt ? tsToIso(data.updatedAt) : undefined,
  };
}

export async function fetchCouponByCodeFromFirestore(code: string): Promise<Coupon | null> {
  const db = getAdminFirestore();
  if (!db) return null;

  const normalized = code.trim().toUpperCase();
  if (!normalized) return null;

  const snap = await db.collection("coupons").doc(normalized).get();
  if (!snap.exists) return null;

  return mapDocToCoupon(snap.id, snap.data()!);
}

export async function incrementCouponUsedCount(code: string): Promise<void> {
  const db = getAdminFirestore();
  if (!db) return;

  const normalized = code.trim().toUpperCase();
  if (!normalized) return;

  const ref = db.collection("coupons").doc(normalized);
  await ref.update({
    usedCount: FieldValue.increment(1),
    updatedAt: FieldValue.serverTimestamp(),
  });
}
