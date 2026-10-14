import type { LegalLanguage } from "./types";

export type LegalDocumentKind = "terms" | "privacy";

export type LegalVersion = {
  /** Verziószám úgy, ahogy a dokumentum fejlécében szerepel, pl. "3.0". */
  version: string;
  /** Hatálybalépés napja, ISO formátumban. */
  effectiveFrom: string;
  /** A hatályvesztés napja; `null`, amíg ez a hatályos verzió. */
  supersededOn: string | null;
  /**
   * A `public/legal/` mappában lévő PDF fájlneve nyelvenként. `null`, ha az
   * adott verzióhoz nincs közzétett PDF (pl. a 2018-as ÁSZF).
   *
   * A fájlnevek verziót és hatálybalépési dátumot tartalmaznak, és soha nem
   * írjuk felül őket: egy új verzió új fájl. Így egy korábban aláírt
   * szerződéshez tartozó szövegváltozat utólag is változatlanul visszakereshető.
   */
  pdf: Record<LegalLanguage, string | null>;
};

export type LegalDocumentMeta = {
  kind: LegalDocumentKind;
  /** Az oldal útvonala nyelvenként. */
  path: Record<LegalLanguage, string>;
  /** Legújabb verzió elöl. */
  versions: LegalVersion[];
};

export const LEGAL_DOCUMENTS: Record<LegalDocumentKind, LegalDocumentMeta> = {
  terms: {
    kind: "terms",
    path: { hu: "/aszf", en: "/en/terms" },
    versions: [
      {
        version: "3.0",
        effectiveFrom: "2026-01-01",
        supersededOn: null,
        pdf: {
          hu: "aszf-v3.0-2026-01-01.pdf",
          en: "gtc-v3.0-2026-01-01-en.pdf",
        },
      },
      {
        version: "1.0",
        effectiveFrom: "2018-01-10",
        supersededOn: "2026-01-01",
        pdf: { hu: null, en: null },
      },
    ],
  },
  privacy: {
    kind: "privacy",
    path: { hu: "/adatvedelem", en: "/en/privacy" },
    versions: [
      {
        version: "2.0",
        effectiveFrom: "2026-01-01",
        supersededOn: null,
        pdf: {
          hu: "adatkezelesi-tajekoztato-v2.0-2026-01-01.pdf",
          en: "privacy-notice-v2.0-2026-01-01-en.pdf",
        },
      },
    ],
  },
};

/** A hatályos (még nem felülírt) verzió. */
export function currentLegalVersion(kind: LegalDocumentKind): LegalVersion {
  const current = LEGAL_DOCUMENTS[kind].versions.find((v) => v.supersededOn === null);
  if (!current) {
    throw new Error(`Nincs hatályos verzió a(z) "${kind}" dokumentumhoz.`);
  }
  return current;
}

/** Publikus URL a verzióhoz tartozó PDF-hez, vagy `null`, ha nincs ilyen fájl. */
export function legalPdfUrl(version: LegalVersion, language: LegalLanguage): string | null {
  const file = version.pdf[language];
  return file ? `/legal/${file}` : null;
}

/**
 * A szerződésekhez elmentendő hivatkozás: melyik dokumentum melyik verzióját
 * fogadta el az ügyfél. A wizard beküldésnél ezt tárolja a Firestore-ban.
 */
export function legalVersionRef(kind: LegalDocumentKind): string {
  const { version, effectiveFrom } = currentLegalVersion(kind);
  return `${kind}-v${version}-${effectiveFrom}`;
}

export function formatLegalDate(iso: string, language: LegalLanguage): string {
  const date = new Date(`${iso}T00:00:00Z`);
  return new Intl.DateTimeFormat(language === "hu" ? "hu-HU" : "en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}
