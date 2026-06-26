"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import {
  calculateCartTotals,
  getCartItemKey,
} from "@/lib/cart/calculate";
import { getProductsByIdsClient } from "@/lib/firebase/products-client";
import { clampToStock, mergeCartQuantity, resolveLineStock } from "@/lib/inventory/stock";
import type { AppliedCoupon, CartItem } from "@/types/cart";
import type { Product, ProductVariant } from "@/types/product";

const STORAGE_KEY = "vc-snapcuts-cart";
const COUPON_STORAGE_KEY = "vc-snapcuts-coupon";

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
  addItem: (input: AddToCartInput) => boolean;
  removeItem: (productId: string, variantId: string | null) => void;
  updateQty: (productId: string, variantId: string | null, qty: number) => void;
  clearCart: () => void;
  applyCoupon: (coupon: AppliedCoupon | null) => void;
  refreshCartStock: () => Promise<void>;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  getRemainingStock: (productId: string, variantId: string | null) => number;
}

const CartContext = createContext<CartContextValue | null>(null);

function buildCartItem(
  product: Product,
  variant: ProductVariant | null,
  qty: number
): CartItem {
  const unitPrice = product.price + (variant?.priceDelta ?? 0);
  const image = product.images[0];
  const maxStock = resolveLineStock(product, variant?.id ?? null);

  return {
    productId: product.id,
    variantId: variant?.id ?? null,
    slug: product.slug,
    title: product.title,
    variantName: variant?.name ?? null,
    imagePublicId: image?.publicId ?? "",
    qty: clampToStock(qty, maxStock),
    unitPrice,
    sku: variant?.sku ?? product.id,
    maxStock,
  };
}

function normalizeStoredItem(item: CartItem): CartItem {
  return {
    ...item,
    maxStock: typeof item.maxStock === "number" ? item.maxStock : 99,
    qty: item.qty,
  };
}

function mergeItemsWithCatalog(prev: CartItem[], products: Product[]): CartItem[] {
  const next: CartItem[] = [];

  for (const item of prev) {
    const product = products.find((p) => p.id === item.productId);
    if (!product || product.status !== "active") continue;

    const maxStock = resolveLineStock(product, item.variantId);
    if (maxStock <= 0) continue;

    const qty = Math.min(item.qty, maxStock);
    next.push({ ...item, maxStock, qty });
  }

  return next;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [coupon, setCoupon] = useState<AppliedCoupon | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const pathname = usePathname();
  const prevPathnameRef = useRef(pathname);
  const itemsRef = useRef(items);
  itemsRef.current = items;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CartItem[];
        setItems(parsed.map(normalizeStoredItem));
      }

      const savedCoupon = localStorage.getItem(COUPON_STORAGE_KEY);
      if (savedCoupon) {
        setCoupon(JSON.parse(savedCoupon) as AppliedCoupon);
      }
    } catch {
      /* ignore corrupt storage */
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    if (coupon) {
      localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(coupon));
    } else {
      localStorage.removeItem(COUPON_STORAGE_KEY);
    }
  }, [coupon, isHydrated]);

  const refreshCartStock = useCallback(async () => {
    const currentItems = itemsRef.current;
    if (currentItems.length === 0) return;

    const productIds = Array.from(new Set(currentItems.map((i) => i.productId)));
    const products = await getProductsByIdsClient(productIds);
    setItems((prev) => mergeItemsWithCatalog(prev, products));
  }, []);

  useEffect(() => {
    if (!isHydrated || items.length === 0) return;
    refreshCartStock();
  }, [isHydrated]); // eslint-disable-line react-hooks/exhaustive-deps -- once on hydrate

  useEffect(() => {
    if (!isHydrated || items.length === 0) return;
    if (pathname !== "/checkout" && pathname !== "/cart") return;

    refreshCartStock();
    const interval = setInterval(refreshCartStock, 30_000);
    return () => clearInterval(interval);
  }, [isHydrated, pathname, items.length, refreshCartStock]);

  const totals = useMemo(() => calculateCartTotals(items, coupon), [items, coupon]);
  const itemCount = totals.itemCount;

  const getRemainingStock = useCallback(
    (productId: string, variantId: string | null) => {
      const key = getCartItemKey(productId, variantId);
      const inCart = items.find(
        (i) => getCartItemKey(i.productId, i.variantId) === key
      );
      const maxStock = inCart?.maxStock ?? 0;
      return Math.max(0, maxStock - (inCart?.qty ?? 0));
    },
    [items]
  );

  const addItem = useCallback(({ product, variant, qty }: AddToCartInput): boolean => {
    const maxStock = resolveLineStock(product, variant?.id ?? null);
    if (maxStock <= 0) return false;

    const key = getCartItemKey(product.id, variant?.id ?? null);
    let added = false;

    setItems((prev) => {
      const existing = prev.find(
        (i) => getCartItemKey(i.productId, i.variantId) === key
      );

      if (existing) {
        const newQty = mergeCartQuantity(existing.qty, qty, maxStock);
        if (newQty <= existing.qty) return prev;
        added = true;
        return prev.map((i) =>
          getCartItemKey(i.productId, i.variantId) === key
            ? { ...i, qty: newQty, maxStock }
            : i
        );
      }

      const newItem = buildCartItem(product, variant, qty);
      if (newItem.qty <= 0) return prev;
      added = true;
      return [...prev, newItem];
    });

    if (added) setIsDrawerOpen(true);
    return added;
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
        prev.map((i) => {
          if (getCartItemKey(i.productId, i.variantId) !== key) return i;
          return { ...i, qty: clampToStock(qty, i.maxStock) };
        })
      );
    },
    [removeItem]
  );

  const clearCart = useCallback(() => {
    setItems([]);
    setCoupon(null);
  }, []);

  const applyCoupon = useCallback((next: AppliedCoupon | null) => {
    setCoupon(next);
  }, []);

  const closeDrawer = useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  useEffect(() => {
    const prevPathname = prevPathnameRef.current;
    prevPathnameRef.current = pathname;

    if (prevPathname !== pathname && isDrawerOpen) {
      setIsDrawerOpen(false);
    }
  }, [pathname, isDrawerOpen]);

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
    applyCoupon,
    refreshCartStock,
    openDrawer: () => setIsDrawerOpen(true),
    closeDrawer,
    toggleDrawer: () => setIsDrawerOpen((v) => !v),
    getRemainingStock,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
