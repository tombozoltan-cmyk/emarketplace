"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { User } from "firebase/auth";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase";

type AdminAuthContextValue = {
  user: User | null;
  isLoading: boolean;
  isAdmin: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

const parseAdminEmails = (raw: string | undefined): string[] => {
  if (!raw) {
    return [];
  }

  return raw
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
};

export function AdminAuthProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const adminEmails = useMemo(
    () => parseAdminEmails(process.env.NEXT_PUBLIC_ADMIN_EMAILS),
    [],
  );

  const isAdmin = useMemo(() => {
    const email = user?.email?.toLowerCase() ?? "";
    return Boolean(email && adminEmails.includes(email));
  }, [adminEmails, user?.email]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (nextUser) => {
      setUser(nextUser);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSignIn = useCallback(async () => {
    const provider = new GoogleAuthProvider();

    await signInWithPopup(firebaseAuth, provider);
  }, []);

  const handleSignOut = useCallback(async () => {
    await signOut(firebaseAuth);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAdmin,
      signIn: handleSignIn,
      signOut: handleSignOut,
    }),
    [handleSignIn, handleSignOut, isAdmin, isLoading, user],
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
