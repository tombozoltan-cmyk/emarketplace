"use client";

import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCgvD1B5Vy6NnmYas7E-V54HmWEsepUMs4",
  authDomain: "emarketplace-8aab1.firebaseapp.com",
  projectId: "emarketplace-8aab1",
  storageBucket: "emarketplace-8aab1.firebasestorage.app",
  messagingSenderId: "589774877876",
  appId: "1:589774877876:web:d3bfb76e9325b1de2713e1",
  measurementId: "G-W0B9WCH8LC",
};

export const firebaseApp: FirebaseApp =
  getApps().length > 0 ? getApps()[0]! : initializeApp(firebaseConfig);

export const firebaseAuth: Auth = getAuth(firebaseApp);

export const firestoreDb: Firestore = getFirestore(firebaseApp);

export const firebaseStorage: FirebaseStorage = getStorage(firebaseApp);

let analyticsPromise: Promise<Analytics | null> | null = null;

export const getFirebaseAnalytics = (): Promise<Analytics | null> => {
  if (typeof window === "undefined") {
    return Promise.resolve(null);
  }

  if (!analyticsPromise) {
    analyticsPromise = isSupported()
      .then((supported: boolean) =>
        supported ? getAnalytics(firebaseApp) : null,
      )
      .catch(() => null);
  }

  return analyticsPromise ?? Promise.resolve(null);
};
