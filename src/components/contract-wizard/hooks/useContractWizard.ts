"use client";

import { useState, useCallback, useMemo } from "react";
import type {
  ContractData,
  ContractLanguage,
  WizardStep,
  ServiceType,
  OwnerData,
} from "@/lib/contract-types";
import { WIZARD_STEPS } from "@/lib/contract-types";

// Alapértelmezett szerződés adatok
const getDefaultOwner = (): OwnerData => ({
  type: "natural",
  ownershipPercent: 100,
  natural: {
    fullName: "",
    birthName: "",
    nationality: "magyar",
    birthPlace: "",
    birthDate: "",
    motherName: "",
    address: "",
    idType: "personal_id",
    idNumber: "",
  },
});

const getDefaultContractData = (language: ContractLanguage): ContractData => ({
  status: "draft",
  language,
  serviceType: "szekhely-hu",
  packageId: "",
  monthlyPrice: 0,
  annualPrice: 0,
  company: {
    isNew: true,
    name: "",
    shortName: "",
    legalForm: "kft",
    registrationNumber: "",
    taxNumber: "",
    currentAddress: "",
    mainActivity: "",
    mainActivityCode: "",
  },
  owners: [getDefaultOwner()],
  representative: {
    fullName: "",
    birthName: "",
    nationality: "magyar",
    birthPlace: "",
    birthDate: "",
    motherName: "",
    address: "",
    idType: "personal_id",
    idNumber: "",
    isForeign: false,
    position: "ügyvezető",
  },
  contact: {
    isSameAsOwner: true,
    fullName: "",
    email: "",
    emailConfirm: "",
    phone: "",
    address: "",
  },
  pepDeclaration: {
    isPep: false,
    isPepRelative: false,
    isPepAssociate: false,
    pepDetails: "",
  },
  uploadedDocuments: {},
  generatedDocuments: {},
});

