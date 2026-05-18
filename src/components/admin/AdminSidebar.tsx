"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { doc, onSnapshot } from "firebase/firestore";
import { firestoreDb } from "@/lib/firebase";
import {
  LayoutDashboard,
  FileText,
  Users,
  Mail,
  MessageSquare,
  CreditCard,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
  X,
  FileCode,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminAuth } from "@/components/admin/AdminAuthProvider";
import { ThemeToggle } from "@/components/ThemeToggle";

const ADMIN_BASE = "/ops/nova";
const LOGO_URL = "https://firebasestorage.googleapis.com/v0/b/emarketplace-8aab1.firebasestorage.app/o/image%2FPlexi-tabla-86x53-E-marketplace_logo-2.png?alt=media";

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Jó reggelt";
  if (hour < 18) return "Szép napot";
  return "Jó estét";
};


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
    href: `${ADMIN_BASE}/company-search`,
    label: "Cégkereső",
    icon: <Building2 className="w-5 h-5" />,
  },
  {
    href: `${ADMIN_BASE}/docx-templates`,
    label: "DOCX Sablonok",
    icon: <FileCode className="w-5 h-5" />,
  },
  {
    href: `${ADMIN_BASE}/pdf-forms`,
    label: "PDF Űrlapok",
    icon: <FileText className="w-5 h-5" />,
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

type AdminSidebarProps = {
  mobileOpen: boolean;
  onMobileClose: () => void;
};

export function AdminSidebar({ mobileOpen, onMobileClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { signOut, user } = useAdminAuth();
  const [adminFirstName, setAdminFirstName] = useState<string | null>(null);

  // Fetch user's firstName from adminUsers collection
  useEffect(() => {
    if (!user?.email) return;
    
    const docId = user.email.toLowerCase().replace(/[.@]/g, "_");
    const unsubscribe = onSnapshot(
      doc(firestoreDb, "adminUsers", docId),
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          setAdminFirstName(data.firstName || null);
        }
      },
      (error) => {
        console.error("Error fetching admin user:", error);
      }
    );
    return () => unsubscribe();
  }, [user?.email]);

  // Close mobile menu on route change
  useEffect(() => {
    onMobileClose();
  }, [pathname, onMobileClose]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const isActive = (href: string) => {
    if (href === ADMIN_BASE) {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen bg-[color:var(--card)] border-r border-[color:var(--border)] transition-all duration-300 flex flex-col",
          // Desktop
          "hidden lg:flex",
          collapsed ? "lg:w-16" : "lg:w-56",
          // Mobile - slide in
          mobileOpen && "!flex w-72"
        )}
      >
        {/* Header with Logo & Welcome */}
        <div className="border-b border-[color:var(--border)]">
          {/* Logo row */}
          <div className="h-14 flex items-center justify-between px-3">
            {(!collapsed || mobileOpen) ? (
              <Link href={ADMIN_BASE} className="flex items-center gap-2">
                <img src={LOGO_URL} alt="E-Marketplace" className="h-8 w-auto" />
                <span className="font-bold text-[color:var(--foreground)]">E-marketplace</span>
              </Link>
            ) : (
              <Link href={ADMIN_BASE} className="mx-auto">
                <img src={LOGO_URL} alt="E-Marketplace" className="h-7 w-auto" />
              </Link>
            )}
            {/* Mobile close button */}
            <button
              onClick={onMobileClose}
              className="lg:hidden p-1.5 rounded-md hover:bg-[color:var(--muted)] text-[color:var(--muted-foreground)] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            {/* Desktop collapse button */}
            {(!collapsed || !mobileOpen) && (
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="hidden lg:block p-1.5 rounded-md hover:bg-[color:var(--muted)] text-[color:var(--muted-foreground)] transition-colors"
                title={collapsed ? "Kinyitás" : "Összecsukás"}
              >
                {collapsed ? (
                  <ChevronRight className="w-5 h-5" />
                ) : (
                  <ChevronLeft className="w-5 h-5" />
                )}
              </button>
            )}
          </div>
          
          {/* Welcome message */}
          {(!collapsed || mobileOpen) && user && (
            <div className="px-4 pb-3">
              <p className="text-xs text-[color:var(--muted-foreground)]">
                {getGreeting()},
              </p>
              <p className="text-sm font-semibold text-[color:var(--foreground)]">
                {adminFirstName || user.displayName?.split(" ")[0] || "Admin"}! 👋
              </p>
            </div>
          )}
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

      {/* User Info & Footer */}
      <div className="p-2 border-t border-[color:var(--border)]">
        {user && !collapsed && (
          <div className="px-3 py-2 mb-2">
            <div className="flex items-center gap-2">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[color:var(--primary)] flex items-center justify-center text-white text-sm font-medium">
                  {(user.displayName || user.email || 'U')[0].toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-[color:var(--foreground)] truncate">
                  {user.displayName || 'Admin'}
                </div>
                <div className="text-xs text-[color:var(--muted-foreground)] truncate">
                  {user.email}
                </div>
              </div>
            </div>
          </div>
        )}
        {user && collapsed && (
          <div className="flex justify-center py-2 mb-2" title={user.displayName || user.email || 'Admin'}>
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'User'}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[color:var(--primary)] flex items-center justify-center text-white text-sm font-medium">
                {(user.displayName || user.email || 'U')[0].toUpperCase()}
              </div>
            )}
          </div>
        )}
        
        {/* Theme toggle & Logout */}
        <div className={cn(
          "flex items-center gap-1",
          collapsed ? "flex-col" : "justify-between"
        )}>
          <ThemeToggle />
          <button
            onClick={() => signOut()}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-[color:var(--muted-foreground)] hover:bg-[color:var(--muted)] hover:text-[color:var(--foreground)] transition-all",
              collapsed ? "justify-center px-2" : "flex-1"
            )}
            title={collapsed ? "Kijelentkezés" : undefined}
          >
            <LogOut className="w-5 h-5" />
            {(!collapsed || mobileOpen) && <span className="text-sm font-medium">Kijelentkezés</span>}
          </button>
        </div>
      </div>
    </aside>
    </>
  );
}

export default AdminSidebar;
