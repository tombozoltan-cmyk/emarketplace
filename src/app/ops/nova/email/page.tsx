"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  type DocumentData,
} from "firebase/firestore";
import { Loader2, Save, Mail, ToggleLeft, ToggleRight, Eye, Send } from "lucide-react";
import { firestoreDb, firebaseAuth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AdminLayout, AdminModal } from "@/components/admin";

type LanguageTemplate = {
  subject: string;
  mjml: string;
};

type AdminTemplate = {
  subject: string;
  mjml: string;
};

type EmailSettings = {
  adminToEmail: string;
  adminSubjectPrefix: string;
  senderName: string;
  replyToEmail: string;
  replyToName: string;
  adminTemplate: AdminTemplate;
  customerAutoReplyEnabled: boolean;
  customerTemplateHu: LanguageTemplate;
};

const DEFAULT_SETTINGS: EmailSettings = {
  adminToEmail: "emarketplacekft@gmail.com",
  adminSubjectPrefix: "[E-Marketplace]",
  senderName: "E-Marketplace",
  replyToEmail: "emarketplacekft@gmail.com",
  replyToName: "E-Marketplace",
  adminTemplate: {
    subject: "{{type}} – New inquiry",
    mjml: "<mjml>\n  <mj-body>\n    <mj-section>\n      <mj-column>\n        <mj-text font-size=\"20px\" font-weight=\"bold\">New inquiry</mj-text>\n        <mj-text><strong>Type:</strong> {{type}}</mj-text>\n        <mj-text><strong>Name:</strong> {{name}}</mj-text>\n        <mj-text><strong>Email:</strong> {{email}}</mj-text>\n        <mj-text><strong>Phone:</strong> {{phone}}</mj-text>\n        <mj-text><strong>Company:</strong> {{companyName}}</mj-text>\n        <mj-text><strong>Message:</strong><br />{{message}}</mj-text>\n        <mj-divider />\n        <mj-text font-size=\"12px\" color=\"#666\">Source: {{sourcePath}} | Site: {{site}}</mj-text>\n      </mj-column>\n    </mj-section>\n  </mj-body>\n</mjml>\n",
  },
  customerAutoReplyEnabled: false,
  customerTemplateHu: {
    subject: "Köszönjük megkeresését!",
    mjml: "<mjml>\n  <mj-body>\n    <mj-section>\n      <mj-column>\n        <mj-text font-size=\"16px\">Kedves {{name}}!</mj-text>\n        <mj-text font-size=\"16px\">Köszönjük megkeresését, hamarosan jelentkezünk.</mj-text>\n      </mj-column>\n    </mj-section>\n  </mj-body>\n</mjml>",
  },
};

const normalizeSettings = (raw: DocumentData | undefined): EmailSettings => {
  if (!raw) return DEFAULT_SETTINGS;
  const rawCustomer = (raw.customerTemplateHu ?? {}) as {
    subject?: unknown;
    mjml?: unknown;
    html?: unknown;
  };

  // Only use mjml field - legacy html is not valid MJML, so fall back to default
  const mjmlContent =
    typeof rawCustomer.mjml === "string" && rawCustomer.mjml.trim().startsWith("<mjml")
      ? rawCustomer.mjml.trim()
      : DEFAULT_SETTINGS.customerTemplateHu.mjml;

  return {
    adminToEmail: raw.adminToEmail || DEFAULT_SETTINGS.adminToEmail,
    adminSubjectPrefix: raw.adminSubjectPrefix || DEFAULT_SETTINGS.adminSubjectPrefix,
    senderName: raw.senderName || DEFAULT_SETTINGS.senderName,
    replyToEmail: raw.replyToEmail || DEFAULT_SETTINGS.replyToEmail,
    replyToName: raw.replyToName || DEFAULT_SETTINGS.replyToName,
    adminTemplate: {
      subject: raw.adminTemplate?.subject || DEFAULT_SETTINGS.adminTemplate.subject,
      mjml: raw.adminTemplate?.mjml || DEFAULT_SETTINGS.adminTemplate.mjml,
    },
    customerAutoReplyEnabled: Boolean(raw.customerAutoReplyEnabled),
    customerTemplateHu: {
      subject: raw.customerTemplateHu?.subject || DEFAULT_SETTINGS.customerTemplateHu.subject,
      mjml: mjmlContent,
    },
  };
};

// Email shortcodes
const EMAIL_SHORTCODES = [
  { code: "{{name}}", label: "Név", category: "Változók" },
  { code: "{{email}}", label: "Email cím", category: "Változók" },
  { code: "{{phone}}", label: "Telefon", category: "Változók" },
  { code: "{{type}}", label: "Kérés típusa", category: "Változók" },
  { code: "{{message}}", label: "Üzenet", category: "Változók" },
  { code: "{{companyName}}", label: "Cégnév", category: "Változók" },
  { code: "{{sourcePath}}", label: "Forrás oldal", category: "Változók" },
];

