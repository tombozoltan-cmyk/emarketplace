"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ContractLanguage, CompanyData } from "@/lib/contract-types";
import { LEGAL_FORMS } from "@/lib/contract-types";

type Step3CompanyDataProps = {
  data: CompanyData;
  onChange: (updates: Partial<CompanyData>) => void;
  language: ContractLanguage;
};

// Cégforma rövidítések a cégnév végére
const LEGAL_FORM_SUFFIXES: Record<string, string> = {
  kft: "Kft.",
  bt: "Bt.",
  zrt: "Zrt.",
  nyrt: "Nyrt.",
  kkt: "Kkt.",
  ev: "e.v.",
};

export function Step3CompanyData({
  data,
  onChange,
  language,
}: Step3CompanyDataProps) {
  const t = language === "hu";

  // Cégforma változtatásakor automatikusan hozzáfűzi a cégnévhez
  const handleLegalFormChange = (newLegalForm: string) => {
    let updatedName = data.name;
    
    // Távolítjuk a korábbi cégforma rövidítést a név végéről
    Object.values(LEGAL_FORM_SUFFIXES).forEach((suffix) => {
      const regex = new RegExp(`\\s*${suffix.replace('.', '\\.')}\\s*$`, 'i');
      updatedName = updatedName.replace(regex, '').trim();
    });
    
    // Hozzáfűzzük az új cégformát
    const newSuffix = LEGAL_FORM_SUFFIXES[newLegalForm];
    if (newSuffix && updatedName) {
      updatedName = `${updatedName} ${newSuffix}`;
    }
    
    onChange({ 
      legalForm: newLegalForm,
      name: updatedName 
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="mb-2 text-2xl font-bold text-[color:var(--foreground)]">
          {t ? "Cég adatok" : "Company Information"}
        </h2>
        <p className="text-[color:var(--muted-foreground)]">
          {t
            ? "Adja meg a cég hivatalos adatait a szerződéshez."
            : "Enter the official company details for the contract."}
        </p>
      </div>

      <div className="mx-auto max-w-2xl space-y-6">
        {/* Cégnév */}
        <div className="space-y-2">
          <Label htmlFor="companyName" className="text-sm font-medium">
            {t ? "Cégnév *" : "Company Name *"}
          </Label>
          <Input
            id="companyName"
            value={data.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder={t ? "Pl.: Példa Kft." : "e.g.: Example Ltd."}
            className="w-full"
          />
        </div>

        {/* Rövidített név */}
        <div className="space-y-2">
          <Label htmlFor="shortName" className="text-sm font-medium">
            {t ? "Rövidített név *" : "Short Name *"}
          </Label>
          <Input
            id="shortName"
            value={data.shortName}
            onChange={(e) => onChange({ shortName: e.target.value })}
            placeholder={t ? "Pl.: Példa" : "e.g.: Example"}
            className="w-full"
          />
          <p className="text-xs text-[color:var(--muted-foreground)]">
            {t
              ? "A cég rövidített neve, ami a cégtáblán és levelezésben szerepel."
              : "The abbreviated name used on signage and correspondence."}
          </p>
        </div>

        {/* Cégforma */}
        <div className="space-y-2">
          <Label htmlFor="legalForm" className="text-sm font-medium">
            {t ? "Cégforma *" : "Legal Form *"}
          </Label>
          <Select
            value={data.legalForm}
            onValueChange={handleLegalFormChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue
                placeholder={t ? "Válasszon cégformát" : "Select legal form"}
              />
            </SelectTrigger>
            <SelectContent>
              {LEGAL_FORMS.map((form) => (
                <SelectItem key={form.value} value={form.value}>
                  {form.label[language]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Cégjegyzékszám és Adószám - csak meglévő cégnél */}
        {!data.isNew && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="registrationNumber" className="text-sm font-medium">
                {t ? "Cégjegyzékszám *" : "Registration Number *"}
              </Label>
              <Input
                id="registrationNumber"
                value={data.registrationNumber || ""}
                onChange={(e) =>
                  onChange({ registrationNumber: e.target.value })
                }
                placeholder={t ? "Pl.: 01-09-123456" : "e.g.: 01-09-123456"}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="taxNumber" className="text-sm font-medium">
                {t ? "Adószám" : "Tax Number"}
              </Label>
              <Input
                id="taxNumber"
                value={data.taxNumber || ""}
                onChange={(e) => onChange({ taxNumber: e.target.value })}
                placeholder={t ? "Pl.: 12345678-2-42" : "e.g.: 12345678-2-42"}
                className="w-full"
              />
            </div>
          </div>
        )}

        {/* Jelenlegi székhely - csak meglévő cégnél */}
        {!data.isNew && (
          <div className="space-y-2">
            <Label htmlFor="currentAddress" className="text-sm font-medium">
              {t ? "Jelenlegi székhely" : "Current Registered Address"}
            </Label>
            <Input
              id="currentAddress"
              value={data.currentAddress || ""}
              onChange={(e) => onChange({ currentAddress: e.target.value })}
              placeholder={t ? "Pl.: 1234 Budapest, Példa utca 1." : "e.g.: 1234 Budapest, Example Street 1."}
              className="w-full"
            />
          </div>
        )}

        {/* Főtevékenység */}
        <div className="space-y-2">
          <Label htmlFor="mainActivity" className="text-sm font-medium">
            {t ? "Főtevékenység *" : "Main Activity *"}
          </Label>
          <Input
            id="mainActivity"
            value={data.mainActivity}
            onChange={(e) => onChange({ mainActivity: e.target.value })}
            placeholder={t ? "Pl.: Számítógépes programozás" : "e.g.: Computer programming"}
            className="w-full"
          />
        </div>

        {/* TEÁOR kód */}
        <div className="space-y-2">
          <Label htmlFor="mainActivityCode" className="text-sm font-medium">
            {t ? "TEÁOR kód (opcionális)" : "NACE Code (optional)"}
          </Label>
          <Input
            id="mainActivityCode"
            value={data.mainActivityCode || ""}
            onChange={(e) => onChange({ mainActivityCode: e.target.value })}
            placeholder={t ? "Pl.: 6201" : "e.g.: 6201"}
            className="w-full"
          />
        </div>

        {/* Új cég infó */}
        {data.isNew && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <span className="font-semibold">
                {t ? "Megjegyzés: " : "Note: "}
              </span>
              {t
                ? "Új cég esetén a cégjegyzékszám és adószám a cégbejegyzés után lesz elérhető. Ezeket később pótolhatja az admin felületen."
                : "For new companies, the registration number and tax ID will be available after company registration. You can add these later in the admin panel."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
