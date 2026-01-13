"use client";

import { useEffect, useState, useCallback } from "react";
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import {
  FileText,
  Loader2,
  Plus,
  Trash2,
  Save,
  Eye,
  Copy,
  Check,
} from "lucide-react";
import { firestoreDb } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AdminLayout,
  AdminCard,
  AdminCardHeader,
  AdminCardTitle,
  AdminCardContent,
  StatusBadge,
  AdminModal,
  AdminModalSection,
  RichTextEditor,
  useAdminAuth,
} from "@/components/admin";
import {
  CONTRACT_SHORTCODE_CATEGORIES,
  ALL_SHORTCODES,
  TEMPLATE_TYPES,
  type TemplateType,
  type ConditionalContext,
  processConditionalBlocks,
} from "@/lib/contract-shortcodes";

type Template = {
  id: string;
  type: TemplateType;
  name: string;
  content: string;
  active: boolean;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};

export default function ContractTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Editor state
  const [editName, setEditName] = useState("");
  const [editType, setEditType] = useState<TemplateType>("contract");
  const [editContent, setEditContent] = useState("");
  const [editActive, setEditActive] = useState(true);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const { user, isAuthenticated } = useAdminAuth();

  // Fetch templates - only when authenticated
  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    
    const unsubscribe = onSnapshot(
      collection(firestoreDb, "documentTemplates"),
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Template));
        setTemplates(items);
        setIsLoading(false);
      },
      (error) => {
        console.error("Firestore error:", error);
        setIsLoading(false);
      }
    );
    return () => unsubscribe();
  }, [user]);

  // Open editor for new or existing template
  const openEditor = (template?: Template) => {
    if (template) {
      setSelectedTemplate(template);
      setEditName(template.name);
      setEditType(template.type);
      setEditContent(template.content);
      setEditActive(template.active);
    } else {
      setSelectedTemplate(null);
      setEditName("");
      setEditType("contract");
      setEditContent("");
      setEditActive(true);
    }
    setIsEditorOpen(true);
  };

  // Save template
  const saveTemplate = async () => {
    if (!editName.trim()) {
      alert("Add meg a sablon nevét!");
      return;
    }

    setIsSaving(true);
    try {
      const templateData = {
        type: editType,
        name: editName.trim(),
        content: editContent,
        active: editActive,
        updatedAt: Timestamp.now(),
      };

      if (selectedTemplate) {
        await updateDoc(doc(firestoreDb, "documentTemplates", selectedTemplate.id), templateData);
      } else {
        const newId = `${editType}_${Date.now()}`;
        await setDoc(doc(firestoreDb, "documentTemplates", newId), {
          ...templateData,
          createdAt: Timestamp.now(),
        });
      }

      setIsEditorOpen(false);
    } catch (error) {
      console.error("Save error:", error);
      alert("Hiba a mentés során!");
    } finally {
      setIsSaving(false);
    }
  };

  // Delete template
  const deleteTemplate = async (id: string) => {
    if (!confirm("Biztosan törlöd ezt a sablont?")) return;
    try {
      await deleteDoc(doc(firestoreDb, "documentTemplates", id));
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  // Copy shortcode to clipboard
  const copyShortcode = useCallback((code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  }, []);

  // Prepare shortcodes for editor
  const editorShortcodes = ALL_SHORTCODES.map((sc) => ({
    code: sc.code,
    label: sc.label,
    category: sc.category,
  }));

  // Sample data for preview
  const SAMPLE_DATA: Record<string, string> = {
    "{{CEG_NEV}}": "Minta Kft.",
    "{{CEG_ROVID_NEV}}": "Minta",
    "{{CEG_FORMA}}": "Korlátolt Felelősségű Társaság",
    "{{CEGJEGYZEKSZAM}}": "01-09-123456",
    "{{ADOSZAM}}": "12345678-1-41",
    "{{FOTEV}}": "Szoftverfejlesztés",
    "{{SZEKHELY}}": "1052 Budapest, Váci utca 8.",
    "{{TULAJDONOS_NEV}}": "Kovács János",
    "{{TULAJDONOS_SZUL_NEV}}": "Kovács János",
    "{{TULAJDONOS_SZUL_HELY}}": "Budapest",
    "{{TULAJDONOS_SZUL_DATUM}}": "1985. január 15.",
    "{{TULAJDONOS_ANYJA_NEVE}}": "Kiss Mária",
    "{{TULAJDONOS_LAKCIM}}": "1111 Budapest, Példa utca 1.",
    "{{TULAJDONOS_OKMANY_TIPUS}}": "Személyi igazolvány",
    "{{TULAJDONOS_OKMANY_SZAM}}": "123456AB",
    "{{TULAJDONOS_ALLAMPOLGARSAG}}": "magyar",
    "{{TULAJDONOS_ARANY}}": "100%",
    "{{KEPVISELO_NEV}}": "Kovács János",
    "{{KEPVISELO_BEOSZTAS}}": "ügyvezető",
    "{{KEPVISELO_ALLAMPOLGARSAG}}": "magyar",
    "{{KAPCSOLAT_NEV}}": "Kovács János",
    "{{KAPCSOLAT_EMAIL}}": "kovacs@minta.hu",
    "{{KAPCSOLAT_TELEFON}}": "+36 30 123 4567",
    "{{KAPCSOLAT_CIM}}": "1111 Budapest, Példa utca 1.",
    "{{CSOMAG_NEV}}": "Székhelyszolgáltatás - Magyar",
    "{{HAVI_DIJ}}": "4 990",
    "{{HAVI_DIJ_SZOVEG}}": "négyezer-kilencszázkilencven",
    "{{EVES_DIJ}}": "59 880",
    "{{EVES_DIJ_SZOVEG}}": "ötvenkilencezer-nyolcszáznyolcvan",
    "{{SZOLGALTATO_NEV}}": "E-Marketplace Kft.",
    "{{SZOLGALTATO_CIM}}": "1064 Budapest, Izabella utca 68/b.",
    "{{DATUM}}": new Date().toLocaleDateString("hu-HU"),
    "{{DATUM_SZO}}": new Date().toLocaleDateString("hu-HU", { year: "numeric", month: "long", day: "numeric" }),
    "{{EV}}": new Date().getFullYear().toString(),
    "{{SZERZODES_ID}}": "SZ-2024-00001",
    "{{KEZBESITESI_CIM}}": "1052 Budapest, Váci utca 8. 1. em.",
  };

  // Sample conditional context for preview (NOT PEP, new company, Hungarian rep, single natural owner)
  const SAMPLE_CONDITIONAL_CONTEXT: ConditionalContext = {
    isPep: false,
    isPepRelative: false,
    isPepAssociate: false,
    isAnyPep: false,
    isNotPep: true,
    isNewCompany: true,
    isExistingCompany: false,
    isForeignRep: false,
    isHungarianRep: true,
    isNaturalOwner: true,
    isLegalOwner: false,
    hasMultipleOwners: false,
    hasSingleOwner: true,
  };

  // Generate preview content with sample data and conditional processing
  const getPreviewContent = useCallback(() => {
    // First process conditional blocks
    let content = processConditionalBlocks(editContent, SAMPLE_CONDITIONAL_CONTEXT);
    
    // Then replace shortcodes with highlighted sample values
    Object.entries(SAMPLE_DATA).forEach(([code, value]) => {
      content = content.replace(new RegExp(code.replace(/[{}]/g, "\\$&"), "g"), `<mark class="bg-yellow-100 px-0.5 rounded">${value}</mark>`);
    });
    return content;
  }, [editContent]);

  const formatDate = (ts?: Timestamp) => {
    if (!ts) return "-";
    return ts.toDate().toLocaleDateString("hu-HU", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <AdminLayout
      title="Dokumentum sablonok"
      description="Szerződések és egyéb dokumentumok szerkeszthető sablonjai"
    >
      {/* Actions */}
      <div className="flex justify-between items-center mb-6">
        <div className="text-sm text-[color:var(--muted-foreground)]">
          {templates.length} sablon
        </div>
        <Button onClick={() => openEditor()} className="gap-2">
          <Plus className="w-4 h-4" />
          Új sablon
        </Button>
      </div>

      {/* Loading */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[color:var(--primary)]" />
        </div>
      ) : templates.length === 0 ? (
        <div className="text-center py-20">
          <FileText className="w-12 h-12 mx-auto mb-4 text-[color:var(--muted-foreground)]" />
          <p className="text-[color:var(--muted-foreground)]">Még nincsenek sablonok</p>
          <Button onClick={() => openEditor()} className="mt-4">
            Első sablon létrehozása
          </Button>
        </div>
      ) : (
        /* Templates grid */
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <AdminCard key={template.id} onClick={() => openEditor(template)} hoverable>
              <AdminCardHeader>
                <div className="flex-1 min-w-0">
                  <AdminCardTitle>{template.name}</AdminCardTitle>
                  <p className="text-xs text-[color:var(--muted-foreground)] mt-0.5">
                    {TEMPLATE_TYPES[template.type]?.hu || template.type}
                  </p>
                </div>
                <StatusBadge
                  status={template.active ? "Aktív" : "Inaktív"}
                  variant={template.active ? "success" : "default"}
                />
              </AdminCardHeader>
              <AdminCardContent>
                <div className="text-xs text-[color:var(--muted-foreground)]">
                  Módosítva: {formatDate(template.updatedAt)}
                </div>
              </AdminCardContent>
            </AdminCard>
          ))}
        </div>
      )}

      {/* Shortcodes reference */}
      <div className="mt-8 p-4 bg-[color:var(--muted)]/30 rounded-xl">
        <h3 className="font-semibold mb-4">Shortcode referencia</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {CONTRACT_SHORTCODE_CATEGORIES.map((category) => (
            <div key={category.name} className="bg-[color:var(--card)] rounded-lg p-3 border border-[color:var(--border)]">
              <h4 className="text-sm font-medium mb-2 text-[color:var(--foreground)]">
                {category.name}
              </h4>
              <div className="space-y-1">
                {category.shortcodes.map((sc) => (
                  <button
                    key={sc.code}
                    onClick={() => copyShortcode(sc.code)}
                    className="w-full flex items-center justify-between gap-2 text-left text-xs p-1.5 rounded hover:bg-[color:var(--muted)] transition-colors group"
                  >
                    <span className="font-mono text-[color:var(--primary)]">{sc.code}</span>
                    <span className="text-[color:var(--muted-foreground)] truncate flex-1 text-right">
                      {sc.label}
                    </span>
                    {copiedCode === sc.code ? (
                      <Check className="w-3 h-3 text-green-500" />
                    ) : (
                      <Copy className="w-3 h-3 opacity-0 group-hover:opacity-50" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Editor Modal */}
      <AdminModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        title={selectedTemplate ? "Sablon szerkesztése" : "Új sablon"}
        size="full"
        footer={
          <>
            {selectedTemplate && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  deleteTemplate(selectedTemplate.id);
                  setIsEditorOpen(false);
                }}
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Törlés
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => setIsPreviewOpen(true)}>
              <Eye className="w-4 h-4 mr-1" />
              Előnézet
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsEditorOpen(false)}>
              Mégse
            </Button>
            <Button size="sm" onClick={saveTemplate} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-1" />
              )}
              Mentés
            </Button>
          </>
        }
      >
        <div className="space-y-6">
          {/* Meta fields */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="templateName">Sablon neve</Label>
              <Input
                id="templateName"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="pl. Székhelyszolgáltatási szerződés v2"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="templateType">Típus</Label>
              <select
                id="templateType"
                value={editType}
                onChange={(e) => setEditType(e.target.value as TemplateType)}
                className="mt-1 w-full h-10 px-3 rounded-md border border-[color:var(--border)] bg-[color:var(--background)] text-sm"
              >
                {Object.entries(TEMPLATE_TYPES).map(([key, val]) => (
                  <option key={key} value={key}>
                    {val.hu}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editActive}
                  onChange={(e) => setEditActive(e.target.checked)}
                  className="w-4 h-4 rounded border-[color:var(--border)]"
                />
                <span className="text-sm">Aktív sablon</span>
              </label>
            </div>
          </div>

          {/* Rich text editor */}
          <div>
            <Label>Tartalom</Label>
            <div className="mt-1">
              <RichTextEditor
                content={editContent}
                onChange={setEditContent}
                shortcodes={editorShortcodes}
                placeholder="Kezdd el írni a sablon tartalmát... Használd a shortcode gombot a változók beszúrásához."
                minHeight="400px"
              />
            </div>
          </div>

          {/* Preview info */}
          <div className="p-3 bg-[color:var(--muted)]/30 rounded-lg text-xs text-[color:var(--muted-foreground)]">
            <strong>Tipp:</strong> A szerkesztőben a <code className="bg-[color:var(--muted)] px-1 rounded">{`{{}}`}</code> gombra 
            kattintva beszúrhatsz shortcode-okat. Ezek a PDF generáláskor automatikusan lecserélődnek a szerződés adataira.
          </div>
        </div>
      </AdminModal>

      {/* Preview Modal */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="fixed inset-0 bg-black/70" onClick={() => setIsPreviewOpen(false)} />
          <div className="relative w-[95vw] h-[90vh] max-w-4xl bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b bg-gray-50">
              <div>
                <h3 className="font-semibold text-gray-900">Sablon előnézet</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  <span className="inline-flex items-center gap-1">
                    <span className="w-3 h-3 bg-yellow-100 rounded"></span>
                    Sárga kiemelés = mintaadatok
                  </span>
                </p>
              </div>
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-200 transition-colors text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 bg-white">
              <style>{`
                .preview-content table { width: 100%; border-collapse: collapse; margin: 15px 0; }
                .preview-content td, .preview-content th { border: 1px solid #000; padding: 10px; vertical-align: top; }
                .preview-content td:first-child, .preview-content th:first-child { width: 50%; }
              `}</style>
              <div 
                className="prose prose-sm max-w-none preview-content"
                dangerouslySetInnerHTML={{ __html: getPreviewContent() }}
              />
            </div>
            <div className="p-4 border-t bg-gray-50 flex justify-end">
              <Button onClick={() => setIsPreviewOpen(false)}>
                Bezárás
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
