"use client";

import React, { useEffect, useState, useCallback } from "react";
import { doc, onSnapshot, setDoc, type DocumentData } from "firebase/firestore";
import { Loader2, Save, Mail, ToggleLeft, ToggleRight } from "lucide-react";
import { firestoreDb } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AdminLayout, RichTextEditor } from "@/components/admin";

type LanguageTemplate = {
  subject: string;
  html: string;
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
  customerTemplateEn: LanguageTemplate;
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
    html: "<p>Kedves {{name}}!</p><p>Köszönjük megkeresését, hamarosan jelentkezünk.</p>",
  },
  customerTemplateEn: {
    subject: "Thank you for your message!",
    html: "<p>Dear {{name}}!</p><p>Thank you for reaching out. We will get back to you shortly.</p>",
  },
};

const normalizeSettings = (raw: DocumentData | undefined): EmailSettings => {
  if (!raw) return DEFAULT_SETTINGS;
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
      html: raw.customerTemplateHu?.html || DEFAULT_SETTINGS.customerTemplateHu.html,
    },
    customerTemplateEn: {
      subject: raw.customerTemplateEn?.subject || DEFAULT_SETTINGS.customerTemplateEn.subject,
      html: raw.customerTemplateEn?.html || DEFAULT_SETTINGS.customerTemplateEn.html,
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
      description="Admin értesítések és ügyfél köszönőlevelek konfigurációja"
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
        {/* Admin notification settings */}
        <div className="p-5 bg-[color:var(--card)] rounded-xl border border-[color:var(--border)]">
          <h3 className="font-semibold mb-4">Admin értesítések</h3>
          <p className="text-sm text-[color:var(--muted-foreground)] mb-4">
            Ezeket a leveleket te kapod, amikor új érdeklődés érkezik.
          </p>

          <div className="space-y-4">
            <div>
              <Label>Címzett email</Label>
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
              <Label>Feladó név</Label>
              <Input
                value={settings.senderName}
                onChange={(e) => updateField("senderName", e.target.value)}
                placeholder="E-Marketplace"
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Reply-to email</Label>
                <Input
                  value={settings.replyToEmail}
                  onChange={(e) => updateField("replyToEmail", e.target.value)}
                  placeholder="emarketplacekft@gmail.com"
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
            </div>
          </div>
        </div>

        {/* Auto-reply toggle */}
        <div className="p-5 bg-[color:var(--card)] rounded-xl border border-[color:var(--border)]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Ügyfél köszönőlevél</h3>
              <p className="text-sm text-[color:var(--muted-foreground)]">
                Automatikus visszaigazolás az érdeklődőknek
              </p>
            </div>
            <button
              onClick={() => updateField("customerAutoReplyEnabled", !settings.customerAutoReplyEnabled)}
              className="flex items-center gap-2"
            >
              {settings.customerAutoReplyEnabled ? (
                <ToggleRight className="w-10 h-10 text-green-500" />
              ) : (
                <ToggleLeft className="w-10 h-10 text-[color:var(--muted-foreground)]" />
              )}
            </button>
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

        {/* Admin MJML template */}
        <div className="p-5 bg-[color:var(--card)] rounded-xl border border-[color:var(--border)]">
          <h3 className="font-semibold mb-4">Admin email template (MJML)</h3>
          <p className="text-sm text-[color:var(--muted-foreground)] mb-4">
            MJML alapú sablon az admin értesítő emailhez. Küldéskor MJML → HTML fordítás történik.
          </p>

          <div className="space-y-4">
            <div>
              <Label>Subject</Label>
              <Input
                value={settings.adminTemplate.subject}
                onChange={(e) =>
                  updateField("adminTemplate", {
                    ...settings.adminTemplate,
                    subject: e.target.value,
                  })
                }
                placeholder="{{type}} – New inquiry"
                className="mt-1"
              />
            </div>

            <div>
              <Label>MJML</Label>
              <Textarea
                value={settings.adminTemplate.mjml}
                onChange={(e) =>
                  updateField("adminTemplate", {
                    ...settings.adminTemplate,
                    mjml: e.target.value,
                  })
                }
                className="mt-1 min-h-[260px] font-mono text-xs"
                placeholder="<mjml>...</mjml>"
              />
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

      {/* Hungarian template */}
      <div className="mt-6 p-5 bg-[color:var(--card)] rounded-xl border border-[color:var(--border)]">
        <h3 className="font-semibold mb-4">🇭🇺 Magyar sablon</h3>
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
            <div className="mt-1">
              <RichTextEditor
                content={settings.customerTemplateHu.html}
                onChange={(html) =>
                  updateField("customerTemplateHu", {
                    ...settings.customerTemplateHu,
                    html,
                  })
                }
                shortcodes={EMAIL_SHORTCODES}
                placeholder="Kedves {{name}}! Köszönjük megkeresését..."
                minHeight="200px"
              />
            </div>
          </div>
        </div>
      </div>

      {/* English template */}
      <div className="mt-6 p-5 bg-[color:var(--card)] rounded-xl border border-[color:var(--border)]">
        <h3 className="font-semibold mb-4">🇬🇧 English template</h3>
        <div className="space-y-4">
          <div>
            <Label>Subject</Label>
            <Input
              value={settings.customerTemplateEn.subject}
              onChange={(e) =>
                updateField("customerTemplateEn", {
                  ...settings.customerTemplateEn,
                  subject: e.target.value,
                })
              }
              placeholder="Thank you for your message!"
              className="mt-1"
            />
          </div>
          <div>
            <Label>Content</Label>
            <div className="mt-1">
              <RichTextEditor
                content={settings.customerTemplateEn.html}
                onChange={(html) =>
                  updateField("customerTemplateEn", {
                    ...settings.customerTemplateEn,
                    html,
                  })
                }
                shortcodes={EMAIL_SHORTCODES}
                placeholder="Dear {{name}}! Thank you for reaching out..."
                minHeight="200px"
              />
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
