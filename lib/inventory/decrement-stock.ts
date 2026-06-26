import "server-only";

import { FieldValue } from "firebase-admin/firestore";
import { getAdminFirestore } from "@/lib/firebase/admin";

export interface StockLineItem {
  productId: string;
  variantId: string | null;
  qty: number;
  title?: string;
}

export async function decrementStockForLineItems(items: StockLineItem[]): Promise<void> {
  const db = getAdminFirestore();
  if (!db) {
    console.warn("Firebase Admin not configured — stock not decremented");
    return;
  }

  await db.runTransaction(async (tx) => {
    for (const item of items) {
      const ref = db.collection("products").doc(item.productId);
      const snap = await tx.get(ref);

      if (!snap.exists) {
        throw new Error(`Product not found: ${item.title ?? item.productId}`);
      }

      const data = snap.data()!;
      const label = (data.title as string) ?? item.title ?? "Product";

      if (data.hasVariants && item.variantId) {
        const variants = [...((data.variants as { id: string; stock: number }[]) ?? [])];
        const index = variants.findIndex((v) => v.id === item.variantId);

        if (index === -1) {
          throw new Error(`Variant not found for ${label}`);
        }

        const current = variants[index].stock ?? 0;
        if (current < item.qty) {
          throw new Error(`Insufficient stock for ${label}`);
        }

        variants[index] = { ...variants[index], stock: current - item.qty };
        tx.update(ref, { variants, updatedAt: FieldValue.serverTimestamp() });
      } else {
        const current = (data.stock as number) ?? 0;
        if (current < item.qty) {
          throw new Error(`Insufficient stock for ${label}`);
        }

        tx.update(ref, {
          stock: current - item.qty,
          updatedAt: FieldValue.serverTimestamp(),
        });
      }
    }
  });
}
