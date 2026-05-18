/**
 * Székhelyszolgáltatás szerződéskötési wizard típusok
 * 2017. évi LIII. törvény (Pmt.) szerinti ügyfél-átvilágítás
 */

export type ContractLanguage = "hu" | "en";

export type ContractStatus =
  | "draft"           // Piszkozat - még nem beküldve
  | "pending_review"  // Beküldve, admin ellenőrzésre vár
  | "documents_needed" // Dokumentumok hiányoznak
  | "approved"        // Jóváhagyva
  | "rejected"        // Elutasítva
  | "active"          // Aktív szerződés
  | "terminated";     // Megszűnt

export type ServiceType =
  | "szekhely-hu"                    // Alap székhely magyar
  | "szekhely-kulfoldi"              // Alap székhely külföldi
  | "kezbesitesi"                    // Csak kézbesítési megbízott
  | "szekhely-kezbesitesi-hu"        // Kombinált magyar
  | "szekhely-kezbesitesi-kulfoldi"  // Kombinált külföldi
  | "szerzodeses-irodaberles"        // Virtuális iroda
  | "iroda-hu"                       // Iroda csomag magyar
  | "iroda-kulfoldi"                 // Iroda csomag külföldi
  | "iroda-kezbesitesi-hu"           // Teljes csomag magyar
  | "iroda-kezbesitesi-kulfoldi";    // Teljes csomag külföldi

export type OwnerType = "natural" | "legal";

export type IdDocumentType = "personal_id" | "passport";

// Természetes személy adatai (tulajdonos, ügyvezető, kapcsolattartó)
export type NaturalPersonData = {
  fullName: string;                    // Teljes név
  birthName: string;                   // Születési név
  nationality: string;                 // Állampolgárság
  birthPlace: string;                  // Születési hely
  birthDate: string;                   // Születési idő (YYYY-MM-DD)
  motherName: string;                  // Anyja neve
  address: string;                     // Lakcím / tartózkodási hely
  idType: IdDocumentType;              // Azonosító okmány típusa
  idNumber: string;                    // Okmány száma
};

// Jogi személy adatai (ha a tulajdonos cég)
export type LegalEntityData = {
  companyName: string;                 // Cégnév
  shortName: string;                   // Rövidített név
  registrationNumber: string;          // Cégjegyzékszám
  taxNumber?: string;                  // Adószám
  address: string;                     // Székhely
  mainActivity?: string;               // Főtevékenység
  representativeName: string;          // Képviselő neve
  representativePosition: string;      // Képviselő beosztása
};

// Tulajdonos (természetes vagy jogi személy)
export type OwnerData = {
  type: OwnerType;
  ownershipPercent: number;            // Tulajdonosi arány %
  natural?: NaturalPersonData;
  legal?: LegalEntityData;
};

// Kapcsolattartó adatai
export type ContactPersonData = {
  isSameAsOwner: boolean;              // Megegyezik-e a tulajdonossal
  fullName: string;
  email: string;                       // Fontos! Ide mennek a hivatalos levelek
  emailConfirm: string;                // Email megerősítés
  phone: string;
  address?: string;
};

// PEP (Politically Exposed Person) nyilatkozat
export type PepDeclaration = {
  isPep: boolean;                      // Kiemelt közszereplő-e
  isPepRelative: boolean;              // PEP közeli hozzátartozója-e
  isPepAssociate: boolean;             // PEP-pel üzleti kapcsolatban áll-e
  pepDetails?: string;                 // Ha igen, részletek
};

// Cég adatai
export type CompanyData = {
  isNew: boolean;                      // Új cég (alakulás alatt) vagy meglévő
  name: string;                        // Cégnév
  shortName: string;                   // Rövidített név
  legalForm: string;                   // Cégforma (Kft., Bt., stb.)
  registrationNumber?: string;         // Cégjegyzékszám (ha meglévő)
  taxNumber?: string;                  // Adószám (ha meglévő)
  currentAddress?: string;             // Jelenlegi székhely (ha meglévő)
  mainActivity: string;                // Főtevékenység (TEÁOR)
  mainActivityCode?: string;           // TEÁOR kód
};

