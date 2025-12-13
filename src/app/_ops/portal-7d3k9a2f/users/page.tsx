"use client";

import React from "react";
import { AdminGate } from "@/components/admin/AdminGate";
import { AdminShell } from "@/components/admin/AdminShell";
import { Card } from "@/components/ui/card";

export default function AdminUsersPage() {
  return (
    <AdminGate>
      <AdminShell basePath="/_ops/portal-7d3k9a2f">
        <Card className="p-5">
          <div className="text-lg font-semibold">Felhasználók</div>
          <div className="mt-2 text-sm text-muted-foreground">
            Következő lépés: `adminUsers` kollekció kezelése (hozzáadás, szerepkörök: admin/editor).
          </div>
        </Card>
      </AdminShell>
    </AdminGate>
  );
}
