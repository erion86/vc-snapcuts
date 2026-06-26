"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/context/AuthProvider";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import {
  addToWishlist,
  getWishlistProductIds,
  removeFromWishlist,
} from "@/lib/firebase/firestore";

const WISHLIST_KEY = "vc-snapcuts-wishlist";

interface WishlistContextValue {
  productIds: string[];
  loading: boolean;
  isWishlisted: (productId: string) => boolean;
  toggle: (productId: string) => Promise<void>;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

function readLocalWishlist(): string[] {
  try {
    const raw = localStorage.getItem(WISHLIST_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function writeLocalWishlist(ids: string[]) {
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(ids));
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [productIds, setProductIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      if (user && isFirebaseConfigured()) {
        const ids = await getWishlistProductIds(user.uid);
        setProductIds(ids);
      } else {
        setProductIds(readLocalWishlist());
      }
      setLoading(false);
    }
    void load();
  }, [user]);

  const isWishlisted = useCallback(
    (productId: string) => productIds.includes(productId),
    [productIds]
  );

  const toggle = useCallback(
    async (productId: string) => {
      const has = productIds.includes(productId);

      if (user && isFirebaseConfigured()) {
        if (has) {
          await removeFromWishlist(user.uid, productId);
          setProductIds((prev) => prev.filter((id) => id !== productId));
        } else {
          await addToWishlist(user.uid, productId);
          setProductIds((prev) => [...prev, productId]);
        }
        return;
      }

      const next = has
        ? productIds.filter((id) => id !== productId)
        : [...productIds, productId];
      setProductIds(next);
      writeLocalWishlist(next);
    },
    [user, productIds]
  );

  return (
    <WishlistContext.Provider value={{ productIds, loading, isWishlisted, toggle }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
