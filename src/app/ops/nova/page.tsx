"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { collection, query, orderBy, limit, onSnapshot, where, Timestamp } from "firebase/firestore";
import { firestoreDb } from "@/lib/firebase";
import {
  AdminLayout,
  AdminCard,
  useAdminAuth,
} from "@/components/admin";
import {
  FileText,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  Users,
  Calendar,
  Mail,
  Building2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type InquiryItem = {
  id: string;
  name?: string;
  email?: string;
  companyName?: string;
  type?: string;
  status?: string;
  createdAt?: Timestamp;
};

type ContractItem = {
  id: string;
  company?: { name?: string; shortName?: string };
  contact?: { email?: string };
  status?: string;
  packageId?: string;
  createdAt?: Timestamp;
};

type Stats = {
  inquiries: { total: number; new: number; thisWeek: number };
  contracts: { total: number; pending: number; active: number };
};

const STATUS_LABELS: Record<string, string> = {
  new: "Új",
  in_progress: "Folyamatban",
  closed: "Lezárt",
  pending_review: "Ellenőrzésre vár",
  approved: "Jóváhagyva",
  active: "Aktív",
  rejected: "Elutasítva",
};

const formatDate = (ts?: Timestamp) => {
  if (!ts) return "-";
  return ts.toDate().toLocaleDateString("hu-HU", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function AdminDashboardPage() {
  const { user } = useAdminAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    inquiries: { total: 0, new: 0, thisWeek: 0 },
    contracts: { total: 0, pending: 0, active: 0 },
  });
  const [recentInquiries, setRecentInquiries] = useState<InquiryItem[]>([]);
  const [recentContracts, setRecentContracts] = useState<ContractItem[]>([]);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    // Inquiries listener
    const inquiriesQuery = query(
      collection(firestoreDb, "inquiries"),
      orderBy("createdAt", "desc"),
      limit(100)
    );

    const unsubInquiries = onSnapshot(inquiriesQuery, (snapshot) => {
      const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as InquiryItem));
      const newCount = items.filter((i) => i.status === "new").length;
      const thisWeekCount = items.filter((i) => {
        if (!i.createdAt) return false;
        return i.createdAt.toDate() >= weekAgo;
      }).length;

      setStats((prev) => ({
        ...prev,
        inquiries: { total: items.length, new: newCount, thisWeek: thisWeekCount },
      }));
      setRecentInquiries(items.slice(0, 5));
    });

    // Contracts listener
    const contractsQuery = query(
      collection(firestoreDb, "contracts"),
      orderBy("createdAt", "desc"),
      limit(100)
    );

    const unsubContracts = onSnapshot(contractsQuery, (snapshot) => {
      const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as ContractItem));
      const pendingCount = items.filter((c) => c.status === "pending_review" || c.status === "documents_needed").length;
      const activeCount = items.filter((c) => c.status === "active" || c.status === "approved").length;

      setStats((prev) => ({
        ...prev,
        contracts: { total: items.length, pending: pendingCount, active: activeCount },
      }));
      setRecentContracts(items.slice(0, 5));
      setIsLoading(false);
    });

    return () => {
      unsubInquiries();
      unsubContracts();
    };
  }, [user]);

  return (
    <AdminLayout title="Vezérlőpult" description="Áttekintés és gyors hozzáférés">
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[color:var(--primary)]" />
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Új érdeklődések */}
            <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-5 text-white">
              <div className="flex items-center justify-between">
                <AlertCircle className="w-8 h-8 opacity-80" />
                <span className="text-3xl font-bold">{stats.inquiries.new}</span>
              </div>
              <div className="mt-3 text-sm font-medium opacity-90">Új érdeklődés</div>
              <div className="text-xs opacity-75">Feldolgozásra vár</div>
            </div>

            {/* Függőben lévő szerződések */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white">
              <div className="flex items-center justify-between">
                <Clock className="w-8 h-8 opacity-80" />
                <span className="text-3xl font-bold">{stats.contracts.pending}</span>
              </div>
              <div className="mt-3 text-sm font-medium opacity-90">Függő szerződés</div>
              <div className="text-xs opacity-75">Ellenőrzésre vár</div>
            </div>

            {/* Aktív szerződések */}
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white">
              <div className="flex items-center justify-between">
                <CheckCircle className="w-8 h-8 opacity-80" />
                <span className="text-3xl font-bold">{stats.contracts.active}</span>
              </div>
              <div className="mt-3 text-sm font-medium opacity-90">Aktív szerződés</div>
              <div className="text-xs opacity-75">Jóváhagyva / Aktív</div>
            </div>

            {/* Heti érdeklődések */}
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5 text-white">
              <div className="flex items-center justify-between">
                <TrendingUp className="w-8 h-8 opacity-80" />
                <span className="text-3xl font-bold">{stats.inquiries.thisWeek}</span>
              </div>
              <div className="mt-3 text-sm font-medium opacity-90">Heti érdeklődés</div>
              <div className="text-xs opacity-75">Elmúlt 7 nap</div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Recent Inquiries */}
            <AdminCard>
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-[color:var(--primary)]" />
                    <h3 className="font-semibold text-[color:var(--foreground)]">Legutóbbi érdeklődések</h3>
                  </div>
                  <Link href="/ops/nova/inquiries">
                    <Button variant="ghost" size="sm" className="text-xs">
                      Összes <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </Link>
                </div>

                {recentInquiries.length === 0 ? (
                  <p className="text-sm text-[color:var(--muted-foreground)] py-4 text-center">
                    Még nincs érdeklődés
                  </p>
                ) : (
                  <div className="space-y-3">
                    {recentInquiries.map((item) => (
                      <Link
                        key={item.id}
                        href="/ops/nova/inquiries"
                        className="flex items-center gap-3 p-3 rounded-lg bg-[color:var(--muted)]/30 hover:bg-[color:var(--muted)]/50 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-[color:var(--foreground)] truncate">
                            {item.name || "Névtelen"}
                          </div>
                          <div className="text-xs text-[color:var(--muted-foreground)] truncate">
                            {item.companyName || item.email || "-"}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                            item.status === "new" ? "bg-amber-100 text-amber-800" :
                            item.status === "in_progress" ? "bg-blue-100 text-blue-800" :
                            "bg-gray-100 text-gray-800"
                          }`}>
                            {STATUS_LABELS[item.status || "new"] || item.status}
                          </span>
                          <div className="text-xs text-[color:var(--muted-foreground)] mt-1">
                            {formatDate(item.createdAt)}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </AdminCard>

            {/* Recent Contracts */}
            <AdminCard>
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[color:var(--primary)]" />
                    <h3 className="font-semibold text-[color:var(--foreground)]">Legutóbbi szerződések</h3>
                  </div>
                  <Link href="/ops/nova/contracts">
                    <Button variant="ghost" size="sm" className="text-xs">
                      Összes <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </Link>
                </div>

                {recentContracts.length === 0 ? (
                  <p className="text-sm text-[color:var(--muted-foreground)] py-4 text-center">
                    Még nincs szerződés
                  </p>
                ) : (
                  <div className="space-y-3">
                    {recentContracts.map((item) => (
                      <Link
                        key={item.id}
                        href="/ops/nova/contracts"
                        className="flex items-center gap-3 p-3 rounded-lg bg-[color:var(--muted)]/30 hover:bg-[color:var(--muted)]/50 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-[color:var(--foreground)] truncate">
                            {item.company?.name || "Névtelen cég"}
                          </div>
                          <div className="text-xs text-[color:var(--muted-foreground)] truncate">
                            {item.contact?.email || "-"}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                            item.status === "active" || item.status === "approved" ? "bg-green-100 text-green-800" :
                            item.status === "pending_review" || item.status === "documents_needed" ? "bg-amber-100 text-amber-800" :
                            item.status === "rejected" ? "bg-red-100 text-red-800" :
                            "bg-gray-100 text-gray-800"
                          }`}>
                            {STATUS_LABELS[item.status || "draft"] || item.status}
                          </span>
                          <div className="text-xs text-[color:var(--muted-foreground)] mt-1">
                            {formatDate(item.createdAt)}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </AdminCard>
          </div>

          {/* Summary Stats */}
          <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[color:var(--card)] border border-[color:var(--border)] rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-[color:var(--foreground)]">{stats.inquiries.total}</div>
                  <div className="text-xs text-[color:var(--muted-foreground)]">Összes érdeklődés</div>
                </div>
              </div>
            </div>

            <div className="bg-[color:var(--card)] border border-[color:var(--border)] rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-[color:var(--foreground)]">{stats.contracts.total}</div>
                  <div className="text-xs text-[color:var(--muted-foreground)]">Összes szerződés</div>
                </div>
              </div>
            </div>

            <div className="bg-[color:var(--card)] border border-[color:var(--border)] rounded-xl p-4 col-span-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-[color:var(--foreground)]">
                    {new Date().toLocaleDateString("hu-HU", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                  </div>
                  <div className="text-xs text-[color:var(--muted-foreground)]">Mai nap</div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
