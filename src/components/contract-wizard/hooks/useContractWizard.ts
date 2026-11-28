"use client";

import { useState, useCallback, useMemo } from "react";
import type {
  ContractData,
  ContractDocumentPaths,
  ContractLanguage,
  WizardStep,
  ServiceType,
  OwnerData,
  OwnerChainNode,
  PepDeclaration,
} from "@/lib/contract-types";
import { WIZARD_STEPS } from "@/lib/contract-types";
import { validIdType, withoutIdImages } from "@/lib/id-documents";
import { pepDeclarantsOf, pepMissingDeclarants, pepDeclarantLabel } from "@/lib/docx-data";
import type { PepDeclarant } from "@/lib/docx-data";
import { dropUndefined, resolveContact } from "@/lib/contract-submission";
import type { ServiceSelection } from "@/lib/service-types";
import { legalPdfUrl, currentLegalVersion, legalVersionRef, LEGAL_DOCUMENTS } from "@/lib/legal/registry";

/** Az összegző lépés két jelölőnégyzete. A beküldés csak akkor fut le, ha mindkettő be van jelölve. */
export type ConsentInput = { terms: boolean; privacy: boolean };

/**
 * Melyik jogi szöveget fogadta el az ügyfél. A `legalVersionRef` és a verzióhoz
 * tartozó, soha nem felülírt PDF épp ezért készült (lásd `src/lib/legal/registry.ts`):
 * e nélkül a beküldés nem mondja meg, MIT fogadtak el, csak azt, hogy valamit.
 */
