import type { Metadata } from "next";
import React from "react";
import { AdminAuthProvider } from "@/components/admin/AdminAuthProvider";

export const metadata: Metadata = {
  title: "Admin | E-Marketplace",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <AdminAuthProvider>{children}</AdminAuthProvider>;
}
