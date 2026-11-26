// The identity document the contract wizard asks for: which document types the applicant can choose (by nationality, the Pmt. rule), which images
// are asked for by the chosen type, and the names the admin shows. Pure functions, so the wizard, the admin page and the tests use the same table.
//
// Pmt. (2017. évi LIII. törvény) 3. § 3a. and 32. pont, 7. § (3) a), as the lawyer reads it (review 2026-11-26): a Hungarian citizen: ID card,
// passport, or a driving licence in CARD format; a foreign citizen: passport, or an ID card that entitles to stay in Hungary. A foreign driving
// licence is not accepted. What the applicant chooses is what is asked for and what is stored: an ID card has two sides (idFront, idBack), a
// card driving licence has two sides (idFront, idBack), a passport has one data page (passport).

// Only erasable TypeScript syntax is used here (no enums, no namespaces), so the tests can load this file with `node --test` as it is.

import type { IdDocumentType } from "./contract-types";

type Lang = "hu" | "en";

export type IdImageKey = "idFront" | "idBack" | "passport";
export type IdImageSpec = {
  key: IdImageKey;
  label: { hu: string; en: string };
  description: { hu: string; en: string };
  required: boolean;
};

/** The nationality value of a Hungarian citizen in the wizard's nationality select (the wizard's own rule for "foreign" is: not this). */
export const HUNGARIAN = "magyar";

export function isHungarianNationality(nationality: string | undefined): boolean {
  return nationality === HUNGARIAN;
}

/** The document types the applicant can choose, for the chosen nationality; the first one is the default. */
export function idTypesFor(nationality: string | undefined): IdDocumentType[] {
  return isHungarianNationality(nationality) ? ["personal_id", "passport", "drivers_license"] : ["passport", "personal_id"];
}

/** The type to keep: the given one when the nationality allows it, otherwise the default of the nationality (a foreign citizen cannot keep a driving licence). */
export function validIdType(nationality: string | undefined, idType: IdDocumentType | undefined): IdDocumentType {
  const allowed = idTypesFor(nationality);
  return idType && allowed.includes(idType) ? idType : allowed[0];
}

const TYPE_LABELS: Record<IdDocumentType, { hu: string; en: string }> = {
  personal_id: { hu: "Személyi igazolvány", en: "Personal ID Card" },
  passport: { hu: "Útlevél", en: "Passport" },
  drivers_license: { hu: "Vezetői engedély (kártya formátumú)", en: "Driving licence (card format)" },
};

export function idTypeLabel(idType: string | undefined, lang: Lang = "hu"): string {
  const known = idType && (TYPE_LABELS as Record<string, { hu: string; en: string }>)[idType];
  return known ? known[lang] : "Személyi igazolvány";
}

/** A short note under the type select, or null: what the lawyer asked to say about that choice. */
export function idTypeNote(idType: string | undefined, nationality: string | undefined, lang: Lang = "hu"): string | null {
  if (idType === "personal_id" && !isHungarianNationality(nationality)) {
    return lang === "hu" ? "Csak akkor, ha magyarországi tartózkodásra jogosít." : "Only if it entitles you to stay in Hungary.";
  }
  if (idType === "drivers_license") {
    return lang === "hu"
      ? "Csak kártya formátumú magyar vezetői engedély. Papír alapú vagy külföldi vezetői engedély nem fogadható el."
      : "Only a Hungarian driving licence in card format. A paper or a foreign driving licence is not accepted.";
  }
  return null;
}

const CARD_IMAGES = (name: { hu: string; en: string }, frontHu: string, frontEn: string): IdImageSpec[] => [
  {
    key: "idFront",
    label: { hu: `${name.hu} (előlap)`, en: `${name.en} (front)` },
    description: { hu: frontHu, en: frontEn },
    required: true,
  },
  {
    key: "idBack",
    label: { hu: `${name.hu} (hátlap)`, en: `${name.en} (back)` },
    description: { hu: "Az okmány hátsó oldala.", en: "The back side of the document." },
    required: true,
  },
];

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

const DRIVERS_LICENSE_IMAGES = CARD_IMAGES(
  { hu: "Vezetői engedély", en: "Driving licence" },
  "A kártya első oldala, ahol a fénykép és az alapadatok láthatók.",
  "The front side of the card with photo and basic data."
);

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
  if (idType === "passport") return PASSPORT_IMAGES;
  if (idType === "drivers_license") return DRIVERS_LICENSE_IMAGES;
  return PERSONAL_ID_IMAGES;
}

/** A copy of the uploaded documents without any identity document image. A changed document type asks for other documents, so nothing of the old choice stays. */
export function withoutIdImages<T extends object>(documents: T): T {
  const copy = { ...documents } as unknown as Record<string, unknown>;
  for (const key of ["idFront", "idBack", "passport"]) delete copy[key];
  return copy as unknown as T;
}

/**
 * The name of an uploaded image for the admin. The key says what was asked when it was uploaded; when the application's document type does not
 * match it (an application made before the wizard asked by type), the name says so instead of calling a passport an ID card.
 */
export function uploadedDocumentLabel(key: string, idType?: string): string {
  const typeName = idType === "passport" ? "útlevél" : idType === "drivers_license" ? "vezetői engedély" : "személyi igazolvány";
  switch (key) {
    case "passport":
      return idType === "personal_id" || idType === "drivers_license" ? `Útlevél (a megadott típus: ${typeName})` : "Útlevél (adatoldal)";
    case "idFront":
      if (idType === "passport") return "Okmány, 1. kép (a megadott típus: útlevél)";
      return idType === "drivers_license" ? "Vezetői engedély, előlap" : "Személyi elő";
    case "idBack":
      if (idType === "passport") return "Okmány, 2. kép (a megadott típus: útlevél)";
      return idType === "drivers_license" ? "Vezetői engedély, hátlap" : "Személyi hát";
    case "addressCard":
      return "Lakcímkártya";
    case "companyExtract":
      return "Cégkivonat";
    default:
      return key;
  }
}
