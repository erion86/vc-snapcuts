"use client";

import { useState } from "react";
import { WishlistButton } from "@/components/product/WishlistButton";
import { PriceTag } from "@/components/ui/PriceTag";
import { Rating } from "@/components/ui/Rating";
import { ProductGallery } from "@/components/product/ProductGallery";
import { VariantSelector } from "@/components/product/VariantPicker";
import { ProductAccordion } from "@/components/product/ProductAccordion";
import { AddToCartSection } from "@/components/product/AddToCartSection";
import type { Product, ProductVariant } from "@/types/product";

interface ProductDetailClientProps {
  product: Product;
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const defaultVariant = product.hasVariants ? product.variants[0] ?? null : null;
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(defaultVariant);

  const displayPrice = product.price + (selectedVariant?.priceDelta ?? 0);
  const inStock = selectedVariant
    ? selectedVariant.stock > 0
    : product.stock > 0;

  const accordionItems = [
    { title: "Description", content: product.description },
    ...(product.materials ? [{ title: "Materials & Care", content: product.materials }] : []),
    ...(product.shipping ? [{ title: "Shipping", content: product.shipping }] : []),
  ];

  return (
    <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
      <ProductGallery images={product.images} title={product.title} />

      <div className="flex flex-col gap-5">
        <div>
          <p className="font-sans text-xs font-semibold uppercase tracking-widest text-ink-soft mb-2 capitalize">
            {product.category}
          </p>
          <h1 className="font-display text-display-lg text-ink">{product.title}</h1>
        </div>

        <Rating value={product.rating.average} count={product.rating.count} size="md" />

        <PriceTag
          price={displayPrice}
          compareAtPrice={product.compareAtPrice}
          size="lg"
        />

        <p className="font-sans text-ink-soft leading-relaxed">{product.shortDescription}</p>

        {product.hasVariants && product.variants.length > 0 && (
          <VariantSelector
            variants={product.variants}
            selectedId={selectedVariant?.id ?? null}
            onSelect={setSelectedVariant}
          />
        )}

        <AddToCartSection
          product={product}
          variant={selectedVariant}
          inStock={inStock}
        />

        <div className="inline-flex items-center gap-2 font-sans text-sm text-ink-soft">
          <WishlistButton productId={product.id} size="md" />
          Save to wishlist
        </div>

        <ProductAccordion items={accordionItems} />
      </div>
    </div>
  );
}
