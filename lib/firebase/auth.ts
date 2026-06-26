import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updateProfile,
  type User,
} from "firebase/auth";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { getFirebaseAuth, getFirebaseDb } from "@/lib/firebase/client";
import type { UserProfile } from "@/types/user";

const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle(): Promise<User> {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error("Firebase is not configured");
  const result = await signInWithPopup(auth, googleProvider);
  await ensureUserDocument(result.user);
  return result.user;
}

export async function signInWithEmail(email: string, password: string): Promise<User> {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error("Firebase is not configured");
  const result = await signInWithEmailAndPassword(auth, email, password);
  await touchUserDocument(result.user);
  return result.user;
}

export async function registerWithEmail(
  email: string,
  password: string,
  displayName: string
): Promise<User> {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error("Firebase is not configured");
  const result = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(result.user, { displayName });
  await ensureUserDocument(result.user, displayName);
  return result.user;
}

export async function signOut(): Promise<void> {
  const auth = getFirebaseAuth();
  if (!auth) return;
  await firebaseSignOut(auth);
}

export async function ensureUserDocument(user: User, displayName?: string): Promise<void> {
  const db = getFirebaseDb();
  if (!db) return;

  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    const profile: UserProfile = {
      email:       user.email ?? "",
      displayName: displayName ?? user.displayName ?? "",
      photoURL:    user.photoURL,
      role:        "customer",
      phone:       "",
      addresses:   [],
      createdAt:   new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };
    await setDoc(ref, { ...profile, createdAt: serverTimestamp(), lastLoginAt: serverTimestamp() });
  } else {
    await touchUserDocument(user);
  }
}

async function touchUserDocument(user: User): Promise<void> {
  const db = getFirebaseDb();
  if (!db) return;
  await updateDoc(doc(db, "users", user.uid), { lastLoginAt: serverTimestamp() });
}

export async function fetchUserProfile(uid: string): Promise<UserProfile | null> {
  const db = getFirebaseDb();
  if (!db) return null;
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    email:       data.email ?? "",
    displayName: data.displayName ?? "",
    photoURL:    data.photoURL ?? null,
    role:        data.role ?? "customer",
    phone:       data.phone ?? "",
    addresses:   data.addresses ?? [],
    createdAt:   data.createdAt?.toDate?.()?.toISOString?.() ?? data.createdAt ?? "",
    lastLoginAt: data.lastLoginAt?.toDate?.()?.toISOString?.() ?? data.lastLoginAt ?? "",
  };
}

export async function updateUserProfile(
  uid: string,
  patch: Partial<Pick<UserProfile, "displayName" | "phone" | "addresses">>
): Promise<void> {
  const db = getFirebaseDb();
  if (!db) throw new Error("Firebase is not configured");
  await updateDoc(doc(db, "users", uid), patch);
}
