"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { firestoreDb, firebaseAuth } from "@/lib/firebase";
import { AdminLayout, AdminCard, useAdminAuth } from "@/components/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  Plus,
  Trash2,
  Shield,
  User,
  Mail,
  Calendar,
  X,
  Send,
  CheckCircle,
} from "lucide-react";

const FUNCTIONS_REGION = process.env.NEXT_PUBLIC_FUNCTIONS_REGION || "europe-west1";

type AdminUser = {
  id: string;
  email: string;
  role: "admin" | "editor";
  createdAt?: Timestamp;
  createdBy?: string;
};

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  editor: "Szerkesztő",
};

export default function AdminUsersPage() {
  const { user: currentUser } = useAdminAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<"admin" | "editor">("editor");
  const [sendInvite, setSendInvite] = useState(true);
  const [inviteStatus, setInviteStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser) {
      setIsLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      collection(firestoreDb, "adminUsers"),
      (snapshot) => {
        const docs = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as AdminUser[];
        setUsers(docs.sort((a, b) => (a.email || "").localeCompare(b.email || "")));
        setIsLoading(false);
      },
      (err) => {
        console.error("Error loading users:", err);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  const sendInviteEmail = useCallback(async (email: string, role: string) => {
    try {
      const token = await firebaseAuth.currentUser?.getIdToken();
      if (!token) throw new Error("No auth token");

      const functionUrl = `https://us-central1-emarketplace-8aab1.cloudfunctions.net/sendAdminInviteEmail`;
      const adminUrl = typeof window !== "undefined" 
        ? `${window.location.origin}/ops/nova`
        : "https://e-marketplace.hu/ops/nova";

      const response = await fetch(functionUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email,
          role,
          adminUrl,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to send invite");
      }

      return true;
    } catch (err) {
      console.error("Error sending invite:", err);
      return false;
    }
  }, []);

  const handleAddUser = useCallback(async () => {
    if (!newEmail.trim()) {
      setError("Email cím megadása kötelező");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail.trim())) {
      setError("Érvénytelen email formátum");
      return;
    }

    const normalizedEmail = newEmail.trim().toLowerCase();
    if (users.some((u) => u.email.toLowerCase() === normalizedEmail)) {
      setError("Ez az email már létezik");
      return;
    }

    setIsSaving(true);
    setError(null);
    setInviteStatus("idle");

    try {
      const docId = normalizedEmail.replace(/[.@]/g, "_");
      await setDoc(doc(firestoreDb, "adminUsers", docId), {
        email: normalizedEmail,
        role: newRole,
        createdAt: serverTimestamp(),
        createdBy: currentUser?.email || "unknown",
      });

      if (sendInvite) {
        setInviteStatus("sending");
        const success = await sendInviteEmail(normalizedEmail, newRole);
        setInviteStatus(success ? "sent" : "error");
        
        if (!success) {
          setError("Felhasználó létrehozva, de a meghívó email küldése sikertelen.");
        }
      }

      setNewEmail("");
      setNewRole("editor");
      setSendInvite(true);
      
      setTimeout(() => {
        setIsAdding(false);
        setInviteStatus("idle");
      }, inviteStatus === "sent" ? 2000 : 0);
    } catch (err) {
      console.error("Error adding user:", err);
      setError("Hiba történt a mentés során. Ellenőrizd a jogosultságokat.");
    } finally {
      setIsSaving(false);
    }
  }, [newEmail, newRole, users, currentUser, sendInvite, sendInviteEmail, inviteStatus]);

  const handleDeleteUser = useCallback(
    async (user: AdminUser) => {
      if (user.email === currentUser?.email) {
        setError("Saját magadat nem törölheted");
        return;
      }

      if (!confirm(`Biztosan törlöd ${user.email} felhasználót?`)) return;

      try {
        await deleteDoc(doc(firestoreDb, "adminUsers", user.id));
      } catch (err) {
        console.error("Error deleting user:", err);
        setError("Hiba történt a törlés során");
      }
    },
    [currentUser]
  );

  const handleUpdateRole = useCallback(
    async (user: AdminUser, newRole: "admin" | "editor") => {
      if (user.email === currentUser?.email) {
        setError("Saját szerepkörödet nem módosíthatod");
        return;
      }

      try {
        await setDoc(
          doc(firestoreDb, "adminUsers", user.id),
          { role: newRole },
          { merge: true }
        );
      } catch (err) {
        console.error("Error updating role:", err);
        setError("Hiba történt a szerepkör módosítása során");
      }
    },
    [currentUser]
  );

  const formatDate = (ts?: Timestamp) => {
    if (!ts) return "-";
    return ts.toDate().toLocaleDateString("hu-HU", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <AdminLayout title="Felhasználók" description="Admin hozzáférések kezelése">
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[color:var(--primary)]" />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-[color:var(--muted-foreground)]">
              {users.length} felhasználó
            </div>
            <Button onClick={() => setIsAdding(true)} disabled={isAdding}>
              <Plus className="w-4 h-4 mr-1" />
              Új felhasználó
            </Button>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center justify-between">
              {error}
              <button onClick={() => setError(null)}>
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Add User Form */}
          {isAdding && (
            <AdminCard>
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Új felhasználó hozzáadása</h3>
                  <button
                    onClick={() => {
                      setIsAdding(false);
                      setNewEmail("");
                      setError(null);
                    }}
                    className="text-[color:var(--muted-foreground)] hover:text-[color:var(--foreground)]"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <Label htmlFor="email" className="text-sm">
                      Email cím
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="pelda@email.com"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="role" className="text-sm">
                      Szerepkör
                    </Label>
                    <select
                      id="role"
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value as "admin" | "editor")}
                      className="mt-1 w-full h-10 px-3 rounded-md border border-[color:var(--border)] bg-[color:var(--background)] text-sm"
                    >
                      <option value="editor">Szerkesztő</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>

                <label className="flex items-center gap-3 mt-4 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={sendInvite}
                    onChange={(e) => setSendInvite(e.target.checked)}
                    className="w-4 h-4 rounded border-[color:var(--border)] text-[color:var(--primary)] focus:ring-[color:var(--primary)]"
                  />
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[color:var(--muted-foreground)]" />
                    <span className="text-sm">Meghívó email küldése a felhasználónak</span>
                  </div>
                </label>

                {inviteStatus === "sent" && (
                  <div className="flex items-center gap-2 mt-3 p-3 bg-green-50 text-green-700 rounded-lg text-sm">
                    <CheckCircle className="w-4 h-4" />
                    Meghívó email sikeresen elküldve!
                  </div>
                )}

                <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-[color:var(--border)]">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsAdding(false);
                      setNewEmail("");
                      setInviteStatus("idle");
                    }}
                  >
                    Mégse
                  </Button>
                  <Button onClick={handleAddUser} disabled={isSaving || inviteStatus === "sending"}>
                    {isSaving || inviteStatus === "sending" ? (
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4 mr-1" />
                    )}
                    {inviteStatus === "sending" ? "Meghívó küldése..." : "Hozzáadás"}
                  </Button>
                </div>
              </div>
            </AdminCard>
          )}

          {/* Users List */}
          <AdminCard>
            <div className="divide-y divide-[color:var(--border)]">
              {users.length === 0 ? (
                <div className="p-8 text-center text-[color:var(--muted-foreground)]">
                  Még nincs felhasználó. Add hozzá az első admint!
                </div>
              ) : (
                users.map((user) => (
                  <div
                    key={user.id}
                    className="p-4 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-[color:var(--muted)] flex items-center justify-center shrink-0">
                        {user.role === "admin" ? (
                          <Shield className="w-5 h-5 text-[color:var(--primary)]" />
                        ) : (
                          <User className="w-5 h-5 text-[color:var(--muted-foreground)]" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-sm truncate flex items-center gap-2">
                          {user.email}
                          {user.email === currentUser?.email && (
                            <span className="text-xs bg-[color:var(--primary)] text-white px-1.5 py-0.5 rounded">
                              Te
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-[color:var(--muted-foreground)] flex items-center gap-2">
                          <Calendar className="w-3 h-3" />
                          {formatDate(user.createdAt)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <select
                        value={user.role}
                        onChange={(e) =>
                          handleUpdateRole(user, e.target.value as "admin" | "editor")
                        }
                        disabled={user.email === currentUser?.email}
                        className="h-8 px-2 text-xs rounded border border-[color:var(--border)] bg-[color:var(--background)] disabled:opacity-50"
                      >
                        <option value="admin">Admin</option>
                        <option value="editor">Szerkesztő</option>
                      </select>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteUser(user)}
                        disabled={user.email === currentUser?.email}
                        className="h-8 w-8 p-0 text-[color:var(--muted-foreground)] hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </AdminCard>

          {/* Info */}
          <div className="text-xs text-[color:var(--muted-foreground)] p-3 bg-[color:var(--muted)]/30 rounded-lg">
            <strong>Megjegyzés:</strong> A felhasználók a Google fiókjukkal tudnak
            bejelentkezni. Csak azok az email címek kapnak hozzáférést, akik itt
            szerepelnek. A szerepkörök jelenleg nem különböztetnek meg
            funkciókat.
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
