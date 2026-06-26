"use client";

import Link from "next/link";
import Image from "next/image";
import { WishlistButton } from "@/components/product/WishlistButton";
import { cn } from "@/lib/utils";
import { PriceTag } from "@/components/ui/PriceTag";
import { Rating } from "@/components/ui/Rating";
import { NewBadge, SaleBadge } from "@/components/ui/Badge";
import type { Product } from "@/types/product";

interface ProductCardProps {
  product: Product;
  className?: string;
  priority?: boolean;
}

export function ProductCard({ product, className, priority = false }: ProductCardProps) {
  const image = product.images[0];
  const onSale = product.compareAtPrice != null && product.compareAtPrice > product.price;

  return (
    <article className={cn("group flex flex-col", className)}>
      <Link
        href={`/product/${product.slug}`}
        className="relative block overflow-hidden rounded-2xl bg-surface-alt aspect-[4/5] border border-border group-hover:border-primary/30 group-hover:shadow-card-hover transition-all duration-250"
      >
        {image && (
          <Image
            src={image.publicId}
            alt={image.alt}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-250 group-hover:scale-[1.03]"
            priority={priority}
          />
        )}

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
          {product.isNewArrival && <NewBadge />}
          {onSale && <SaleBadge />}
        </div>

        <WishlistButton
          productId={product.id}
          className="absolute top-2.5 right-2.5 inline-flex h-8 w-8 items-center justify-center rounded-full bg-surface/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-surface"
        />
      </Link>

      <div className="mt-3 flex flex-col gap-1.5 px-0.5">
        <Link href={`/product/${product.slug}`}>
          <h3 className="font-sans text-sm font-semibold text-ink line-clamp-2 group-hover:text-primary-strong transition-colors">
            {product.title}
          </h3>
        </Link>

        <Rating value={product.rating.average} count={product.rating.count} />

        <PriceTag price={product.price} compareAtPrice={product.compareAtPrice} size="sm" />
      </div>
    </article>
  );
}
