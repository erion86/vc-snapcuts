import "server-only";

import { FieldValue, Timestamp, type DocumentData, type DocumentSnapshot } from "firebase-admin/firestore";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { resolveLineStock } from "@/lib/inventory/stock";
import type { Product } from "@/types/product";

export const STOCK_RESERVATION_TTL_MS = 30 * 60 * 1000;

export interface StockLineItem {
  productId: string;
  variantId: string | null;
  qty: number;
  title?: string;
}

export interface StockReservation {
  orderId: string;
  items: StockLineItem[];
  status: "active" | "fulfilled" | "released";
  expiresAt: string;
  createdAt: string;
}

type VariantRow = { id: string; stock: number; reservedStock?: number; [key: string]: unknown };

function getVariantReserved(variant: VariantRow | undefined): number {
  return variant?.reservedStock ?? 0;
}

/** Physical stock minus units held for unpaid checkouts. */
export function getEffectiveAvailableStock(
  data: DocumentData,
  variantId: string | null
): number {
  const product = data as unknown as Product;
  const physical = resolveLineStock(product, variantId);

  if (product.hasVariants && variantId) {
    const variant = (data.variants as VariantRow[] | undefined)?.find((v) => v.id === variantId);
    return Math.max(0, physical - getVariantReserved(variant));
  }

  const reserved = Number(data.reservedStock ?? 0);
  return Math.max(0, physical - reserved);
}

function applyReservedDelta(
  data: DocumentData,
  variantId: string | null,
  delta: number
): Record<string, unknown> {
  if (data.hasVariants && variantId) {
    const variants = [...((data.variants as VariantRow[]) ?? [])];
    const index = variants.findIndex((v) => v.id === variantId);
    if (index === -1) throw new Error("Variant not found");

    const current = getVariantReserved(variants[index]);
    variants[index] = {
      ...variants[index],
      reservedStock: Math.max(0, current + delta),
    };

    return { variants, updatedAt: FieldValue.serverTimestamp() };
  }

  const current = Number(data.reservedStock ?? 0);
  return {
    reservedStock: Math.max(0, current + delta),
    updatedAt: FieldValue.serverTimestamp(),
  };
}

export function applyStockFulfillmentUpdates(
  data: DocumentData,
  variantId: string | null,
  qty: number
): Record<string, unknown> {
  if (data.hasVariants && variantId) {
    const variants = [...((data.variants as VariantRow[]) ?? [])];
    const index = variants.findIndex((v) => v.id === variantId);
    if (index === -1) throw new Error("Variant not found");

    const stock = variants[index].stock ?? 0;
    const reserved = getVariantReserved(variants[index]);
    if (stock < qty) throw new Error("Insufficient stock at fulfillment");
    if (reserved < qty) throw new Error("Reservation mismatch");

    variants[index] = {
      ...variants[index],
      stock: stock - qty,
      reservedStock: reserved - qty,
    };

    return { variants, updatedAt: FieldValue.serverTimestamp() };
  }

  const stock = Number(data.stock ?? 0);
  const reserved = Number(data.reservedStock ?? 0);
  if (stock < qty) throw new Error("Insufficient stock at fulfillment");
  if (reserved < qty) throw new Error("Reservation mismatch");

  return {
    stock: stock - qty,
    reservedStock: reserved - qty,
    updatedAt: FieldValue.serverTimestamp(),
  };
}

export async function cleanupExpiredStockReservations(): Promise<void> {
  const db = getAdminFirestore();
  if (!db) return;

  const snap = await db
    .collection("stockReservations")
    .where("status", "==", "active")
    .limit(100)
    .get();

  const now = Date.now();
  for (const doc of snap.docs) {
    const expiresAt = doc.data().expiresAt;
    const expiresMs =
      expiresAt && typeof expiresAt.toMillis === "function"
        ? expiresAt.toMillis()
        : 0;
    if (expiresMs > 0 && expiresMs < now) {
      try {
        await releaseStockReservation(doc.id);
      } catch {
        /* best-effort cleanup */
      }
    }
  }
}