export default function EmailSettingsPage() {
  const [settings, setSettings] = useState<EmailSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string>("");
  const [previewErrors, setPreviewErrors] = useState<string[]>([]);
  const [previewSubject, setPreviewSubject] = useState<string>("");
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testStatus, setTestStatus] = useState<string | null>(null);
  const [customerEditorTab, setCustomerEditorTab] = useState<"mjml" | "preview">("mjml");
  const [isCompilingPreview, setIsCompilingPreview] = useState(false);

  const previewVariables = useCallback((): Record<string, string> => {
    return {
      name: "Teszt Elek",
      email: "teszt@pelda.hu",
      phone: "+36 30 123 4567",
      type: "Teszt érdeklődés",
      message: "Ez egy teszt üzenet az admin felületről.",
      companyName: "Teszt Kft.",
      sourcePath: "/ops/nova/email",
      site: "admin",
    };
  }, []);

  const compileMjmlPreview = useCallback(
    async ({ subject, mjml }: { subject: string; mjml: string }) => {
      const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
      if (!projectId) {
        throw new Error("Missing NEXT_PUBLIC_FIREBASE_PROJECT_ID");
      }

      const region = process.env.NEXT_PUBLIC_FUNCTIONS_REGION || "us-central1";

      const user = firebaseAuth.currentUser;
      if (!user) {
        throw new Error("Nincs bejelentkezett admin felhasználó");
      }

      const token = await user.getIdToken();
      const url = `https://${region}-${projectId}.cloudfunctions.net/compileMjmlPreview`;

      let res: Response;
      try {
        res = await fetch(url, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            subject,
            mjml,
            variables: previewVariables(),
          }),
        });
      } catch (error) {
        throw new Error(
          `Nem sikerült elérni az MJML előnézet szolgáltatást (Failed to fetch). ` +
            `Ellenőrizd, hogy a Firebase Function deployolva van-e: compileMjmlPreview. ` +
            `Project: ${projectId}, region: ${region}. URL: ${url}. ` +
            `Hiba: ${error instanceof Error ? error.message : String(error)}`
        );
      }

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `Preview compile failed (${res.status})`);
      }

      const payload = (await res.json()) as {
        html?: string;
        subject?: string;
        errors?: string[];
      };

      return {
        html: payload.html ?? "",
        subject: payload.subject ?? "",
        errors: payload.errors ?? [],
      };
    },
    [previewVariables]
  );

  const openCustomerPreview = useCallback(async () => {
    setIsCompilingPreview(true);
    setPreviewErrors([]);
    setPreviewHtml("");
    setPreviewSubject("");
    try {
      const result = await compileMjmlPreview({
        subject: settings.customerTemplateHu.subject,
        mjml: settings.customerTemplateHu.mjml,
      });

      setPreviewHtml(result.html);
      setPreviewSubject(result.subject);
      setPreviewErrors(result.errors);
      setIsPreviewOpen(true);
      setCustomerEditorTab("preview");
    } catch (error) {
      console.error("Preview compile error:", error);
      setPreviewErrors([
        error instanceof Error ? error.message : "Ismeretlen hiba a preview generálásakor.",
      ]);
      setIsPreviewOpen(true);
    } finally {
      setIsCompilingPreview(false);
    }
  }, [compileMjmlPreview, settings.customerTemplateHu.mjml, settings.customerTemplateHu.subject]);

  // Fetch settings
  useEffect(() => {
    const ref = doc(firestoreDb, "emailSettings", "global");
    const unsubscribe = onSnapshot(ref, (snap) => {
      setSettings(normalizeSettings(snap.data()));
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Save settings
  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      await setDoc(doc(firestoreDb, "emailSettings", "global"), settings, { merge: true });
      setSavedAt(Date.now());
    } catch (error) {
      console.error("Save error:", error);
      alert("Mentés sikertelen!");
    } finally {
      setIsSaving(false);
    }
  }, [settings]);

  const sendTestAdminNotification = useCallback(async () => {
    setIsSendingTest(true);
    setTestStatus(null);
    try {
      await addDoc(collection(firestoreDb, "inquiries"), {
        createdAt: serverTimestamp(),
        language: "hu",
        sourcePath: "/ops/nova/email",
        status: "new",
        type: "Teszt admin értesítés",
        companyName: "Teszt Kft.",
        name: "Teszt Elek",
        email: "",
        phone: "+36 30 123 4567",
        message: "Teszt üzenet az admin Email beállítások oldalról.",
        site: "admin",
      });
      setTestStatus("Teszt elküldve: létrejött egy új 'inquiries' rekord. Az admin értesítés pár másodpercen belül meg kell érkezzen.");
    } catch (error) {
      console.error("Test send error:", error);
      setTestStatus("Teszt küldés sikertelen (lásd konzol).");
    } finally {
      setIsSendingTest(false);
    }
  }, []);

  // Update field helper
  const updateField = <K extends keyof EmailSettings>(key: K, value: EmailSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return (
      <AdminLayout title="Email beállítások">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[color:var(--primary)]" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Email beállítások"
      description="Admin értesítések és automatikus visszaigazoló email konfiguráció"
    >
      {/* Save button header */}
      <div className="flex items-center justify-between mb-6 p-4 bg-[color:var(--card)] rounded-xl border border-[color:var(--border)]">
        <div>
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-[color:var(--primary)]" />
            <span className="font-medium">Email konfiguráció</span>
          </div>
          {savedAt && (
            <p className="text-xs text-[color:var(--muted-foreground)] mt-1">
              Utoljára mentve: {new Date(savedAt).toLocaleString("hu-HU")}
            </p>
          )}
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
          Mentés
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="p-5 bg-[color:var(--card)] rounded-xl border border-[color:var(--border)]">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h3 className="font-semibold">Admin értesítő email</h3>
              <p className="text-sm text-[color:var(--muted-foreground)]">
                Ezt a levelet te kapod, amikor új érdeklődés érkezik.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={sendTestAdminNotification}
              disabled={isSendingTest}
            >
              {isSendingTest ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-1" />
              )}
              Teszt küldés
            </Button>
          </div>

          {testStatus && (
            <div className="mb-4 text-xs text-[color:var(--muted-foreground)] p-3 bg-[color:var(--muted)]/30 rounded-lg">
              {testStatus}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <Label>Admin címzett email</Label>
              <Input
                value={settings.adminToEmail}
                onChange={(e) => updateField("adminToEmail", e.target.value)}
                placeholder="emarketplacekft@gmail.com"
                className="mt-1"
              />
            </div>

            <div>
              <Label>Subject prefix</Label>
              <Input
                value={settings.adminSubjectPrefix}
                onChange={(e) => updateField("adminSubjectPrefix", e.target.value)}
                placeholder="[E-Marketplace]"
                className="mt-1"
              />
            </div>

            <div>
              <Label>Admin email subject (MJML sablon esetén)</Label>
              <Input
                value={settings.adminTemplate.subject}
                onChange={(e) =>
                  updateField("adminTemplate", {
                    ...settings.adminTemplate,
                    subject: e.target.value,
                  })
                }
                placeholder="{{type}} – Új érdeklődés"
                className="mt-1"
              />
            </div>

            <div>
              <Label>Admin email sablon (MJML)</Label>
              <Textarea
                value={settings.adminTemplate.mjml}
                onChange={(e) =>
                  updateField("adminTemplate", {
                    ...settings.adminTemplate,
                    mjml: e.target.value,
                  })
                }
                className="mt-1 min-h-[320px] font-mono text-xs"
                placeholder="<mjml>...</mjml>"
              />
              <div className="mt-2 text-xs text-[color:var(--muted-foreground)]">
                MJML → HTML fordítás küldéskor történik (Cloud Function). Ha szeretnél itt helyben előnézetet, kell egy külön MJML-compile endpoint.
              </div>
            </div>

            <div className="text-xs text-[color:var(--muted-foreground)] p-3 bg-[color:var(--muted)]/30 rounded-lg">
              <strong>Használható változók:</strong>{" "}
              {EMAIL_SHORTCODES.map((sc) => (
                <code key={sc.code} className="mx-1 px-1 bg-[color:var(--muted)] rounded">
                  {sc.code}
                </code>
              ))}
            </div>
          </div>
        </div>

        <div className="p-5 bg-[color:var(--card)] rounded-xl border border-[color:var(--border)]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Automatikus visszaigazoló email (ügyfélnek)</h3>
              <p className="text-sm text-[color:var(--muted-foreground)]">
                Ha be van kapcsolva, az érdeklődő automatikus visszaigazolást kap.
              </p>
            </div>
            <button
              onClick={() => updateField("customerAutoReplyEnabled", !settings.customerAutoReplyEnabled)}
              className="flex items-center gap-2"
              title={settings.customerAutoReplyEnabled ? "Bekapcsolva" : "Kikapcsolva"}
            >
              {settings.customerAutoReplyEnabled ? (
                <ToggleRight className="w-10 h-10 text-green-500" />
              ) : (
                <ToggleLeft className="w-10 h-10 text-[color:var(--muted-foreground)]" />
              )}
            </button>
          </div>

          <div className="flex items-center justify-end mb-3">
            <Button
              variant="outline"
              size="sm"
              onClick={openCustomerPreview}
              disabled={isCompilingPreview}
            >
              {isCompilingPreview ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <Eye className="w-4 h-4 mr-1" />
              )}
              Előnézet (MJML)
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <Label>Tárgy</Label>
              <Input
                value={settings.customerTemplateHu.subject}
                onChange={(e) =>
                  updateField("customerTemplateHu", {
                    ...settings.customerTemplateHu,
                    subject: e.target.value,
                  })
                }
                placeholder="Köszönjük megkeresését!"
                className="mt-1"
              />
            </div>

            <div>
              <Label>Tartalom</Label>
              <div className="mt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCustomerEditorTab("mjml")}
                  className={
                    customerEditorTab === "mjml"
                      ? "text-xs px-2 py-1 rounded bg-[color:var(--primary)] text-[color:var(--primary-foreground)]"
                      : "text-xs px-2 py-1 rounded hover:bg-[color:var(--muted)] text-[color:var(--muted-foreground)]"
                  }
                >
                  MJML
                </button>
                <button
                  type="button"
                  onClick={openCustomerPreview}
                  className={
                    customerEditorTab === "preview"
                      ? "text-xs px-2 py-1 rounded bg-[color:var(--primary)] text-[color:var(--primary-foreground)]"
                      : "text-xs px-2 py-1 rounded hover:bg-[color:var(--muted)] text-[color:var(--muted-foreground)]"
                  }
                >
                  Preview
                </button>
              </div>

              {customerEditorTab === "mjml" ? (
                <div className="mt-2">
                  <Textarea
                    value={settings.customerTemplateHu.mjml}
                    onChange={(e) =>
                      updateField("customerTemplateHu", {
                        ...settings.customerTemplateHu,
                        mjml: e.target.value,
                      })
                    }
                    className="min-h-[260px] font-mono text-xs"
                    placeholder="<mjml>...</mjml>"
                  />
                </div>
              ) : (
                <div className="mt-2 rounded-lg border border-[color:var(--border)] overflow-hidden bg-white">
                  <iframe title="Customer MJML preview" className="w-full h-[320px]" srcDoc={previewHtml} />
                </div>
              )}
            </div>

            <div className="text-xs text-[color:var(--muted-foreground)] p-3 bg-[color:var(--muted)]/30 rounded-lg">
              <strong>Használható változók:</strong>{" "}
              {EMAIL_SHORTCODES.map((sc) => (
                <code key={sc.code} className="mx-1 px-1 bg-[color:var(--muted)] rounded">
                  {sc.code}
                </code>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 p-5 bg-[color:var(--card)] rounded-xl border border-[color:var(--border)]">
        <h3 className="font-semibold mb-4">Haladó beállítások</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>Feladó név</Label>
            <Input
              value={settings.senderName}
              onChange={(e) => updateField("senderName", e.target.value)}
              placeholder="E-Marketplace"
              className="mt-1"
            />
          </div>

          <div>
            <Label>Reply-to név</Label>
            <Input
              value={settings.replyToName}
              onChange={(e) => updateField("replyToName", e.target.value)}
              placeholder="E-Marketplace"
              className="mt-1"
            />
          </div>

          <div>
            <Label>Reply-to email</Label>
            <Input
              value={settings.replyToEmail}
              onChange={(e) => updateField("replyToEmail", e.target.value)}
              placeholder="emarketplacekft@gmail.com"
              className="mt-1"
            />
          </div>
        </div>
      </div>

      <AdminModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title="Előnézet (teszt adatokkal)"
        description="A változók teszt értékekkel vannak kitöltve."
        size="xl"
        footer={<Button onClick={() => setIsPreviewOpen(false)}>Bezárás</Button>}
      >
        {previewSubject ? (
          <div className="mb-3 text-sm">
            <span className="text-[color:var(--muted-foreground)]">Tárgy: </span>
            <span className="font-medium">{previewSubject}</span>
          </div>
        ) : null}

        {previewErrors.length ? (
          <div className="mb-3 text-xs p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-700">
            <div className="font-semibold mb-1">MJML hibák / figyelmeztetések</div>
            <div className="space-y-1">
              {previewErrors.map((err, idx) => (
                <div key={idx}>{err}</div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="rounded-lg border border-[color:var(--border)] overflow-hidden bg-white">
          <iframe
            title="Email preview"
            className="w-full h-[70vh]"
            srcDoc={previewHtml}
          />
        </div>
      </AdminModal>
    </AdminLayout>
  );
}
