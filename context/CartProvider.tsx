"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  calculateCartTotals,
  getCartItemKey,
} from "@/lib/cart/calculate";
import type { AppliedCoupon, CartItem } from "@/types/cart";
import type { Product, ProductVariant } from "@/types/product";

const STORAGE_KEY = "vc-snapcuts-cart";

interface AddToCartInput {
  product: Product;
  variant: ProductVariant | null;
  qty: number;
}

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  totals: ReturnType<typeof calculateCartTotals>;
  coupon: AppliedCoupon | null;
  isDrawerOpen: boolean;
  isHydrated: boolean;
  addItem: (input: AddToCartInput) => void;
  removeItem: (productId: string, variantId: string | null) => void;
  updateQty: (productId: string, variantId: string | null, qty: number) => void;
  clearCart: () => void;
  applyCoupon: (coupon: AppliedCoupon | null) => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function buildCartItem(
  product: Product,
  variant: ProductVariant | null,
  qty: number
): CartItem {
  const unitPrice = product.price + (variant?.priceDelta ?? 0);
  const image = product.images[0];

  return {
    productId: product.id,
    variantId: variant?.id ?? null,
    slug: product.slug,
    title: product.title,
    variantName: variant?.name ?? null,
    imagePublicId: image?.publicId ?? "",
    qty,
    unitPrice,
    sku: variant?.sku ?? product.id,
  };
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [coupon, setCoupon] = useState<AppliedCoupon | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw) as CartItem[]);
    } catch {
      /* ignore corrupt storage */
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, isHydrated]);

  const totals = useMemo(() => calculateCartTotals(items, coupon), [items, coupon]);
  const itemCount = totals.itemCount;

  const addItem = useCallback(({ product, variant, qty }: AddToCartInput) => {
    const key = getCartItemKey(product.id, variant?.id ?? null);
    setItems((prev) => {
      const existing = prev.find(
        (i) => getCartItemKey(i.productId, i.variantId) === key
      );
      if (existing) {
        return prev.map((i) =>
          getCartItemKey(i.productId, i.variantId) === key
            ? { ...i, qty: i.qty + qty }
            : i
        );
      }
      return [...prev, buildCartItem(product, variant, qty)];
    });
    setIsDrawerOpen(true);
  }, []);

  const removeItem = useCallback((productId: string, variantId: string | null) => {
    const key = getCartItemKey(productId, variantId);
    setItems((prev) =>
      prev.filter((i) => getCartItemKey(i.productId, i.variantId) !== key)
    );
  }, []);

  const updateQty = useCallback(
    (productId: string, variantId: string | null, qty: number) => {
      const key = getCartItemKey(productId, variantId);
      if (qty <= 0) {
        removeItem(productId, variantId);
        return;
      }
      setItems((prev) =>
        prev.map((i) =>
          getCartItemKey(i.productId, i.variantId) === key ? { ...i, qty } : i
        )
      );
    },
    [removeItem]
  );

  const clearCart = useCallback(() => {
    setItems([]);
    setCoupon(null);
  }, []);

  const value: CartContextValue = {
    items,
    itemCount,
    totals,
    coupon,
    isDrawerOpen,
    isHydrated,
    addItem,
    removeItem,
    updateQty,
    clearCart,
    applyCoupon: setCoupon,
    openDrawer: () => setIsDrawerOpen(true),
    closeDrawer: () => setIsDrawerOpen(false),
    toggleDrawer: () => setIsDrawerOpen((v) => !v),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
