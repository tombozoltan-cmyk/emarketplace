"use client";

import React from "react";
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  type Timestamp,
} from "firebase/firestore";
import { AdminGate } from "../../../../components/admin/AdminGate";
import { AdminShell } from "../../../../components/admin/AdminShell";
import { Button } from "../../../../components/ui/button";
import { Card } from "../../../../components/ui/card";
import { Select } from "../../../../components/ui/select";
import { firestoreDb } from "../../../../lib/firebase";

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

const statusLabel: Record<InquiryStatus, string> = {
  new: "Új",
  in_progress: "Folyamatban",
  closed: "Lezárt",
};

const statusClasses: Record<InquiryStatus, string> = {
  new: "bg-primary/15 text-foreground",
  in_progress: "bg-blue-500/15 text-foreground",
  closed: "bg-muted text-muted-foreground",
};

const formatTimestamp = (ts: Timestamp | null): string => {
  if (!ts) {
    return "-";
  }

  const date = ts.toDate();
  return new Intl.DateTimeFormat("hu-HU", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

export default function AdminInquiriesPage() {
  const [items, setItems] = React.useState<Inquiry[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [statusFilter, setStatusFilter] = React.useState<"all" | InquiryStatus>("all");
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const q = query(collection(firestoreDb, "inquiries"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const nextItems: Inquiry[] = snapshot.docs.map((d) => {
          const data = d.data() as Omit<Inquiry, "id">;
          return { ...data, id: d.id };
        });

        setItems(nextItems);
        setIsLoading(false);
      },
      () => {
        setError("Nem sikerült betölteni a kéréseket.");
        setIsLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  const filteredItems = React.useMemo(() => {
    if (statusFilter === "all") {
      return items;
    }

    return items.filter((i) => i.status === statusFilter);
  }, [items, statusFilter]);

  const selectedInquiry = React.useMemo(() => {
    if (!selectedId) {
      return null;
    }

    return items.find((i) => i.id === selectedId) ?? null;
  }, [items, selectedId]);

  React.useEffect(() => {
    if (!selectedId && filteredItems.length > 0) {
      setSelectedId(filteredItems[0]?.id ?? null);
    }
  }, [filteredItems, selectedId]);

  const updateStatus = React.useCallback(
    async (id: string, status: InquiryStatus) => {
      await updateDoc(doc(firestoreDb, "inquiries", id), {
        status,
      });
    },
    [],
  );

  return (
    <AdminGate>
      <AdminShell basePath="/_ops/portal-7d3k9a2f" title="Beérkezett kérések">
        <div className="flex flex-col gap-4 lg:flex-row">
          <Card className="w-full p-4 lg:w-[420px]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold">Kérések</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {isLoading ? "Betöltés..." : `${filteredItems.length} db`}
                </div>
              </div>

              <Select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as "all" | InquiryStatus)
                }
                className="h-9 w-[170px]"
              >
                <option value="all">Összes</option>
                <option value="new">Új</option>
                <option value="in_progress">Folyamatban</option>
                <option value="closed">Lezárt</option>
              </Select>
            </div>

            {error ? (
              <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-200">
                {error}
              </div>
            ) : null}

            <div className="mt-4 flex max-h-[65vh] flex-col gap-2 overflow-auto">
              {filteredItems.length === 0 && !isLoading ? (
                <div className="rounded-xl border border-border bg-background p-4 text-sm text-muted-foreground">
                  Nincs megjeleníthető kérés.
                </div>
              ) : null}

              {filteredItems.map((item) => {
                const isSelected = item.id === selectedId;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedId(item.id)}
                    className={`w-full rounded-xl border px-3 py-3 text-left transition-colors ${
                      isSelected
                        ? "border-primary/40 bg-primary/10"
                        : "border-border bg-background hover:bg-muted"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-foreground">
                          {item.companyName || item.name || "(Névtelen)"}
                        </div>
                        <div className="mt-0.5 truncate text-xs text-muted-foreground">
                          {item.email || "-"}
                        </div>
                      </div>
                      <div
                        className={`flex-shrink-0 rounded-full px-2 py-1 text-[11px] font-medium ${
                          statusClasses[item.status]
                        }`}
                      >
                        {statusLabel[item.status]}
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
                      <div className="truncate">{item.selectedPackage}</div>
                      <div className="flex-shrink-0">
                        {formatTimestamp(item.createdAt)}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>

          <Card className="min-w-0 flex-1 p-5">
            {selectedInquiry ? (
              <div className="space-y-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="text-lg font-semibold">
                      {selectedInquiry.companyName || selectedInquiry.name || "Kérés"}
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {selectedInquiry.type} • {formatTimestamp(selectedInquiry.createdAt)}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      Forrás: {selectedInquiry.sourcePath ?? "-"} • Nyelv: {selectedInquiry.language}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <div
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        statusClasses[selectedInquiry.status]
                      }`}
                    >
                      {statusLabel[selectedInquiry.status]}
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => updateStatus(selectedInquiry.id, "in_progress")}
                      disabled={selectedInquiry.status === "in_progress"}
                    >
                      Folyamatban
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => updateStatus(selectedInquiry.id, "closed")}
                      disabled={selectedInquiry.status === "closed"}
                    >
                      Lezárás
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => updateStatus(selectedInquiry.id, "new")}
                      disabled={selectedInquiry.status === "new"}
                    >
                      Újra nyitás
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div className="rounded-xl border border-border bg-background p-4">
                    <div className="text-xs font-medium text-muted-foreground">Kapcsolat</div>
                    <div className="mt-2 space-y-1 text-sm">
                      <div className="text-foreground">{selectedInquiry.name || "-"}</div>
                      <div className="text-muted-foreground">{selectedInquiry.email || "-"}</div>
                      <div className="text-muted-foreground">{selectedInquiry.phone || "-"}</div>
                    </div>
                  </div>
                  <div className="rounded-xl border border-border bg-background p-4">
                    <div className="text-xs font-medium text-muted-foreground">Cég</div>
                    <div className="mt-2 space-y-1 text-sm">
                      <div className="text-foreground">{selectedInquiry.companyName || "-"}</div>
                      <div className="text-muted-foreground">
                        Típus: {selectedInquiry.companyType || "-"}
                      </div>
                      <div className="text-muted-foreground">
                        Adószám: {selectedInquiry.taxNumber || "-"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-background p-4">
                  <div className="text-xs font-medium text-muted-foreground">Szolgáltatás</div>
                  <div className="mt-2 text-sm text-foreground">
                    {selectedInquiry.selectedPackage || "-"}
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-background p-4">
                  <div className="text-xs font-medium text-muted-foreground">Cím</div>
                  <div className="mt-2 text-sm text-foreground">
                    {selectedInquiry.address || "-"}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Ország: {selectedInquiry.country || "-"}
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-background p-4">
                  <div className="text-xs font-medium text-muted-foreground">Üzenet</div>
                  <div className="mt-2 whitespace-pre-wrap text-sm text-foreground">
                    {selectedInquiry.message || "(Nincs üzenet)"}
                  </div>
                </div>

                {selectedInquiry.contact ? (
                  <div className="rounded-xl border border-border bg-background p-4">
                    <div className="text-xs font-medium text-muted-foreground">Kapcsolattartó</div>
                    <div className="mt-2 grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
                      <div className="text-foreground">
                        Név: {selectedInquiry.contact.name || "-"}
                      </div>
                      <div className="text-foreground">
                        Email: {selectedInquiry.contact.email || "-"}
                      </div>
                      <div className="text-foreground">
                        Telefon: {selectedInquiry.contact.phone || "-"}
                      </div>
                      <div className="text-foreground">
                        Cím: {selectedInquiry.contact.address || "-"}
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                Válassz ki egy kérést a listából.
              </div>
            )}
          </Card>
        </div>
      </AdminShell>
    </AdminGate>
  );
}
