import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";
import type { Product, ProductStatus } from "@/types/product";

function tsToIso(value: unknown): string {
  if (value && typeof value === "object" && "toDate" in value) {
    return (value as { toDate: () => Date }).toDate().toISOString();
  }
  return typeof value === "string" ? value : new Date().toISOString();
}

function mapDoc(id: string, data: Record<string, unknown>): Product {
  return {
    id,
    slug:             String(data.slug ?? ""),
    title:            String(data.title ?? ""),
    description:      String(data.description ?? ""),
    shortDescription: String(data.shortDescription ?? ""),
    category:         String(data.category ?? ""),
    tags:             (data.tags as string[]) ?? [],
    price:            Number(data.price ?? 0),
    compareAtPrice:   (data.compareAtPrice as number | null) ?? null,
    currency:         "PHP",
    images:           (data.images as Product["images"]) ?? [],
    variants:         (data.variants as Product["variants"]) ?? [],
    hasVariants:      Boolean(data.hasVariants),
    stock:            Number(data.stock ?? 0),
    status:           (data.status as ProductStatus) ?? "draft",
    rating:           (data.rating as Product["rating"]) ?? { average: 0, count: 0 },
    isFeatured:       Boolean(data.isFeatured),
    isNewArrival:     Boolean(data.isNewArrival),
    isBestSeller:     Boolean(data.isBestSeller),
    createdAt:        tsToIso(data.createdAt),
    updatedAt:        tsToIso(data.updatedAt),
    seo:              data.seo as Product["seo"],
    materials:        data.materials as string | undefined,
    shipping:         data.shipping as string | undefined,
  };
}

export interface ProductInput {
  slug: string;
  title: string;
  shortDescription: string;
  description: string;
  category: string;
  tags: string[];
  price: number;
  compareAtPrice: number | null;
  stock: number;
  status: ProductStatus;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  imagePublicId: string;
  imageAlt: string;
  materials?: string;
  shipping?: string;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function listAllProductsClient(): Promise<Product[]> {
  const db = getFirebaseDb();
  if (!db) return [];

  const q = query(collection(db, "products"), orderBy("updatedAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => mapDoc(d.id, d.data() as Record<string, unknown>));
}

export async function getProductByIdClient(id: string): Promise<Product | null> {
  const db = getFirebaseDb();
  if (!db) return null;

  const snap = await getDoc(doc(db, "products", id));
  if (!snap.exists()) return null;
  return mapDoc(snap.id, snap.data() as Record<string, unknown>);
}

export async function getProductsByIdsClient(ids: string[]): Promise<Product[]> {
  if (ids.length === 0) return [];

  const db = getFirebaseDb();
  if (!db) return [];

  const results = await Promise.all(ids.map((id) => getProductByIdClient(id)));
  return results.filter((p): p is Product => p !== null && p.status === "active");
}

function inputToDoc(input: ProductInput) {
  return {
    slug:             input.slug,
    title:            input.title,
    shortDescription: input.shortDescription,
    description:      input.description,
    category:         input.category,
    tags:             input.tags,
    price:            input.price,
    compareAtPrice:   input.compareAtPrice,
    currency:         "PHP" as const,
    images: input.imagePublicId
      ? [{ publicId: input.imagePublicId, alt: input.imageAlt || input.title, order: 0 }]
      : [],
    variants:     [],
    hasVariants:  false,
    stock:        input.stock,
    status:       input.status,
    rating:       { average: 0, count: 0 },
    isFeatured:   input.isFeatured,
    isNewArrival: input.isNewArrival,
    isBestSeller: input.isBestSeller,
    materials:    input.materials ?? null,
    shipping:     input.shipping ?? null,
    seo:          null,
  };
}

export async function createProductClient(input: ProductInput): Promise<string> {
  const db = getFirebaseDb();
  if (!db) throw new Error("Firebase is not configured");

  const ref = doc(collection(db, "products"));
  await setDoc(ref, {
    ...inputToDoc(input),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return ref.id;
}

export async function updateProductClient(id: string, input: ProductInput): Promise<void> {
  const db = getFirebaseDb();
  if (!db) throw new Error("Firebase is not configured");

  const existing = await getDoc(doc(db, "products", id));
  const createdAt = existing.exists() ? existing.data().createdAt : serverTimestamp();

  await setDoc(
    doc(db, "products", id),
    {
      ...inputToDoc(input),
      createdAt,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function deleteProductClient(id: string): Promise<void> {
  const db = getFirebaseDb();
  if (!db) throw new Error("Firebase is not configured");
  await deleteDoc(doc(db, "products", id));
}

export function productToInput(product: Product): ProductInput {
  const firstImage = product.images[0];
  return {
    slug:             product.slug,
    title:            product.title,
    shortDescription: product.shortDescription,
    description:      product.description,
    category:         product.category,
    tags:             product.tags,
    price:            product.price,
    compareAtPrice:   product.compareAtPrice,
    stock:            product.stock,
    status:           product.status,
    isFeatured:       product.isFeatured,
    isNewArrival:     product.isNewArrival,
    isBestSeller:     product.isBestSeller,
    imagePublicId:    firstImage?.publicId ?? "",
    imageAlt:         firstImage?.alt ?? product.title,
    materials:        product.materials,
    shipping:         product.shipping,
  };
}
