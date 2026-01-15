"use client";

import { useState, useCallback } from "react";
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Shield,
  Lock,
  Scale,
  Trash2,
  Loader2,
  Info,
} from "lucide-react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { firebaseStorage } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { ContractLanguage, ContractDocuments } from "@/lib/contract-types";

type Step7DocumentsProps = {
  data: ContractDocuments;
  companyName: string;
  ownerName: string;
  onChange: (updates: Partial<ContractDocuments>) => void;
  language: ContractLanguage;
};

type DocumentType = keyof Omit<ContractDocuments, "otherDocuments">;

const DOCUMENT_TYPES: {
  key: DocumentType;
  label: { hu: string; en: string };
  description: { hu: string; en: string };
  required: boolean;
}[] = [
  {
    key: "idFront",
    label: { hu: "Személyi igazolvány (előlap)", en: "ID Card (front)" },
    description: {
      hu: "Az azonosító okmány első oldala, ahol a fénykép és az alapadatok láthatók.",
      en: "The front side of the ID card with photo and basic data.",
    },
    required: true,
  },
  {
    key: "idBack",
    label: { hu: "Személyi igazolvány (hátlap)", en: "ID Card (back)" },
    description: {
      hu: "Az azonosító okmány hátsó oldala a lakcímmel.",
      en: "The back side of the ID card with address.",
    },
    required: true,
  },
  {
    key: "addressCard",
    label: { hu: "Lakcímkártya (első oldal)", en: "Address Card (front only)" },
    description: {
      hu: "Csak a lakcímkártya első oldala szükséges. A hátsó oldal feltöltése jogszabály által tiltott.",
      en: "Only the front side of the address card is required. Uploading the back side is prohibited by law.",
    },
    required: false,
  },
  {
    key: "companyExtract",
    label: { hu: "Cégkivonat (ha meglévő cég)", en: "Company Extract (if existing)" },
    description: {
      hu: "30 napnál nem régebbi cégkivonat meglévő cég esetén.",
      en: "Company extract not older than 30 days for existing companies.",
    },
    required: false,
  },
];

