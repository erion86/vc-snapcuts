import "server-only";

import { getAdminFirestore } from "@/lib/firebase/admin";
import type { OrderRecord } from "@/lib/orders/store";

export async function saveOrderToFirestore(order: OrderRecord): Promise<void> {
  const db = getAdminFirestore();
  if (!db) {
    console.warn("Firebase Admin not configured — order not persisted");
    return;
  }

  await db.collection("orders").doc(order.id).set({
    ...order,
    orderNumberLower: order.orderNumber.toLowerCase(),
  });
}

export async function fetchOrderByIdFromFirestore(id: string): Promise<OrderRecord | null> {
  const db = getAdminFirestore();
  if (!db) return null;

  const snap = await db.collection("orders").doc(id).get();
  if (!snap.exists) return null;
  return snap.data() as OrderRecord;
}

export async function fetchOrderByNumberFromFirestore(
  orderNumber: string
): Promise<OrderRecord | null> {
  const db = getAdminFirestore();
  if (!db) return null;

  const snap = await db
    .collection("orders")
    .where("orderNumber", "==", orderNumber)
    .limit(1)
    .get();

  const doc = snap.docs[0];
  return doc ? (doc.data() as OrderRecord) : null;
}

export async function patchOrderInFirestore(
  id: string,
  patch: Partial<Pick<OrderRecord, "status" | "payment" | "updatedAt">>
): Promise<OrderRecord | null> {
  const db = getAdminFirestore();
  if (!db) return null;

  const ref = db.collection("orders").doc(id);
  const snap = await ref.get();
  if (!snap.exists) return null;

  const existing = snap.data() as OrderRecord;
  const updated: OrderRecord = {
    ...existing,
    ...patch,
    payment: patch.payment ? { ...existing.payment, ...patch.payment } : existing.payment,
    updatedAt: new Date().toISOString(),
  };

  await ref.set(updated);
  return updated;
}
