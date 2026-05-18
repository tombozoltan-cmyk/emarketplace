"use client"

import { useState, useEffect, useCallback } from "react"
import { collection, onSnapshot } from "firebase/firestore"
import {
  Upload,
  FileText,
  Trash2,
  Settings,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  X,
} from "lucide-react"
import { firestoreDb } from "@/lib/firebase"
import { firebaseAuth } from "@/lib/firebase-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AdminLayout,
  AdminCard,
  AdminCardHeader,
  AdminCardTitle,
  AdminCardContent,
} from "@/components/admin"

const FUNCTIONS_BASE_URL = process.env.NEXT_PUBLIC_FUNCTIONS_URL || "https://us-central1-e-cegkozpont.cloudfunctions.net"

const SHORTCODE_OPTIONS = [
  { value: "", label: "-- Válassz shortcode-ot --" },
  { value: "CEG_NEV", label: "Cégnév (teljes)" },
  { value: "CEG_ROVID_NEV", label: "Rövidített cégnév" },
  { value: "CEGJEGYZEKSZAM", label: "Cégjegyzékszám" },
  { value: "ADOSZAM", label: "Adószám" },
  { value: "SZEKHELY", label: "Székhely címe" },
  { value: "FOTEV", label: "Főtevékenység" },
  { value: "TULAJDONOS_1_NEV", label: "1. Tulajdonos neve" },
  { value: "TULAJDONOS_1_SZUL_NEV", label: "1. Tulajdonos születési neve" },
  { value: "TULAJDONOS_1_SZUL_HELY", label: "1. Tulajdonos születési hely" },
  { value: "TULAJDONOS_1_SZUL_DATUM", label: "1. Tulajdonos születési dátum" },
  { value: "TULAJDONOS_1_SZUL_HELY_IDO", label: "1. Tulajdonos szül. hely+idő" },
  { value: "TULAJDONOS_1_ANYJA_NEVE", label: "1. Tulajdonos anyja neve" },
  { value: "TULAJDONOS_1_LAKCIM", label: "1. Tulajdonos lakcím" },
  { value: "TULAJDONOS_1_OKMANY_SZAM", label: "1. Tulajdonos okmányszám" },
  { value: "TULAJDONOS_2_NEV", label: "2. Tulajdonos neve" },
  { value: "TULAJDONOS_2_SZUL_NEV", label: "2. Tulajdonos születési neve" },
  { value: "TULAJDONOS_2_SZUL_HELY", label: "2. Tulajdonos születési hely" },
  { value: "TULAJDONOS_2_SZUL_DATUM", label: "2. Tulajdonos születési dátum" },
  { value: "TULAJDONOS_2_SZUL_HELY_IDO", label: "2. Tulajdonos szül. hely+idő" },
  { value: "TULAJDONOS_2_ANYJA_NEVE", label: "2. Tulajdonos anyja neve" },
  { value: "TULAJDONOS_2_LAKCIM", label: "2. Tulajdonos lakcím" },
  { value: "TULAJDONOS_2_OKMANY_SZAM", label: "2. Tulajdonos okmányszám" },
  { value: "KEPVISELO_NEV", label: "Képviselő neve" },
  { value: "KEPVISELO_BEOSZTAS", label: "Képviselő beosztása" },
  { value: "KAPCSOLAT_NEV", label: "Kapcsolattartó neve" },
  { value: "KAPCSOLAT_EMAIL", label: "Kapcsolattartó email" },
  { value: "KAPCSOLAT_TELEFON", label: "Kapcsolattartó telefon" },
  { value: "MAI_DATUM", label: "Mai dátum" },
]

type PdfFormTemplate = {
  id: string
  name: string
  description?: string
  filename: string
  formFields: string[]
  fieldMappings: Record<string, string>
  staticValues: Record<string, string>
  fileSize: number
  createdAt: { toDate: () => Date } | null
}

async function getAuthToken() {
  const user = firebaseAuth.currentUser
  if (!user) throw new Error("Nincs bejelentkezve")
  return user.getIdToken()
}

