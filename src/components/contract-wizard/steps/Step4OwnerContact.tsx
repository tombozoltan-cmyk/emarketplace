"use client";

import { useState, useCallback } from "react";
import { AlertCircle, Mail, User, Plus, Trash2, Users, Building2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NativeSelect } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import type {
  ContractLanguage,
  OwnerData,
  ContactPersonData,
  NaturalPersonData,
  LegalEntityData,
  IdDocumentType,
  OwnerType,
} from "@/lib/contract-types";
import { NATIONALITIES } from "@/lib/contract-types";

type Step4OwnerContactProps = {
  owners: OwnerData[];
  contact: ContactPersonData;
  onOwnerChange: (index: number, updates: Partial<OwnerData>) => void;
  onContactChange: (updates: Partial<ContactPersonData>) => void;
  onAddOwner: () => void;
  onRemoveOwner: (index: number) => void;
  onSetOwnerCount: (count: number) => void;
  language: ContractLanguage;
};

export function Step4OwnerContact({
  owners,
  contact,
  onOwnerChange,
  onContactChange,
  onAddOwner,
  onRemoveOwner,
  onSetOwnerCount,
  language,
}: Step4OwnerContactProps) {
  const t = language === "hu";
  const [emailTouched, setEmailTouched] = useState(false);
  const [emailConfirmTouched, setEmailConfirmTouched] = useState(false);

  // Név formázás - minden szó első betűje nagybetű
  const formatName = useCallback((name: string): string => {
    if (!name) return name;
    return name
      .split(' ')
      .map(word => {
        if (word.length === 0) return word;
        // Kisbetűs kötőszavak (dr., ifj., id., özv.)
        const lowerWords = ['dr.', 'ifj.', 'id.', 'özv.'];
        if (lowerWords.includes(word.toLowerCase())) {
          return word.toLowerCase();
        }
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join(' ');
  }, []);

  // Tulajdonosi arány összesen
  const totalPercent = owners.reduce((sum, o) => sum + (o.ownershipPercent || 0), 0);
  const isPercentValid = totalPercent === 100;

  // Email validáció
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email);
  const emailsMatch = contact.email === contact.emailConfirm;
  const showEmailError = emailTouched && contact.email && !isEmailValid;
  const showEmailMatchError =
    emailConfirmTouched && contact.emailConfirm && !emailsMatch;

  // Ha a kapcsolattartó megegyezik az első tulajdonossal
  const handleSameAsOwnerChange = (checked: boolean) => {
    if (checked) {
      const firstOwner = owners[0];
      // Ha természetes személy, használjuk az adatait
      if (firstOwner?.type !== "legal" && firstOwner?.natural?.fullName) {
        onContactChange({
          isSameAsOwner: checked,
          fullName: firstOwner.natural.fullName,
          address: firstOwner.natural.address,
        });
      } else if (firstOwner?.type === "legal" && firstOwner?.legal?.representativeName) {
        // Ha jogi személy, a képviselő nevét használjuk
        onContactChange({
          isSameAsOwner: checked,
          fullName: firstOwner.legal.representativeName,
          address: firstOwner.legal.address,
        });
      } else {
        onContactChange({ isSameAsOwner: checked });
      }
    } else {
      onContactChange({ isSameAsOwner: checked });
    }
  };

  // Tulajdonosok számának változtatása
  const handleOwnerCountChange = (count: number) => {
    if (count >= 1 && count <= 10) {
      onSetOwnerCount(count);
    }
  };

  // Tulajdonosi arány változtatása automatikus számítással
  const handleOwnerPercentChange = (index: number, newPercent: number) => {
    // Ha csak 2 tulajdonos van, automatikusan számoljuk a másikat
    if (owners.length === 2) {
      const otherIndex = index === 0 ? 1 : 0;
      const remaining = 100 - newPercent;
      // Ha az új érték valid (1-99), automatikusan kitöltjük a másikat
      if (newPercent >= 1 && newPercent <= 99) {
        onOwnerChange(index, { ownershipPercent: newPercent });
        onOwnerChange(otherIndex, { ownershipPercent: remaining });
      } else {
        onOwnerChange(index, { ownershipPercent: newPercent });
      }
    } else {
      // Több mint 2 tulajdonos esetén csak az utolsónál számolunk automatikusan
      onOwnerChange(index, { ownershipPercent: newPercent });
      
      // Ha nem az utolsó tulajdonos, és van utolsó, számoljuk ki az utolsónak a maradékot
      if (index !== owners.length - 1) {
        const othersTotal = owners.reduce((sum, o, i) => {
          if (i === index) return sum + newPercent;
          if (i === owners.length - 1) return sum; // Az utolsót kihagyjuk
          return sum + (o.ownershipPercent || 0);
        }, 0);
        const remaining = 100 - othersTotal;
        if (remaining >= 0 && remaining <= 100) {
          onOwnerChange(owners.length - 1, { ownershipPercent: remaining });
        }
      }
    }
  };

  // Egyetlen tulajdonos form render
  const renderOwnerForm = (owner: OwnerData, index: number) => {
    const ownerType = owner.type || "natural";
    
    const natural = owner.natural || {
      fullName: "",
      birthName: "",
      nationality: "magyar",
      birthPlace: "",
      birthDate: "",
      motherName: "",
      address: "",
      idType: "personal_id" as IdDocumentType,
      idNumber: "",
    };

    const legal = owner.legal || {
      companyName: "",
      shortName: "",
      registrationNumber: "",
      taxNumber: "",
      address: "",
      mainActivity: "",
      representativeName: "",
      representativePosition: "ügyvezető",
    };

    const updateNatural = (updates: Partial<NaturalPersonData>) => {
      onOwnerChange(index, {
        natural: { ...natural, ...updates },
      });
    };

    const updateLegal = (updates: Partial<LegalEntityData>) => {
      onOwnerChange(index, {
        legal: { ...legal, ...updates },
      });
    };

    const handleTypeChange = (newType: OwnerType) => {
      onOwnerChange(index, { type: newType });
    };

    return (
      <Card key={index} className="border-2 border-[color:var(--border)]">
        <CardContent className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {ownerType === "natural" ? (
                <User className="h-5 w-5 text-[color:var(--primary)]" />
              ) : (
                <Building2 className="h-5 w-5 text-[color:var(--primary)]" />
              )}
              <h3 className="text-lg font-semibold text-[color:var(--foreground)]">
                {owners.length > 1
                  ? `${t ? "Tulajdonos" : "Owner"} #${index + 1}`
                  : t ? "Tulajdonos adatai" : "Owner Details"}
              </h3>
            </div>
            {owners.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onRemoveOwner(index)}
                className="text-red-500 hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="mr-1 h-4 w-4" />
                {t ? "Törlés" : "Remove"}
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Tulajdonosi arány */}
            <div className="col-span-full space-y-2">
              <Label className="text-sm font-medium">
                {t ? "Tulajdonosi arány (%) *" : "Ownership Percentage (%) *"}
              </Label>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={owner.ownershipPercent}
                  onChange={(e) => handleOwnerPercentChange(index, parseInt(e.target.value, 10) || 0)}
                  className="w-24"
                />
                <span className="text-sm text-muted-foreground">%</span>
              </div>
            </div>

            {/* TULAJDONOS TÍPUS VÁLASZTÓ */}
            <div className="col-span-full space-y-3">
              <Label className="text-sm font-medium">
                {t ? "A tulajdonos típusa *" : "Owner Type *"}
              </Label>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {/* Természetes személy */}
                <div
                  onClick={() => handleTypeChange("natural")}
                  className={`cursor-pointer rounded-lg border-2 p-4 transition-all ${
                    ownerType === "natural"
                      ? "border-[color:var(--primary)] bg-[color:var(--primary)]/5"
                      : "border-[color:var(--border)] hover:border-[color:var(--primary)]/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`rounded-full p-2 ${
                      ownerType === "natural" 
                        ? "bg-[color:var(--primary)] text-white" 
                        : "bg-[color:var(--muted)]"
                    }`}>
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-[color:var(--foreground)]">
                        {t ? "Természetes személy" : "Natural Person"}
                      </p>
                      <p className="text-xs text-[color:var(--muted-foreground)]">
                        {t 
                          ? "Magánszemély tulajdonos (pl. alapító tag)" 
                          : "Individual owner (e.g., founding member)"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Jogi személy */}
                <div
                  onClick={() => handleTypeChange("legal")}
                  className={`cursor-pointer rounded-lg border-2 p-4 transition-all ${
                    ownerType === "legal"
                      ? "border-[color:var(--primary)] bg-[color:var(--primary)]/5"
                      : "border-[color:var(--border)] hover:border-[color:var(--primary)]/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`rounded-full p-2 ${
                      ownerType === "legal" 
                        ? "bg-[color:var(--primary)] text-white" 
                        : "bg-[color:var(--muted)]"
                    }`}>
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-[color:var(--foreground)]">
                        {t ? "Jogi személy" : "Legal Entity"}
                      </p>
                      <p className="text-xs text-[color:var(--muted-foreground)]">
                        {t 
                          ? "Cég vagy szervezet a tulajdonos (anyavállalat)" 
                          : "Company or organization is the owner (parent company)"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* TERMÉSZETES SZEMÉLY ŰRLAP */}
            {ownerType === "natural" && (
              <>
                {/* Teljes név */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    {t ? "Teljes név *" : "Full Name *"}
                  </Label>
                  <Input
                    value={natural.fullName}
                    onChange={(e) => updateNatural({ fullName: e.target.value })}
                    onBlur={(e) => updateNatural({ fullName: formatName(e.target.value) })}
                    placeholder={t ? "Pl.: Kovács János" : "e.g.: John Smith"}
                  />
                </div>

            {/* Születési név */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                {t ? "Születési név" : "Birth Name"}
              </Label>
              <Input
                value={natural.birthName}
                onChange={(e) => updateNatural({ birthName: e.target.value })}
                onBlur={(e) => e.target.value && updateNatural({ birthName: formatName(e.target.value) })}
                placeholder={t ? "Ha eltér a jelenlegi névtől" : "If different from current name"}
              />
            </div>

            {/* Állampolgárság */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                {t ? "Állampolgárság *" : "Nationality *"}
              </Label>
              <Select
                value={natural.nationality}
                onValueChange={(value) => updateNatural({ nationality: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {NATIONALITIES.map((n) => (
                    <SelectItem key={n.value} value={n.value}>
                      {n.label[language]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Születési hely */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                {t ? "Születési hely *" : "Place of Birth *"}
              </Label>
              <Input
                value={natural.birthPlace}
                onChange={(e) => updateNatural({ birthPlace: e.target.value })}
                onBlur={(e) => updateNatural({ birthPlace: formatName(e.target.value) })}
                placeholder={t ? "Pl.: Budapest" : "e.g.: Budapest"}
              />
            </div>

            {/* Születési dátum */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                {t ? "Születési dátum *" : "Date of Birth *"}
              </Label>
              <Input
                type="date"
                value={natural.birthDate}
                onChange={(e) => updateNatural({ birthDate: e.target.value })}
              />
            </div>

            {/* Anyja neve */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                {t ? "Anyja neve *" : "Mother's Name *"}
              </Label>
              <Input
                value={natural.motherName}
                onChange={(e) => updateNatural({ motherName: e.target.value })}
                onBlur={(e) => updateNatural({ motherName: formatName(e.target.value) })}
                placeholder={t ? "Pl.: Kiss Mária" : "e.g.: Mary Smith"}
              />
            </div>

            {/* Lakcím */}
            <div className="col-span-full space-y-2">
              <Label className="text-sm font-medium">
                {t ? "Lakcím / Tartózkodási hely *" : "Address *"}
              </Label>
              <Input
                value={natural.address}
                onChange={(e) => updateNatural({ address: e.target.value })}
                placeholder={t ? "Pl.: 1234 Budapest, Példa utca 1." : "e.g.: 1234 Budapest, Example St. 1."}
              />
            </div>

            {/* Okmány típusa */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                {t ? "Azonosító okmány típusa *" : "ID Document Type *"}
              </Label>
              <Select
                value={natural.idType}
                onValueChange={(value) =>
                  updateNatural({ idType: value as IdDocumentType })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="personal_id">
                    {t ? "Személyi igazolvány" : "Personal ID Card"}
                  </SelectItem>
                  <SelectItem value="passport">
                    {t ? "Útlevél" : "Passport"}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Okmány száma */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    {t ? "Okmány száma *" : "Document Number *"}
                  </Label>
                  <Input
                    value={natural.idNumber}
                    onChange={(e) => updateNatural({ idNumber: e.target.value })}
                    placeholder={t ? "Pl.: 123456AB" : "e.g.: 123456AB"}
                  />
                </div>
              </>
            )}

            {/* JOGI SZEMÉLY ŰRLAP */}
            {ownerType === "legal" && (
              <>
                {/* Figyelmeztetés */}
                <div className="col-span-full rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950">
                  <div className="flex gap-3">
                    <AlertCircle className="h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                    <div>
                      <p className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                        {t ? "Jogi személy tulajdonos esetén" : "For legal entity owners"}
                      </p>
                      <p className="mt-1 text-xs text-blue-700 dark:text-blue-300">
                        {t 
                          ? "Kérjük, készítsen másolatot a cég bejegyzési okiratáról, cégkivonatáról vagy nyilvántartásba vételi határozatáról. Ezt a dokumentumot fel kell majd töltenie."
                          : "Please prepare a copy of the company's registration document, company extract, or registration decision. You will need to upload this document."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Cégnév */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    {t ? "Cégnév *" : "Company Name *"}
                  </Label>
                  <Input
                    value={legal.companyName}
                    onChange={(e) => updateLegal({ companyName: e.target.value })}
                    placeholder={t ? "Pl.: VALKO BAU ÉP Kft." : "e.g.: ABC Holdings Ltd."}
                  />
                </div>

                {/* Rövidített név */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    {t ? "Rövidített név" : "Short Name"}
                  </Label>
                  <Input
                    value={legal.shortName}
                    onChange={(e) => updateLegal({ shortName: e.target.value })}
                    placeholder={t ? "Pl.: VALKO BAU" : "e.g.: ABC Holdings"}
                  />
                </div>

                {/* Székhely */}
                <div className="col-span-full space-y-2">
                  <Label className="text-sm font-medium">
                    {t ? "Székhely *" : "Registered Address *"}
                  </Label>
                  <Input
                    value={legal.address}
                    onChange={(e) => updateLegal({ address: e.target.value })}
                    placeholder={t ? "Pl.: 1234 Budapest, Példa utca 1." : "e.g.: 1234 Budapest, Example St. 1."}
                  />
                  <p className="text-xs text-[color:var(--muted-foreground)]">
                    {t 
                      ? "Külföldi székhelyű vállalkozás esetén a magyarországi fióktelep címe (ha van)."
                      : "For foreign companies, the Hungarian branch address (if applicable)."}
                  </p>
                </div>

                {/* Cégjegyzékszám */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    {t ? "Cégjegyzékszám *" : "Registration Number *"}
                  </Label>
                  <Input
                    value={legal.registrationNumber}
                    onChange={(e) => updateLegal({ registrationNumber: e.target.value })}
                    placeholder={t ? "Pl.: 01-09-123456" : "e.g.: 01-09-123456"}
                  />
                  <p className="text-xs text-[color:var(--muted-foreground)]">
                    {t 
                      ? "Vagy nyilvántartásba vételi határozat száma, nyilvántartási szám."
                      : "Or registration decision number, registry number."}
                  </p>
                </div>

                {/* Adószám */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    {t ? "Adószám" : "Tax Number"}
                  </Label>
                  <Input
                    value={legal.taxNumber || ""}
                    onChange={(e) => updateLegal({ taxNumber: e.target.value })}
                    placeholder={t ? "Pl.: 12345678-1-41" : "e.g.: 12345678-1-41"}
                  />
                </div>

                {/* Főtevékenység */}
                <div className="col-span-full space-y-2">
                  <Label className="text-sm font-medium">
                    {t ? "Főtevékenység *" : "Main Activity *"}
                  </Label>
                  <Input
                    value={legal.mainActivity || ""}
                    onChange={(e) => updateLegal({ mainActivity: e.target.value })}
                    placeholder={t ? "Pl.: Padló- és falburkolás" : "e.g.: Construction services"}
                  />
                </div>

                {/* Képviselő neve */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    {t ? "Képviselő neve *" : "Representative Name *"}
                  </Label>
                  <Input
                    value={legal.representativeName}
                    onChange={(e) => updateLegal({ representativeName: e.target.value })}
                    onBlur={(e) => updateLegal({ representativeName: formatName(e.target.value) })}
                    placeholder={t ? "Pl.: Kovács János" : "e.g.: John Smith"}
                  />
                </div>

                {/* Képviselő beosztása */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    {t ? "Képviselő beosztása *" : "Representative Position *"}
                  </Label>
                  <Input
                    value={legal.representativePosition}
                    onChange={(e) => updateLegal({ representativePosition: e.target.value })}
                    placeholder={t ? "Pl.: ügyvezető" : "e.g.: Managing Director"}
                  />
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="mb-2 text-2xl font-bold text-[color:var(--foreground)]">
          {t ? "Tulajdonos(ok) és kapcsolattartó" : "Owner(s) and Contact Person"}
        </h2>
        <p className="text-[color:var(--muted-foreground)]">
          {t
            ? "Adja meg a cég tulajdonosainak és a kapcsolattartónak az adatait."
            : "Enter the details of the company owners and contact person."}
        </p>
      </div>

      <div className="mx-auto max-w-3xl space-y-6">
        {/* TULAJDONOSOK SZÁMA */}
        <Card className="border-2 border-[color:var(--primary)]/30 bg-[color:var(--primary)]/5">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-[color:var(--primary)]" />
                <div>
                  <h3 className="font-semibold text-[color:var(--foreground)]">
                    {t ? "Tulajdonosok száma" : "Number of Owners"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t 
                      ? "Ha több tulajdonos van, mindegyik adatait meg kell adni."
                      : "If there are multiple owners, all their data must be provided."}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <NativeSelect
                  value={owners.length.toString()}
                  onChange={(e) => handleOwnerCountChange(parseInt(e.target.value, 10))}
                  className="w-20"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </NativeSelect>
                <span className="text-sm text-muted-foreground">{t ? "fő" : "person(s)"}</span>
              </div>
            </div>

            {/* Tulajdonosi arány összesítő */}
            <div className={`mt-4 flex items-center justify-between rounded-lg p-3 ${
              isPercentValid 
                ? "bg-green-100 dark:bg-green-900/30" 
                : "bg-red-100 dark:bg-red-900/30"
            }`}>
              <span className="text-sm font-medium">
                {t ? "Tulajdonosi arányok összesen:" : "Total ownership:"}
              </span>
              <span className={`text-lg font-bold ${
                isPercentValid 
                  ? "text-green-700 dark:text-green-400" 
                  : "text-red-700 dark:text-red-400"
              }`}>
                {totalPercent}%
                {!isPercentValid && (
                  <span className="ml-2 text-sm font-normal">
                    ({t ? "100% kell legyen!" : "must be 100%!"})
                  </span>
                )}
              </span>
            </div>

            {/* Tényleges tulajdonos figyelmeztetés */}
            {owners.length > 1 && (
              <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                  <div>
                    <p className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                      {t ? "Tényleges tulajdonosi nyilatkozat" : "Beneficial Owner Declaration"}
                    </p>
                    <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                      {t
                        ? "Több tulajdonos esetén a Pmt. (2017. évi LIII. törvény) szerint minden tényleges tulajdonos adatait külön-külön rögzítjük az ügyfél-átvilágítási adatlapon."
                        : "For multiple owners, according to AML regulations, all beneficial owners' data will be recorded separately on the customer due diligence form."}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* TULAJDONOS FORMOK */}
        {owners.map((owner, index) => renderOwnerForm(owner, index))}

        {/* KAPCSOLATTARTÓ SZEKCIÓ */}
        <Card className="border-2 border-[color:var(--border)]">
          <CardContent className="p-6">
            <div className="mb-6 flex items-center gap-2">
              <Mail className="h-5 w-5 text-[color:var(--primary)]" />
              <h3 className="text-lg font-semibold text-[color:var(--foreground)]">
                {t ? "Kapcsolattartó adatai" : "Contact Person Details"}
              </h3>
            </div>

            {/* Megegyezik a tulajdonossal */}
            <div className="mb-6 flex items-center space-x-2">
              <Checkbox
                id="sameAsOwner"
                checked={contact.isSameAsOwner}
                onCheckedChange={handleSameAsOwnerChange}
              />
              <Label
                htmlFor="sameAsOwner"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {t
                  ? `A kapcsolattartó megegyezik ${owners.length > 1 ? "az első tulajdonossal" : "a tulajdonossal"}`
                  : `Contact person is the same as ${owners.length > 1 ? "the first owner" : "the owner"}`}
              </Label>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Kapcsolattartó neve */}
              {!contact.isSameAsOwner && (
                <div className="col-span-full space-y-2">
                  <Label htmlFor="contactFullName" className="text-sm font-medium">
                    {t ? "Kapcsolattartó neve *" : "Contact Name *"}
                  </Label>
                  <Input
                    id="contactFullName"
                    value={contact.fullName}
                    onChange={(e) => onContactChange({ fullName: e.target.value })}
                    placeholder={t ? "Pl.: Kovács János" : "e.g.: John Smith"}
                  />
                </div>
              )}

              {/* EMAIL - FONTOS FIGYELMEZTETÉSSEL */}
              <div className="col-span-full space-y-2">
                <Label htmlFor="contactEmail" className="text-sm font-medium">
                  {t ? "Email cím *" : "Email Address *"}
                </Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={contact.email}
                  onChange={(e) => onContactChange({ email: e.target.value })}
                  onBlur={() => setEmailTouched(true)}
                  placeholder={t ? "pelda@email.com" : "example@email.com"}
                  className={showEmailError ? "border-red-500" : ""}
                />
                {showEmailError && (
                  <p className="flex items-center gap-1 text-xs text-red-500">
                    <AlertCircle className="h-3 w-3" />
                    {t ? "Érvénytelen email formátum" : "Invalid email format"}
                  </p>
                )}
              </div>

              {/* EMAIL MEGERŐSÍTÉS */}
              <div className="col-span-full space-y-2">
                <Label htmlFor="contactEmailConfirm" className="text-sm font-medium">
                  {t ? "Email cím megerősítése *" : "Confirm Email Address *"}
                </Label>
                <Input
                  id="contactEmailConfirm"
                  type="email"
                  value={contact.emailConfirm}
                  onChange={(e) => onContactChange({ emailConfirm: e.target.value })}
                  onBlur={() => setEmailConfirmTouched(true)}
                  placeholder={t ? "pelda@email.com" : "example@email.com"}
                  className={showEmailMatchError ? "border-red-500" : ""}
                />
                {showEmailMatchError && (
                  <p className="flex items-center gap-1 text-xs text-red-500">
                    <AlertCircle className="h-3 w-3" />
                    {t ? "Az email címek nem egyeznek" : "Email addresses do not match"}
                  </p>
                )}
              </div>

              {/* EMAIL FIGYELMEZTETÉS */}
              <div className="col-span-full rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
                  <div>
                    <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                      {t ? "Fontos az email cím!" : "Email address is important!"}
                    </p>
                    <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
                      {t
                        ? "Erre az email címre küldjük a hivatalos postai levelek szkennelt másolatait. Kérjük, olyan email címet adjon meg, amelyet rendszeresen ellenőriz, mert fontos hivatalos dokumentumok érkezhetnek (pl. NAV, Cégbíróság, hatósági levelek)."
                        : "We will send scanned copies of official mail to this email address. Please provide an email you check regularly, as important official documents may arrive (e.g., tax authority, court registry, authority letters)."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Telefonszám */}
              <div className="space-y-2">
                <Label htmlFor="contactPhone" className="text-sm font-medium">
                  {t ? "Telefonszám *" : "Phone Number *"}
                </Label>
                <Input
                  id="contactPhone"
                  type="tel"
                  value={contact.phone}
                  onChange={(e) => onContactChange({ phone: e.target.value })}
                  placeholder={t ? "+36 30 123 4567" : "+36 30 123 4567"}
                />
              </div>

              {/* Kapcsolattartó címe */}
              {!contact.isSameAsOwner && (
                <div className="space-y-2">
                  <Label htmlFor="contactAddress" className="text-sm font-medium">
                    {t ? "Cím *" : "Address *"}
                  </Label>
                  <Input
                    id="contactAddress"
                    value={contact.address || ""}
                    onChange={(e) => onContactChange({ address: e.target.value })}
                    placeholder={t ? "1234 Budapest, Példa utca 1." : "1234 Budapest, Example St. 1."}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
