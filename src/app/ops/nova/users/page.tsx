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
import { firestoreDb } from "@/lib/firebase";
import { firebaseAuth } from "@/lib/firebase-auth";
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
  Pencil,
} from "lucide-react";

const FUNCTIONS_REGION = process.env.NEXT_PUBLIC_FUNCTIONS_REGION || "europe-west1";

type AdminUser = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
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
  const [newFirstName, setNewFirstName] = useState("");
  const [newLastName, setNewLastName] = useState("");
  const [newRole, setNewRole] = useState<"admin" | "editor">("editor");
  const [sendInvite, setSendInvite] = useState(true);
  const [isEditing, setIsEditing] = useState<AdminUser | null>(null);
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editEmail, setEditEmail] = useState("");
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
        firstName: newFirstName.trim() || null,
        lastName: newLastName.trim() || null,
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
      setNewFirstName("");
      setNewLastName("");
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
  }, [newEmail, newFirstName, newLastName, newRole, users, currentUser, sendInvite, sendInviteEmail, inviteStatus]);

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

  const openEditModal = useCallback((user: AdminUser) => {
    setIsEditing(user);
    setEditFirstName(user.firstName || "");
    setEditLastName(user.lastName || "");
    setEditEmail(user.email);
  }, []);

  const handleEditUser = useCallback(async () => {
    if (!isEditing) return;

    const normalizedEmail = editEmail.trim().toLowerCase();
    if (!normalizedEmail) {
      setError("Email cím megadása kötelező");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      setError("Érvénytelen email formátum");
      return;
    }

    // Check if email changed and already exists
    if (normalizedEmail !== isEditing.email.toLowerCase()) {
      if (users.some((u) => u.email.toLowerCase() === normalizedEmail && u.id !== isEditing.id)) {
        setError("Ez az email már létezik");
        return;
      }
    }

    setIsSaving(true);
    setError(null);

    try {
      // If email changed, we need to delete old doc and create new one
      if (normalizedEmail !== isEditing.email.toLowerCase()) {
        await deleteDoc(doc(firestoreDb, "adminUsers", isEditing.id));
        const newDocId = normalizedEmail.replace(/[.@]/g, "_");
        await setDoc(doc(firestoreDb, "adminUsers", newDocId), {
          email: normalizedEmail,
          firstName: editFirstName.trim() || null,
          lastName: editLastName.trim() || null,
          role: isEditing.role,
          createdAt: isEditing.createdAt || serverTimestamp(),
          createdBy: isEditing.createdBy || currentUser?.email || "unknown",
        });
      } else {
        // Just update names
        await setDoc(
          doc(firestoreDb, "adminUsers", isEditing.id),
          { firstName: editFirstName.trim() || null, lastName: editLastName.trim() || null },
          { merge: true }
        );
      }

      setIsEditing(null);
      setEditFirstName("");
      setEditLastName("");
      setEditEmail("");
    } catch (err) {
      console.error("Error updating user:", err);
      setError("Hiba történt a mentés során");
    } finally {
      setIsSaving(false);
    }
  }, [isEditing, editEmail, editFirstName, editLastName, users, currentUser]);

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
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm text-[color:var(--muted-foreground)]">
              {users.length} felhasználó
            </div>
            <Button onClick={() => setIsAdding(true)} disabled={isAdding} size="sm" className="shrink-0">
              <Plus className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">Új felhasználó</span>
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

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="newLastName" className="text-sm">
                      Családnév
                    </Label>
                    <Input
                      id="newLastName"
                      type="text"
                      value={newLastName}
                      onChange={(e) => setNewLastName(e.target.value)}
                      placeholder="Kovács"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="newFirstName" className="text-sm">
                      Keresztnév
                    </Label>
                    <Input
                      id="newFirstName"
                      type="text"
                      value={newFirstName}
                      onChange={(e) => setNewFirstName(e.target.value)}
                      placeholder="János"
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <Label htmlFor="email" className="text-sm">
                    Email cím *
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
                <div className="mt-4">
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
                    className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[color:var(--muted)] flex items-center justify-center shrink-0">
                        {user.role === "admin" ? (
                          <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-[color:var(--primary)]" />
                        ) : (
                          <User className="w-4 h-4 sm:w-5 sm:h-5 text-[color:var(--muted-foreground)]" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-xs sm:text-sm truncate flex items-center gap-2">
                          <span className="truncate">
                            {user.firstName 
                              ? `${user.lastName || ''} ${user.firstName}`.trim() 
                              : user.email}
                          </span>
                          {user.email === currentUser?.email && (
                            <span className="text-[10px] sm:text-xs bg-[color:var(--primary)] text-white px-1 sm:px-1.5 py-0.5 rounded shrink-0">
                              Te
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] sm:text-xs text-[color:var(--muted-foreground)] truncate">
                          {user.firstName ? user.email : formatDate(user.createdAt)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 sm:gap-2 shrink-0 ml-11 sm:ml-0">
                      <select
                        value={user.role}
                        onChange={(e) =>
                          handleUpdateRole(user, e.target.value as "admin" | "editor")
                        }
                        disabled={user.email === currentUser?.email}
                        className="h-7 sm:h-8 px-2 text-[10px] sm:text-xs rounded border border-[color:var(--border)] bg-[color:var(--background)] disabled:opacity-50"
                      >
                        <option value="admin">Admin</option>
                        <option value="editor">Szerkesztő</option>
                      </select>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditModal(user)}
                        className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-[color:var(--muted-foreground)] hover:text-[color:var(--primary)]"
                        title="Szerkesztés"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteUser(user)}
                        disabled={user.email === currentUser?.email}
                        className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-[color:var(--muted-foreground)] hover:text-red-600 disabled:opacity-50"
                        title="Törlés"
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

          {/* Edit Modal */}
          {isEditing && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div 
                className="fixed inset-0 bg-black/50" 
                onClick={() => {
                  setIsEditing(null);
                  setEditFirstName("");
                  setEditLastName("");
                  setEditEmail("");
                }}
              />
              <div className="relative bg-[color:var(--card)] rounded-xl shadow-xl w-full max-w-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg">Felhasználó szerkesztése</h3>
                  <button
                    onClick={() => {
                      setIsEditing(null);
                      setEditFirstName("");
                      setEditLastName("");
                      setEditEmail("");
                    }}
                    className="text-[color:var(--muted-foreground)] hover:text-[color:var(--foreground)]"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="editLastName" className="text-sm">
                        Családnév
                      </Label>
                      <Input
                        id="editLastName"
                        type="text"
                        value={editLastName}
                        onChange={(e) => setEditLastName(e.target.value)}
                        placeholder="Kovács"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="editFirstName" className="text-sm">
                        Keresztnév
                      </Label>
                      <Input
                        id="editFirstName"
                        type="text"
                        value={editFirstName}
                        onChange={(e) => setEditFirstName(e.target.value)}
                        placeholder="János"
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="editEmail" className="text-sm">
                      Email cím *
                    </Label>
                    <Input
                      id="editEmail"
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      placeholder="pelda@email.com"
                      className="mt-1"
                      disabled={isEditing.email === currentUser?.email}
                    />
                    {isEditing.email === currentUser?.email && (
                      <p className="text-xs text-[color:var(--muted-foreground)] mt-1">
                        Saját email címedet nem módosíthatod
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-[color:var(--border)]">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(null);
                      setEditFirstName("");
                      setEditLastName("");
                      setEditEmail("");
                    }}
                  >
                    Mégse
                  </Button>
                  <Button onClick={handleEditUser} disabled={isSaving}>
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4 mr-1" />
                    )}
                    Mentés
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  );
}
