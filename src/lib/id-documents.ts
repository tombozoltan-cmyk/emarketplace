// The identity document images the contract wizard asks for, by the document type the applicant chose (step "representative"), and the names
// the admin shows for the uploaded images. Pure functions, so the wizard, the admin page and the tests use the same table.
//
// An ID card has two sides (idFront, idBack); a passport has one data page (passport). What the applicant chose decides what is asked for and
// how the image is called, so an applicant who chose "passport" is not asked for an "ID card (front)".

// Only erasable TypeScript syntax is used here (no enums, no namespaces), so the tests can load this file with `node --test` as it is.

import type { IdDocumentType } from "./contract-types";

export type IdImageKey = "idFront" | "idBack" | "passport";
export type IdImageSpec = {
  key: IdImageKey;
  label: { hu: string; en: string };
  description: { hu: string; en: string };
  required: boolean;
};

const PERSONAL_ID_IMAGES: IdImageSpec[] = [
  {
    key: "idFront",
    label: { hu: "Személyi igazolvány (előlap)", en: "ID Card (front)" },
    description: {
      hu: "Az azonosító okmány első oldala, ahol a fénykép és az alapadatok láthatók.",
      en: "The front side of the ID card with photo and basic data.",
    },
    required: true,
  },
  {
    key: "idBack",
    label: { hu: "Személyi igazolvány (hátlap)", en: "ID Card (back)" },
    description: {
      hu: "Az azonosító okmány hátsó oldala a lakcímmel.",
      en: "The back side of the ID card with address.",
    },
    required: true,
  },
];

const PASSPORT_IMAGES: IdImageSpec[] = [
  {
    key: "passport",
    label: { hu: "Útlevél (adatoldal)", en: "Passport (data page)" },
    description: {
      hu: "Az útlevél adatoldala, ahol a fénykép és az alapadatok láthatók. Egy kép elég.",
      en: "The data page of the passport, with the photo and the basic data. One image is enough.",
    },
    required: true,
  },
];

/** The images to ask for, for the chosen document type (an unknown or missing type is asked as an ID card, like the form's default). */
export function idImagesFor(idType: IdDocumentType | undefined): IdImageSpec[] {
  return idType === "passport" ? PASSPORT_IMAGES : PERSONAL_ID_IMAGES;
}

/** The image keys of the OTHER document type: cleared when the applicant changes the type, so nothing of the old choice stays in the application. */
export function idImageKeysToClear(idType: IdDocumentType | undefined): IdImageKey[] {
  return idType === "passport" ? ["idFront", "idBack"] : ["passport"];
}

/** A copy of the uploaded documents without the images of the other document type. */
export function withoutOtherTypeImages<T extends object>(documents: T, idType: IdDocumentType | undefined): T {
  const copy = { ...documents } as unknown as Record<string, unknown>;
  for (const key of idImageKeysToClear(idType)) delete copy[key];
  return copy as unknown as T;
}

/**
 * The name of an uploaded image for the admin. The key says what was asked when it was uploaded; when the application's document type does not
 * match it (an application made before the wizard asked by type), the name says so instead of calling a passport an ID card.
 */
export function uploadedDocumentLabel(key: string, idType?: string): string {
  const passportChosen = idType === "passport";
  switch (key) {
    case "passport":
      return idType === "personal_id" ? "Útlevél (a megadott típus: személyi igazolvány)" : "Útlevél (adatoldal)";
    case "idFront":
      return passportChosen ? "Okmány, 1. kép (a megadott típus: útlevél)" : "Személyi elő";
    case "idBack":
      return passportChosen ? "Okmány, 2. kép (a megadott típus: útlevél)" : "Személyi hát";
    case "addressCard":
      return "Lakcímkártya";
    case "companyExtract":
      return "Cégkivonat";
    default:
      return key;
  }
}
