import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  deleteDoc,
  where,
  orderBy,
  addDoc,
  updateDoc,
  serverTimestamp,
  type Timestamp,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";
import type { Review, ReviewInput } from "@/types/review";

function tsToIso(value: unknown): string {
  if (value && typeof value === "object" && "toDate" in value) {
    return (value as Timestamp).toDate().toISOString();
  }
  return typeof value === "string" ? value : new Date().toISOString();
}

export async function getApprovedReviews(productId: string): Promise<Review[]> {
  const db = getFirebaseDb();
  if (!db) return [];

  const q = query(
    collection(db, "reviews"),
    where("productId", "==", productId),
    where("status", "==", "approved")
  );

  const snap = await getDocs(q);
  return snap.docs
    .map((d) => {
      const data = d.data();
      return {
        id:               d.id,
        productId:        data.productId,
        userId:           data.userId,
        userName:         data.userName,
        rating:           data.rating,
        title:            data.title,
        body:             data.body,
        images:           data.images ?? [],
        status:           data.status,
        verifiedPurchase: data.verifiedPurchase ?? false,
        helpfulCount:     data.helpfulCount ?? 0,
        createdAt:        tsToIso(data.createdAt),
      } satisfies Review;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function submitReview(
  input: ReviewInput,
  userId: string,
  userName: string
): Promise<void> {
  const db = getFirebaseDb();
  if (!db) throw new Error("Firebase is not configured");

  await addDoc(collection(db, "reviews"), {
    productId:        input.productId,
    userId,
    userName,
    rating:           input.rating,
    title:            input.title.trim(),
    body:             input.body.trim(),
    images:           [],
    status:           "pending",
    verifiedPurchase: false,
    helpfulCount:     0,
    createdAt:        serverTimestamp(),
  });
}

export async function subscribeNewsletter(email: string, source: "footer" | "popup" = "footer"): Promise<void> {
  const db = getFirebaseDb();
  if (!db) throw new Error("Firebase is not configured");

  const normalized = email.trim().toLowerCase();
  await setDoc(doc(db, "newsletter", normalized), {
    email:         normalized,
    source,
    subscribedAt:  serverTimestamp(),
    consent:       true,
  });
}

export async function mergeCartToFirestore(
  uid: string,
  items: { productId: string; variantId: string | null; qty: number; unitPrice: number }[]
): Promise<void> {
  const db = getFirebaseDb();
  if (!db || items.length === 0) return;

  await setDoc(
    doc(db, "carts", uid),
    {
      items: items.map((i) => ({
        productId:     i.productId,
        variantId:     i.variantId,
        qty:           i.qty,
        priceSnapshot: i.unitPrice,
      })),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function getWishlistProductIds(uid: string): Promise<string[]> {
  const db = getFirebaseDb();
  if (!db) return [];

  const snap = await getDocs(collection(db, "users", uid, "wishlist"));
  return snap.docs.map((d) => d.id);
}

export async function addToWishlist(uid: string, productId: string): Promise<void> {
  const db = getFirebaseDb();
  if (!db) throw new Error("Firebase is not configured");
  await setDoc(doc(db, "users", uid, "wishlist", productId), {
    productId,
    addedAt: serverTimestamp(),
  });
}

export async function removeFromWishlist(uid: string, productId: string): Promise<void> {
  const db = getFirebaseDb();
  if (!db) throw new Error("Firebase is not configured");
  await deleteDoc(doc(db, "users", uid, "wishlist", productId));
}

export async function getPendingReviews(): Promise<Review[]> {
  const db = getFirebaseDb();
  if (!db) return [];

  const q = query(collection(db, "reviews"), where("status", "==", "pending"));
  const snap = await getDocs(q);

  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id:               d.id,
      productId:        data.productId,
      userId:           data.userId,
      userName:         data.userName,
      rating:           data.rating,
      title:            data.title,
      body:             data.body,
      images:           data.images ?? [],
      status:           data.status,
      verifiedPurchase: data.verifiedPurchase ?? false,
      helpfulCount:     data.helpfulCount ?? 0,
      createdAt:        tsToIso(data.createdAt),
    } satisfies Review;
  });
}

export async function updateReviewStatus(
  reviewId: string,
  status: "approved" | "rejected"
): Promise<void> {
  const db = getFirebaseDb();
  if (!db) throw new Error("Firebase is not configured");
  await updateDoc(doc(db, "reviews", reviewId), { status });
}

export async function getAllOrdersForAdmin(): Promise<
  { id: string; orderNumber: string; status: string; total: number; email: string; createdAt: string }[]
> {
  const db = getFirebaseDb();
  if (!db) return [];

  try {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        id:          d.id,
        orderNumber: data.orderNumber,
        status:      data.status,
        total:       data.total,
        email:       data.email,
        createdAt:   tsToIso(data.createdAt),
      };
    });
  } catch {
    return [];
  }
}

export async function getUserOrdersByEmail(email: string): Promise<
  { id: string; orderNumber: string; status: string; total: number; createdAt: string }[]
> {
  const db = getFirebaseDb();
  if (!db) return [];

  const q = query(
    collection(db, "orders"),
    where("email", "==", email.toLowerCase()),
    orderBy("createdAt", "desc")
  );

  try {
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        id:          d.id,
        orderNumber: data.orderNumber,
        status:      data.status,
        total:       data.total,
        createdAt:   tsToIso(data.createdAt),
      };
    });
  } catch {
    return [];
  }
}
