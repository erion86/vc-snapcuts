import "server-only";

import { categories } from "@/config/site";
import { fetchAllProductsFromFirestore, fetchProductBySlugFromFirestore } from "@/lib/db/firestore-products";
import type { Category, Product, ProductSort } from "@/types/product";

export type { ProductSort };

export interface ProductFilters {
  category?: string;
  tag?: string;
  filter?: "new" | "bestseller" | "featured" | "sale";
  search?: string;
  inStock?: boolean;
  sort?: ProductSort;
}

function activeProducts(all: Product[]): Product[] {
  return all.filter((p) => p.status === "active");
}

function applyFilters(results: Product[], filters: ProductFilters): Product[] {
  let filtered = results;

  if (filters.category) {
    filtered = filtered.filter((p) => p.category === filters.category);
  }

  if (filters.tag) {
    filtered = filtered.filter((p) => p.tags.includes(filters.tag!));
  }

  if (filters.filter === "new") {
    filtered = filtered.filter((p) => p.isNewArrival);
  } else if (filters.filter === "bestseller") {
    filtered = filtered.filter((p) => p.isBestSeller);
  } else if (filters.filter === "featured") {
    filtered = filtered.filter((p) => p.isFeatured);
  } else if (filters.filter === "sale") {
    filtered = filtered.filter((p) => p.compareAtPrice !== null);
  }

  if (filters.search) {
    const q = filters.search.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.shortDescription.toLowerCase().includes(q) ||
        p.tags.some((t) => t.includes(q))
    );
  }

  if (filters.inStock) {
    filtered = filtered.filter((p) => p.stock > 0);
  }

  return filtered;
}

function sortProducts(results: Product[], sort: ProductSort): Product[] {
  return [...results].sort((a, b) => {
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
}

export async function getAllProducts(): Promise<Product[]> {
  return fetchAllProductsFromFirestore();
}

export async function getProducts(filters: ProductFilters = {}): Promise<Product[]> {
  const all = activeProducts(await fetchAllProductsFromFirestore());
  const filtered = applyFilters(all, filters);
  return sortProducts(filtered, filters.sort ?? "new");
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const product = await fetchProductBySlugFromFirestore(slug);
  if (!product || product.status !== "active") return null;
  return product;
}

export async function getFeaturedProducts(limit = 1): Promise<Product[]> {
  const all = activeProducts(await fetchAllProductsFromFirestore());
  return all.filter((p) => p.isFeatured).slice(0, limit);
}

export async function getNewArrivals(limit = 8): Promise<Product[]> {
  const all = activeProducts(await fetchAllProductsFromFirestore());
  return all
    .filter((p) => p.isNewArrival)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
}

export async function getBestSellers(limit = 8): Promise<Product[]> {
  const all = activeProducts(await fetchAllProductsFromFirestore());
  return all
    .filter((p) => p.isBestSeller)
    .sort((a, b) => b.rating.count - a.rating.count)
    .slice(0, limit);
}

export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  const all = activeProducts(await fetchAllProductsFromFirestore());
  return all
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, limit);
}

export async function getAllProductSlugs(): Promise<string[]> {
  const all = activeProducts(await fetchAllProductsFromFirestore());
  return all.map((p) => p.slug);
}

export async function getCategories(): Promise<Category[]> {
  return categories.map((cat, index) => ({
    id:            cat.slug,
    slug:          cat.slug,
    name:          cat.name,
    description:   cat.description,
    imagePublicId: null,
    order:         index,
    parent:        null,
  }));
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const cats = await getCategories();
  return cats.find((c) => c.slug === slug) ?? null;
}
