import "server-only";

import { FieldValue } from "firebase-admin/firestore";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { assertAndRedeemCouponInTransaction } from "@/lib/coupons/redeem-coupon";
import {
  applyStockFulfillmentUpdates,
  type StockLineItem,
} from "@/lib/inventory/stock-reservation";

export type { StockLineItem };

export function toStockLineItems(
  items: { productId: string; variantId: string | null; qty: number; title?: string }[]
): StockLineItem[] {
  return items.map((item) => ({
    productId: item.productId,
    variantId: item.variantId,
    qty: item.qty,
    title: item.title,
  }));
}

/** Fulfill reserved stock and redeem coupon in one atomic transaction. */
export async function fulfillOrderInventory(
  orderId: string,
  couponCode: string | null
): Promise<void> {
  const db = getAdminFirestore();
  if (!db) {
    console.warn("Firebase Admin not configured — order inventory not fulfilled");
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

    if (couponCode) {
      await assertAndRedeemCouponInTransaction(tx, couponCode);
    }

    tx.update(reservationRef, {
      status: "fulfilled",
      fulfilledAt: FieldValue.serverTimestamp(),
    });
  });
}
