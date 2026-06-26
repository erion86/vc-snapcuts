import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";
import type { Coupon, CouponInput } from "@/types/coupon";

function tsToIso(value: unknown): string {
  if (value && typeof value === "object" && "toDate" in value) {
    return (value as { toDate: () => Date }).toDate().toISOString();
  }
  return typeof value === "string" ? value : new Date().toISOString();
}

function mapDoc(code: string, data: Record<string, unknown>): Coupon {
  return {
    code,
    type: (data.type as Coupon["type"]) ?? "percent",
    value: Number(data.value ?? 0),
    minSpend: Number(data.minSpend ?? 0),
    usageLimit: Number(data.usageLimit ?? 0),
    usedCount: Number(data.usedCount ?? 0),
    perUserLimit: Number(data.perUserLimit ?? 1),
    startsAt: tsToIso(data.startsAt),
    expiresAt: tsToIso(data.expiresAt),
    appliesTo: (data.appliesTo as Coupon["appliesTo"]) ?? "all",
    targetIds: (data.targetIds as string[]) ?? [],
    active: Boolean(data.active),
    createdAt: data.createdAt ? tsToIso(data.createdAt) : undefined,
    updatedAt: data.updatedAt ? tsToIso(data.updatedAt) : undefined,
  };
}

export function normalizeCouponCode(code: string): string {
  return code.trim().toUpperCase().replace(/\s+/g, "");
}

function inputToDoc(input: CouponInput, usedCount: number) {
  return {
    code: normalizeCouponCode(input.code),
    type: input.type,
    value: input.value,
    minSpend: input.minSpend,
    usageLimit: input.usageLimit,
    usedCount,
    perUserLimit: input.perUserLimit,
    startsAt: input.startsAt,
    expiresAt: input.expiresAt,
    appliesTo: input.appliesTo,
    targetIds: input.targetIds,
    active: input.active,
  };
}

export async function listAllCouponsClient(): Promise<Coupon[]> {
  const db = getFirebaseDb();
  if (!db) return [];

  const q = query(collection(db, "coupons"), orderBy("code", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => mapDoc(d.id, d.data() as Record<string, unknown>));
}

export async function getCouponByCodeClient(code: string): Promise<Coupon | null> {
  const db = getFirebaseDb();
  if (!db) return null;

  const normalized = normalizeCouponCode(code);
  const snap = await getDoc(doc(db, "coupons", normalized));
  if (!snap.exists()) return null;
  return mapDoc(snap.id, snap.data() as Record<string, unknown>);
}

export async function createCouponClient(input: CouponInput): Promise<string> {
  const db = getFirebaseDb();
  if (!db) throw new Error("Firebase is not configured");

  const code = normalizeCouponCode(input.code);
  if (!code) throw new Error("Coupon code is required");

  const existing = await getDoc(doc(db, "coupons", code));
  if (existing.exists()) {
    throw new Error(`Coupon "${code}" already exists`);
  }

  await setDoc(doc(db, "coupons", code), {
    ...inputToDoc({ ...input, code }, 0),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return code;
}

export async function updateCouponClient(code: string, input: CouponInput): Promise<void> {
  const db = getFirebaseDb();
  if (!db) throw new Error("Firebase is not configured");

  const normalized = normalizeCouponCode(code);
  const existing = await getDoc(doc(db, "coupons", normalized));
  if (!existing.exists()) {
    throw new Error("Coupon not found");
  }

  const usedCount = Number(existing.data()?.usedCount ?? 0);
  const createdAt = existing.data()?.createdAt ?? serverTimestamp();

  await setDoc(
    doc(db, "coupons", normalized),
    {
      ...inputToDoc({ ...input, code: normalized }, usedCount),
      createdAt,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function deleteCouponClient(code: string): Promise<void> {
  const db = getFirebaseDb();
  if (!db) throw new Error("Firebase is not configured");
  await deleteDoc(doc(db, "coupons", normalizeCouponCode(code)));
}

export function couponToInput(coupon: Coupon): CouponInput {
  return {
    code: coupon.code,
    type: coupon.type,
    value: coupon.value,
    minSpend: coupon.minSpend,
    usageLimit: coupon.usageLimit,
    perUserLimit: coupon.perUserLimit,
    startsAt: coupon.startsAt.slice(0, 10),
    expiresAt: coupon.expiresAt.slice(0, 10),
    appliesTo: coupon.appliesTo,
    targetIds: coupon.targetIds,
    active: coupon.active,
  };
}
