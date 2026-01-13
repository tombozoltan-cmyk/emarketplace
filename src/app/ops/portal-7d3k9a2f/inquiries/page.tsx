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
              <AdminCardHeader>
                <div className="flex-1 min-w-0">
                  <AdminCardTitle>{item.companyName || item.name || "Névtelen"}</AdminCardTitle>
                  <p className="text-xs text-[color:var(--muted-foreground)] mt-0.5 truncate">
                    {item.selectedPackage || "Nincs csomag"}
                  </p>
                </div>
                <StatusBadge
                  status={STATUS_CONFIG[item.status].label}
                  variant={STATUS_CONFIG[item.status].variant}
                />
              </AdminCardHeader>
              <AdminCardContent>
                <div className="flex items-center gap-2 text-sm text-[color:var(--muted-foreground)]">
                  <Mail className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{item.email || "-"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[color:var(--muted-foreground)]">
                  <Phone className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{item.phone || "-"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[color:var(--muted-foreground)]">
                  <Calendar className="w-3.5 h-3.5 shrink-0" />
                  <span>{formatDate(item.createdAt)}</span>
                </div>
              </AdminCardContent>
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
          <div className="space-y-6">
            {/* Status & Actions */}
            <div className="flex flex-wrap items-center gap-3 p-4 bg-[color:var(--muted)]/30 rounded-lg">
              <span className="text-sm font-medium">Státusz:</span>
              <div className="flex flex-wrap gap-2">
                {(["new", "in_progress", "closed"] as InquiryStatus[]).map((status) => (
                  <button
                    key={status}
                    onClick={() => updateStatus(status)}
                    disabled={isUpdating}
                    className={`px-3 py-1 text-xs font-medium rounded-full transition-all ${
                      selectedInquiry.status === status
                        ? "ring-2 ring-[color:var(--primary)] ring-offset-1"
                        : "opacity-70 hover:opacity-100"
                    } ${
                      status === "new" ? "bg-yellow-100 text-yellow-800" :
                      status === "in_progress" ? "bg-blue-100 text-blue-800" :
                      "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {STATUS_CONFIG[status].label}
                  </button>
                ))}
              </div>
            </div>

            {/* Contact Info */}
            <AdminModalSection title="Kapcsolat">
              <AdminModalGrid>
                <AdminModalField label="Név" value={selectedInquiry.name} />
                <AdminModalField label="Email" value={selectedInquiry.email} />
                <AdminModalField label="Telefon" value={selectedInquiry.phone} />
                <AdminModalField label="Ország" value={selectedInquiry.country} />
                <AdminModalField label="Cím" value={selectedInquiry.address} />
              </AdminModalGrid>
            </AdminModalSection>

            {/* Company Info */}
            <AdminModalSection title="Cég">
              <AdminModalGrid>
                <AdminModalField label="Cégnév" value={selectedInquiry.companyName} />
                <AdminModalField label="Cég típus" value={selectedInquiry.companyType} />
                <AdminModalField label="Adószám" value={selectedInquiry.taxNumber} />
              </AdminModalGrid>
            </AdminModalSection>

            {/* Package */}
            <AdminModalSection title="Szolgáltatás">
              <AdminModalField label="Kiválasztott csomag" value={selectedInquiry.selectedPackage} />
            </AdminModalSection>

            {/* Message */}
            {selectedInquiry.message && (
              <AdminModalSection title="Üzenet">
                <div className="p-3 bg-[color:var(--muted)]/30 rounded-lg text-sm whitespace-pre-wrap">
                  {selectedInquiry.message}
                </div>
              </AdminModalSection>
            )}

            {/* Additional Contact */}
            {selectedInquiry.contact && (
              <AdminModalSection title="Kapcsolattartó">
                <AdminModalGrid>
                  <AdminModalField label="Név" value={selectedInquiry.contact.name} />
                  <AdminModalField label="Email" value={selectedInquiry.contact.email} />
                  <AdminModalField label="Telefon" value={selectedInquiry.contact.phone} />
                  <AdminModalField label="Cím" value={selectedInquiry.contact.address} />
                </AdminModalGrid>
              </AdminModalSection>
            )}

            {/* Meta */}
            <AdminModalSection title="Meta">
              <AdminModalGrid>
                <AdminModalField label="Típus" value={selectedInquiry.type} />
                <AdminModalField label="Nyelv" value={selectedInquiry.language === "hu" ? "Magyar" : "English"} />
                <AdminModalField label="Forrás" value={selectedInquiry.sourcePath} />
                <AdminModalField label="Beérkezés" value={formatDate(selectedInquiry.createdAt)} />
              </AdminModalGrid>
            </AdminModalSection>
          </div>
        )}
      </AdminModal>
    </AdminLayout>
  );
}
