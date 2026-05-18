"use client"

import { useEffect, useState, useCallback } from "react"
import {
  collection,
  onSnapshot,
  Timestamp,
  doc,
  updateDoc,
} from "firebase/firestore"
import {
  FileText,
  Loader2,
  Plus,
  Trash2,
  Download,
  Upload,
  Eye,
  Copy,
  Check,
  FileDown,
  X,
  Pencil,
} from "lucide-react"
import { firestoreDb } from "@/lib/firebase"
import { firebaseAuth } from "@/lib/firebase-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  AdminLayout,
  AdminCard,
  AdminCardHeader,
  AdminCardTitle,
  AdminCardContent,
  StatusBadge,
  AdminModal,
  AdminModalSection,
  useAdminAuth,
} from "@/components/admin"

type DocxTemplate = {
  id: string
  name: string
  description?: string
  category: string
  filename: string
  storagePath: string
  detectedShortcodes: string[]
  fileSize: number
  createdAt?: Timestamp
  updatedAt?: Timestamp
}

type ShortcodeCategory = {
  name: string
  shortcodes: {
    code: string
    label: string
    type: string
  }[]
}

const CATEGORIES = ["Szerződés", "Adatlap", "Nyilatkozat", "Hozzájáruló nyilatkozat", "Egyéb"]

const FUNCTIONS_BASE_URL = process.env.NEXT_PUBLIC_FUNCTIONS_URL || "https://us-central1-emarketplace-8aab1.cloudfunctions.net"

