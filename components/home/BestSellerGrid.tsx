import { ProductCard } from "@/components/product/ProductCard";
import type { Product } from "@/types/product";

interface BestSellerGridProps {
  products: Product[];
}

export function BestSellerGrid({ products }: BestSellerGridProps) {
  if (products.length === 0) return null;

  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