// Feltöltött dokumentumok (Firebase Storage URL-ek)
export type ContractDocuments = {
  idFront?: string;                    // Személyi elő
  idBack?: string;                     // Személyi hátoldal
  passport?: string;                   // Útlevél
  addressCard?: string;                // Lakcímkártya
  companyExtract?: string;             // Cégkivonat (meglévő cégnél)
  otherDocuments?: string[];           // Egyéb dokumentumok
};

// Generált szerződések
export type GeneratedDocuments = {
  contract?: string;                   // Székhelyszolgáltatási szerződés
  kycForm?: string;                    // Ügyfél-átvilágítási adatlap
  pepDeclaration?: string;             // PEP nyilatkozat
  postalAuthorization?: string;        // Postai meghatalmazás
  consentDeclaration?: string;         // Hozzájáruló nyilatkozat
};

// Teljes szerződés adatstruktúra
export type ContractData = {
  id?: string;
  status: ContractStatus;
  createdAt?: Date;
  updatedAt?: Date;
  language: ContractLanguage;

  // Szolgáltatás
  serviceType: ServiceType;
  packageId: string;
  monthlyPrice: number;
  annualPrice: number;

  // Cég adatok
  company: CompanyData;

  // Tulajdonosok (több is lehet, összesen 100%)
  owners: OwnerData[];

  // Képviselő / Ügyvezető
  representative: NaturalPersonData & {
    isForeign: boolean;                // Külföldi-e (kézbesítési megbízott kell)
    position: string;                  // Beosztás (pl. ügyvezető)
  };

  // Kapcsolattartó
  contact: ContactPersonData;

  // PEP nyilatkozat
  pepDeclaration: PepDeclaration;

  // Dokumentumok (admin tölti fel)
  uploadedDocuments: ContractDocuments;

  // Generált dokumentumok
  generatedDocuments: GeneratedDocuments;

  // Admin mezők
  reviewedBy?: string;
  reviewedAt?: Date;
  adminNotes?: string;
};

// Wizard lépések
export type WizardStep =
  | "company-type"      // 1. Új vagy meglévő cég
  | "service-select"    // 2. Szolgáltatás választás
  | "company-data"      // 3. Cég adatok
  | "owner-contact"     // 4. Tulajdonos + Kapcsolattartó
  | "representative"    // 5. Képviselő/Ügyvezető
  | "pep-declaration"   // 6. PEP nyilatkozat
  | "documents"         // 7. Dokumentum feltöltés
  | "summary";          // 8. Összegzés és beküldés

export const WIZARD_STEPS: WizardStep[] = [
  "company-type",
  "service-select",
  "company-data",
  "owner-contact",
  "representative",
  "pep-declaration",
  "documents",
  "summary",
];

export const WIZARD_STEP_LABELS: Record<WizardStep, { hu: string; en: string }> = {
  "company-type": { hu: "Cég típusa", en: "Company Type" },
  "service-select": { hu: "Szolgáltatás", en: "Service" },
  "company-data": { hu: "Cég adatok", en: "Company Data" },
  "owner-contact": { hu: "Tulajdonos", en: "Owner" },
  "representative": { hu: "Képviselő", en: "Representative" },
  "pep-declaration": { hu: "Nyilatkozat", en: "Declaration" },
  "documents": { hu: "Dokumentumok", en: "Documents" },
  "summary": { hu: "Összegzés", en: "Summary" },
};

// Cégformák
export const LEGAL_FORMS = [
  { value: "kft", label: { hu: "Korlátolt Felelősségű Társaság (Kft.)", en: "Limited Liability Company (Kft.)" } },
  { value: "bt", label: { hu: "Betéti Társaság (Bt.)", en: "Limited Partnership (Bt.)" } },
  { value: "zrt", label: { hu: "Zártkörűen Működő Részvénytársaság (Zrt.)", en: "Private Limited Company (Zrt.)" } },
  { value: "nyrt", label: { hu: "Nyilvánosan Működő Részvénytársaság (Nyrt.)", en: "Public Limited Company (Nyrt.)" } },
  { value: "kkt", label: { hu: "Közkereseti Társaság (Kkt.)", en: "General Partnership (Kkt.)" } },
  { value: "ev", label: { hu: "Egyéni Vállalkozó", en: "Sole Proprietor" } },
  { value: "other", label: { hu: "Egyéb", en: "Other" } },
];

