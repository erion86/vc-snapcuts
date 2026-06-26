import { categories } from "@/config/site";
import { seedProducts } from "@/lib/data/seed-products";
import type { Category, Product } from "@/types/product";

export type ProductSort = "new" | "price-asc" | "price-desc" | "rating" | "title";

export interface ProductFilters {
  category?: string;
  tag?: string;
  filter?: "new" | "bestseller" | "featured" | "sale";
  search?: string;
  inStock?: boolean;
  sort?: ProductSort;
}

function activeProducts(): Product[] {
  return seedProducts.filter((p) => p.status === "active");
}

export async function getProducts(filters: ProductFilters = {}): Promise<Product[]> {
  let results = activeProducts();

  if (filters.category) {
    results = results.filter((p) => p.category === filters.category);
  }

  if (filters.tag) {
    results = results.filter((p) => p.tags.includes(filters.tag!));
  }

  if (filters.filter === "new") {
    results = results.filter((p) => p.isNewArrival);
  } else if (filters.filter === "bestseller") {
    results = results.filter((p) => p.isBestSeller);
  } else if (filters.filter === "featured") {
    results = results.filter((p) => p.isFeatured);
  } else if (filters.filter === "sale") {
    results = results.filter((p) => p.compareAtPrice !== null);
  }

  if (filters.search) {
    const q = filters.search.toLowerCase();
    results = results.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.shortDescription.toLowerCase().includes(q) ||
        p.tags.some((t) => t.includes(q))
    );
  }

  if (filters.inStock) {
    results = results.filter((p) => p.stock > 0);
  }

  const sort = filters.sort ?? "new";
  results = [...results].sort((a, b) => {
    switch (sort) {
      case "price-asc":
        return a.price - b.price;
      case "price-desc":
        return b.price - a.price;
      case "rating":
        return b.rating.average - a.rating.average;
      case "title":
        return a.title.localeCompare(b.title);
      case "new":
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  return results;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  return activeProducts().find((p) => p.slug === slug) ?? null;
}

export async function getFeaturedProducts(limit = 1): Promise<Product[]> {
  return activeProducts()
    .filter((p) => p.isFeatured)
    .slice(0, limit);
}

export async function getNewArrivals(limit = 8): Promise<Product[]> {
  return activeProducts()
    .filter((p) => p.isNewArrival)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
}

export async function getBestSellers(limit = 8): Promise<Product[]> {
  return activeProducts()
    .filter((p) => p.isBestSeller)
    .sort((a, b) => b.rating.count - a.rating.count)
    .slice(0, limit);
}

export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  return activeProducts()
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, limit);
}

export async function getAllProductSlugs(): Promise<string[]> {
  return activeProducts().map((p) => p.slug);
}

export async function getCategories(): Promise<Category[]> {
  return categories.map((cat, index) => ({
    id: cat.slug,
    slug: cat.slug,
    name: cat.name,
    description: cat.description,
    imagePublicId: null,
    order: index,
    parent: null,
  }));
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const cats = await getCategories();
  return cats.find((c) => c.slug === slug) ?? null;
}
