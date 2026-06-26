"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import {
  fetchUserProfile,
  signInWithEmail,
  signInWithGoogle,
  registerWithEmail,
  signOut as authSignOut,
} from "@/lib/firebase/auth";
import { mergeCartToFirestore } from "@/lib/firebase/firestore";
import type { UserProfile } from "@/types/user";
import type { CartItem } from "@/types/cart";

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  firebaseReady: boolean;
  signInGoogle: () => Promise<void>;
  signInEmail: (email: string, password: string) => Promise<void>;
  registerEmail: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const firebaseReady = isFirebaseConfigured();

  const refreshProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      return;
    }
    const p = await fetchUserProfile(user.uid);
    setProfile(p);
  }, [user]);

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const p = await fetchUserProfile(firebaseUser.uid);
        setProfile(p);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const signInGoogle = useCallback(async () => {
    await signInWithGoogle();
  }, []);

  const signInEmail = useCallback(async (email: string, password: string) => {
    await signInWithEmail(email, password);
  }, []);

  const registerEmail = useCallback(async (email: string, password: string, name: string) => {
    await registerWithEmail(email, password, name);
  }, []);

  const signOut = useCallback(async () => {
    await authSignOut();
    setProfile(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        firebaseReady,
        signInGoogle,
        signInEmail,
        registerEmail,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

/** Merges guest cart to Firestore once per login session */
export function useCartMergeOnLogin(items: CartItem[], clearAfterMerge?: () => void) {
  const { user } = useAuth();

  useEffect(() => {
    if (!user || items.length === 0) return;

    const key = `vc-cart-merged-${user.uid}`;
    if (sessionStorage.getItem(key)) return;

    mergeCartToFirestore(
      user.uid,
      items.map((i) => ({
        productId: i.productId,
        variantId: i.variantId,
        qty:       i.qty,
        unitPrice: i.unitPrice,
      }))
    )
      .then(() => {
        sessionStorage.setItem(key, "1");
        clearAfterMerge?.();
      })
      .catch(() => {});
  }, [user, items, clearAfterMerge]);
}