function acceptedLegalVersions(language: ContractLanguage) {
  const terms = currentLegalVersion("terms");
  const privacy = currentLegalVersion("privacy");
  return dropUndefined({
    termsVersion: legalVersionRef("terms"),
    privacyVersion: legalVersionRef("privacy"),
    termsPath: LEGAL_DOCUMENTS.terms.path[language],
    privacyPath: LEGAL_DOCUMENTS.privacy.path[language],
    termsPdf: legalPdfUrl(terms, language) ?? undefined,
    privacyPdf: legalPdfUrl(privacy, language) ?? undefined,
    language,
  });
}

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
      
      // Minden tulajdonos adatainak validációja.
      // The sub-object is not required to exist: switching an owner to a company only sets `type`, so `owner.legal` is missing until the
      // applicant types into it. Guarding the checks with `&& owner.legal` skipped all of them, and an owner with no company data at all
      // passed the step and was stored that way.
      data.owners.forEach((owner, idx) => {
        const ownerNum = data.owners.length > 1 ? ` (#${idx + 1})` : "";
        if (owner.type === "legal") {
          const legal = owner.legal;
          if (!legal?.companyName.trim()) {
            errors.push(t ? `Tulajdonos${ownerNum} cégnév megadása kötelező` : `Owner${ownerNum} company name is required`);
          }
          if (!legal?.registrationNumber.trim()) {
            errors.push(t ? `Tulajdonos${ownerNum} cégjegyzékszám megadása kötelező` : `Owner${ownerNum} registration number is required`);
          }
          if (!legal?.address.trim()) {
            errors.push(t ? `Tulajdonos${ownerNum} székhely megadása kötelező` : `Owner${ownerNum} registered address is required`);
          }
          if (!legal?.representativeName.trim()) {
            errors.push(t ? `Tulajdonos${ownerNum} képviselő nevének megadása kötelező` : `Owner${ownerNum} representative name is required`);
          }
        } else {
          const natural = owner.natural;
          if (!natural?.fullName.trim()) {
            errors.push(t ? `Tulajdonos${ownerNum} neve kötelező` : `Owner${ownerNum} name is required`);
          }
          if (!natural?.birthDate) {
            errors.push(t ? `Tulajdonos${ownerNum} születési dátuma kötelező` : `Owner${ownerNum} birth date is required`);
          }
          if (!natural?.address.trim()) {
            errors.push(t ? `Tulajdonos${ownerNum} lakcíme kötelező` : `Owner${ownerNum} address is required`);
          }
          if (!natural?.idNumber.trim()) {
            errors.push(t ? `Tulajdonos${ownerNum} okmányszáma kötelező` : `Owner${ownerNum} ID number is required`);
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
      // Mindhárom kérdésre válaszolni kell. Alapértelmezés nincs: a Pmt. szerinti
      // nyilatkozatot az ügyfélnek kell megtennie, nem az űrlapnak helyette.
      // A 25% alatti meghatározó befolyás: kötelező igen/nem, alapértelmezés nélkül.
      // Jogi átnézés 2026-11-28, 5. pont: "a jelzés nem elég".
      if (typeof data.decisiveInfluence?.exists !== "boolean") {
        errors.push(
          t
            ? "Kérjük, válaszoljon a meghatározó befolyásra vonatkozó kérdésre - ez kötelező nyilatkozat"
            : "Please answer the question about decisive influence - this is a mandatory declaration"
        );
      } else if (data.decisiveInfluence.exists && !data.decisiveInfluence.details?.trim()) {
        errors.push(
          t
            ? "Kérjük, nevezze meg, ki gyakorol meghatározó befolyást, és milyen módon"
            : "Please name who exercises decisive influence, and how"
        );
      }
      for (const declarant of pepMissingDeclarants(data)) {
        const kinel = pepDeclarantLabel(declarant);
        errors.push(
          t
            ? `Kérjük, válaszoljon mind a három kérdésre ${kinel} - ez kötelező nyilatkozat`
            : "Please answer all three questions for every beneficial owner - this is a mandatory declaration"
        );
      }
      // PEP részletek kötelezőek annál, aki igen-t jelölt
      for (const declarant of pepDeclarantsOf(data)) {
        const nyilatkozat =
          declarant.kind === "owner" ? data.owners[declarant.ownerNumber - 1]?.pep : data.representativePep;
        const erintett = nyilatkozat?.isPep || nyilatkozat?.isPepRelative || nyilatkozat?.isPepAssociate;
        if (erintett && !nyilatkozat?.pepDetails?.trim()) {
          const kinel = pepDeclarantLabel(declarant);
          errors.push(
            t
              ? `Kérjük, adja meg a közszereplői státusz részleteit ${kinel}`
              : "Please provide PEP status details"
          );
        }
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
  updatePepDeclaration: (declarant: PepDeclarant, updates: Partial<PepDeclaration>) => void;
  updateDecisiveInfluence: (updates: Partial<NonNullable<ContractData["decisiveInfluence"]>>) => void;
  updateDocuments: (updates: Partial<ContractData["uploadedDocuments"]>) => void;
  updateDocumentPaths: (updates: Partial<ContractDocumentPaths>) => void;
  setServiceType: (selection: ServiceSelection) => void;

  // Validáció
  validateCurrentStep: () => StepValidation;
  getStepValidation: (step: WizardStep) => StepValidation;
  isStepComplete: (step: WizardStep) => boolean;

  // Beküldés
  isSubmitting: boolean;
  submitError: string | null;
  submit: (consent: ConsentInput) => Promise<string | null>;

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
      setData((prev) => {
        const merged = { ...prev.representative, ...updates };
        // a nationality that does not allow the chosen document type (a foreign citizen with a driving licence) takes the default of the nationality
        merged.idType = validIdType(merged.nationality, merged.idType);
        // a changed document type asks for other images: the images of the old choice are removed from the application
        const typeChanged = merged.idType !== prev.representative.idType;
        return {
          ...prev,
          representative: merged,
          ...(typeChanged
            ? {
                uploadedDocuments: withoutIdImages(prev.uploadedDocuments),
                uploadedDocumentPaths: withoutIdImages(prev.uploadedDocumentPaths ?? {}),
              }
            : {}),
        };
      });
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

  // A nyilatkozat oda kerül, akiről szól: a tulajdonoshoz vagy a vezető tisztségviselőhöz.
  // A beadvány-szintű `pepDeclaration` örökség, új beadvány nem tölti.
  const updateDecisiveInfluence = useCallback(
    (updates: Partial<NonNullable<ContractData["decisiveInfluence"]>>) => {
      setData((prev) => ({ ...prev, decisiveInfluence: { ...prev.decisiveInfluence, ...updates } }));
    },
    []
  );

  const updatePepDeclaration = useCallback(
    (declarant: PepDeclarant, updates: Partial<PepDeclaration>) => {
      setData((prev) => {
        if (declarant.kind === "representative") {
          return { ...prev, representativePep: { ...prev.representativePep, ...updates } };
        }
        const owners = [...prev.owners];
        const index = declarant.ownerNumber - 1;
        if (!owners[index]) return prev;

        if (declarant.kind === "owner") {
          owners[index] = { ...owners[index], pep: { ...owners[index].pep, ...updates } };
          return { ...prev, owners };
        }

        // Lánc: az indexek mentén másoljuk le az utat a módosított elemig. Másolat kell minden
        // szinten, különben a React nem venné észre a változást a beágyazott tömbökben.
        const irLancba = (lista: OwnerChainNode[] | undefined, ut: number[]): OwnerChainNode[] | undefined => {
          if (!lista || ut.length === 0) return lista;
          const [elso, ...tovabb] = ut;
          const elem = lista[elso];
          if (!elem) return lista;
          const uj = [...lista];
          uj[elso] =
            tovabb.length === 0
              ? { ...elem, pep: { ...elem.pep, ...updates } }
              : { ...elem, owners: irLancba(elem.owners, tovabb) };
          return uj;
        };
        const legal = owners[index].legal;
        if (!legal) return prev;
        owners[index] = { ...owners[index], legal: { ...legal, owners: irLancba(legal.owners, declarant.indexPath) } };
        return { ...prev, owners };
      });
    },
    []
  );

  // an update whose value is `undefined` (the remove button of the upload step) REMOVES the key instead of storing `undefined`: Firestore
  // refuses a document that has such a field, and the whole submission failed with the SDK's own message
  const mergeDropping = <T extends object>(previous: T, updates: Partial<T>): T => {
    const merged = { ...previous } as Record<string, unknown>;
    for (const [key, value] of Object.entries(updates as Record<string, unknown>)) {
      if (value === undefined) delete merged[key];
      else merged[key] = value;
    }
    return merged as T;
  };

  const updateDocuments = useCallback(
    (updates: Partial<ContractData["uploadedDocuments"]>) => {
      setData((prev) => ({
        ...prev,
        uploadedDocuments: mergeDropping(prev.uploadedDocuments, updates),
      }));
    },
    []
  );

  const updateDocumentPaths = useCallback(
    (updates: Partial<ContractDocumentPaths>) => {
      setData((prev) => ({
        ...prev,
        uploadedDocumentPaths: mergeDropping(prev.uploadedDocumentPaths ?? {}, updates),
      }));
    },
    []
  );

  // egy objektum, nem négy sorrendfüggő érték: a két új mezővel hat lett volna belőlük,
  // és egy felcserélt pár csendben rossz árat vagy rossz megnevezést írt volna a beadványba
  const setServiceType = useCallback((selection: ServiceSelection) => {
    setData((prev) => {
      const next = {
        ...prev,
        serviceType: selection.serviceType as ServiceType,
        packageId: selection.packageId,
        monthlyPrice: selection.monthlyPrice,
        annualPrice: selection.annualPrice,
      } as ContractData;
      // üres kártyaszövegnél a kulcs kimarad, nem marad ott egy korábbi kártya szövege sem
      if (selection.packageLabel) next.packageLabel = selection.packageLabel;
      else delete next.packageLabel;
      if (selection.priceText) next.priceText = selection.priceText;
      else delete next.priceText;
      return next;
    });
  }, []);

  // Beküldés
  const submit = useCallback(async (consent: ConsentInput): Promise<string | null> => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // A két elfogadó jelölőnégyzet nélkül nincs beküldés. Az összegző gomb is ezt
      // kéri, de a nyomot a beküldés írja ki, ezért itt is ellenőrizzük.
      if (!consent.terms || !consent.privacy) {
        throw new Error(
          language === "hu"
            ? "Az ÁSZF és az adatkezelési tájékoztató elfogadása kötelező."
            : "Accepting the Terms and the Privacy Policy is required."
        );
      }

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
        // `dropUndefined`: a Firestore visszadobja azt a dokumentumot, amelyben egy mező értéke `undefined`
        ...dropUndefined({
          ...data,
          // a rejtett kapcsolattartó-mezők kitöltése az első tulajdonosból, ha az ügyfél a "megegyezik a tulajdonossal" alapértelmezést hagyta
          contact: resolveContact(data.contact, data.owners[0]),
        }),
        // a hozzájárulás időpontja a szerver órája szerint, nem a böngészőé
        consent: { ...acceptedLegalVersions(language), acceptedAt: serverTimestamp() },
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
    updateDecisiveInfluence,
    updateDocuments,
    updateDocumentPaths,
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
