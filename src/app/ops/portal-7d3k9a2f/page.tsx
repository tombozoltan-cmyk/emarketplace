"use client";

import React from "react";
import Link from "next/link";
import { AdminGate } from "../../../components/admin/AdminGate";
import { AdminShell } from "../../../components/admin/AdminShell";
import { Card } from "../../../components/ui/card";

export default function AdminDashboardPage() {
  const githubRepoUrl = process.env.NEXT_PUBLIC_GITHUB_REPO_URL;

  return (
    <AdminGate>
      <AdminShell basePath="/_ops/portal-7d3k9a2f">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="p-5">
            <div className="text-xs font-medium text-muted-foreground">Új kérések</div>
            <div className="mt-2 text-2xl font-bold text-foreground">0</div>
            <div className="mt-1 text-xs text-muted-foreground">Utolsó 7 nap</div>
          </Card>
          <Card className="p-5">
            <div className="text-xs font-medium text-muted-foreground">Összes kérelem</div>
            <div className="mt-2 text-2xl font-bold text-foreground">0</div>
            <div className="mt-1 text-xs text-muted-foreground">Összesen</div>
          </Card>
          <Card className="p-5">
            <div className="text-xs font-medium text-muted-foreground">Blog posztok</div>
            <div className="mt-2 text-2xl font-bold text-foreground">0</div>
            <div className="mt-1 text-xs text-muted-foreground">Publikált</div>
          </Card>
          <Card className="p-5">
            <div className="text-xs font-medium text-muted-foreground">Marketing státusz</div>
            <div className="mt-2 text-2xl font-bold text-foreground">OK</div>
            <div className="mt-1 text-xs text-muted-foreground">Tracking / CTA</div>
          </Card>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="p-5 lg:col-span-2">
            <div className="text-sm font-semibold">Aktivitás</div>
            <div className="mt-2 text-sm text-muted-foreground">
              Itt lesz egy összesítő a legutóbbi kérésekről és tartalom módosításokról.
            </div>
          </Card>
          <Card className="p-5">
            <div className="text-sm font-semibold">Gyors műveletek</div>
            <div className="mt-2 text-sm text-muted-foreground">
              Blog cikk létrehozás, új felhasználó, marketing beállítások.
            </div>

            <div className="mt-4">
              <div className="text-sm font-semibold">Deploy</div>
              <div className="mt-2 text-sm text-muted-foreground">
                Build &amp; deploy indítása GitHub Actions-ből.
              </div>
              {githubRepoUrl ? (
                <Link
                  className="mt-3 inline-flex h-10 w-full items-center justify-center whitespace-nowrap rounded-md bg-[color:var(--primary)] px-4 py-2 text-sm font-medium text-[color:var(--primary-foreground)] transition-colors hover:bg-[color:var(--primary)]/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)] focus-visible:ring-offset-2"
                  href={`${githubRepoUrl.replace(/\/$/, "")}/actions/workflows/deploy.yml`}
                  target="_blank"
                  rel="noreferrer"
                >
                  GitHub Actions megnyitása
                </Link>
              ) : (
                <div className="mt-3 rounded-md border border-border bg-card p-3 text-xs text-muted-foreground">
                  Állítsd be a <span className="font-medium text-foreground">NEXT_PUBLIC_GITHUB_REPO_URL</span> env változót (pl.
                  https://github.com/OWNER/REPO), és új build után itt megjelenik a link.
                </div>
              )}
            </div>
          </Card>
        </div>
      </AdminShell>
    </AdminGate>
  );
}