export default function DocxTemplatesPage() {
  const [templates, setTemplates] = useState<DocxTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [shortcodeCategories, setShortcodeCategories] = useState<ShortcodeCategory[]>([])
  const [sampleData, setSampleData] = useState<Record<string, string>>({})
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadForm, setUploadForm] = useState({
    name: "",
    description: "",
    category: "Szerződés",
    file: null as File | null,
  })

  const [isTestModalOpen, setIsTestModalOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<DocxTemplate | null>(null)
  const [testData, setTestData] = useState<Record<string, string>>({})
  const [testFormat, setTestFormat] = useState<"docx" | "both">("docx")
  const [isGenerating, setIsGenerating] = useState(false)
  const [useSampleData, setUseSampleData] = useState(true)

  const [isShortcodesModalOpen, setIsShortcodesModalOpen] = useState(false)
  const [viewingTemplate, setViewingTemplate] = useState<DocxTemplate | null>(null)
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null)
  const [editingCategory, setEditingCategory] = useState<string>("")

  const { user } = useAdminAuth()

  const updateTemplateCategory = async (templateId: string, newCategory: string) => {
    try {
      await updateDoc(doc(firestoreDb, "docxTemplates", templateId), {
        category: newCategory,
        updatedAt: Timestamp.now(),
      })
      setEditingTemplateId(null)
    } catch (error) {
      console.error("Error updating category:", error)
      alert("Hiba a kategória mentésekor!")
    }
  }

  useEffect(() => {
    if (!user) {
      setIsLoading(false)
      return
    }

    const unsubscribe = onSnapshot(
      collection(firestoreDb, "docxTemplates"),
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as DocxTemplate))
        setTemplates(items.sort((a, b) => a.name.localeCompare(b.name, "hu")))
        setIsLoading(false)
      },
      (error) => {
        console.error("Firestore error:", error)
        setIsLoading(false)
      }
    )
    return () => unsubscribe()
  }, [user])

  useEffect(() => {
    fetch(`${FUNCTIONS_BASE_URL}/listShortcodes`)
      .then((res) => res.json())
      .then((data) => {
        setShortcodeCategories(data.categories || [])
        setSampleData(data.sampleData || {})
      })
      .catch(console.error)
  }, [])

  const getAuthToken = async () => {
    const currentUser = firebaseAuth.currentUser
    if (!currentUser) throw new Error("Nincs bejelentkezve")
    return currentUser.getIdToken()
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!uploadForm.file) {
      alert("Válassz ki egy DOCX fájlt!")
      return
    }

    setIsUploading(true)
    try {
      const token = await getAuthToken()
      const formData = new FormData()
      formData.append("file", uploadForm.file)
      formData.append("name", uploadForm.name || uploadForm.file.name.replace(".docx", ""))
      formData.append("description", uploadForm.description)
      formData.append("category", uploadForm.category)

      const res = await fetch(`${FUNCTIONS_BASE_URL}/uploadDocxTemplate`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Feltöltési hiba")

      alert(`Sablon feltöltve! ${data.template.detectedShortcodes.length} shortcode találva.`)
      setIsUploadModalOpen(false)
      setUploadForm({ name: "", description: "", category: "Szerződés", file: null })
    } catch (error) {
      alert(error instanceof Error ? error.message : "Ismeretlen hiba")
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async (template: DocxTemplate) => {
    if (!confirm(`Biztosan törlöd a "${template.name}" sablont?`)) return

    try {
      const token = await getAuthToken()
      const res = await fetch(`${FUNCTIONS_BASE_URL}/deleteDocxTemplate`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ templateId: template.id }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Törlési hiba")
    } catch (error) {
      alert(error instanceof Error ? error.message : "Ismeretlen hiba")
    }
  }

  const openTestModal = (template: DocxTemplate) => {
    setSelectedTemplate(template)
    const initialData: Record<string, string> = {}
    template.detectedShortcodes.forEach((code) => {
      initialData[code] = sampleData[code] || ""
    })
    setTestData(initialData)
    setIsTestModalOpen(true)
  }

  const handleTestGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTemplate) return

    setIsGenerating(true)
    try {
      const token = await getAuthToken()
      const res = await fetch(`${FUNCTIONS_BASE_URL}/generateDocument`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          templateId: selectedTemplate.id,
          format: testFormat,
          data: testData,
          useSampleData,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Generálási hiba")
      }

      const blob = await res.blob()
      const contentDisposition = res.headers.get("Content-Disposition") || ""
      const filenameMatch = contentDisposition.match(/filename="(.+)"/)
      const filename = filenameMatch ? filenameMatch[1] : `document.${testFormat === "both" ? "zip" : "docx"}`

      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setIsTestModalOpen(false)
    } catch (error) {
      alert(error instanceof Error ? error.message : "Ismeretlen hiba")
    } finally {
      setIsGenerating(false)
    }
  }

  const copyShortcode = useCallback((code: string) => {
    navigator.clipboard.writeText(`{${code}}`)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }, [])

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  const formatDate = (ts?: Timestamp) => {
    if (!ts) return "-"
    return ts.toDate().toLocaleDateString("hu-HU", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const showShortcodes = (template: DocxTemplate) => {
    setViewingTemplate(template)
    setIsShortcodesModalOpen(true)
  }

  return (
    <AdminLayout
      title="DOCX Sablonok"
      description="DOCX dokumentum sablonok feltöltése és kezelése szerződés generáláshoz"
    >
      <div className="flex justify-between items-center gap-3 mb-6">
        <div className="text-sm text-[color:var(--muted-foreground)]">
          {templates.length} sablon
        </div>
        <Button onClick={() => setIsUploadModalOpen(true)} size="sm" className="gap-2 shrink-0">
          <Upload className="w-4 h-4" />
          <span className="hidden sm:inline">Új DOCX sablon feltöltése</span>
          <span className="sm:hidden">Feltöltés</span>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[color:var(--primary)]" />
        </div>
      ) : templates.length === 0 ? (
        <div className="text-center py-20">
          <FileText className="w-12 h-12 mx-auto mb-4 text-[color:var(--muted-foreground)]" />
          <p className="text-[color:var(--muted-foreground)]">Még nincsenek DOCX sablonok</p>
          <Button onClick={() => setIsUploadModalOpen(true)} className="mt-4 gap-2">
            <Upload className="w-4 h-4" />
            Első sablon feltöltése
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[color:var(--border)]">
                <th className="text-left py-3 px-2 font-medium">Sablon neve</th>
                <th className="text-left py-3 px-2 font-medium hidden sm:table-cell">Kategória</th>
                <th className="text-left py-3 px-2 font-medium hidden md:table-cell">Shortcode-ok</th>
                <th className="text-left py-3 px-2 font-medium hidden lg:table-cell">Fájl méret</th>
                <th className="text-left py-3 px-2 font-medium hidden lg:table-cell">Módosítva</th>
                <th className="text-right py-3 px-2 font-medium">Műveletek</th>
              </tr>
            </thead>
            <tbody>
              {templates.map((template) => (
                <tr key={template.id} className="border-b border-[color:var(--border)] hover:bg-[color:var(--muted)]/30">
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[color:var(--primary)] shrink-0" />
                      <div>
                        <div className="font-medium">{template.name}</div>
                        {template.description && (
                          <div className="text-xs text-[color:var(--muted-foreground)] truncate max-w-[200px]">
                            {template.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-2 hidden sm:table-cell">
                    {editingTemplateId === template.id ? (
                      <div className="flex items-center gap-1">
                        <select
                          value={editingCategory}
                          onChange={(e) => setEditingCategory(e.target.value)}
                          className="h-8 px-2 text-xs rounded border border-[color:var(--border)] bg-[color:var(--background)]"
                        >
                          {CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => updateTemplateCategory(template.id, editingCategory)}>
                          <Check className="w-3 h-3 text-green-600" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => setEditingTemplateId(null)}>
                          <X className="w-3 h-3 text-red-600" />
                        </Button>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setEditingTemplateId(template.id); setEditingCategory(template.category); }}
                        className="flex items-center gap-1 group"
                      >
                        <StatusBadge status={template.category} variant="default" />
                        <Pencil className="w-3 h-3 opacity-0 group-hover:opacity-50" />
                      </button>
                    )}
                  </td>
                  <td className="py-3 px-2 hidden md:table-cell">
                    <button
                      onClick={() => showShortcodes(template)}
                      className="text-[color:var(--primary)] hover:underline"
                    >
                      {template.detectedShortcodes.length} kód
                    </button>
                  </td>
                  <td className="py-3 px-2 hidden lg:table-cell text-[color:var(--muted-foreground)]">
                    {formatFileSize(template.fileSize)}
                  </td>
                  <td className="py-3 px-2 hidden lg:table-cell text-[color:var(--muted-foreground)]">
                    {formatDate(template.updatedAt)}
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => showShortcodes(template)}
                        className="gap-1"
                        title="Shortcode-ok megtekintése"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openTestModal(template)}
                        className="gap-1"
                        title="Teszt generálás"
                      >
                        <FileDown className="w-4 h-4" />
                        <span className="hidden xl:inline">Teszt</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(template)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        title="Törlés"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-[color:var(--muted)]/30 rounded-xl overflow-hidden">
        <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Shortcode referencia (DOCX formátum)</h3>
        <p className="text-xs text-[color:var(--muted-foreground)] mb-4">
          A DOCX sablonokban a shortcode-okat <code className="bg-[color:var(--muted)] px-1 rounded">{"{SHORTCODE_NAME}"}</code> formátumban használd (egyszerű kapcsos zárójelek).
        </p>
        <Accordion type="multiple" className="bg-[color:var(--card)] rounded-xl border border-[color:var(--border)] divide-y divide-[color:var(--border)]">
          {shortcodeCategories.map((category) => (
            <AccordionItem key={category.name} value={category.name} className="px-4">
              <AccordionTrigger className="text-[color:var(--foreground)]">
                <div className="flex items-center justify-between w-full">
                  <span className="text-sm font-semibold">{category.name}</span>
                  <span className="text-xs text-[color:var(--muted-foreground)]">
                    {category.shortcodes.length}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid gap-1 sm:grid-cols-2">
                  {category.shortcodes.map((sc) => (
                    <button
                      key={sc.code}
                      onClick={() => copyShortcode(sc.code)}
                      className="w-full flex items-center justify-between gap-1 sm:gap-2 text-left text-[10px] sm:text-xs px-1.5 sm:px-2 py-1.5 sm:py-2 rounded hover:bg-[color:var(--muted)] transition-colors group"
                      title={sc.label}
                    >
                      <span className="font-mono text-[color:var(--primary)] text-[9px] sm:text-xs">{`{${sc.code}}`}</span>
                      <span className="text-[color:var(--muted-foreground)] truncate flex-1 text-right hidden sm:block">
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
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <AdminModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Új DOCX sablon feltöltése"
        size="md"
      >
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <Label htmlFor="file">DOCX fájl *</Label>
            <Input
              id="file"
              type="file"
              accept=".docx"
              onChange={(e) => setUploadForm({ ...uploadForm, file: e.target.files?.[0] || null })}
              className="mt-1"
              required
            />
            <p className="text-xs text-[color:var(--muted-foreground)] mt-1">
              Csak .docx formátum engedélyezett
            </p>
          </div>

          <div>
            <Label htmlFor="name">Sablon neve</Label>
            <Input
              id="name"
              type="text"
              value={uploadForm.name}
              onChange={(e) => setUploadForm({ ...uploadForm, name: e.target.value })}
              placeholder="pl. Megbízási Szerződés"
              className="mt-1"
            />
            <p className="text-xs text-[color:var(--muted-foreground)] mt-1">
              Ha üresen hagyod, a fájlnév lesz a sablon neve
            </p>
          </div>

          <div>
            <Label htmlFor="category">Kategória</Label>
            <select
              id="category"
              value={uploadForm.category}
              onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value })}
              className="mt-1 w-full h-10 px-3 rounded-md border border-[color:var(--border)] bg-[color:var(--background)] text-sm"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="description">Leírás</Label>
            <textarea
              id="description"
              value={uploadForm.description}
              onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
              placeholder="Rövid leírás a sablonról..."
              className="mt-1 w-full px-3 py-2 rounded-md border border-[color:var(--border)] bg-[color:var(--background)] text-sm min-h-[80px]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsUploadModalOpen(false)}>
              Mégse
            </Button>
            <Button type="submit" disabled={isUploading} className="gap-2">
              {isUploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              Feltöltés
            </Button>
          </div>
        </form>
      </AdminModal>

      <AdminModal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
        title={`Teszt generálás: ${selectedTemplate?.name || ""}`}
        size="lg"
      >
        <form onSubmit={handleTestGenerate} className="space-y-4">
          <div className="flex items-center gap-2 p-3 bg-[color:var(--muted)]/30 rounded-lg">
            <input
              type="checkbox"
              id="useSampleData"
              checked={useSampleData}
              onChange={(e) => setUseSampleData(e.target.checked)}
              className="w-4 h-4 rounded border-[color:var(--border)]"
            />
            <Label htmlFor="useSampleData" className="cursor-pointer">
              Mintaadatok használata (üres mezőkhöz)
            </Label>
          </div>

          {selectedTemplate && selectedTemplate.detectedShortcodes.length > 0 && (
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              <p className="text-sm text-[color:var(--muted-foreground)]">
                Talált shortcode-ok ({selectedTemplate.detectedShortcodes.length}):
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {selectedTemplate.detectedShortcodes.map((code) => (
                  <div key={code}>
                    <Label htmlFor={code} className="text-xs font-mono">{`{${code}}`}</Label>
                    <Input
                      id={code}
                      type="text"
                      value={testData[code] || ""}
                      onChange={(e) => setTestData({ ...testData, [code]: e.target.value })}
                      placeholder={sampleData[code] || ""}
                      className="mt-1 text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedTemplate && selectedTemplate.detectedShortcodes.length === 0 && (
            <p className="text-sm text-[color:var(--muted-foreground)] p-4 bg-[color:var(--muted)]/30 rounded-lg">
              Ez a sablon nem tartalmaz felismert shortcode-okat.
            </p>
          )}

          <div>
            <Label htmlFor="format">Kimeneti formátum</Label>
            <select
              id="format"
              value={testFormat}
              onChange={(e) => setTestFormat(e.target.value as "docx" | "both")}
              className="mt-1 w-full h-10 px-3 rounded-md border border-[color:var(--border)] bg-[color:var(--background)] text-sm"
            >
              <option value="docx">Csak DOCX</option>
              <option value="both">Mindkettő (ZIP)</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsTestModalOpen(false)}>
              Mégse
            </Button>
            <Button type="submit" disabled={isGenerating} className="gap-2">
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Generálás és letöltés
            </Button>
          </div>
        </form>
      </AdminModal>

      <AdminModal
        isOpen={isShortcodesModalOpen}
        onClose={() => setIsShortcodesModalOpen(false)}
        title={`Shortcode-ok: ${viewingTemplate?.name || ""}`}
        size="md"
      >
        {viewingTemplate && (
          <div className="space-y-4">
            <p className="text-sm text-[color:var(--muted-foreground)]">
              A sablonban található {viewingTemplate.detectedShortcodes.length} shortcode:
            </p>
            <div className="flex flex-wrap gap-2">
              {viewingTemplate.detectedShortcodes.map((code) => (
                <button
                  key={code}
                  onClick={() => copyShortcode(code)}
                  className="px-2 py-1 bg-[color:var(--muted)] rounded text-xs font-mono hover:bg-[color:var(--primary)]/10 transition-colors flex items-center gap-1"
                >
                  {`{${code}}`}
                  {copiedCode === code ? (
                    <Check className="w-3 h-3 text-green-500" />
                  ) : (
                    <Copy className="w-3 h-3 opacity-50" />
                  )}
                </button>
              ))}
            </div>
            <div className="flex justify-end pt-4">
              <Button variant="outline" onClick={() => setIsShortcodesModalOpen(false)}>
                Bezárás
              </Button>
            </div>
          </div>
        )}
      </AdminModal>
    </AdminLayout>
  )
}
