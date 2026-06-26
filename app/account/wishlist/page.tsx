"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useWishlist } from "@/context/WishlistProvider";
import { getProductsByIdsClient } from "@/lib/firebase/products-client";
import { ProductCard } from "@/components/product/ProductCard";
import { Button } from "@/components/ui/Button";
import type { Product } from "@/types/product";

export default function WishlistPage() {
  const { productIds, loading: wishlistLoading } = useWishlist();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (wishlistLoading) return;

    if (productIds.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    getProductsByIdsClient(productIds)
      .then(setProducts)
      .finally(() => setLoading(false));
  }, [productIds, wishlistLoading]);

  if (wishlistLoading || loading) return <div className="skeleton h-40 rounded-2xl" />;

  return (
    <div>
      <h2 className="font-display text-display-sm text-ink mb-6">Wishlist</h2>
      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="font-sans text-ink-soft mb-4">Nothing saved yet — tap the heart on any product.</p>
          <Button asChild><Link href="/shop">Browse shop</Link></Button>
        </div>
      ) : (
        <div className="product-grid">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
