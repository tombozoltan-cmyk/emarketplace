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
import { Step7Documents } from "./steps/Step7Documents";
import { Step7Summary } from "./steps/Step7Summary";
import type { ContractLanguage, WizardStep } from "@/lib/contract-types";

type ContractWizardProps = {
  language?: ContractLanguage;
};

export function ContractWizard({ language = "hu" }: ContractWizardProps) {
  const wizard = useContractWizard(language);
  const t = wizard.language === "hu";
  const [attemptedNext, setAttemptedNext] = useState(false);

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
            data={wizard.data.pepDeclaration}
            onChange={wizard.updatePepDeclaration}
            language={wizard.language}
          />
        );

      case "documents":
        return (
          <Step7Documents
            data={wizard.data.uploadedDocuments}
            companyName={wizard.data.company.name}
            ownerName={wizard.data.owners[0]?.natural?.fullName || ""}
            onChange={wizard.updateDocuments}
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
