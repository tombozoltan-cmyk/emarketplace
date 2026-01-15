"use client";

import React from "react";
import { AdminSidebar } from "./AdminSidebar";
import { useAdminAuth } from "./AdminAuthProvider";
import { Loader2 } from "lucide-react";

type AdminLayoutProps = {
  children: React.ReactNode;
  title?: string;
  description?: string;
};

export function AdminLayout({ children, title, description }: AdminLayoutProps) {
  const { isAuthenticated, isLoading } = useAdminAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[color:var(--background)]">
        <Loader2 className="w-8 h-8 animate-spin text-[color:var(--primary)]" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[color:var(--background)]">
      <AdminSidebar />
      <main className="ml-56 transition-all duration-300">
        <div className="p-6 lg:p-8">
          {(title || description) && (
            <div className="mb-6">
              {title && (
                <h1 className="text-2xl font-bold text-[color:var(--foreground)]">
                  {title}
                </h1>
              )}
              {description && (
                <p className="mt-1 text-sm text-[color:var(--muted-foreground)]">
                  {description}
                </p>
              )}
            </div>
          )}
          {children}
        </div>
      </main>
    </div>
  );
}

export default AdminLayout;
