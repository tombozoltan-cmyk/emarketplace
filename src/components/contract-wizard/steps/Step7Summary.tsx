"use client";

import { useState } from "react";
import {
  AlertCircle,
  Building2,
  Check,
  CheckCircle2,
  FileText,
  Loader2,
  Mail,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import type { ContractData, ContractLanguage } from "@/lib/contract-types";

type Step7SummaryProps = {
  data: ContractData;
  language: ContractLanguage;
  isSubmitting: boolean;
  submitError: string | null;
  onSubmit: () => Promise<string | null>;
  onEditStep: (step: string) => void;
};

export function Step7Summary({
  data,
  language,
  isSubmitting,
  submitError,
  onSubmit,
  onEditStep,
}: Step7SummaryProps) {
  const t = language === "hu";
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [contractId, setContractId] = useState<string | null>(null);

  const canSubmit = termsAccepted && privacyAccepted && !isSubmitting;

  const handleSubmit = async () => {
    const id = await onSubmit();
    if (id) {
      setSubmitSuccess(true);
      setContractId(id);
    }
  };

  // Sikeres beküldés nézet
  if (submitSuccess && contractId) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 text-center">
        <div className="flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
            <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-[color:var(--foreground)]">
          {t ? "Sikeres beküldés!" : "Successfully Submitted!"}
        </h2>
        <p className="text-[color:var(--muted-foreground)]">
          {t
            ? "Az adatokat sikeresen rögzítettük. Kollégánk hamarosan felveszi Önnel a kapcsolatot a szerződéskötés részleteivel kapcsolatban."
            : "Your data has been successfully recorded. Our colleague will contact you soon regarding the contract details."}
        </p>
        <Card className="border-2 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
          <CardContent className="p-4">
            <p className="text-sm text-green-800 dark:text-green-200">
              <span className="font-semibold">
                {t ? "Hivatkozási szám: " : "Reference number: "}
              </span>
              {contractId}
            </p>
          </CardContent>
        </Card>
        
        <div className="pt-4">
          <p className="text-sm text-[color:var(--muted-foreground)]">
            {t
              ? "Megerősítő emailt küldtünk a megadott email címre."
              : "We have sent a confirmation email to the provided email address."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="mb-2 text-2xl font-bold text-[color:var(--foreground)]">
          {t ? "Összegzés" : "Summary"}
        </h2>
        <p className="text-[color:var(--muted-foreground)]">
          {t
            ? "Kérjük, ellenőrizze a megadott adatokat, majd fogadja el a feltételeket a beküldéshez."
            : "Please review your information, then accept the terms to submit."}
        </p>
      </div>

      <div className="mx-auto max-w-3xl space-y-6">
        {/* Szolgáltatás */}
        <SummaryCard
          icon={<FileText className="h-5 w-5" />}
          title={t ? "Szolgáltatás" : "Service"}
          onEdit={() => onEditStep("service-select")}
          language={language}
        >
          <div className="grid gap-2">
            <SummaryRow
              label={t ? "Csomag" : "Package"}
              value={data.packageId || "-"}
            />
            <SummaryRow
              label={t ? "Havi díj" : "Monthly fee"}
              value={`${data.monthlyPrice.toLocaleString()} Ft + ÁFA`}
            />
            <SummaryRow
              label={t ? "Éves díj" : "Annual fee"}
              value={`${data.annualPrice.toLocaleString()} Ft + ÁFA`}
            />
          </div>
        </SummaryCard>

        {/* Cég adatok */}
        <SummaryCard
          icon={<Building2 className="h-5 w-5" />}
          title={t ? "Cég adatok" : "Company Data"}
          onEdit={() => onEditStep("company-data")}
          language={language}
        >
          <div className="grid gap-2">
            <SummaryRow
              label={t ? "Cégnév" : "Company name"}
              value={data.company.name || "-"}
            />
            <SummaryRow
              label={t ? "Cégforma" : "Legal form"}
              value={data.company.legalForm || "-"}
            />
            <SummaryRow
              label={t ? "Típus" : "Type"}
              value={
                data.company.isNew
                  ? t
                    ? "Új cég (alakulás alatt)"
                    : "New company (being founded)"
                  : t
                    ? "Meglévő cég"
                    : "Existing company"
              }
            />
            {data.company.registrationNumber && (
              <SummaryRow
                label={t ? "Cégjegyzékszám" : "Registration number"}
                value={data.company.registrationNumber}
              />
            )}
            <SummaryRow
              label={t ? "Főtevékenység" : "Main activity"}
              value={data.company.mainActivity || "-"}
            />
          </div>
        </SummaryCard>

        {/* Tulajdonos(ok) */}
        <SummaryCard
          icon={<User className="h-5 w-5" />}
          title={t ? (data.owners.length > 1 ? "Tulajdonosok" : "Tulajdonos") : (data.owners.length > 1 ? "Owners" : "Owner")}
          onEdit={() => onEditStep("owner-contact")}
          language={language}
        >
          <div className="space-y-4">
            {data.owners.map((owner, idx) => (
              <div key={idx} className={data.owners.length > 1 ? "border-l-2 border-[color:var(--primary)]/30 pl-3" : ""}>
                {data.owners.length > 1 && (
                  <div className="mb-2 text-xs font-medium text-[color:var(--primary)]">
                    #{idx + 1} - {owner.ownershipPercent}%
                  </div>
                )}
                <div className="grid gap-2">
                  <SummaryRow
                    label={t ? "Típus" : "Type"}
                    value={owner.type === "legal" ? (t ? "Jogi személy" : "Legal entity") : (t ? "Természetes személy" : "Natural person")}
                  />

                  {owner.type === "legal" ? (
                    <>
                      <SummaryRow
                        label={t ? "Cégnév" : "Company name"}
                        value={owner.legal?.companyName || "-"}
                      />
                      <SummaryRow
                        label={t ? "Rövidített név" : "Short name"}
                        value={owner.legal?.shortName || "-"}
                      />
                      <SummaryRow
                        label={t ? "Cégjegyzékszám" : "Registration number"}
                        value={owner.legal?.registrationNumber || "-"}
                      />
                      <SummaryRow
                        label={t ? "Székhely" : "Registered address"}
                        value={owner.legal?.address || "-"}
                      />
                      <SummaryRow
                        label={t ? "Képviselő" : "Representative"}
                        value={owner.legal?.representativeName || "-"}
                      />
                    </>
                  ) : (
                    <>
                      <SummaryRow
                        label={t ? "Név" : "Name"}
                        value={owner.natural?.fullName || "-"}
                      />
                      <SummaryRow
                        label={t ? "Születési hely, idő" : "Birth place, date"}
                        value={`${owner.natural?.birthPlace || ""}, ${owner.natural?.birthDate || ""}`}
                      />
                      <SummaryRow
                        label={t ? "Lakcím" : "Address"}
                        value={owner.natural?.address || "-"}
                      />
                      <SummaryRow
                        label={t ? "Okmány száma" : "ID number"}
                        value={owner.natural?.idNumber || "-"}
                      />
                    </>
                  )}
                  {data.owners.length === 1 && (
                    <SummaryRow
                      label={t ? "Tulajdoni arány" : "Ownership"}
                      value={`${owner.ownershipPercent}%`}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </SummaryCard>

        {/* Kapcsolattartó */}
        <SummaryCard
          icon={<Mail className="h-5 w-5" />}
          title={t ? "Kapcsolattartó" : "Contact Person"}
          onEdit={() => onEditStep("owner-contact")}
          language={language}
        >
          <div className="grid gap-2">
            <SummaryRow
              label={t ? "Név" : "Name"}
              value={
                data.contact.isSameAsOwner
                  ? data.owners[0]?.natural?.fullName || "-"
                  : data.contact.fullName || "-"
              }
            />
            <SummaryRow label="Email" value={data.contact.email || "-"} />
            <SummaryRow
              label={t ? "Telefon" : "Phone"}
              value={data.contact.phone || "-"}
            />
          </div>
        </SummaryCard>

        {/* Képviselő */}
        <SummaryCard
          icon={<User className="h-5 w-5" />}
          title={t ? "Képviselő / Ügyvezető" : "Representative"}
          onEdit={() => onEditStep("representative")}
          language={language}
        >
          <div className="grid gap-2">
            <SummaryRow
              label={t ? "Név" : "Name"}
              value={data.representative.fullName || "-"}
            />
            <SummaryRow
              label={t ? "Beosztás" : "Position"}
              value={data.representative.position || "-"}
            />
            <SummaryRow
              label={t ? "Állampolgárság" : "Nationality"}
              value={data.representative.nationality || "-"}
            />
            {data.representative.isForeign && (
              <div className="mt-2 flex items-center gap-2 text-amber-600 dark:text-amber-400">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {t
                    ? "Külföldi képviselő - kézbesítési megbízott szükséges"
                    : "Foreign representative - delivery agent required"}
                </span>
              </div>
            )}
          </div>
        </SummaryCard>

        {/* PEP nyilatkozat */}
        <SummaryCard
          icon={<FileText className="h-5 w-5" />}
          title={t ? "Közszereplői nyilatkozat" : "PEP Declaration"}
          onEdit={() => onEditStep("pep-declaration")}
          language={language}
        >
          <div className="grid gap-2">
            <SummaryRow
              label={t ? "Kiemelt közszereplő" : "PEP status"}
              value={
                data.pepDeclaration.isPep
                  ? t
                    ? "Igen"
                    : "Yes"
                  : t
                    ? "Nem"
                    : "No"
              }
            />
            <SummaryRow
              label={t ? "PEP hozzátartozó" : "PEP relative"}
              value={
                data.pepDeclaration.isPepRelative
                  ? t
                    ? "Igen"
                    : "Yes"
                  : t
                    ? "Nem"
                    : "No"
              }
            />
            <SummaryRow
              label={t ? "PEP kapcsolat" : "PEP associate"}
              value={
                data.pepDeclaration.isPepAssociate
                  ? t
                    ? "Igen"
                    : "Yes"
                  : t
                    ? "Nem"
                    : "No"
              }
            />
          </div>
        </SummaryCard>

        {/* Feltételek elfogadása */}
        <Card className="border-2 border-[color:var(--border)]">
          <CardContent className="space-y-4 p-6">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="terms"
                checked={termsAccepted}
                onCheckedChange={(checked) => setTermsAccepted(!!checked)}
              />
              <Label
                htmlFor="terms"
                className="text-sm leading-relaxed text-[color:var(--muted-foreground)]"
              >
                {t
                  ? "Elfogadom az Általános Szerződési Feltételeket és kijelentem, hogy a megadott adatok a valóságnak megfelelnek."
                  : "I accept the Terms and Conditions and declare that the provided information is true and accurate."}
              </Label>
            </div>
            <div className="flex items-start space-x-3">
              <Checkbox
                id="privacy"
                checked={privacyAccepted}
                onCheckedChange={(checked) => setPrivacyAccepted(!!checked)}
              />
              <Label
                htmlFor="privacy"
                className="text-sm leading-relaxed text-[color:var(--muted-foreground)]"
              >
                {t
                  ? "Elfogadom az Adatkezelési Tájékoztatót és hozzájárulok személyes adataim kezeléséhez a szerződéskötés és szolgáltatásnyújtás céljából."
                  : "I accept the Privacy Policy and consent to the processing of my personal data for contract conclusion and service provision."}
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Hiba megjelenítése */}
        {submitError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              <p className="text-sm font-medium text-red-800 dark:text-red-200">
                {submitError}
              </p>
            </div>
          </div>
        )}

        {/* Beküldés gomb */}
        <div className="flex justify-center pt-4">
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit}
            size="lg"
            className="min-w-[200px] rounded-full bg-[color:var(--primary)] px-8 py-6 text-lg font-semibold text-[color:var(--primary-foreground)] hover:bg-[color:var(--primary)]/90"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                {t ? "Küldés..." : "Submitting..."}
              </>
            ) : (
              <>
                <Check className="mr-2 h-5 w-5" />
                {t ? "Szerződés beküldése" : "Submit Contract"}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Összegző kártya komponens
function SummaryCard({
  icon,
  title,
  onEdit,
  language,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  onEdit: () => void;
  language: ContractLanguage;
  children: React.ReactNode;
}) {
  const t = language === "hu";

  return (
    <Card className="border border-[color:var(--border)]">
      <CardContent className="px-4 pt-5 pb-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[color:var(--primary)]">
            {icon}
            <h3 className="font-semibold text-[color:var(--foreground)]">
              {title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onEdit}
            className="text-sm font-medium text-[color:var(--primary)] hover:underline"
          >
            {t ? "Szerkesztés" : "Edit"}
          </button>
        </div>
        {children}
      </CardContent>
    </Card>
  );
}

// Összegző sor komponens
function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-[color:var(--muted-foreground)]">{label}:</span>
      <span className="font-medium text-[color:var(--foreground)]">{value}</span>
    </div>
  );
}