export default function PdfFormsPage() {
  const [templates, setTemplates] = useState<PdfFormTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<PdfFormTemplate | null>(null)
  const [editedMappings, setEditedMappings] = useState<Record<string, string>>({})
  const [editedStaticValues, setEditedStaticValues] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [uploadForm, setUploadForm] = useState({
    name: "",
    description: "",
    file: null as File | null,
  })
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    const colRef = collection(firestoreDb, "pdfFormTemplates")
    const unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as PdfFormTemplate[]
        // Sort by createdAt client-side
        data.sort((a, b) => {
          const aTime = a.createdAt?.toDate?.()?.getTime() || 0
          const bTime = b.createdAt?.toDate?.()?.getTime() || 0
          return bTime - aTime
        })
        setTemplates(data)
        setLoading(false)
        
        // Update selectedTemplate if it exists in the updated list
        setSelectedTemplate(prev => {
          if (!prev) return null
          const updated = data.find(t => t.id === prev.id)
          if (updated) {
            setEditedMappings({ ...updated.fieldMappings })
            setEditedStaticValues({ ...updated.staticValues })
            return updated
          }
          return prev
        })
      },
      (error) => {
        console.error("Firestore error:", error)
        setLoading(false)
      }
    )
    return () => unsubscribe()
  }, [])

  const showMessage = useCallback((type: "success" | "error", text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 5000)
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type === "application/pdf") {
      setUploadForm((prev) => ({ ...prev, file }))
    } else {
      showMessage("error", "Csak PDF fájl tölthető fel")
    }
  }

  const handleUpload = async () => {
    if (!uploadForm.file || !uploadForm.name) {
      showMessage("error", "Név és PDF fájl megadása kötelező")
      return
    }

    setUploading(true)
    try {
      const token = await getAuthToken()
      const formData = new FormData()
      formData.append("file", uploadForm.file)
      formData.append("name", uploadForm.name)
      formData.append("description", uploadForm.description)

      const res = await fetch(`${FUNCTIONS_BASE_URL}/uploadPdfFormTemplate`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Feltöltési hiba")

      showMessage("success", `Feltöltve! ${data.template.fieldCount} mező észlelve.`)
      setUploadForm({ name: "", description: "", file: null })
    } catch (error) {
      showMessage("error", error instanceof Error ? error.message : "Ismeretlen hiba")
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (templateId: string) => {
    if (!confirm("Biztosan törölni szeretnéd ezt a sablont?")) return

    try {
      const token = await getAuthToken()
      const res = await fetch(`${FUNCTIONS_BASE_URL}/deletePdfFormTemplate`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ templateId }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Törlési hiba")
      }

      showMessage("success", "Sablon törölve")
      if (selectedTemplate?.id === templateId) {
        setSelectedTemplate(null)
      }
    } catch (error) {
      showMessage("error", error instanceof Error ? error.message : "Ismeretlen hiba")
    }
  }

  const handleSelectTemplate = (template: PdfFormTemplate) => {
    setSelectedTemplate(template)
    setEditedMappings({ ...template.fieldMappings })
    setEditedStaticValues({ ...template.staticValues })
  }

  const handleMappingChange = (fieldName: string, shortcode: string) => {
    setEditedMappings((prev) => ({
      ...prev,
      [fieldName]: shortcode,
    }))
    // Clear static value if shortcode is selected
    if (shortcode) {
      setEditedStaticValues((prev) => {
        const updated = { ...prev }
        delete updated[fieldName]
        return updated
      })
    }
  }

  const handleStaticValueChange = (fieldName: string, value: string) => {
    setEditedStaticValues((prev) => ({
      ...prev,
      [fieldName]: value,
    }))
    // Clear shortcode if static value is entered
    if (value) {
      setEditedMappings((prev) => {
        const updated = { ...prev }
        delete updated[fieldName]
        return updated
      })
    }
  }

  const handleSaveMappings = async () => {
    if (!selectedTemplate) return

    setSaving(true)
    try {
      const token = await getAuthToken()
      const payload = {
        templateId: selectedTemplate.id,
        fieldMappings: editedMappings,
        staticValues: editedStaticValues,
      }
      console.log("Saving PDF mappings:", payload)
      
      const res = await fetch(`${FUNCTIONS_BASE_URL}/updatePdfFormMappings`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const responseData = await res.json()
      console.log("Save response:", responseData)
      
      if (!res.ok) {
        throw new Error(responseData.error || "Mentési hiba")
      }

      // Update selectedTemplate with new values so UI reflects the change
      setSelectedTemplate(prev => prev ? {
        ...prev,
        fieldMappings: editedMappings,
        staticValues: editedStaticValues,
      } : null)

      showMessage("success", "Mezők mentve")
    } catch (error) {
      showMessage("error", error instanceof Error ? error.message : "Ismeretlen hiba")
    } finally {
      setSaving(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[color:var(--foreground)]">PDF Űrlap Sablonok</h1>
            <p className="text-sm text-[color:var(--muted-foreground)]">
              Postai meghatalmazás és egyéb kitölthető PDF formok kezelése
            </p>
          </div>
        </div>

        {message && (
          <div
            className={`p-4 rounded-lg flex items-center gap-2 ${
              message.type === "success"
                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload Section */}
          <AdminCard>
            <AdminCardHeader>
              <AdminCardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Új PDF Űrlap Feltöltése
              </AdminCardTitle>
            </AdminCardHeader>
            <AdminCardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Sablon neve *</Label>
                <Input
                  placeholder="Pl.: Postai meghatalmazás"
                  value={uploadForm.name}
                  onChange={(e) => setUploadForm((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Leírás</Label>
                <Textarea
                  placeholder="Opcionális leírás..."
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm((prev) => ({ ...prev, description: e.target.value }))}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>PDF fájl *</Label>
                <div className="border-2 border-dashed border-[color:var(--border)] rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    id="pdf-upload"
                  />
                  <label htmlFor="pdf-upload" className="cursor-pointer">
                    {uploadForm.file ? (
                      <div className="flex items-center justify-center gap-2 text-[color:var(--primary)]">
                        <FileText className="h-6 w-6" />
                        <span>{uploadForm.file.name}</span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="h-8 w-8 mx-auto text-[color:var(--muted-foreground)]" />
                        <p className="text-sm text-[color:var(--muted-foreground)]">
                          Kattints a PDF feltöltéséhez
                        </p>
                      </div>
                    )}
                  </label>
                </div>
              </div>
              <Button
                onClick={handleUpload}
                disabled={uploading || !uploadForm.file || !uploadForm.name}
                className="w-full"
              >
                {uploading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Feltöltés...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Feltöltés
                  </>
                )}
              </Button>
            </AdminCardContent>
          </AdminCard>

          {/* Templates List */}
          <AdminCard>
            <AdminCardHeader>
              <AdminCardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Feltöltött Sablonok ({templates.length})
              </AdminCardTitle>
            </AdminCardHeader>
            <AdminCardContent>
              {loading ? (
                <div className="text-center py-8 text-[color:var(--muted-foreground)]">
                  <RefreshCw className="h-6 w-6 mx-auto animate-spin mb-2" />
                  Betöltés...
                </div>
              ) : templates.length === 0 ? (
                <div className="text-center py-8 text-[color:var(--muted-foreground)]">
                  Nincs még feltöltött sablon
                </div>
              ) : (
                <div className="space-y-3">
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      className={`p-4 rounded-lg border transition-all cursor-pointer ${
                        selectedTemplate?.id === template.id
                          ? "border-[color:var(--primary)] bg-[color:var(--primary)]/5"
                          : "border-[color:var(--border)] hover:border-[color:var(--primary)]/50"
                      }`}
                      onClick={() => handleSelectTemplate(template)}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-[color:var(--foreground)]">{template.name}</h4>
                          <p className="text-xs text-[color:var(--muted-foreground)]">
                            {template.filename} • {formatFileSize(template.fileSize)}
                          </p>
                          <p className="text-xs text-[color:var(--primary)] mt-1">
                            {template.formFields?.length || 0} kitölthető mező
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(template.id)
                          }}
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </AdminCardContent>
          </AdminCard>
        </div>

        {/* Field Mappings Editor */}
        {selectedTemplate && (
          <AdminCard>
            <AdminCardHeader>
              <AdminCardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Mező Hozzárendelések: {selectedTemplate.name}
                </span>
                <Button variant="ghost" size="sm" onClick={() => setSelectedTemplate(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </AdminCardTitle>
            </AdminCardHeader>
            <AdminCardContent>
              <p className="text-sm text-[color:var(--muted-foreground)] mb-4">
                Minden mezőhöz válassz: <strong>dinamikus shortcode</strong> (szerződés adatból) VAGY <strong>állandó érték</strong> (fix szöveg).
              </p>

              {selectedTemplate.formFields?.length === 0 ? (
                <div className="text-center py-8 text-[color:var(--muted-foreground)]">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                  Nem találhatók kitölthető mezők ebben a PDF-ben.
                  <br />
                  <span className="text-xs">Győződj meg róla, hogy a PDF tartalmaz form mezőket.</span>
                </div>
              ) : (
                <>
                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                    {selectedTemplate.formFields?.map((fieldName) => {
                      const hasMapping = !!editedMappings[fieldName]
                      const hasStatic = !!editedStaticValues[fieldName]
                      return (
                        <div key={fieldName} className="p-3 bg-[color:var(--muted)]/20 rounded-lg">
                          <Label className="text-sm font-mono font-semibold block mb-2">{fieldName}</Label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <span className="text-xs text-[color:var(--muted-foreground)]">Dinamikus (shortcode)</span>
                              <Select
                                value={editedMappings[fieldName] || ""}
                                onValueChange={(value) => handleMappingChange(fieldName, value)}
                              >
                                <SelectTrigger className={`h-9 ${hasMapping ? "border-[color:var(--primary)]" : ""}`}>
                                  <SelectValue placeholder="-- Válassz --" />
                                </SelectTrigger>
                                <SelectContent>
                                  {SHORTCODE_OPTIONS.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                      {opt.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-1">
                              <span className="text-xs text-[color:var(--muted-foreground)]">VAGY állandó érték</span>
                              <Input
                                value={editedStaticValues[fieldName] || ""}
                                onChange={(e) => handleStaticValueChange(fieldName, e.target.value)}
                                placeholder="Fix szöveg..."
                                className={`h-9 ${hasStatic ? "border-[color:var(--primary)]" : ""}`}
                              />
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div className="flex justify-end mt-6 pt-4 border-t border-[color:var(--border)]">
                    <Button onClick={handleSaveMappings} disabled={saving}>
                      {saving ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Mentés...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Hozzárendelések mentése
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </AdminCardContent>
          </AdminCard>
        )}
      </div>
    </AdminLayout>
  )
}
