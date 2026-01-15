"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Users,
  Mail,
  MessageSquare,
  CreditCard,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  FileEdit,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminAuth } from "@/components/admin/AdminAuthProvider";

const ADMIN_BASE = "/ops/nova";

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
};

const navItems: NavItem[] = [
  {
    href: ADMIN_BASE,
    label: "Dashboard",
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    href: `${ADMIN_BASE}/inquiries`,
    label: "Érdeklődések",
    icon: <MessageSquare className="w-5 h-5" />,
  },
  {
    href: `${ADMIN_BASE}/contracts`,
    label: "Szerződések",
    icon: <FileText className="w-5 h-5" />,
  },
  {
    href: `${ADMIN_BASE}/contract-templates`,
    label: "Sablonok",
    icon: <FileEdit className="w-5 h-5" />,
  },
  {
    href: `${ADMIN_BASE}/blog`,
    label: "Blog",
    icon: <FileText className="w-5 h-5" />,
  },
  {
    href: `${ADMIN_BASE}/email`,
    label: "Email",
    icon: <Mail className="w-5 h-5" />,
  },
  {
    href: `${ADMIN_BASE}/users`,
    label: "Felhasználók",
    icon: <Users className="w-5 h-5" />,
  },
  {
    href: `${ADMIN_BASE}/pricing`,
    label: "Árazás",
    icon: <CreditCard className="w-5 h-5" />,
  },
  {
    href: `${ADMIN_BASE}/marketing`,
    label: "Marketing",
    icon: <BarChart3 className="w-5 h-5" />,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { signOut } = useAdminAuth();

  const isActive = (href: string) => {
    if (href === ADMIN_BASE) {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-[color:var(--card)] border-r border-[color:var(--border)] transition-all duration-300 flex flex-col",
        collapsed ? "w-16" : "w-56"
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-[color:var(--border)]">
        {!collapsed && (
          <Link href={ADMIN_BASE} className="font-bold text-lg text-[color:var(--primary)]">
            E-Marketplace
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-md hover:bg-[color:var(--muted)] text-[color:var(--muted-foreground)] transition-colors"
          title={collapsed ? "Kinyitás" : "Összecsukás"}
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                  isActive(item.href)
                    ? "bg-[color:var(--primary)] text-[color:var(--primary-foreground)]"
                    : "text-[color:var(--muted-foreground)] hover:bg-[color:var(--muted)] hover:text-[color:var(--foreground)]",
                  collapsed && "justify-center px-2"
                )}
                title={collapsed ? item.label : undefined}
              >
                {item.icon}
                {!collapsed && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
                {!collapsed && item.badge !== undefined && item.badge > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-[color:var(--border)]">
        <button
          onClick={() => signOut()}
          className={cn(
            "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-[color:var(--muted-foreground)] hover:bg-[color:var(--muted)] hover:text-[color:var(--foreground)] transition-all",
            collapsed && "justify-center px-2"
          )}
          title={collapsed ? "Kijelentkezés" : undefined}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span className="text-sm font-medium">Kijelentkezés</span>}
        </button>
      </div>
    </aside>
  );
}

export default AdminSidebar;
