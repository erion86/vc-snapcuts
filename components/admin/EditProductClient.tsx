"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ProductForm } from "@/components/admin/ProductForm";
import { getProductByIdClient } from "@/lib/firebase/products-client";
import type { Product } from "@/types/product";

interface EditProductClientProps {
  id: string;
}

export function EditProductClient({ id }: EditProductClientProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    getProductByIdClient(id)
      .then((p) => {
        if (!p) setNotFound(true);
        else setProduct(p);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="skeleton h-96 rounded-2xl" />;

  if (notFound || !product) {
    return (
      <div className="text-center py-12">
        <p className="font-sans text-ink-soft mb-4">Product not found.</p>
        <Link href="/admin/products" className="font-sans text-sm text-primary hover:text-primary-strong">
          Back to products
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <Link href="/admin/products" className="font-sans text-sm text-ink-soft hover:text-ink">
          ← Back to products
        </Link>
        <h1 className="font-display text-display-md text-ink mt-2">Edit product</h1>
        <p className="font-sans text-sm text-ink-soft mt-1">{product.title}</p>
      </div>
      <ProductForm product={product} />
    </div>
  );
}
