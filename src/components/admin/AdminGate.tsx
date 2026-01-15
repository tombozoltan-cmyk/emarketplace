"use client";

import React from "react";
import { Button } from "../ui/button";
import { useAdminAuth } from "./AdminAuthProvider";

export function AdminGate({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { user, isAdmin, isLoading, signIn, signOut } = useAdminAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] w-full items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 text-card-foreground">
          <div className="text-lg font-semibold">Betöltés...</div>
          <div className="mt-2 text-sm text-muted-foreground">
            Az admin felület előkészítése folyamatban.
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-[60vh] w-full items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 text-card-foreground">
          <div className="text-lg font-semibold">Admin belépés</div>
          <div className="mt-2 text-sm text-muted-foreground">
            Jelentkezz be Google fiókkal.
          </div>
          <Button type="button" className="mt-5 w-full" onClick={signIn}>
            Bejelentkezés Google-lel
          </Button>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-[60vh] w-full items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 text-card-foreground">
          <div className="text-lg font-semibold">Nincs jogosultság</div>
          <div className="mt-2 text-sm text-muted-foreground">
            {user.email ?? "A fiókod"} nincs felvéve az admin engedélyezési listába.
          </div>
          <Button
            type="button"
            variant="outline"
            className="mt-5 w-full"
            onClick={signOut}
          >
            Kijelentkezés
          </Button>
        </div>
      </div>
    );
  }

  return children;
}
