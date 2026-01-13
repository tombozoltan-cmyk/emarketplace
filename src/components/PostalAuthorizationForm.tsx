"use client";

import { useState } from "react";
import { FileDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  generatePostalAuthorizationPDF,
  downloadPDF,
  type PostalAuthorizationData,
} from "@/lib/pdf-generators/postal-authorization";

type PostalAuthorizationFormProps = {
  language?: "hu" | "en";
  initialData?: Partial<PostalAuthorizationData>;
  onGenerated?: (pdfBytes: Uint8Array) => void;
};

export function PostalAuthorizationForm({
  language = "hu",
  initialData,
  onGenerated,
}: PostalAuthorizationFormProps) {
  const t = language === "hu";
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState<PostalAuthorizationData>({
    companyName: initialData?.companyName || "",
    companyAddress: initialData?.companyAddress || "",
    companyRegistrationNumber: initialData?.companyRegistrationNumber || "",
    authorizedPersonName: initialData?.authorizedPersonName || "",
    authorizedPersonIdNumber: initialData?.authorizedPersonIdNumber || "",
    authorizedPersonAddress: initialData?.authorizedPersonAddress || "",
    representativeName: initialData?.representativeName || "",
    representativePosition: initialData?.representativePosition || "ügyvezető",
    deliveryAddress: initialData?.deliveryAddress || "",
    date: initialData?.date || new Date().toLocaleDateString("hu-HU"),
    city: initialData?.city || "Budapest",
  });

  const updateField = (field: keyof PostalAuthorizationData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const pdfBytes = await generatePostalAuthorizationPDF(formData);
      
      if (onGenerated) {
        onGenerated(pdfBytes);
      }
      
      const filename = `meghatalmazas_${formData.companyName.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.pdf`;
      downloadPDF(pdfBytes, filename);
    } catch (error) {
      console.error("PDF generation error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileDown className="h-5 w-5" />
          {t ? "Postai Meghatalmazás" : "Postal Authorization"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Cég adatai */}
        <div className="space-y-4">
          <h3 className="font-semibold text-sm text-muted-foreground border-b pb-2">
            {t ? "I. Meghatalmazó (Cég) adatai" : "I. Authorizing Company Details"}
          </h3>
          
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t ? "Cégnév *" : "Company Name *"}</Label>
              <Input
                value={formData.companyName}
                onChange={(e) => updateField("companyName", e.target.value)}
                placeholder={t ? "Pl.: Example Kft." : "e.g.: Example Ltd."}
              />
            </div>
            <div className="space-y-2">
              <Label>{t ? "Cégjegyzékszám" : "Registration Number"}</Label>
              <Input
                value={formData.companyRegistrationNumber}
                onChange={(e) => updateField("companyRegistrationNumber", e.target.value)}
                placeholder="01-09-123456"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>{t ? "Székhely *" : "Registered Address *"}</Label>
            <Input
              value={formData.companyAddress}
              onChange={(e) => updateField("companyAddress", e.target.value)}
              placeholder={t ? "1234 Budapest, Példa utca 1." : "1234 Budapest, Example St. 1."}
            />
          </div>
        </div>

        {/* Meghatalmazott adatai */}
        <div className="space-y-4">
          <h3 className="font-semibold text-sm text-muted-foreground border-b pb-2">
            {t ? "II. Meghatalmazott adatai" : "II. Authorized Person Details"}
          </h3>
          
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t ? "Meghatalmazott neve *" : "Authorized Person Name *"}</Label>
              <Input
                value={formData.authorizedPersonName}
                onChange={(e) => updateField("authorizedPersonName", e.target.value)}
                placeholder={t ? "Kovács János" : "John Smith"}
              />
            </div>
            <div className="space-y-2">
              <Label>{t ? "Személyi ig. száma *" : "ID Number *"}</Label>
              <Input
                value={formData.authorizedPersonIdNumber}
                onChange={(e) => updateField("authorizedPersonIdNumber", e.target.value)}
                placeholder="123456AB"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>{t ? "Lakcím *" : "Address *"}</Label>
            <Input
              value={formData.authorizedPersonAddress}
              onChange={(e) => updateField("authorizedPersonAddress", e.target.value)}
              placeholder={t ? "1234 Budapest, Lakó utca 2." : "1234 Budapest, Home St. 2."}
            />
          </div>
        </div>

        {/* Képviselő és kézbesítési cím */}
        <div className="space-y-4">
          <h3 className="font-semibold text-sm text-muted-foreground border-b pb-2">
            {t ? "III. Képviselő és kézbesítési cím" : "III. Representative & Delivery Address"}
          </h3>
          
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t ? "Képviselő neve *" : "Representative Name *"}</Label>
              <Input
                value={formData.representativeName}
                onChange={(e) => updateField("representativeName", e.target.value)}
                placeholder={t ? "Nagy Péter" : "Peter Nagy"}
              />
            </div>
            <div className="space-y-2">
              <Label>{t ? "Beosztása *" : "Position *"}</Label>
              <Input
                value={formData.representativePosition}
                onChange={(e) => updateField("representativePosition", e.target.value)}
                placeholder="ügyvezető"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>{t ? "Kézbesítési cím *" : "Delivery Address *"}</Label>
            <Input
              value={formData.deliveryAddress}
              onChange={(e) => updateField("deliveryAddress", e.target.value)}
              placeholder={t ? "1052 Budapest, Székház utca 10." : "1052 Budapest, Office St. 10."}
            />
          </div>
        </div>

        {/* Dátum */}
        <div className="space-y-4">
          <h3 className="font-semibold text-sm text-muted-foreground border-b pb-2">
            {t ? "IV. Keltezés" : "IV. Date"}
          </h3>
          
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t ? "Város" : "City"}</Label>
              <Input
                value={formData.city}
                onChange={(e) => updateField("city", e.target.value)}
                placeholder="Budapest"
              />
            </div>
            <div className="space-y-2">
              <Label>{t ? "Dátum" : "Date"}</Label>
              <Input
                value={formData.date}
                onChange={(e) => updateField("date", e.target.value)}
                placeholder="2024. január 1."
              />
            </div>
          </div>
        </div>

        {/* Generate button */}
        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !formData.companyName || !formData.authorizedPersonName}
          className="w-full"
          size="lg"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t ? "PDF generálása..." : "Generating PDF..."}
            </>
          ) : (
            <>
              <FileDown className="mr-2 h-4 w-4" />
              {t ? "PDF Letöltése" : "Download PDF"}
            </>
          )}
        </Button>
        
        <p className="text-xs text-muted-foreground text-center">
          {t 
            ? "A letöltött PDF-et ki kell nyomtatni és aláírni. Az eredeti példányt a meghatalmazottnak magánál kell tartania."
            : "The downloaded PDF must be printed and signed. The original copy must be kept by the authorized person."}
        </p>
      </CardContent>
    </Card>
  );
}
