import "server-only";

import type { DocumentData, Firestore } from "firebase-admin/firestore";
import { fetchProductsByIdsFromFirestore } from "@/lib/db/firestore-products";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { getEffectiveAvailableStock } from "@/lib/inventory/stock-reservation";
import { resolveLineStock } from "@/lib/inventory/stock";
import type { CartItem } from "@/types/cart";

export async function validateCartStockAvailability(
  items: CartItem[]
): Promise<string | null> {
  const productIds = Array.from(new Set(items.map((i) => i.productId)));
  const products = await fetchProductsByIdsFromFirestore(productIds);
  const productMap = new Map(products.map((p) => [p.id, p]));

  for (const item of items) {
    const product = productMap.get(item.productId);

    if (!product || product.status !== "active") {
      return `"${item.title}" is no longer available`;
    }
  }

  const db = getAdminFirestore();
  if (!db) {
    for (const item of items) {
      const product = productMap.get(item.productId)!;
      const available = resolveLineStock(product, item.variantId);

      if (available <= 0) {
        return `"${item.title}" is out of stock`;
      }

      if (item.qty > available) {
        return `"${item.title}" only has ${available} left in stock`;
      }
    }

    return null;
  }

  const dbProducts = await fetchProductDocs(productIds, db);

  for (const item of items) {
    const docData = dbProducts.get(item.productId);
    if (!docData) {
      return `"${item.title}" is no longer available`;
    }

    const available = getEffectiveAvailableStock(docData, item.variantId);

    if (available <= 0) {
      return `"${item.title}" is out of stock`;
    }

    if (item.qty > available) {
      return `"${item.title}" only has ${available} left in stock`;
    }
  }

  return null;
}

async function fetchProductDocs(
  ids: string[],
  db: Firestore
): Promise<Map<string, DocumentData>> {
  const map = new Map<string, DocumentData>();

  if (ids.length === 0) return map;

  const refs = ids.map((id) => db.collection("products").doc(id));
  const snaps = await db.getAll(...refs);

  for (const snap of snaps) {
    if (snap.exists) {
      map.set(snap.id, snap.data()!);
    }
  }

  return map;
}
