"use client";

import { useCart } from "@/hooks/useCart";
import { useCartMergeOnLogin } from "@/context/AuthProvider";

/** Bridges cart context into auth for login merge */
export function CartMergeBridge() {
  const { items } = useCart();
  useCartMergeOnLogin(items);
  return null;
}