export function Step7Documents({
  data,
  companyName,
  ownerName,
  onChange,
  language,
}: Step7DocumentsProps) {
  const t = language === "hu";
  const [uploading, setUploading] = useState<DocumentType | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileUpload = useCallback(
    async (docType: DocumentType, file: File) => {
      if (!file) return;

      // Validate file type (bővítve mobilos formátumokra is, pl. iOS HEIC/HEIF)
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/heic",
        "image/heif",
        "application/pdf",
      ];
      if (!allowedTypes.includes(file.type)) {
        setUploadError(
          t
            ? "Csak JPG, PNG, WEBP vagy PDF fájlok tölthetők fel."
            : "Only JPG, PNG, WEBP or PDF files are allowed."
        );
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setUploadError(
          t ? "A fájl mérete maximum 10MB lehet." : "File size must be under 10MB."
        );
        return;
      }

      setUploading(docType);
      setUploadError(null);

      try {
        const safeCompanyName = companyName.replace(/[^a-zA-Z0-9]/g, "_") || "company";
        const timestamp = Date.now();
        const safeFileName = file.name.replace(/\s+/g, "-");
        const path = `contract-documents/${safeCompanyName}/${docType}_${timestamp}_${safeFileName}`;
        const storageRef = ref(firebaseStorage, path);

        await uploadBytes(storageRef, file, {
          contentType: file.type,
        });

        const downloadUrl = await getDownloadURL(storageRef);
        onChange({ [docType]: downloadUrl });
      } catch (error) {
        console.error("Upload error:", error);
        setUploadError(
          t ? "Hiba történt a feltöltés során. Kérjük, próbálja újra." : "Upload failed. Please try again."
        );
      } finally {
        setUploading(null);
      }
    },
    [companyName, onChange, t]
  );

  const handleRemoveDocument = useCallback(
    (docType: DocumentType) => {
      onChange({ [docType]: undefined });
    },
    [onChange]
  );

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="mb-2 text-2xl font-bold text-[color:var(--foreground)]">
          {t ? "Dokumentumok feltöltése" : "Document Upload"}
        </h2>
        <p className="text-[color:var(--muted-foreground)]">
          {t
            ? "A jogszabályi előírásoknak megfelelően kérjük, töltse fel az azonosító okmányait."
            : "Please upload your identification documents as required by law."}
        </p>
      </div>

      <div className="mx-auto max-w-3xl space-y-6">
        {/* Adatvédelmi és jogi tájékoztató */}
        <Card className="border-2 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
          <CardContent className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200">
                {t ? "Miért kérjük ezeket az adatokat?" : "Why do we need these documents?"}
              </h3>
            </div>

            <div className="space-y-4 text-sm text-blue-700 dark:text-blue-300">
              <div className="flex gap-3">
                <Scale className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">
                    {t ? "Jogszabályi kötelezettség" : "Legal Requirement"}
                  </p>
                  <p>
                    {t
                      ? "A 2017. évi LIII. törvény (Pmt.) előírja a székhelyszolgáltatók számára az ügyfél-átvilágítási kötelezettséget. Ez magában foglalja az ügyfél és a tényleges tulajdonos azonosítását, személyazonosságának igazoló ellenőrzését."
                      : "Act LIII of 2017 (AML Act) requires registered office service providers to perform customer due diligence. This includes identifying and verifying the identity of the customer and beneficial owners."}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Lock className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">
                    {t ? "Adatbiztonság" : "Data Security"}
                  </p>
                  <p>
                    {t
                      ? "Dokumentumait titkosított kapcsolaton keresztül, biztonságos szervereken tároljuk. Az adatokat kizárólag a jogszabályban meghatározott célra használjuk, harmadik félnek nem adjuk át (kivéve hatósági megkeresés esetén)."
                      : "Your documents are transmitted via encrypted connection and stored on secure servers. We use the data solely for legally required purposes and do not share it with third parties (except for official authority requests)."}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Info className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">
                    {t ? "Adatmegőrzés" : "Data Retention"}
                  </p>
                  <p>
                    {t
                      ? "A Pmt. értelmében az ügyfél-átvilágítási adatokat a szerződés megszűnését követően 8 évig kötelesek vagyunk megőrizni. Ezt követően az adatokat töröljük."
                      : "Under the AML Act, we are required to retain customer due diligence data for 8 years after the termination of the contract. After this period, the data will be deleted."}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Hibaüzenet */}
        {uploadError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              <p className="text-sm font-medium text-red-800 dark:text-red-200">
                {uploadError}
              </p>
            </div>
          </div>
        )}

        {/* Dokumentum feltöltő kártyák */}
        <div className="grid gap-4 md:grid-cols-2">
          {DOCUMENT_TYPES.map((docType) => {
            const isUploaded = !!data[docType.key];
            const isUploading = uploading === docType.key;

            return (
              <Card
                key={docType.key}
                className={`border-2 transition-all ${
                  isUploaded
                    ? "border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-950"
                    : "border-[color:var(--border)] hover:border-[color:var(--primary)]/50"
                }`}
              >
                <CardContent className="px-4 pt-5 pb-4">
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {isUploaded ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                      ) : (
                        <FileText className="h-5 w-5 text-[color:var(--muted-foreground)]" />
                      )}
                      <div>
                        <p className="font-medium text-[color:var(--foreground)]">
                          {docType.label[language]}
                          {docType.required && (
                            <span className="ml-1 text-red-500">*</span>
                          )}
                        </p>
                      </div>
                    </div>
                    {isUploaded && (
                      <button
                        onClick={() => handleRemoveDocument(docType.key)}
                        className="rounded p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900"
                        title={t ? "Törlés" : "Remove"}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <p className="mb-3 text-xs text-[color:var(--muted-foreground)]">
                    {docType.description[language]}
                  </p>

                  {isUploaded ? (
                    <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-300">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>{t ? "Feltöltve" : "Uploaded"}</span>
                    </div>
                  ) : (
                    <div className="relative">
                      <input
                        type="file"
                        id={`file-${docType.key}`}
                        accept="image/jpeg,image/png,image/webp,image/heic,image/heif,application/pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleFileUpload(docType.key, file);
                          }
                          // Reset input so same file can be selected again
                          e.target.value = "";
                        }}
                        disabled={isUploading}
                        className="absolute inset-0 cursor-pointer opacity-0 w-full h-full z-10"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isUploading}
                        className="w-full gap-2 pointer-events-none"
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            {t ? "Feltöltés..." : "Uploading..."}
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4" />
                            {t ? "Fájl kiválasztása" : "Choose File"}
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Elfogadott formátumok */}
        <p className="text-center text-xs text-[color:var(--muted-foreground)]">
          {t
            ? "Elfogadott formátumok: JPG, PNG, WEBP, HEIC, HEIF, PDF (max. 10MB)"
            : "Accepted formats: JPG, PNG, WEBP, HEIC, HEIF, PDF (max. 10MB)"}
        </p>

        {/* Adatvédelmi nyilatkozat link */}
        <div className="text-center">
          <a
            href="/adatvedelem"
            target="_blank"
            className="text-sm text-[color:var(--primary)] hover:underline"
          >
            {t ? "Adatvédelmi tájékoztató megtekintése →" : "View Privacy Policy →"}
          </a>
        </div>
      </div>
    </div>
  );
}
