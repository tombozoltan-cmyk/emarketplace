"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  deleteDoc,
  type Timestamp,
} from "firebase/firestore";
import {
  Search,
  Mail,
  Phone,
  Building2,
  MapPin,
  MessageSquare,
  Calendar,
  Loader2,
  Trash2,
  Globe,
} from "lucide-react";
import { firestoreDb } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AdminLayout,
  AdminCard,
  AdminCardHeader,
  AdminCardTitle,
  AdminCardContent,
  StatusBadge,
  AdminModal,
  AdminModalSection,
  AdminModalField,
  AdminModalGrid,
} from "@/components/admin";

type InquiryStatus = "new" | "in_progress" | "closed";

type Inquiry = {
  id: string;
  createdAt: Timestamp | null;
  status: InquiryStatus;
  type: string;
  language: "hu" | "en";
  sourcePath: string | null;
  selectedPackage: string;
  companyType: string;
  companyName: string;
  taxNumber: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  address: string;
  message: string;
  contact: null | {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
};

const STATUS_CONFIG: Record<InquiryStatus, { label: string; variant: "default" | "success" | "warning" | "error" | "info" }> = {
  new: { label: "Új", variant: "warning" },
  in_progress: { label: "Folyamatban", variant: "info" },
  closed: { label: "Lezárt", variant: "default" },
};

const formatDate = (ts: Timestamp | null): string => {
  if (!ts) return "-";
  return ts.toDate().toLocaleDateString("hu-HU", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function InquiriesPage() {
  const [items, setItems] = useState<Inquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | InquiryStatus>("all");
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const q = query(collection(firestoreDb, "inquiries"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Inquiry));
      setItems(docs);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        !searchQuery ||
        item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.companyName?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [items, searchQuery, statusFilter]);

  const openModal = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
    setIsModalOpen(true);
  };

  const updateStatus = useCallback(async (status: InquiryStatus) => {
    if (!selectedInquiry) return;
    setIsUpdating(true);
    try {
      await updateDoc(doc(firestoreDb, "inquiries", selectedInquiry.id), { status });
      setSelectedInquiry({ ...selectedInquiry, status });
    } catch (error) {
      console.error("Status update error:", error);
    } finally {
      setIsUpdating(false);
    }
  }, [selectedInquiry]);

  const deleteInquiry = useCallback(async () => {
    if (!selectedInquiry || !confirm("Biztosan törlöd ezt az érdeklődést?")) return;
    setIsUpdating(true);
    try {
      await deleteDoc(doc(firestoreDb, "inquiries", selectedInquiry.id));
      setIsModalOpen(false);
      setSelectedInquiry(null);
    } catch (error) {
      console.error("Delete error:", error);
    } finally {
      setIsUpdating(false);
    }
  }, [selectedInquiry]);

  const statusCounts = useMemo(() => {
    return {
      new: items.filter((i) => i.status === "new").length,
      in_progress: items.filter((i) => i.status === "in_progress").length,
      closed: items.filter((i) => i.status === "closed").length,
    };
  }, [items]);

  return (
    <AdminLayout title="Érdeklődések" description="Beérkezett ajánlatkérések és kapcsolatfelvételek">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[color:var(--muted-foreground)]" />
          <Input
            placeholder="Keresés név, email, cégnév..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={statusFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("all")}
          >
            Mind ({items.length})
          </Button>
          <Button
            variant={statusFilter === "new" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("new")}
            className={statusFilter !== "new" && statusCounts.new > 0 ? "border-yellow-500" : ""}
          >
            Új ({statusCounts.new})
          </Button>
          <Button
            variant={statusFilter === "in_progress" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("in_progress")}
          >
            Folyamatban ({statusCounts.in_progress})
          </Button>
          <Button
            variant={statusFilter === "closed" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("closed")}
          >
            Lezárt ({statusCounts.closed})
          </Button>
        </div>
      </div>

      {/* Loading */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[color:var(--primary)]" />
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-20 text-[color:var(--muted-foreground)]">
          Nincs találat
        </div>
      ) : (
        /* Cards grid */
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredItems.map((item) => (
            <AdminCard key={item.id} onClick={() => openModal(item)} hoverable>
              <div className="space-y-3">
                {/* Header: Ügyfél név és cégnév */}
                <div>
                  <h3 className="font-semibold text-[color:var(--foreground)] text-base leading-tight">
                    {item.name || "Névtelen"}
                  </h3>
                  {item.companyName && (
                    <p className="text-sm text-[color:var(--muted-foreground)] mt-0.5 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5" />
                      <span className="truncate">{item.companyName}</span>
                    </p>
                  )}
                  <p className="text-xs text-[color:var(--primary)] mt-1 font-medium">
                    {item.type || item.selectedPackage || "Általános érdeklődés"}
                  </p>
                </div>

                {/* Státusz badge - külön sorban, jól olvasható */}
                <div>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-semibold ${
                    item.status === "new" 
                      ? "bg-amber-500 text-white" 
                      : item.status === "in_progress"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-500 text-white"
                  }`}>
                    {STATUS_CONFIG[item.status].label}
                  </span>
                </div>

                {/* Info rows */}
                <div className="space-y-1.5 pt-2 border-t border-[color:var(--border)]">
                  <div className="flex items-center gap-2 text-sm text-[color:var(--muted-foreground)]">
                    <Mail className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{item.email || "-"}</span>
                  </div>
                  {item.phone && (
                    <div className="flex items-center gap-2 text-sm text-[color:var(--muted-foreground)]">
                      <Phone className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{item.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-[color:var(--muted-foreground)]">
                    <Calendar className="w-3.5 h-3.5 shrink-0" />
                    <span>{formatDate(item.createdAt)}</span>
                  </div>
                  {item.language && (
                    <div className="flex items-center gap-2 text-sm text-[color:var(--muted-foreground)]">
                      <Globe className="w-3.5 h-3.5 shrink-0" />
                      <span>{item.language === "hu" ? "Magyar" : "English"}</span>
                    </div>
                  )}
                </div>
              </div>
            </AdminCard>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedInquiry?.companyName || selectedInquiry?.name || "Érdeklődés részletei"}
        size="lg"
        footer={
          <>
            <Button variant="destructive" size="sm" onClick={deleteInquiry} disabled={isUpdating}>
              <Trash2 className="w-4 h-4 mr-1" />
              Törlés
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Bezárás
            </Button>
          </>
        }
      >
        {selectedInquiry && (
          <div className="space-y-5">
            {/* Status Row */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-[color:var(--foreground)] mr-2">Státusz:</span>
              {(["new", "in_progress", "closed"] as InquiryStatus[]).map((status) => (
                <button
                  key={status}
                  onClick={() => updateStatus(status)}
                  disabled={isUpdating}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                    selectedInquiry.status === status
                      ? "bg-[color:var(--primary)] text-white shadow-sm"
                      : "bg-[color:var(--muted)] text-[color:var(--muted-foreground)] hover:bg-[color:var(--muted)]/80"
                  }`}
                >
                  {STATUS_CONFIG[status].label}
                </button>
              ))}
            </div>

            {/* Two Column Layout */}
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Contact */}
                <div>
                  <h4 className="text-sm font-semibold text-[color:var(--foreground)] mb-4 pb-2 border-b border-[color:var(--border)]">Kapcsolat</h4>
                  <dl className="space-y-3 text-sm">
                    <div>
                      <dt className="text-[color:var(--muted-foreground)]">Név</dt>
                      <dd className="font-medium mt-0.5">{selectedInquiry.name || "-"}</dd>
                    </div>
                    <div>
                      <dt className="text-[color:var(--muted-foreground)]">Email</dt>
                      <dd className="mt-0.5">{selectedInquiry.email || "-"}</dd>
                    </div>
                    <div>
                      <dt className="text-[color:var(--muted-foreground)]">Telefon</dt>
                      <dd className="mt-0.5">{selectedInquiry.phone || "-"}</dd>
                    </div>
                    <div>
                      <dt className="text-[color:var(--muted-foreground)]">Ország</dt>
                      <dd className="mt-0.5">{selectedInquiry.country || "-"}</dd>
                    </div>
                    <div>
                      <dt className="text-[color:var(--muted-foreground)]">Cím</dt>
                      <dd className="mt-0.5">{selectedInquiry.address || "-"}</dd>
                    </div>
                  </dl>
                </div>

                {/* Company */}
                <div>
                  <h4 className="text-sm font-semibold text-[color:var(--foreground)] mb-4 pb-2 border-b border-[color:var(--border)]">Cégadatok</h4>
                  <dl className="space-y-3 text-sm">
                    <div>
                      <dt className="text-[color:var(--muted-foreground)]">Cégnév</dt>
                      <dd className="font-medium mt-0.5">{selectedInquiry.companyName || "-"}</dd>
                    </div>
                    <div>
                      <dt className="text-[color:var(--muted-foreground)]">Cégtípus</dt>
                      <dd className="mt-0.5">{selectedInquiry.companyType || "-"}</dd>
                    </div>
                    <div>
                      <dt className="text-[color:var(--muted-foreground)]">Adószám</dt>
                      <dd className="mt-0.5">{selectedInquiry.taxNumber || "-"}</dd>
                    </div>
                  </dl>
                </div>

                {/* Additional Contact */}
                {selectedInquiry.contact && (
                  <div>
                    <h4 className="text-sm font-semibold text-[color:var(--foreground)] mb-4 pb-2 border-b border-[color:var(--border)]">Kapcsolattartó</h4>
                    <dl className="space-y-3 text-sm">
                      <div>
                        <dt className="text-[color:var(--muted-foreground)]">Név</dt>
                        <dd className="font-medium mt-0.5">{selectedInquiry.contact.name || "-"}</dd>
                      </div>
                      <div>
                        <dt className="text-[color:var(--muted-foreground)]">Email</dt>
                        <dd className="mt-0.5">{selectedInquiry.contact.email || "-"}</dd>
                      </div>
                      <div>
                        <dt className="text-[color:var(--muted-foreground)]">Telefon</dt>
                        <dd className="mt-0.5">{selectedInquiry.contact.phone || "-"}</dd>
                      </div>
                      <div>
                        <dt className="text-[color:var(--muted-foreground)]">Cím</dt>
                        <dd className="mt-0.5">{selectedInquiry.contact.address || "-"}</dd>
                      </div>
                    </dl>
                  </div>
                )}
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Service */}
                <div>
                  <h4 className="text-sm font-semibold text-[color:var(--foreground)] mb-4 pb-2 border-b border-[color:var(--border)]">Szolgáltatás</h4>
                  <dl className="space-y-3 text-sm">
                    <div>
                      <dt className="text-[color:var(--muted-foreground)]">Kiválasztott csomag</dt>
                      <dd className="font-semibold text-[color:var(--primary)] mt-0.5">{selectedInquiry.selectedPackage || "-"}</dd>
                    </div>
                    <div>
                      <dt className="text-[color:var(--muted-foreground)]">Érdeklődés típusa</dt>
                      <dd className="mt-0.5">{selectedInquiry.type || "-"}</dd>
                    </div>
                  </dl>
                </div>

                {/* Message */}
                {selectedInquiry.message && (
                  <div>
                    <h4 className="text-sm font-semibold text-[color:var(--foreground)] mb-4 pb-2 border-b border-[color:var(--border)]">Üzenet</h4>
                    <div className="p-4 bg-[color:var(--muted)]/30 rounded-lg text-sm whitespace-pre-wrap">
                      {selectedInquiry.message}
                    </div>
                  </div>
                )}

                {/* Meta */}
                <div>
                  <h4 className="text-sm font-semibold text-[color:var(--foreground)] mb-4 pb-2 border-b border-[color:var(--border)]">Részletek</h4>
                  <dl className="space-y-3 text-sm">
                    <div>
                      <dt className="text-[color:var(--muted-foreground)]">Nyelv</dt>
                      <dd className="mt-0.5">{selectedInquiry.language === "hu" ? "Magyar" : "English"}</dd>
                    </div>
                    <div>
                      <dt className="text-[color:var(--muted-foreground)]">Beérkezés</dt>
                      <dd className="mt-0.5">{formatDate(selectedInquiry.createdAt)}</dd>
                    </div>
                    {selectedInquiry.sourcePath && (
                      <div>
                        <dt className="text-[color:var(--muted-foreground)]">Forrás oldal</dt>
                        <dd className="text-xs font-mono mt-0.5">{selectedInquiry.sourcePath}</dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>
            </div>
          </div>
        )}
      </AdminModal>
    </AdminLayout>
  );
}
