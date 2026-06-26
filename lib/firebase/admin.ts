import "server-only";

import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { isFirebaseAdminConfigured } from "@/lib/firebase/config";

let adminApp: App | undefined;
let adminDb: Firestore | undefined;

function getPrivateKey(): string {
  const raw = process.env.FIREBASE_ADMIN_PRIVATE_KEY ?? "";
  return raw.replace(/\\n/g, "\n");
}

export function getAdminApp(): App | null {
  if (!isFirebaseAdminConfigured()) return null;

  if (!adminApp) {
    const existing = getApps();
    adminApp =
      existing.length > 0
        ? existing[0]
        : initializeApp({
            credential: cert({
              projectId:   process.env.FIREBASE_ADMIN_PROJECT_ID!,
              clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL!,
              privateKey:  getPrivateKey(),
            }),
          });
  }

  return adminApp;
}

export function getAdminFirestore(): Firestore | null {
  if (!getAdminApp()) return null;

  if (!adminDb) {
    adminDb = getFirestore(getAdminApp()!);
  }

  return adminDb;
}
