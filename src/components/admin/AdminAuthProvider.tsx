"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { User } from "firebase/auth";
import {
  GoogleAuthProvider,
  getRedirectResult,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut,
} from "firebase/auth";
import { firestoreDb } from "../../lib/firebase";
import { firebaseAuth } from "../../lib/firebase-auth";
import { doc, onSnapshot } from "firebase/firestore";

type AdminAuthContextValue = {
  user: User | null;
  isLoading: boolean;
  isAdmin: boolean;
  isAuthenticated: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

const defaultAdminEmails: string[] = [
  "emarketplacekft@gmail.com",
  "tombo.zoltan@gmail.com",
];

const parseAdminEmails = (raw: string | undefined): string[] => {
  const parsed = (raw ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  return Array.from(new Set([...defaultAdminEmails, ...parsed]));
};

export function AdminAuthProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInFirestore, setIsInFirestore] = useState(false);
  const [firestoreChecked, setFirestoreChecked] = useState(false);
  const signInInProgress = useRef(false);

  const adminEmails = useMemo(
    () => parseAdminEmails(process.env.NEXT_PUBLIC_ADMIN_EMAILS),
    [],
  );

  const isInHardcodedList = useMemo(() => {
    const email = user?.email?.toLowerCase() ?? "";
    return Boolean(email && adminEmails.includes(email));
  }, [adminEmails, user?.email]);

  // Check if user exists in adminUsers Firestore collection
  useEffect(() => {
    if (!user?.email) {
      setIsInFirestore(false);
      setFirestoreChecked(true);
      return;
    }

    const docId = user.email.toLowerCase().replace(/[.@]/g, "_");
    const unsubscribe = onSnapshot(
      doc(firestoreDb, "adminUsers", docId),
      (snapshot) => {
        setIsInFirestore(snapshot.exists());
        setFirestoreChecked(true);
      },
      (error) => {
        console.error("Error checking admin user:", error);
        setIsInFirestore(false);
        setFirestoreChecked(true);
      }
    );

    return () => unsubscribe();
  }, [user?.email]);

  // User is admin if in hardcoded list OR in Firestore collection
  const isAdmin = isInHardcodedList || isInFirestore;

  useEffect(() => {
    getRedirectResult(firebaseAuth).catch((error: unknown) => {
      console.error("Redirect result error:", error);
    });

    const unsubscribe = onAuthStateChanged(firebaseAuth, (nextUser) => {
      setUser(nextUser);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSignIn = useCallback(async () => {
    if (signInInProgress.current) return;
    signInInProgress.current = true;
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(firebaseAuth, provider);
    } catch (error: unknown) {
      const firebaseError = error as { code?: string };
      if (firebaseError.code === "auth/popup-blocked") {
        const provider = new GoogleAuthProvider();
        await signInWithRedirect(firebaseAuth, provider);
        return;
      }

      if (firebaseError.code === "auth/popup-closed-by-user") {
        return;
      }

      if (firebaseError.code !== "auth/cancelled-popup-request") {
        console.error("Sign in error:", error);
      }
    } finally {
      signInInProgress.current = false;
    }
  }, []);

  const handleSignOut = useCallback(async () => {
    await signOut(firebaseAuth);
  }, []);

  const isAuthenticated = isAdmin && !isLoading && firestoreChecked;

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAdmin,
      isAuthenticated,
      signIn: handleSignIn,
      signOut: handleSignOut,
    }),
    [handleSignIn, handleSignOut, isAdmin, isAuthenticated, isLoading, user],
  );

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth(): AdminAuthContextValue {
  const ctx = useContext(AdminAuthContext);

  if (!ctx) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }

  return ctx;
}
