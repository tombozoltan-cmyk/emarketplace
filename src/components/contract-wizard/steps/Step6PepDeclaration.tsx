"use client";

import { AlertCircle, Shield } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import type { ContractLanguage, PepDeclaration } from "@/lib/contract-types";

type Step6PepDeclarationProps = {
  data: PepDeclaration;
  onChange: (updates: Partial<PepDeclaration>) => void;
  language: ContractLanguage;
};

export function Step6PepDeclaration({
  data,
  onChange,
  language,
}: Step6PepDeclarationProps) {
  const t = language === "hu";

  const hasPepStatus = data.isPep || data.isPepRelative || data.isPepAssociate;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="mb-2 text-2xl font-bold text-[color:var(--foreground)]">
          {t ? "Kiemelt közszereplői nyilatkozat" : "PEP Declaration"}
        </h2>
        <p className="text-[color:var(--muted-foreground)]">
          {t
            ? "A 2017. évi LIII. törvény (Pmt.) előírásai szerint nyilatkoznia kell a kiemelt közszereplői státuszról."
            : "According to Hungarian AML law (Act LIII of 2017), you must declare your PEP status."}
        </p>
      </div>

      <div className="mx-auto max-w-3xl space-y-6">
        {/* Információs doboz */}
        <Card className="border-2 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <Shield className="h-6 w-6 flex-shrink-0 text-blue-600 dark:text-blue-400" />
              <div>
                <h4 className="mb-2 text-lg font-semibold text-blue-800 dark:text-blue-200">
                  {t ? "Mi az a kiemelt közszereplő (PEP)?" : "What is a PEP?"}
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {t
                    ? "Kiemelt közszereplő az a személy, aki fontos közfeladatot lát el, vagy a megelőző egy éven belül látott el. Ide tartozik például: államfő, miniszter, országgyűlési képviselő, alkotmánybírósági tag, legfelsőbb bírósági tag, számvevőszéki elnök, állami tulajdonú vállalat vezetője, stb."
                    : "A Politically Exposed Person (PEP) is someone who holds or has held a prominent public function within the past year. This includes: head of state, minister, member of parliament, constitutional court member, supreme court member, head of state audit office, manager of state-owned enterprise, etc."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* PEP kérdések */}
        <Card className="border-2 border-[color:var(--border)]">
          <CardContent className="space-y-8 p-6">
            {/* 1. Kiemelt közszereplő */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">
                {t
                  ? "1. Ön kiemelt közszereplő, vagy a megelőző egy éven belül az volt?"
                  : "1. Are you a PEP, or were you one within the past year?"}
              </Label>
              <RadioGroup
                value={data.isPep ? "yes" : "no"}
                onValueChange={(value) => onChange({ isPep: value === "yes" })}
                className="flex gap-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="pep-no" />
                  <Label htmlFor="pep-no" className="font-normal">
                    {t ? "Nem" : "No"}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="pep-yes" />
                  <Label htmlFor="pep-yes" className="font-normal">
                    {t ? "Igen" : "Yes"}
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* 2. PEP közeli hozzátartozója */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">
                {t
                  ? "2. Ön kiemelt közszereplő közeli hozzátartozója?"
                  : "2. Are you a close relative of a PEP?"}
              </Label>
              <p className="text-sm text-[color:var(--muted-foreground)]">
                {t
                  ? "(Házastárs, élettárs, gyermek, szülő, testvér, nagyszülő, unoka)"
                  : "(Spouse, partner, child, parent, sibling, grandparent, grandchild)"}
              </p>
              <RadioGroup
                value={data.isPepRelative ? "yes" : "no"}
                onValueChange={(value) =>
                  onChange({ isPepRelative: value === "yes" })
                }
                className="flex gap-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="pep-relative-no" />
                  <Label htmlFor="pep-relative-no" className="font-normal">
                    {t ? "Nem" : "No"}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="pep-relative-yes" />
                  <Label htmlFor="pep-relative-yes" className="font-normal">
                    {t ? "Igen" : "Yes"}
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* 3. PEP-pel közeli kapcsolatban álló */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">
                {t
                  ? "3. Ön kiemelt közszereplővel közeli kapcsolatban álló személy?"
                  : "3. Are you a close associate of a PEP?"}
              </Label>
              <p className="text-sm text-[color:var(--muted-foreground)]">
                {t
                  ? "(Közös tulajdonú cég, szoros üzleti kapcsolat, kedvezményezett)"
                  : "(Joint ownership, close business relationship, beneficiary)"}
              </p>
              <RadioGroup
                value={data.isPepAssociate ? "yes" : "no"}
                onValueChange={(value) =>
                  onChange({ isPepAssociate: value === "yes" })
                }
                className="flex gap-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="pep-associate-no" />
                  <Label htmlFor="pep-associate-no" className="font-normal">
                    {t ? "Nem" : "No"}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="pep-associate-yes" />
                  <Label htmlFor="pep-associate-yes" className="font-normal">
                    {t ? "Igen" : "Yes"}
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Részletek, ha bármelyik igen */}
            {hasPepStatus && (
              <div className="space-y-4">
                <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950">
                  <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    {t
                      ? "Kérjük, adja meg a közszereplői státusz részleteit az alábbi mezőben."
                      : "Please provide details about your PEP status in the field below."}
                  </p>
                </div>
                <Label htmlFor="pepDetails" className="text-base font-semibold">
                  {t ? "Közszereplői státusz részletei *" : "PEP Status Details *"}
                </Label>
                <Textarea
                  id="pepDetails"
                  value={data.pepDetails || ""}
                  onChange={(e) => onChange({ pepDetails: e.target.value })}
                  placeholder={
                    t
                      ? "Kérjük, írja le a betöltött pozíciót, időtartamot, és a közszereplővel való kapcsolat jellegét."
                      : "Please describe the position held, duration, and nature of the relationship with the PEP."
                  }
                  rows={4}
                  className="w-full"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Jogi hivatkozás */}
        <div className="rounded-lg border border-[color:var(--border)] bg-[color:var(--muted)]/50 p-4">
          <p className="text-xs text-[color:var(--muted-foreground)]">
            {t
              ? "Ez a nyilatkozat a pénzmosás és a terrorizmus finanszírozása megelőzéséről és megakadályozásáról szóló 2017. évi LIII. törvény 9. § (2) bekezdése alapján készült. A valótlan nyilatkozat büntetőjogi következményekkel járhat."
              : "This declaration is made pursuant to Section 9(2) of Act LIII of 2017 on the Prevention and Combating of Money Laundering and Terrorist Financing. False declarations may have criminal consequences."}
          </p>
        </div>
      </div>
    </div>
  );
}
