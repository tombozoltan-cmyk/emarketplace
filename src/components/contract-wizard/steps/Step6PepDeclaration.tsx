"use client";

import { AlertCircle, Shield } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import type { PepDeclarant } from "@/lib/docx-data";
import type { ContractLanguage, PepDeclaration } from "@/lib/contract-types";

/** Egy nyilatkozó a lépésben: kiről szól a három kérdés, és hol tart a válasza. */
export type PepDeclarantView = {
  /** Egyedi kulcs az elemek azonosítóihoz: "owner-1", "representative". */
  key: string;
  declarant: PepDeclarant;
  /** A nyilatkozó neve, ha már megadták. Üresen a kérdés "Ön"-re vált. */
  name: string;
  /** A szerepe emberi szóval: "1. tulajdonos", "vezető tisztségviselő". */
  role: string;
  /** Miért ő nyilatkozik - csak ott mutatjuk, ahol ez nem magától értetődő. */
  note?: string;
  data: PepDeclaration;
};

type Step6PepDeclarationProps = {
  declarants: PepDeclarantView[];
  onChange: (declarant: PepDeclarant, updates: Partial<PepDeclaration>) => void;
  language: ContractLanguage;
};

/** A három kérdés egy nyilatkozóra. A szöveg a megnevezett személyről szól; név nélkül "Ön"-re vált. */
function PepQuestions({
  view,
  onChange,
  t,
}: {
  view: PepDeclarantView;
  onChange: (updates: Partial<PepDeclaration>) => void;
  t: boolean;
}) {
  const { data, key, name } = view;
  const hasPepStatus = data.isPep || data.isPepRelative || data.isPepAssociate;
  const ertek = (valasz: boolean | undefined) => (valasz === undefined ? "" : valasz ? "yes" : "no");

  const kerdesek = name
    ? {
        pep: t
          ? `1. ${name} kiemelt közszereplő, vagy a megelőző egy éven belül az volt?`
          : `1. Is ${name} a PEP, or were they one within the past year?`,
        relative: t
          ? `2. ${name} kiemelt közszereplő közeli hozzátartozója?`
          : `2. Is ${name} a close relative of a PEP?`,
        associate: t
          ? `3. ${name} kiemelt közszereplővel közeli kapcsolatban álló személy?`
          : `3. Is ${name} a close associate of a PEP?`,
      }
    : {
        pep: t
          ? "1. Ön kiemelt közszereplő, vagy a megelőző egy éven belül az volt?"
          : "1. Are you a PEP, or were you one within the past year?",
        relative: t ? "2. Ön kiemelt közszereplő közeli hozzátartozója?" : "2. Are you a close relative of a PEP?",
        associate: t
          ? "3. Ön kiemelt közszereplővel közeli kapcsolatban álló személy?"
          : "3. Are you a close associate of a PEP?",
      };

  const sorok: {
    mezo: "isPep" | "isPepRelative" | "isPepAssociate";
    cim: string;
    alcim?: string;
    azonosito: string;
  }[] = [
    { mezo: "isPep", cim: kerdesek.pep, azonosito: `pep-${key}` },
    {
      mezo: "isPepRelative",
      cim: kerdesek.relative,
      alcim: t
        ? "(Házastárs, élettárs, gyermek, szülő, testvér, nagyszülő, unoka)"
        : "(Spouse, partner, child, parent, sibling, grandparent, grandchild)",
      azonosito: `pep-relative-${key}`,
    },
    {
      mezo: "isPepAssociate",
      cim: kerdesek.associate,
      alcim: t
        ? "(Közös tulajdonú cég, szoros üzleti kapcsolat, kedvezményezett)"
        : "(Joint ownership, close business relationship, beneficiary)",
      azonosito: `pep-associate-${key}`,
    },
  ];

  return (
    <CardContent className="space-y-8 p-6">
      {sorok.map((sor) => (
        <div key={sor.mezo} className="space-y-4">
          <Label className="text-base font-semibold">{sor.cim}</Label>
          {sor.alcim && <p className="text-sm text-[color:var(--muted-foreground)]">{sor.alcim}</p>}
          <RadioGroup
            value={ertek(data[sor.mezo])}
            onValueChange={(value) => onChange({ [sor.mezo]: value === "yes" })}
            className="flex gap-6"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id={`${sor.azonosito}-no`} />
              <Label htmlFor={`${sor.azonosito}-no`} className="font-normal">
                {t ? "Nem" : "No"}
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id={`${sor.azonosito}-yes`} />
              <Label htmlFor={`${sor.azonosito}-yes`} className="font-normal">
                {t ? "Igen" : "Yes"}
              </Label>
            </div>
          </RadioGroup>
        </div>
      ))}

      {/* Részletek, ha bármelyik igen */}
      {hasPepStatus && (
        <div className="space-y-4">
          <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
            <p className="text-sm text-amber-800 dark:text-amber-200">
              {t
                ? "Kérjük, adja meg a közszereplői státusz részleteit az alábbi mezőben."
                : "Please provide details about the PEP status in the field below."}
            </p>
          </div>
          <Label htmlFor={`pepDetails-${key}`} className="text-base font-semibold">
            {t ? "Közszereplői státusz részletei *" : "PEP Status Details *"}
          </Label>
          <Textarea
            id={`pepDetails-${key}`}
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
  );
}

export function Step6PepDeclaration({ declarants, onChange, language }: Step6PepDeclarationProps) {
  const t = language === "hu";
  const tobbNyilatkozo = declarants.length > 1;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="mb-2 text-2xl font-bold text-[color:var(--foreground)]">
          {t ? "Kiemelt közszereplői nyilatkozat" : "PEP Declaration"}
        </h2>
        <p className="text-[color:var(--muted-foreground)]">
          {t
            ? "A 2017. évi LIII. törvény (Pmt.) előírásai szerint nyilatkozni kell a kiemelt közszereplői státuszról."
            : "According to Hungarian AML law (Act LIII of 2017), the PEP status must be declared."}
        </p>
        {tobbNyilatkozo && (
          <p className="mt-2 text-[color:var(--muted-foreground)]">
            {t
              ? "A nyilatkozatot minden tényleges tulajdonosra külön kell megtenni, mert a státusz személyenként más lehet."
              : "The declaration must be made separately for each beneficial owner: the status may differ from person to person."}
          </p>
        )}
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

        {/* Nyilatkozónként a három kérdés */}
        {declarants.map((view) => (
          <Card key={view.key} className="border-2 border-[color:var(--border)]">
            {(tobbNyilatkozo || view.note) && (
              <div className="border-b border-[color:var(--border)] bg-[color:var(--muted)]/40 px-6 py-4">
                <h3 className="text-lg font-semibold text-[color:var(--foreground)]">
                  {view.name ? `${view.role} - ${view.name}` : view.role}
                </h3>
                {view.note && <p className="mt-1 text-sm text-[color:var(--muted-foreground)]">{view.note}</p>}
              </div>
            )}
            <PepQuestions view={view} onChange={(updates) => onChange(view.declarant, updates)} t={t} />
          </Card>
        ))}

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
