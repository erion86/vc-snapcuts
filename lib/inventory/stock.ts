import type { Product } from "@/types/product";

export function resolveLineStock(product: Product, variantId: string | null): number {
  if (product.hasVariants && variantId) {
    const variant = product.variants.find((v) => v.id === variantId);
    return variant?.stock ?? 0;
  }
  return product.stock;
}

export function clampToStock(qty: number, maxStock: number): number {
  if (maxStock <= 0) return 0;
  return Math.min(Math.max(1, qty), maxStock);
}

export function mergeCartQuantity(
  currentQty: number,
  addQty: number,
  maxStock: number
): number {
  if (maxStock <= 0) return 0;
  return Math.min(currentQty + addQty, maxStock);
}