export async function reserveStockForOrder(
  orderId: string,
  items: StockLineItem[]
): Promise<void> {
  const db = getAdminFirestore();
  if (!db) {
    console.warn("Firebase Admin not configured — stock not reserved");
    return;
  }

  await cleanupExpiredStockReservations();

  const reservationRef = db.collection("stockReservations").doc(orderId);

  await db.runTransaction(async (tx) => {
    const existing = await tx.get(reservationRef);
    if (existing.exists && existing.data()?.status === "active") {
      return;
    }

    const productSnaps = new Map<string, DocumentSnapshot>();

    for (const item of items) {
      if (!productSnaps.has(item.productId)) {
        productSnaps.set(
          item.productId,
          await tx.get(db.collection("products").doc(item.productId))
        );
      }
    }

    for (const item of items) {
      const snap = productSnaps.get(item.productId)!;
      if (!snap.exists) {
        throw new Error(`Product not found: ${item.title ?? item.productId}`);
      }

      const data = snap.data()!;
      const label = (data.title as string) ?? item.title ?? "Product";

      if (data.status !== "active") {
        throw new Error(`"${label}" is no longer available`);
      }

      const available = getEffectiveAvailableStock(data, item.variantId);
      if (available <= 0) {
        throw new Error(`"${label}" is out of stock`);
      }
      if (item.qty > available) {
        throw new Error(`"${label}" only has ${available} left in stock`);
      }
    }

    for (const item of items) {
      const ref = db.collection("products").doc(item.productId);
      const snap = productSnaps.get(item.productId)!;
      tx.update(ref, applyReservedDelta(snap.data()!, item.variantId, item.qty));
    }

    const expiresAt = Timestamp.fromMillis(Date.now() + STOCK_RESERVATION_TTL_MS);
    tx.set(reservationRef, {
      orderId,
      items,
      status: "active",
      expiresAt,
      createdAt: FieldValue.serverTimestamp(),
    });
  });
}

export async function releaseStockReservation(orderId: string): Promise<void> {
  const db = getAdminFirestore();
  if (!db) return;

  const reservationRef = db.collection("stockReservations").doc(orderId);

  await db.runTransaction(async (tx) => {
    const reservationSnap = await tx.get(reservationRef);
    if (!reservationSnap.exists) return;

    const reservation = reservationSnap.data()!;
    if (reservation.status !== "active") return;

    const items = (reservation.items as StockLineItem[]) ?? [];

    for (const item of items) {
      const ref = db.collection("products").doc(item.productId);
      const snap = await tx.get(ref);
      if (!snap.exists) continue;
      tx.update(ref, applyReservedDelta(snap.data()!, item.variantId, -item.qty));
    }

    tx.update(reservationRef, {
      status: "released",
      releasedAt: FieldValue.serverTimestamp(),
    });
  });
}

export async function fulfillStockReservation(orderId: string): Promise<void> {
  const db = getAdminFirestore();
  if (!db) {
    console.warn("Firebase Admin not configured — stock not decremented");
    return;
  }

  const reservationRef = db.collection("stockReservations").doc(orderId);

  await db.runTransaction(async (tx) => {
    const reservationSnap = await tx.get(reservationRef);
    if (!reservationSnap.exists) {
      throw new Error(`No stock reservation for order ${orderId}`);
    }

    const reservation = reservationSnap.data()!;
    if (reservation.status === "fulfilled") return;
    if (reservation.status !== "active") {
      throw new Error(`Reservation for order ${orderId} is ${reservation.status}`);
    }

    const items = (reservation.items as StockLineItem[]) ?? [];

    for (const item of items) {
      const ref = db.collection("products").doc(item.productId);
      const snap = await tx.get(ref);
      if (!snap.exists) {
        throw new Error(`Product not found: ${item.productId}`);
      }
      tx.update(ref, applyStockFulfillmentUpdates(snap.data()!, item.variantId, item.qty));
    }

    tx.update(reservationRef, {
      status: "fulfilled",
      fulfilledAt: FieldValue.serverTimestamp(),
    });
  });
}
