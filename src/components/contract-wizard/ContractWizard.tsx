"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StepProgress } from "./StepProgress";
import { useContractWizard } from "./hooks/useContractWizard";
import { Step1CompanyType } from "./steps/Step1CompanyType";
import { Step2ServiceSelect } from "./steps/Step2ServiceSelect";
import { Step3CompanyData } from "./steps/Step3CompanyData";
import { Step4OwnerContact } from "./steps/Step4OwnerContact";
import { Step5Representative } from "./steps/Step5Representative";
import { Step6PepDeclaration } from "./steps/Step6PepDeclaration";
import type { PepDeclarantView } from "./steps/Step6PepDeclaration";
import { Step7Documents } from "./steps/Step7Documents";
import { Step7Summary } from "./steps/Step7Summary";
import type { ContractLanguage, OwnerChainNode, WizardStep } from "@/lib/contract-types";
import { pepDeclarantsOf } from "@/lib/docx-data";

type ContractWizardProps = {
  language?: ContractLanguage;
};

export function ContractWizard({ language = "hu" }: ContractWizardProps) {
  const wizard = useContractWizard(language);
  const t = wizard.language === "hu";
  const [attemptedNext, setAttemptedNext] = useState(false);

  // Kiről kell PEP-nyilatkozat: a tényleges tulajdonosokról, vagy - ha egyetlen tag sem éri el
  // a 25%-ot - a vezető tisztségviselőről. A szabály a pepDeclarantsOf-ban van, egy helyen.
  const pepDeclarantViews: PepDeclarantView[] = pepDeclarantsOf(wizard.data).map((declarant) => {
    if (declarant.kind === "representative") {
      return {
        key: "representative",
        declarant,
        name: (wizard.data.representative?.fullName || "").trim(),
        role: t ? "Vezető tisztségviselő" : "Managing director",
        // A két ok nem ugyanaz, és nem is szabad összemosni: a jogi személyes esetben az
        // ügyvezető NEM a tényleges tulajdonos, csak a legjobb elérhető közelítés.
        note:
          declarant.reason === "jogi-szemely-tag"
            ? t
              ? "A tulajdonos egy cég. A törvény szerint azt kell tudnunk, melyik ember áll a cég mögött — ezt az ügyintézés során tisztázzuk Önnel. Addig az ügyvezetőről kérjük a nyilatkozatot."
              : "The owner is a company. The law requires us to know which person is behind it — we will clarify this with you during the process. Until then we ask for the declaration about the managing director."
            : t
              ? "Egyik tulajdonos sem éri el a 25%-ot. Ilyenkor a törvény szerint az ügyvezetőről kell nyilatkozni."
              : "No owner reaches 25%. In that case the law requires the declaration to be made about the managing director.",
        data: wizard.data.representativePep ?? {},
      };
    }
    if (declarant.kind === "chain") {
      // A láncon át azonosított ember. A cégnév kedvéért megkeressük, melyik tag alatt áll.
      const alatta = wizard.data.owners[declarant.ownerNumber - 1]?.legal?.companyName || "";
      const csomopont = declarant.indexPath.reduce<OwnerChainNode | undefined>(
        (elem, i) => (elem ? elem.owners?.[i] : wizard.data.owners[declarant.ownerNumber - 1]?.legal?.owners?.[i]),
        undefined,
      );
      return {
        key: `chain-${declarant.ownerNumber}-${declarant.indexPath.join("-")}`,
        declarant,
        name: declarant.name,
        role: t
          ? alatta
            ? `A(z) ${alatta} tulajdonosa`
            : "A cég mögött álló tulajdonos"
          : alatta
            ? `Owner of ${alatta}`
            : "Owner behind the company",
        note: t
          ? "Őt Ön adta meg a cég tulajdonosaként. A törvény szerint róla is nyilatkozni kell, mert végső soron övé a cég legalább negyede."
          : "You named this person as an owner of the company. The law requires a declaration about them too, as they ultimately hold at least a quarter of the company.",
        data: csomopont?.pep ?? {},
      };
    }
    const owner = wizard.data.owners[declarant.ownerNumber - 1];
    return {
      key: `owner-${declarant.ownerNumber}`,
      declarant,
      name: (owner?.natural?.fullName || "").trim(),
      role: t ? `${declarant.ownerNumber}. tulajdonos` : `Owner ${declarant.ownerNumber}`,
      data: owner?.pep ?? {},
    };
  });

  const handleEditStep = (stepId: string) => {
    wizard.goToStep(stepId as WizardStep);
    setAttemptedNext(false);
  };

  const handleNext = () => {
    const validation = wizard.validateCurrentStep();
    if (validation.isValid) {
      wizard.goToNextStep();
      setAttemptedNext(false);
    } else {
      setAttemptedNext(true);
    }
  };

  const handlePrevious = () => {
    wizard.goToPreviousStep();
    setAttemptedNext(false);
  };

  const renderStep = () => {
    switch (wizard.currentStep) {
      case "company-type":
        return (
          <Step1CompanyType
            isNew={wizard.data.company.isNew}
            onSelect={(isNew) => wizard.updateCompany({ isNew })}
            language={wizard.language}
          />
        );

      case "service-select":
        return (
          <Step2ServiceSelect
            selectedPackageId={wizard.data.packageId}
            onSelect={wizard.setServiceType}
            language={wizard.language}
            isNewCompany={wizard.data.company.isNew}
          />
        );

      case "company-data":
        return (
          <Step3CompanyData
            data={wizard.data.company}
            onChange={wizard.updateCompany}
            language={wizard.language}
          />
        );

      case "owner-contact":
        return (
          <Step4OwnerContact
            owners={wizard.data.owners}
            contact={wizard.data.contact}
            onOwnerChange={wizard.updateOwner}
            onContactChange={wizard.updateContact}
            onAddOwner={wizard.addOwner}
            onRemoveOwner={wizard.removeOwner}
            onSetOwnerCount={wizard.setOwnerCount}
            language={wizard.language}
          />
        );

      case "representative":
        return (
          <Step5Representative
            data={wizard.data.representative}
            ownerData={wizard.data.owners[0]}
            onChange={wizard.updateRepresentative}
            language={wizard.language}
          />
        );

      case "pep-declaration":
        return (
          <Step6PepDeclaration
            declarants={pepDeclarantViews}
            onChange={wizard.updatePepDeclaration}
            decisiveInfluence={wizard.data.decisiveInfluence ?? {}}
            onDecisiveInfluenceChange={wizard.updateDecisiveInfluence}
            language={wizard.language}
          />
        );

      case "documents":
        return (
          <Step7Documents
            data={wizard.data.uploadedDocuments}
            companyName={wizard.data.company.name}
            ownerName={wizard.data.owners[0]?.natural?.fullName || ""}
            idType={wizard.data.representative.idType}
            onChange={wizard.updateDocuments}
            onPathsChange={wizard.updateDocumentPaths}
            language={wizard.language}
          />
        );

      case "summary":
        return (
          <Step7Summary
            data={wizard.data}
            language={wizard.language}
            isSubmitting={wizard.isSubmitting}
            submitError={wizard.submitError}
            onSubmit={wizard.submit}
            onEditStep={handleEditStep}
          />
        );

      default:
        return null;
    }
  };

  const validation = wizard.validateCurrentStep();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Fejléc */}
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-bold text-[color:var(--foreground)] md:text-4xl">
          {t ? "Szerződéskötés indítása" : "Start Contract Process"}
        </h1>
        <p className="text-[color:var(--muted-foreground)]">
          {t
            ? "Töltse ki az alábbi űrlapot a székhelyszolgáltatás szerződéskötéséhez."
            : "Fill out the form below to start the registered office service contract."}
        </p>
      </div>

      {/* Lépésjelző */}
      <div className="mb-8">
        <StepProgress
          currentStep={wizard.currentStep}
          isStepComplete={wizard.isStepComplete}
          onStepClick={(step) => {
            const stepIndex =
              ["company-type", "service-select", "company-data", "owner-contact", "representative", "pep-declaration", "documents", "summary"].indexOf(step);
            const currentIndex = wizard.currentStepIndex;
            if (stepIndex <= currentIndex) {
              wizard.goToStep(step);
            }
          }}
          language={wizard.language}
        />
      </div>

      {/* Lépés tartalma */}
      <Card className="mb-8 border-2 border-[color:var(--border)] shadow-lg">
        <CardContent className="p-6 md:p-8">{renderStep()}</CardContent>
      </Card>

      {/* Validációs hibák - csak ha már megpróbált továbblépni */}
      {attemptedNext && validation.errors.length > 0 && wizard.currentStep !== "summary" && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
          <ul className="list-inside list-disc space-y-1">
            {validation.errors.map((error, idx) => (
              <li key={idx} className="text-sm text-red-700 dark:text-red-300">
                {error}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Navigációs gombok */}
      {wizard.currentStep !== "summary" && (
        <div className="flex items-center justify-between">
          {/* Vissza gomb */}
          <Button
            type="button"
            variant="outline"
            onClick={handlePrevious}
            disabled={wizard.isFirstStep}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {t ? "Vissza" : "Back"}
          </Button>

          {/* Tovább gomb */}
          <Button
            type="button"
            onClick={handleNext}
            className="gap-2 bg-[color:var(--primary)] text-[color:var(--primary-foreground)] hover:bg-[color:var(--primary)]/90"
          >
            {t ? "Tovább" : "Next"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Visszalépés az összegzésnél */}
      {wizard.currentStep === "summary" && (
        <div className="flex justify-start">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrevious}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {t ? "Vissza a szerkesztéshez" : "Back to edit"}
          </Button>
        </div>
      )}
    </div>
  );
}
