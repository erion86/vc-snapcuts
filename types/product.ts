export type ProductStatus = "active" | "draft" | "archived";

export type ProductSort = "new" | "price-asc" | "price-desc" | "rating" | "title";

export interface ProductImage {
  publicId: string;
  alt: string;
  order: number;
}

export interface ProductVariant {
  id: string;
  name: string;
  options: {
    size?: string;
    color?: string;
  };
  priceDelta: number;
  stock: number;
  sku: string;
}

export interface ProductRating {
  average: number;
  count: number;
}

export interface ProductSEO {
  title?: string;
  description?: string;
}

export interface Product {
  id: string;
  slug: string;
  title: string;
  description: string;
  shortDescription: string;
  category: string;
  tags: string[];
  price: number;
  compareAtPrice: number | null;
  currency: "PHP";
  images: ProductImage[];
  variants: ProductVariant[];
  hasVariants: boolean;
  stock: number;
  status: ProductStatus;
  rating: ProductRating;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  createdAt: string;
  updatedAt: string;
  seo?: ProductSEO;
  materials?: string;
  shipping?: string;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  imagePublicId: string | null;
  order: number;
  parent: string | null;
}