// Gyakori állampolgárságok
export const NATIONALITIES = [
  { value: "magyar", label: { hu: "Magyar", en: "Hungarian" } },
  { value: "nemet", label: { hu: "Német", en: "German" } },
  { value: "osztrak", label: { hu: "Osztrák", en: "Austrian" } },
  { value: "roman", label: { hu: "Román", en: "Romanian" } },
  { value: "szlovak", label: { hu: "Szlovák", en: "Slovak" } },
  { value: "szerb", label: { hu: "Szerb", en: "Serbian" } },
  { value: "ukran", label: { hu: "Ukrán", en: "Ukrainian" } },
  { value: "kinai", label: { hu: "Kínai", en: "Chinese" } },
  { value: "other", label: { hu: "Egyéb", en: "Other" } },
];

// Szerződés sablon típusok
export type ContractTemplateType =
  | "szekhelyszerzodes"     // Székhelyszolgáltatási szerződés
  | "ugyfel-atvilagitas"    // Ügyfél-átvilágítási adatlap
  | "pep-nyilatkozat"       // Kiemelt közszereplői nyilatkozat
  | "postai-meghatalmaz"    // Postai meghatalmazás
  | "hozzajarulo";          // Hozzájáruló nyilatkozat

export type ContractTemplate = {
  id: string;
  type: ContractTemplateType;
  name: { hu: string; en: string };
  description: { hu: string; en: string };
  version: string;
  createdAt?: Date;
  updatedAt?: Date;
  templateUrl: string;                 // Word sablon URL (Firebase Storage)
  variables: string[];                 // Használt változók listája
  active: boolean;
};

// Alapértelmezett sablon típusok
export const CONTRACT_TEMPLATE_TYPES: Record<ContractTemplateType, { hu: string; en: string }> = {
  "szekhelyszerzodes": { hu: "Székhelyszolgáltatási szerződés", en: "Registered Office Agreement" },
  "ugyfel-atvilagitas": { hu: "Ügyfél-átvilágítási adatlap", en: "Customer Due Diligence Form" },
  "pep-nyilatkozat": { hu: "Kiemelt közszereplői nyilatkozat", en: "PEP Declaration" },
  "postai-meghatalmaz": { hu: "Postai meghatalmazás", en: "Postal Authorization" },
  "hozzajarulo": { hu: "Hozzájáruló nyilatkozat", en: "Declaration of Consent" },
};

