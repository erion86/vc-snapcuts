import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { PriceTag } from "@/components/ui/PriceTag";
import { Rating } from "@/components/ui/Rating";
import { SaleBadge } from "@/components/ui/Badge";
import type { Product } from "@/types/product";

interface FeaturedBlockProps {
  product: Product;
}

export function FeaturedBlock({ product }: FeaturedBlockProps) {
  const image = product.images[0];
  const onSale = product.compareAtPrice != null && product.compareAtPrice > product.price;

  return (
    <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
      <Link
        href={`/product/${product.slug}`}
        className="relative block aspect-[4/5] md:aspect-square rounded-3xl overflow-hidden bg-surface-alt border border-border kiss-cut group"
      >
        {image && (
          <Image
            src={image.publicId}
            alt={image.alt}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-transform duration-250 group-hover:scale-[1.02]"
            priority
          />
        )}
        {onSale && (
          <div className="absolute top-4 left-4">
            <SaleBadge />
          </div>
        )}
      </Link>

      <div className="flex flex-col gap-5">
        <p className="font-sans text-xs font-semibold uppercase tracking-widest text-secondary">
          Featured
        </p>
        <h2 className="font-display text-display-lg text-ink">{product.title}</h2>
        <p className="font-sans text-ink-soft leading-relaxed">{product.shortDescription}</p>
        <Rating value={product.rating.average} count={product.rating.count} size="md" />
        <PriceTag price={product.price} compareAtPrice={product.compareAtPrice} size="lg" />
        <div className="flex flex-wrap gap-3 pt-2">
          <Button size="lg" asChild>
            <Link href={`/product/${product.slug}`}>View Product</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/shop">Browse All</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
