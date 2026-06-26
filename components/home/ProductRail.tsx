import Link from "next/link";
import { ProductCard } from "@/components/product/ProductCard";
import { Button } from "@/components/ui/Button";
import type { Product } from "@/types/product";

interface ProductRailProps {
  products: Product[];
  seeAllHref?: string;
}

export function ProductRail({ products, seeAllHref = "/shop?filter=new" }: ProductRailProps) {
  if (products.length === 0) return null;

  return (
    <div className="snap-rail -mx-4 px-4 md:mx-0 md:px-0">
      {products.map((product, i) => (
        <div key={product.id} className="w-[44vw] sm:w-[32vw] md:w-[24vw] lg:w-[18vw] max-w-[260px]">
          <ProductCard product={product} priority={i < 2} />
        </div>
      ))}
      {seeAllHref && (
        <div className="flex items-center justify-center w-32 flex-shrink-0">
          <Button variant="outline" size="sm" asChild>
            <Link href={seeAllHref}>See all</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