// Szerződés shortcode-ok kategóriákba rendezve
// Használat: {SHORTCODE} formátumban a Word dokumentumban
// Több tulajdonos esetén: {TULAJDONOS_1_NEV}, {TULAJDONOS_2_NEV}, stb.
export const CONTRACT_SHORTCODE_CATEGORIES = {
  company: {
    label: "🏢 Cég adatok",
    codes: [
      { code: "{CEG_NEV}", description: "Cégnév (teljes)" },
      { code: "{CEG_ROVID_NEV}", description: "Rövidített cégnév" },
      { code: "{CEG_FORMA}", description: "Cégforma (Kft., Bt., stb.)" },
      { code: "{CEGJEGYZEKSZAM}", description: "Cégjegyzékszám" },
      { code: "{ADOSZAM}", description: "Adószám" },
      { code: "{FOTEV}", description: "Főtevékenység" },
      { code: "{SZEKHELY}", description: "Székhely címe" },
    ],
  },
  owner1Natural: {
    label: "👤 1. Tulajdonos (természetes személy)",
    codes: [
      { code: "{TULAJDONOS_1_NEV}", description: "Teljes név" },
      { code: "{TULAJDONOS_1_SZUL_NEV}", description: "Születési név" },
      { code: "{TULAJDONOS_1_SZUL_HELY}", description: "Születési hely" },
      { code: "{TULAJDONOS_1_SZUL_DATUM}", description: "Születési dátum" },
      { code: "{TULAJDONOS_1_ANYJA_NEVE}", description: "Anyja neve" },
      { code: "{TULAJDONOS_1_LAKCIM}", description: "Lakcím" },
      { code: "{TULAJDONOS_1_OKMANY_TIPUS}", description: "Okmány típusa" },
      { code: "{TULAJDONOS_1_OKMANY_SZAM}", description: "Okmány száma" },
      { code: "{TULAJDONOS_1_ALLAMPOLGARSAG}", description: "Állampolgárság" },
      { code: "{TULAJDONOS_1_ARANY}", description: "Tulajdoni arány (%)" },
      { code: "{TULAJDONOS_1_TIPUS}", description: "Típus (természetes/jogi)" },
    ],
  },
  owner1Legal: {
    label: "🏛️ 1. Tulajdonos (jogi személy)",
    codes: [
      { code: "{TULAJDONOS_1_CEG_NEV}", description: "Cég neve" },
      { code: "{TULAJDONOS_1_CEG_ROVID}", description: "Rövidített név" },
      { code: "{TULAJDONOS_1_CEG_SZEKHELY}", description: "Cég székhelye" },
      { code: "{TULAJDONOS_1_CEG_CEGJSZ}", description: "Cégjegyzékszám" },
      { code: "{TULAJDONOS_1_CEG_FOTEV}", description: "Főtevékenység" },
      { code: "{TULAJDONOS_1_CEG_KEPVISELO}", description: "Képviselő neve" },
      { code: "{TULAJDONOS_1_CEG_KEPV_BEOSZTAS}", description: "Képviselő beosztása" },
    ],
  },
  owner2Natural: {
    label: "👤 2. Tulajdonos (természetes személy)",
    codes: [
      { code: "{TULAJDONOS_2_NEV}", description: "Teljes név" },
      { code: "{TULAJDONOS_2_SZUL_NEV}", description: "Születési név" },
      { code: "{TULAJDONOS_2_SZUL_HELY}", description: "Születési hely" },
      { code: "{TULAJDONOS_2_SZUL_DATUM}", description: "Születési dátum" },
      { code: "{TULAJDONOS_2_ANYJA_NEVE}", description: "Anyja neve" },
      { code: "{TULAJDONOS_2_LAKCIM}", description: "Lakcím" },
      { code: "{TULAJDONOS_2_OKMANY_TIPUS}", description: "Okmány típusa" },
      { code: "{TULAJDONOS_2_OKMANY_SZAM}", description: "Okmány száma" },
      { code: "{TULAJDONOS_2_ALLAMPOLGARSAG}", description: "Állampolgárság" },
      { code: "{TULAJDONOS_2_ARANY}", description: "Tulajdoni arány (%)" },
      { code: "{TULAJDONOS_2_TIPUS}", description: "Típus (természetes/jogi)" },
    ],
  },
  owner2Legal: {
    label: "🏛️ 2. Tulajdonos (jogi személy)",
    codes: [
      { code: "{TULAJDONOS_2_CEG_NEV}", description: "Cég neve" },
      { code: "{TULAJDONOS_2_CEG_ROVID}", description: "Rövidített név" },
      { code: "{TULAJDONOS_2_CEG_SZEKHELY}", description: "Cég székhelye" },
      { code: "{TULAJDONOS_2_CEG_CEGJSZ}", description: "Cégjegyzékszám" },
      { code: "{TULAJDONOS_2_CEG_FOTEV}", description: "Főtevékenység" },
      { code: "{TULAJDONOS_2_CEG_KEPVISELO}", description: "Képviselő neve" },
      { code: "{TULAJDONOS_2_CEG_KEPV_BEOSZTAS}", description: "Képviselő beosztása" },
    ],
  },
  owner3Natural: {
    label: "👤 3. Tulajdonos (természetes személy)",
    codes: [
      { code: "{TULAJDONOS_3_NEV}", description: "Teljes név" },
      { code: "{TULAJDONOS_3_SZUL_NEV}", description: "Születési név" },
      { code: "{TULAJDONOS_3_SZUL_HELY}", description: "Születési hely" },
      { code: "{TULAJDONOS_3_SZUL_DATUM}", description: "Születési dátum" },
      { code: "{TULAJDONOS_3_ANYJA_NEVE}", description: "Anyja neve" },
      { code: "{TULAJDONOS_3_LAKCIM}", description: "Lakcím" },
      { code: "{TULAJDONOS_3_OKMANY_TIPUS}", description: "Okmány típusa" },
      { code: "{TULAJDONOS_3_OKMANY_SZAM}", description: "Okmány száma" },
      { code: "{TULAJDONOS_3_ALLAMPOLGARSAG}", description: "Állampolgárság" },
      { code: "{TULAJDONOS_3_ARANY}", description: "Tulajdoni arány (%)" },
      { code: "{TULAJDONOS_3_TIPUS}", description: "Típus (természetes/jogi)" },
    ],
  },
  representative: {
    label: "👔 Képviselő / Ügyvezető",
    codes: [
      { code: "{KEPVISELO_NEV}", description: "Név" },
      { code: "{KEPVISELO_SZUL_NEV}", description: "Születési név" },
      { code: "{KEPVISELO_SZUL_HELY}", description: "Születési hely" },
      { code: "{KEPVISELO_SZUL_DATUM}", description: "Születési dátum" },
      { code: "{KEPVISELO_ANYJA_NEVE}", description: "Anyja neve" },
      { code: "{KEPVISELO_LAKCIM}", description: "Lakcím" },
      { code: "{KEPVISELO_OKMANY_TIPUS}", description: "Okmány típusa" },
      { code: "{KEPVISELO_OKMANY_SZAM}", description: "Okmány száma" },
      { code: "{KEPVISELO_BEOSZTAS}", description: "Beosztás" },
      { code: "{KEPVISELO_ALLAMPOLGARSAG}", description: "Állampolgárság" },
    ],
  },
  contact: {
    label: "📞 Kapcsolattartó",
    codes: [
      { code: "{KAPCSOLAT_NEV}", description: "Név" },
      { code: "{KAPCSOLAT_EMAIL}", description: "Email cím" },
      { code: "{KAPCSOLAT_TELEFON}", description: "Telefonszám" },
      { code: "{KAPCSOLAT_CIM}", description: "Cím" },
    ],
  },
  pep: {
    label: "🎭 Kiemelt közszereplő (PEP)",
    codes: [
      { code: "{PEP_STATUS}", description: "PEP státusz (igen/nem)" },
      { code: "{PEP_RESZLETEK}", description: "PEP részletek" },
      { code: "{PEP_NYILATKOZAT}", description: "minősül / nem minősül" },
    ],
  },
  service: {
    label: "📦 Szolgáltatás",
    codes: [
      { code: "{SZOLGALTATAS_TIPUS}", description: "Szolgáltatás típusa" },
      { code: "{CSOMAG_NEV}", description: "Csomag neve" },
      { code: "{HAVI_DIJ}", description: "Havi díj (Ft)" },
      { code: "{EVES_DIJ}", description: "Éves díj (Ft)" },
    ],
  },
  business: {
    label: "📊 Üzleti kapcsolat",
    codes: [
      { code: "{KOCKAZAT_SZINT}", description: "Kockázati szint (alacsony/átlagos/magas)" },
      { code: "{TELJESITES_HELY}", description: "Teljesítés helye" },
      { code: "{UZLETI_CEL}", description: "Üzleti kapcsolat célja" },
    ],
  },
  dates: {
    label: "📅 Dátumok",
    codes: [
      { code: "{DATUM}", description: "Mai dátum (ÉÉÉÉ.HH.NN.)" },
      { code: "{DATUM_SZO}", description: "Dátum szöveggel (2024. január 1.)" },
      { code: "{EV}", description: "Aktuális év" },
    ],
  },
  meta: {
    label: "ℹ️ Meta adatok",
    codes: [
      { code: "{TULAJDONOS_SZAM}", description: "Tulajdonosok száma" },
      { code: "{SZERZODES_ID}", description: "Szerződés azonosító" },
      { code: "{KEZBESITESI_CIM}", description: "Kézbesítési cím (fix: Budapest, 1064 Izabella u. 68/b)" },
    ],
  },
} as const;

export type ShortcodeCategory = keyof typeof CONTRACT_SHORTCODE_CATEGORIES;
