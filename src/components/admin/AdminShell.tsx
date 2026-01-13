"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  LayoutDashboard,
  LogOut,
  BadgeDollarSign,
  Megaphone,
  Mail,
  Users,
  FileSignature,
  FolderOpen,
} from "lucide-react";
import { Button } from "../ui/button";
import { useAdminAuth } from "./AdminAuthProvider";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

export function AdminShell({
  basePath,
  title = "Dashboard",
  children,
}: Readonly<{ basePath: string; title?: string; children: React.ReactNode }>) {
  const pathname = usePathname();
  const { signOut, user } = useAdminAuth();

  const navItems: NavItem[] = useMemo(
    () => [
      { href: `${basePath}`, label: "Dashboard", icon: LayoutDashboard },
      { href: `${basePath}/inquiries`, label: "Beérkezett kérések", icon: FileText },
      { href: `${basePath}/contracts`, label: "Szerződések", icon: FileSignature },
      { href: `${basePath}/contract-templates`, label: "Szerződés sablonok", icon: FolderOpen },
      { href: `${basePath}/pricing`, label: "Árak", icon: BadgeDollarSign },
      { href: `${basePath}/marketing`, label: "Marketing beállítások", icon: Megaphone },
      { href: `${basePath}/email`, label: "Email beállítások", icon: Mail },
      { href: `${basePath}/blog`, label: "Blog szerkesztő", icon: FileText },
      { href: `${basePath}/users`, label: "Felhasználók", icon: Users },
    ],
    [basePath],
  );

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      <aside className="hidden w-72 flex-col border-r border-border bg-card text-card-foreground md:flex">
        <div className="flex items-center gap-2 border-b border-border px-5 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-black">
            EM
          </div>
          <div className="flex flex-col">
            <div className="text-sm font-semibold">Admin</div>
            <div className="text-xs text-muted-foreground">E-Marketplace</div>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-3 py-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary/15 text-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-3">
          <div className="px-2 pb-2 text-xs text-muted-foreground">
            {user?.email ?? ""}
          </div>
          <Button
            type="button"
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={signOut}
          >
            <LogOut className="h-4 w-4" />
            Kijelentkezés
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border bg-background px-4 py-3 md:px-6">
          <div className="text-sm font-semibold">{title}</div>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" onClick={signOut} className="md:hidden">
              Kijelentkezés
            </Button>
          </div>
        </header>

        <main className="w-full flex-1 px-4 py-6 md:px-6">{children}</main>
      </div>
    </div>
  );
}
