import { firebaseAuth } from '@/lib/firebase-auth'

const FUNCTIONS_BASE_URL = process.env.NEXT_PUBLIC_FUNCTIONS_URL || 'https://us-central1-emarketplace-8aab1.cloudfunctions.net'

export type DocxTemplate = {
  id: string
  name: string
  description?: string
  category: string
  filename: string
  storagePath: string
  detectedShortcodes: string[]
  fileSize: number
  createdAt?: Date
  updatedAt?: Date
}

export type ShortcodeCategory = {
  name: string
  shortcodes: {
    code: string
    label: string
    type: string
  }[]
}

export type UploadTemplateParams = {
  file: File
  name?: string
  description?: string
  category?: string
}

export type GenerateDocumentParams = {
  templateId: string
  format?: 'docx' | 'both'
  data?: Record<string, string>
  useSampleData?: boolean
}

async function getAuthToken(): Promise<string> {
  const currentUser = firebaseAuth.currentUser
  if (!currentUser) throw new Error('Nincs bejelentkezve')
  return currentUser.getIdToken()
}

export async function uploadDocxTemplate(params: UploadTemplateParams): Promise<{
  success: boolean
  template: {
    id: string
    name: string
    filename: string
    detectedShortcodes: string[]
    fileSize: number
    fileSizeFormatted: string
  }
}> {
  const token = await getAuthToken()
  const formData = new FormData()
  formData.append('file', params.file)
  formData.append('name', params.name || params.file.name.replace('.docx', ''))
  formData.append('description', params.description || '')
  formData.append('category', params.category || 'Egyéb')

  const res = await fetch(`${FUNCTIONS_BASE_URL}/uploadDocxTemplate`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Feltöltési hiba')
  return data
}

export async function generateDocument(params: GenerateDocumentParams): Promise<Blob> {
  const token = await getAuthToken()
  const res = await fetch(`${FUNCTIONS_BASE_URL}/generateDocument`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      templateId: params.templateId,
      format: params.format || 'docx',
      data: params.data || {},
      useSampleData: params.useSampleData ?? false,
    }),
  })

  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.error || 'Generálási hiba')
  }

  return res.blob()
}

export async function deleteDocxTemplate(templateId: string): Promise<{ success: boolean }> {
  const token = await getAuthToken()
  const res = await fetch(`${FUNCTIONS_BASE_URL}/deleteDocxTemplate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ templateId }),
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Törlési hiba')
  return data
}

export async function listShortcodes(): Promise<{
  categories: ShortcodeCategory[]
  sampleData: Record<string, string>
}> {
  const res = await fetch(`${FUNCTIONS_BASE_URL}/listShortcodes`)
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Hiba a shortcode-ok lekérésekor')
  return data
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function getFilenameFromResponse(response: Response, defaultName: string): string {
  const contentDisposition = response.headers.get('Content-Disposition') || ''
  const filenameMatch = contentDisposition.match(/filename="(.+)"/)
  return filenameMatch ? filenameMatch[1] : defaultName
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}