// Lépés validációk
type StepValidation = {
  isValid: boolean;
  errors: string[];
};

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateStep = (
  step: WizardStep,
  data: ContractData,
  language: ContractLanguage
): StepValidation => {
  const errors: string[] = [];
  const t = language === "hu";

  switch (step) {
    case "company-type":
      // Nincs validáció - csak választás
      break;

    case "service-select":
      if (!data.packageId) {
        errors.push(t ? "Válasszon szolgáltatási csomagot" : "Please select a service package");
      }
      break;

    case "company-data":
      if (!data.company.name.trim()) {
        errors.push(t ? "Cégnév megadása kötelező" : "Company name is required");
      }
      if (!data.company.shortName.trim()) {
        errors.push(t ? "Rövidített név megadása kötelező" : "Short name is required");
      }
      if (!data.company.mainActivity.trim()) {
        errors.push(t ? "Főtevékenység megadása kötelező" : "Main activity is required");
      }
      if (!data.company.isNew) {
        if (!data.company.registrationNumber?.trim()) {
          errors.push(t ? "Cégjegyzékszám megadása kötelező meglévő cégnél" : "Registration number is required for existing companies");
        }
      }
      break;

    case "owner-contact":
      // Tulajdonosok validációja
      if (data.owners.length === 0) {
        errors.push(t ? "Legalább egy tulajdonos megadása kötelező" : "At least one owner is required");
      }
      
      // Tulajdonosi arány összesen 100% kell legyen
      const totalPercent = data.owners.reduce((sum, o) => sum + (o.ownershipPercent || 0), 0);
      if (totalPercent !== 100) {
        errors.push(t ? `A tulajdonosi arányok összege ${totalPercent}%, de pontosan 100% kell legyen` : `Total ownership is ${totalPercent}%, but must be exactly 100%`);
      }
      
      // Minden tulajdonos adatainak validációja
      data.owners.forEach((owner, idx) => {
        const ownerNum = data.owners.length > 1 ? ` (#${idx + 1})` : "";
        if (owner.type === "natural" && owner.natural) {
          if (!owner.natural.fullName.trim()) {
            errors.push(t ? `Tulajdonos${ownerNum} neve kötelező` : `Owner${ownerNum} name is required`);
          }
          if (!owner.natural.birthDate) {
            errors.push(t ? `Tulajdonos${ownerNum} születési dátuma kötelező` : `Owner${ownerNum} birth date is required`);
          }
          if (!owner.natural.address.trim()) {
            errors.push(t ? `Tulajdonos${ownerNum} lakcíme kötelező` : `Owner${ownerNum} address is required`);
          }
          if (!owner.natural.idNumber.trim()) {
            errors.push(t ? `Tulajdonos${ownerNum} okmányszáma kötelező` : `Owner${ownerNum} ID number is required`);
          }
        }

        if (owner.type === "legal" && owner.legal) {
          if (!owner.legal.companyName.trim()) {
            errors.push(t ? `Tulajdonos${ownerNum} cégnév megadása kötelező` : `Owner${ownerNum} company name is required`);
          }
          if (!owner.legal.registrationNumber.trim()) {
            errors.push(t ? `Tulajdonos${ownerNum} cégjegyzékszám megadása kötelező` : `Owner${ownerNum} registration number is required`);
          }
          if (!owner.legal.address.trim()) {
            errors.push(t ? `Tulajdonos${ownerNum} székhely megadása kötelező` : `Owner${ownerNum} registered address is required`);
          }
          if (!owner.legal.representativeName.trim()) {
            errors.push(t ? `Tulajdonos${ownerNum} képviselő nevének megadása kötelező` : `Owner${ownerNum} representative name is required`);
          }
        }
      });
      if (!data.contact.email.trim()) {
        errors.push(t ? "Email cím kötelező" : "Email is required");
      } else if (!validateEmail(data.contact.email)) {
        errors.push(t ? "Érvénytelen email cím formátum" : "Invalid email format");
      } else if (data.contact.email !== data.contact.emailConfirm) {
        errors.push(t ? "Az email címek nem egyeznek" : "Email addresses do not match");
      }
      if (!data.contact.phone.trim()) {
        errors.push(t ? "Telefonszám kötelező" : "Phone number is required");
      }
      if (!data.contact.isSameAsOwner && !data.contact.address?.trim()) {
        errors.push(t ? "Kapcsolattartó címe kötelező" : "Contact address is required");
      }
      break;

    case "representative":
      if (!data.representative.fullName.trim()) {
        errors.push(t ? "Képviselő neve kötelező" : "Representative name is required");
      }
      if (!data.representative.birthDate) {
        errors.push(t ? "Születési dátum kötelező" : "Birth date is required");
      }
      if (!data.representative.address.trim()) {
        errors.push(t ? "Lakcím kötelező" : "Address is required");
      }
      if (!data.representative.idNumber.trim()) {
        errors.push(t ? "Azonosító okmány száma kötelező" : "ID number is required");
      }
      break;

    case "pep-declaration":
      // PEP részletek kötelezőek, ha igen-t jelölt
      if (
        (data.pepDeclaration.isPep ||
          data.pepDeclaration.isPepRelative ||
          data.pepDeclaration.isPepAssociate) &&
        !data.pepDeclaration.pepDetails?.trim()
      ) {
        errors.push(
          t
            ? "Kérjük, adja meg a közszereplői státusz részleteit"
            : "Please provide PEP status details"
        );
      }
      break;

    case "summary":
      // Összegzésnél nincs extra validáció
      break;
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export type UseContractWizardReturn = {
  // Jelenlegi állapot
  currentStep: WizardStep;
  currentStepIndex: number;
  data: ContractData;
  language: ContractLanguage;

  // Navigáció
  goToStep: (step: WizardStep) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
  isFirstStep: boolean;
  isLastStep: boolean;

  // Adatok frissítése
  updateData: (updates: Partial<ContractData>) => void;
  updateCompany: (updates: Partial<ContractData["company"]>) => void;
  updateOwner: (index: number, updates: Partial<OwnerData>) => void;
  addOwner: () => void;
  removeOwner: (index: number) => void;
  setOwnerCount: (count: number) => void;
  updateRepresentative: (updates: Partial<ContractData["representative"]>) => void;
  updateContact: (updates: Partial<ContractData["contact"]>) => void;
  updatePepDeclaration: (updates: Partial<ContractData["pepDeclaration"]>) => void;
  updateDocuments: (updates: Partial<ContractData["uploadedDocuments"]>) => void;
  setServiceType: (serviceType: ServiceType, packageId: string, monthlyPrice: number, annualPrice: number) => void;

  // Validáció
  validateCurrentStep: () => StepValidation;
  getStepValidation: (step: WizardStep) => StepValidation;
  isStepComplete: (step: WizardStep) => boolean;

  // Beküldés
  isSubmitting: boolean;
  submitError: string | null;
  submit: () => Promise<string | null>;

  // Reset
  reset: () => void;
};

export function useContractWizard(
  initialLanguage: ContractLanguage = "hu"
): UseContractWizardReturn {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [data, setData] = useState<ContractData>(() =>
    getDefaultContractData(initialLanguage)
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const currentStep = WIZARD_STEPS[currentStepIndex];
  const language = data.language;

  // Navigáció
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === WIZARD_STEPS.length - 1;

  const scrollToTop = useCallback(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  const goToStep = useCallback((step: WizardStep) => {
    const index = WIZARD_STEPS.indexOf(step);
    if (index !== -1) {
      setCurrentStepIndex(index);
      scrollToTop();
    }
  }, [scrollToTop]);

  const goToNextStep = useCallback(() => {
    if (currentStepIndex < WIZARD_STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
      scrollToTop();
    }
  }, [currentStepIndex, scrollToTop]);

  const goToPreviousStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
      scrollToTop();
    }
  }, [currentStepIndex, scrollToTop]);

  // Validáció
  const validateCurrentStep = useCallback(() => {
    return validateStep(currentStep, data, language);
  }, [currentStep, data, language]);

  const getStepValidation = useCallback(
    (step: WizardStep) => {
      return validateStep(step, data, language);
    },
    [data, language]
  );

  const isStepComplete = useCallback(
    (step: WizardStep) => {
      return validateStep(step, data, language).isValid;
    },
    [data, language]
  );

  const canGoNext = useMemo(() => {
    return validateCurrentStep().isValid && !isLastStep;
  }, [validateCurrentStep, isLastStep]);

  const canGoPrevious = !isFirstStep;

  // Adatok frissítése
  const updateData = useCallback((updates: Partial<ContractData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  }, []);

  const updateCompany = useCallback(
    (updates: Partial<ContractData["company"]>) => {
      setData((prev) => ({
        ...prev,
        company: { ...prev.company, ...updates },
      }));
    },
    []
  );

  const updateOwner = useCallback(
    (index: number, updates: Partial<OwnerData>) => {
      setData((prev) => {
        const newOwners = [...prev.owners];
        if (newOwners[index]) {
          newOwners[index] = { ...newOwners[index], ...updates };
        }
        return { ...prev, owners: newOwners };
      });
    },
    []
  );

  const addOwner = useCallback(() => {
    setData((prev) => ({
      ...prev,
      owners: [...prev.owners, getDefaultOwner()],
    }));
  }, []);

  const removeOwner = useCallback((index: number) => {
    setData((prev) => {
      if (prev.owners.length <= 1) return prev;
      const newOwners = prev.owners.filter((_, i) => i !== index);
      return { ...prev, owners: newOwners };
    });
  }, []);

  const setOwnerCount = useCallback((count: number) => {
    setData((prev) => {
      const currentCount = prev.owners.length;
      if (count === currentCount) return prev;
      
      let newOwners: OwnerData[];
      if (count > currentCount) {
        // Add new owners
        newOwners = [...prev.owners];
        for (let i = currentCount; i < count; i++) {
          newOwners.push(getDefaultOwner());
        }
      } else {
        // Remove owners
        newOwners = prev.owners.slice(0, count);
      }
      return { ...prev, owners: newOwners };
    });
  }, []);

  const updateRepresentative = useCallback(
    (updates: Partial<ContractData["representative"]>) => {
      setData((prev) => ({
        ...prev,
        representative: { ...prev.representative, ...updates },
      }));
    },
    []
  );

  const updateContact = useCallback(
    (updates: Partial<ContractData["contact"]>) => {
      setData((prev) => ({
        ...prev,
        contact: { ...prev.contact, ...updates },
      }));
    },
    []
  );

  const updatePepDeclaration = useCallback(
    (updates: Partial<ContractData["pepDeclaration"]>) => {
      setData((prev) => ({
        ...prev,
        pepDeclaration: { ...prev.pepDeclaration, ...updates },
      }));
    },
    []
  );

  const updateDocuments = useCallback(
    (updates: Partial<ContractData["uploadedDocuments"]>) => {
      setData((prev) => ({
        ...prev,
        uploadedDocuments: { ...prev.uploadedDocuments, ...updates },
      }));
    },
    []
  );

  const setServiceType = useCallback(
    (
      serviceType: ServiceType,
      packageId: string,
      monthlyPrice: number,
      annualPrice: number
    ) => {
      setData((prev) => ({
        ...prev,
        serviceType,
        packageId,
        monthlyPrice,
        annualPrice,
      }));
    },
    []
  );

  // Beküldés
  const submit = useCallback(async (): Promise<string | null> => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Validáljuk az összes lépést
      for (const step of WIZARD_STEPS) {
        const validation = validateStep(step, data, language);
        if (!validation.isValid) {
          throw new Error(validation.errors[0]);
        }
      }

      // Firestore-ba mentés
      const { addDoc, collection, serverTimestamp } = await import("firebase/firestore");
      const { firestoreDb } = await import("@/lib/firebase");

      const contractData = {
        ...data,
        status: "pending_review",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(firestoreDb, "contracts"), contractData);

      return docRef.id;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Ismeretlen hiba történt";
      setSubmitError(message);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, [data, language]);

  // Reset
  const reset = useCallback(() => {
    setData(getDefaultContractData(language));
    setCurrentStepIndex(0);
    setSubmitError(null);
  }, [language]);

  return {
    currentStep,
    currentStepIndex,
    data,
    language,
    goToStep,
    goToNextStep,
    goToPreviousStep,
    canGoNext,
    canGoPrevious,
    isFirstStep,
    isLastStep,
    updateData,
    updateCompany,
    updateOwner,
    addOwner,
    removeOwner,
    setOwnerCount,
    updateRepresentative,
    updateContact,
    updatePepDeclaration,
    updateDocuments,
    setServiceType,
    validateCurrentStep,
    getStepValidation,
    isStepComplete,
    isSubmitting,
    submitError,
    submit,
    reset,
  };
}
