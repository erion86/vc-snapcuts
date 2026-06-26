import "server-only";

import type { DocumentData, QueryDocumentSnapshot } from "firebase-admin/firestore";
import { getAdminFirestore } from "@/lib/firebase/admin";
import type { Product, ProductStatus } from "@/types/product";

function tsToIso(value: unknown): string {
  if (value && typeof value === "object" && "toDate" in value) {
    return (value as { toDate: () => Date }).toDate().toISOString();
  }
  return typeof value === "string" ? value : new Date().toISOString();
}

export function mapDocToProduct(doc: QueryDocumentSnapshot<DocumentData>): Product {
  const data = doc.data();

  return {
    id:               doc.id,
    slug:             data.slug ?? "",
    title:            data.title ?? "",
    description:      data.description ?? "",
    shortDescription: data.shortDescription ?? "",
    category:         data.category ?? "",
    tags:             data.tags ?? [],
    price:            data.price ?? 0,
    compareAtPrice:   data.compareAtPrice ?? null,
    currency:         "PHP",
    images:           data.images ?? [],
    variants:         data.variants ?? [],
    hasVariants:      data.hasVariants ?? false,
    stock:            data.stock ?? 0,
    status:           (data.status ?? "draft") as ProductStatus,
    rating:           data.rating ?? { average: 0, count: 0 },
    isFeatured:       data.isFeatured ?? false,
    isNewArrival:     data.isNewArrival ?? false,
    isBestSeller:     data.isBestSeller ?? false,
    createdAt:        tsToIso(data.createdAt),
    updatedAt:        tsToIso(data.updatedAt),
    seo:              data.seo,
    materials:        data.materials,
    shipping:         data.shipping,
  };
}

export async function fetchAllProductsFromFirestore(): Promise<Product[]> {
  const db = getAdminFirestore();
  if (!db) return [];

  const snap = await db.collection("products").get();
  return snap.docs.map(mapDocToProduct);
}

export async function fetchProductBySlugFromFirestore(slug: string): Promise<Product | null> {
  const db = getAdminFirestore();
  if (!db) return null;

  const snap = await db.collection("products").where("slug", "==", slug).limit(1).get();
  const doc = snap.docs[0];
  return doc ? mapDocToProduct(doc) : null;
}

export async function fetchProductsByIdsFromFirestore(ids: string[]): Promise<Product[]> {
  if (ids.length === 0) return [];

  const db = getAdminFirestore();
  if (!db) return [];

  const unique = Array.from(new Set(ids));
  const refs = unique.map((id) => db.collection("products").doc(id));
  const snaps = await db.getAll(...refs);

  return snaps
    .filter((s) => s.exists)
    .map((s) => mapDocToProduct(s as QueryDocumentSnapshot<DocumentData>));
}

export function productToFirestoreDoc(
  product: Omit<Product, "id" | "createdAt" | "updatedAt">,
  timestamps?: { createdAt?: unknown; updatedAt?: unknown }
) {
  return {
    slug:             product.slug,
    title:            product.title,
    description:      product.description,
    shortDescription: product.shortDescription,
    category:         product.category,
    tags:             product.tags,
    price:            product.price,
    compareAtPrice:   product.compareAtPrice,
    currency:         product.currency,
    images:           product.images,
    variants:         product.variants,
    hasVariants:      product.hasVariants,
    stock:            product.stock,
    status:           product.status,
    rating:           product.rating,
    isFeatured:       product.isFeatured,
    isNewArrival:     product.isNewArrival,
    isBestSeller:     product.isBestSeller,
    seo:              product.seo ?? null,
    materials:        product.materials ?? null,
    shipping:         product.shipping ?? null,
    createdAt:        timestamps?.createdAt ?? new Date(),
    updatedAt:        timestamps?.updatedAt ?? new Date(),
  };
}
