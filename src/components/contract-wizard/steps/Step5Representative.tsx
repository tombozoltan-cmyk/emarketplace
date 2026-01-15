"use client";

import { useEffect } from "react";
import { AlertTriangle, Briefcase, Globe } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import type {
  ContractLanguage,
  ContractData,
  IdDocumentType,
  OwnerData,
} from "@/lib/contract-types";
import { NATIONALITIES } from "@/lib/contract-types";

type RepresentativeData = ContractData["representative"];

type Step5RepresentativeProps = {
  data: RepresentativeData;
  ownerData: OwnerData | undefined;
  onChange: (updates: Partial<RepresentativeData>) => void;
  language: ContractLanguage;
};

export function Step5Representative({
  data,
  ownerData,
  onChange,
  language,
}: Step5RepresentativeProps) {
  const t = language === "hu";

  // Külföldi állampolgár automatikus detektálás - csak állampolgárság változáskor
  const isForeignNationality = data.nationality !== "magyar";

  useEffect(() => {
    // Csak akkor állítjuk be automatikusan, ha külföldi állampolgárságot választott
    // és még nem volt manuálisan beállítva a checkbox
    if (isForeignNationality && !data.isForeign) {
      onChange({ isForeign: true });
    }
  }, [data.nationality]); // eslint-disable-line react-hooks/exhaustive-deps

  // Adatok másolása tulajdonostól
  const copyFromOwner = () => {
    if (ownerData?.natural) {
      onChange({
        fullName: ownerData.natural.fullName,
        birthName: ownerData.natural.birthName,
        nationality: ownerData.natural.nationality,
        birthPlace: ownerData.natural.birthPlace,
        birthDate: ownerData.natural.birthDate,
        motherName: ownerData.natural.motherName,
        address: ownerData.natural.address,
        idType: ownerData.natural.idType,
        idNumber: ownerData.natural.idNumber,
        isForeign: ownerData.natural.nationality !== "magyar",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="mb-2 text-2xl font-bold text-[color:var(--foreground)]">
          {t ? "Képviselő / Ügyvezető adatai" : "Representative / Director Details"}
        </h2>
        <p className="text-[color:var(--muted-foreground)]">
          {t
            ? "Adja meg a cég képviseletére jogosult személy adatait."
            : "Enter the details of the person authorized to represent the company."}
        </p>
      </div>

      <div className="mx-auto max-w-3xl space-y-6">
        {/* Másolás tulajdonostól */}
        {ownerData?.natural?.fullName && (
          <div className="flex items-center justify-center">
            <button
              type="button"
              onClick={copyFromOwner}
              className="rounded-lg border border-[color:var(--primary)] bg-[color:var(--primary)]/10 px-4 py-2 text-sm font-medium text-[color:var(--primary)] transition-colors hover:bg-[color:var(--primary)]/20"
            >
              {t
                ? "Adatok másolása a tulajdonostól"
                : "Copy data from owner"}
            </button>
          </div>
        )}

        <Card className="border-2 border-[color:var(--border)]">
          <CardContent className="p-6">
            <div className="mb-6 flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-[color:var(--primary)]" />
              <h3 className="text-lg font-semibold text-[color:var(--foreground)]">
                {t ? "Személyes adatok" : "Personal Information"}
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Beosztás */}
              <div className="col-span-full space-y-2">
                <Label htmlFor="position" className="text-sm font-medium">
                  {t ? "Beosztás *" : "Position *"}
                </Label>
                <Select
                  value={data.position}
                  onValueChange={(value) => onChange({ position: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ügyvezető">
                      {t ? "Ügyvezető" : "Managing Director"}
                    </SelectItem>
                    <SelectItem value="vezérigazgató">
                      {t ? "Vezérigazgató" : "CEO"}
                    </SelectItem>
                    <SelectItem value="igazgatósági tag">
                      {t ? "Igazgatósági tag" : "Board Member"}
                    </SelectItem>
                    <SelectItem value="cégvezető">
                      {t ? "Cégvezető" : "Company Manager"}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Teljes név */}
              <div className="space-y-2">
                <Label htmlFor="repFullName" className="text-sm font-medium">
                  {t ? "Teljes név *" : "Full Name *"}
                </Label>
                <Input
                  id="repFullName"
                  value={data.fullName}
                  onChange={(e) => onChange({ fullName: e.target.value })}
                  placeholder={t ? "Pl.: Kovács János" : "e.g.: John Smith"}
                />
              </div>

              {/* Születési név */}
              <div className="space-y-2">
                <Label htmlFor="repBirthName" className="text-sm font-medium">
                  {t ? "Születési név" : "Birth Name"}
                </Label>
                <Input
                  id="repBirthName"
                  value={data.birthName}
                  onChange={(e) => onChange({ birthName: e.target.value })}
                  placeholder={t ? "Ha eltér a jelenlegi névtől" : "If different from current name"}
                />
              </div>

              {/* Állampolgárság */}
              <div className="space-y-2">
                <Label htmlFor="repNationality" className="text-sm font-medium">
                  {t ? "Állampolgárság *" : "Nationality *"}
                </Label>
                <Select
                  value={data.nationality}
                  onValueChange={(value) => onChange({ nationality: value })}
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
                <Label htmlFor="repBirthPlace" className="text-sm font-medium">
                  {t ? "Születési hely *" : "Place of Birth *"}
                </Label>
                <Input
                  id="repBirthPlace"
                  value={data.birthPlace}
                  onChange={(e) => onChange({ birthPlace: e.target.value })}
                  placeholder={t ? "Pl.: Budapest" : "e.g.: Budapest"}
                />
              </div>

              {/* Születési dátum */}
              <div className="space-y-2">
                <Label htmlFor="repBirthDate" className="text-sm font-medium">
                  {t ? "Születési dátum *" : "Date of Birth *"}
                </Label>
                <Input
                  id="repBirthDate"
                  type="date"
                  value={data.birthDate}
                  onChange={(e) => onChange({ birthDate: e.target.value })}
                />
              </div>

              {/* Anyja neve */}
              <div className="space-y-2">
                <Label htmlFor="repMotherName" className="text-sm font-medium">
                  {t ? "Anyja neve *" : "Mother's Name *"}
                </Label>
                <Input
                  id="repMotherName"
                  value={data.motherName}
                  onChange={(e) => onChange({ motherName: e.target.value })}
                  placeholder={t ? "Pl.: Kiss Mária" : "e.g.: Mary Smith"}
                />
              </div>

              {/* Lakcím */}
              <div className="col-span-full space-y-2">
                <Label htmlFor="repAddress" className="text-sm font-medium">
                  {t ? "Lakcím / Tartózkodási hely *" : "Address *"}
                </Label>
                <Input
                  id="repAddress"
                  value={data.address}
                  onChange={(e) => onChange({ address: e.target.value })}
                  placeholder={t ? "Pl.: 1234 Budapest, Példa utca 1." : "e.g.: 1234 Budapest, Example St. 1."}
                />
              </div>

              {/* Okmány típusa */}
              <div className="space-y-2">
                <Label htmlFor="repIdType" className="text-sm font-medium">
                  {t ? "Azonosító okmány típusa *" : "ID Document Type *"}
                </Label>
                <Select
                  value={data.idType}
                  onValueChange={(value) =>
                    onChange({ idType: value as IdDocumentType })
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
                <Label htmlFor="repIdNumber" className="text-sm font-medium">
                  {t ? "Okmány száma *" : "Document Number *"}
                </Label>
                <Input
                  id="repIdNumber"
                  value={data.idNumber}
                  onChange={(e) => onChange({ idNumber: e.target.value })}
                  placeholder={t ? "Pl.: 123456AB" : "e.g.: 123456AB"}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Külföldi checkbox */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isForeign"
              checked={data.isForeign}
              onCheckedChange={(checked: boolean) => onChange({ isForeign: checked })}
            />
            <Label
              htmlFor="isForeign"
              className="text-sm font-medium leading-none"
            >
              {t
                ? "A képviselő nem rendelkezik magyarországi lakcímmel"
                : "The representative does not have a Hungarian address"}
            </Label>
          </div>

          {/* Külföldi figyelmeztetés - checkbox után jelenik meg */}
          {data.isForeign && (
            <Card className="border-2 border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-amber-200 dark:bg-amber-800">
                    <Globe className="h-6 w-6 text-amber-700 dark:text-amber-300" />
                  </div>
                  <div>
                    <h4 className="mb-2 text-lg font-semibold text-amber-800 dark:text-amber-200">
                      {t ? "Külföldi képviselő" : "Foreign Representative"}
                    </h4>
                    <p className="mb-3 text-sm text-amber-700 dark:text-amber-300">
                      {t
                        ? "Mivel a képviselő nem magyar állampolgár és nem rendelkezik magyarországi lakcímmel, a magyar jogszabályok értelmében kötelező kézbesítési megbízottat megjelölni."
                        : "Since the representative is not a Hungarian citizen and does not have a Hungarian address, according to Hungarian law, a delivery agent must be designated."}
                    </p>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
                        {t
                          ? "A kézbesítési megbízott szolgáltatás automatikusan hozzáadásra kerül."
                          : "Delivery agent service will be automatically added."}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
