export type ShortcodeCategory = {
  name: string;
  shortcodes: {
    code: string;
    label: string;
    description?: string;
  }[];
};

export const CONTRACT_SHORTCODE_CATEGORIES: ShortcodeCategory[] = [
  {
    name: "Cég adatok",
    shortcodes: [
      { code: "{{CEG_NEV}}", label: "Cégnév", description: "Teljes cégnév" },
      { code: "{{CEG_ROVID_NEV}}", label: "Rövidített név" },
      { code: "{{CEG_FORMA}}", label: "Cégforma", description: "Kft., Bt., stb." },
      { code: "{{CEGJEGYZEKSZAM}}", label: "Cégjegyzékszám" },
      { code: "{{ADOSZAM}}", label: "Adószám" },
      { code: "{{FOTEV}}", label: "Főtevékenység" },
      { code: "{{SZEKHELY}}", label: "Székhely címe" },
    ],
  },
  {
    name: "Tulajdonos (természetes személy)",
    shortcodes: [
      { code: "{{TULAJDONOS_NEV}}", label: "Teljes név" },
      { code: "{{TULAJDONOS_SZUL_NEV}}", label: "Születési név" },
      { code: "{{TULAJDONOS_SZUL_HELY}}", label: "Születési hely" },
      { code: "{{TULAJDONOS_SZUL_DATUM}}", label: "Születési dátum" },
      { code: "{{TULAJDONOS_ANYJA_NEVE}}", label: "Anyja neve" },
      { code: "{{TULAJDONOS_LAKCIM}}", label: "Lakcím" },
      { code: "{{TULAJDONOS_OKMANY_TIPUS}}", label: "Okmány típusa" },
      { code: "{{TULAJDONOS_OKMANY_SZAM}}", label: "Okmány száma" },
      { code: "{{TULAJDONOS_ALLAMPOLGARSAG}}", label: "Állampolgárság" },
      { code: "{{TULAJDONOS_ARANY}}", label: "Tulajdoni arány (%)" },
    ],
  },
  {
    name: "Tulajdonos (jogi személy)",
    shortcodes: [
      { code: "{{TULAJ_CEG_NEV}}", label: "Cég neve" },
      { code: "{{TULAJ_CEG_SZEKHELY}}", label: "Cég székhelye" },
      { code: "{{TULAJ_CEG_CEGJSZ}}", label: "Cégjegyzékszáma" },
      { code: "{{TULAJ_CEG_KEPVISELO}}", label: "Képviselő neve" },
      { code: "{{TULAJ_CEG_KEPV_BEOSZTAS}}", label: "Képviselő beosztása" },
    ],
  },
  {
    name: "Képviselő / Ügyvezető",
    shortcodes: [
      { code: "{{KEPVISELO_NEV}}", label: "Név" },
      { code: "{{KEPVISELO_SZUL_NEV}}", label: "Születési név" },
      { code: "{{KEPVISELO_SZUL_HELY}}", label: "Születési hely" },
      { code: "{{KEPVISELO_SZUL_DATUM}}", label: "Születési dátum" },
      { code: "{{KEPVISELO_ANYJA_NEVE}}", label: "Anyja neve" },
      { code: "{{KEPVISELO_LAKCIM}}", label: "Lakcím" },
      { code: "{{KEPVISELO_OKMANY_SZAM}}", label: "Okmány száma" },
      { code: "{{KEPVISELO_BEOSZTAS}}", label: "Beosztás" },
      { code: "{{KEPVISELO_ALLAMPOLGARSAG}}", label: "Állampolgárság" },
    ],
  },
  {
    name: "Kapcsolattartó",
    shortcodes: [
      { code: "{{KAPCSOLAT_NEV}}", label: "Név" },
      { code: "{{KAPCSOLAT_EMAIL}}", label: "Email" },
      { code: "{{KAPCSOLAT_TELEFON}}", label: "Telefon" },
      { code: "{{KAPCSOLAT_CIM}}", label: "Cím" },
    ],
  },
  {
    name: "Szolgáltatás",
    shortcodes: [
      { code: "{{CSOMAG_NEV}}", label: "Csomag neve" },
      { code: "{{HAVI_DIJ}}", label: "Havi díj (Ft)", description: "Számmal" },
      { code: "{{HAVI_DIJ_SZOVEG}}", label: "Havi díj szöveggel", description: "Betűvel kiírva" },
      { code: "{{EVES_DIJ}}", label: "Éves díj (Ft)", description: "12 havi díj" },
      { code: "{{EVES_DIJ_SZOVEG}}", label: "Éves díj szöveggel", description: "Betűvel kiírva" },
      { code: "{{SZOLGALTATO_NEV}}", label: "Szolgáltató neve" },
      { code: "{{SZOLGALTATO_CIM}}", label: "Szolgáltató címe" },
    ],
  },
  {
    name: "Dátumok",
    shortcodes: [
      { code: "{{DATUM}}", label: "Mai dátum", description: "ÉÉÉÉ.HH.NN." },
      { code: "{{DATUM_SZO}}", label: "Mai dátum szöveggel", description: "2024. január 1." },
      { code: "{{EV}}", label: "Aktuális év" },
      { code: "{{HONAP}}", label: "Aktuális hónap" },
      { code: "{{NAP}}", label: "Aktuális nap" },
    ],
  },
  {
    name: "Egyéb",
    shortcodes: [
      { code: "{{SZERZODES_ID}}", label: "Szerződés azonosító" },
      { code: "{{KEZBESITESI_CIM}}", label: "Kézbesítési cím" },
    ],
  },
  {
    name: "Feltételes blokkok - PEP",
    shortcodes: [
      { code: "{{#IF_PEP}}...{{/IF_PEP}}", label: "Ha kiemelt közszereplő", description: "Tartalom csak PEP esetén jelenik meg" },
      { code: "{{#IF_PEP_RELATIVE}}...{{/IF_PEP_RELATIVE}}", label: "Ha PEP hozzátartozó", description: "Tartalom csak PEP hozzátartozó esetén" },
      { code: "{{#IF_PEP_ASSOCIATE}}...{{/IF_PEP_ASSOCIATE}}", label: "Ha PEP közeli kapcsolat", description: "Tartalom csak PEP üzleti kapcsolat esetén" },
      { code: "{{#IF_ANY_PEP}}...{{/IF_ANY_PEP}}", label: "Ha bármilyen PEP", description: "Tartalom ha PEP vagy hozzátartozó vagy kapcsolat" },
      { code: "{{#IF_NOT_PEP}}...{{/IF_NOT_PEP}}", label: "Ha NEM közszereplő", description: "Tartalom csak ha egyik PEP sem" },
    ],
  },
  {
    name: "Feltételes blokkok - Cég",
    shortcodes: [
      { code: "{{#IF_NEW_COMPANY}}...{{/IF_NEW_COMPANY}}", label: "Ha alakuló cég", description: "Tartalom csak új cég esetén" },
      { code: "{{#IF_EXISTING_COMPANY}}...{{/IF_EXISTING_COMPANY}}", label: "Ha meglévő cég", description: "Tartalom csak meglévő cég esetén" },
      { code: "{{#IF_FOREIGN_REP}}...{{/IF_FOREIGN_REP}}", label: "Ha külföldi képviselő", description: "Tartalom csak külföldi képviselő esetén" },
      { code: "{{#IF_HUNGARIAN_REP}}...{{/IF_HUNGARIAN_REP}}", label: "Ha magyar képviselő", description: "Tartalom csak magyar képviselő esetén" },
    ],
  },
  {
    name: "Feltételes blokkok - Tulajdonos",
    shortcodes: [
      { code: "{{#IF_NATURAL_OWNER}}...{{/IF_NATURAL_OWNER}}", label: "Ha természetes személy tulajdonos", description: "Tartalom csak természetes személy tulajdonos esetén" },
      { code: "{{#IF_LEGAL_OWNER}}...{{/IF_LEGAL_OWNER}}", label: "Ha jogi személy tulajdonos", description: "Tartalom csak jogi személy tulajdonos esetén" },
      { code: "{{#IF_MULTIPLE_OWNERS}}...{{/IF_MULTIPLE_OWNERS}}", label: "Ha több tulajdonos", description: "Tartalom csak több tulajdonos esetén" },
      { code: "{{#IF_SINGLE_OWNER}}...{{/IF_SINGLE_OWNER}}", label: "Ha egy tulajdonos", description: "Tartalom csak egy tulajdonos esetén" },
    ],
  },
];

// Flatten shortcodes for easy lookup
export const ALL_SHORTCODES = CONTRACT_SHORTCODE_CATEGORIES.flatMap((cat) =>
  cat.shortcodes.map((sc) => ({
    ...sc,
    category: cat.name,
  }))
);

// Template types
export const TEMPLATE_TYPES = {
  contract: { hu: "Székhelyszolgáltatási szerződés", en: "Registered Office Contract" },
  kyc: { hu: "Ügyfél-átvilágítási adatlap", en: "KYC Form" },
  pep: { hu: "PEP nyilatkozat", en: "PEP Declaration" },
  postal_auth: { hu: "Postai meghatalmazás", en: "Postal Authorization" },
  custom: { hu: "Egyéni sablon", en: "Custom Template" },
} as const;

export type TemplateType = keyof typeof TEMPLATE_TYPES;

// Conditional context for template processing
export type ConditionalContext = {
  // PEP status
  isPep: boolean;
  isPepRelative: boolean;
  isPepAssociate: boolean;
  isAnyPep: boolean;
  isNotPep: boolean;
  // Company status
  isNewCompany: boolean;
  isExistingCompany: boolean;
  isForeignRep: boolean;
  isHungarianRep: boolean;
  // Owner status
  isNaturalOwner: boolean;
  isLegalOwner: boolean;
  hasMultipleOwners: boolean;
  hasSingleOwner: boolean;
};

// Process conditional blocks in template
export function processConditionalBlocks(
  template: string,
  context: ConditionalContext
): string {
  let result = template;

  // Define conditional mappings
  const conditionals: { tag: string; condition: boolean }[] = [
    // PEP conditions
    { tag: "IF_PEP", condition: context.isPep },
    { tag: "IF_PEP_RELATIVE", condition: context.isPepRelative },
    { tag: "IF_PEP_ASSOCIATE", condition: context.isPepAssociate },
    { tag: "IF_ANY_PEP", condition: context.isAnyPep },
    { tag: "IF_NOT_PEP", condition: context.isNotPep },
    // Company conditions
    { tag: "IF_NEW_COMPANY", condition: context.isNewCompany },
    { tag: "IF_EXISTING_COMPANY", condition: context.isExistingCompany },
    { tag: "IF_FOREIGN_REP", condition: context.isForeignRep },
    { tag: "IF_HUNGARIAN_REP", condition: context.isHungarianRep },
    // Owner conditions
    { tag: "IF_NATURAL_OWNER", condition: context.isNaturalOwner },
    { tag: "IF_LEGAL_OWNER", condition: context.isLegalOwner },
    { tag: "IF_MULTIPLE_OWNERS", condition: context.hasMultipleOwners },
    { tag: "IF_SINGLE_OWNER", condition: context.hasSingleOwner },
  ];

  // Process each conditional block
  for (const { tag, condition } of conditionals) {
    const regex = new RegExp(
      `\\{\\{#${tag}\\}\\}([\\s\\S]*?)\\{\\{/${tag}\\}\\}`,
      "g"
    );
    result = result.replace(regex, condition ? "$1" : "");
  }

  return result;
}

// Build conditional context from contract data
export function buildConditionalContext(contractData: {
  pepDeclaration?: {
    isPep?: boolean;
    isPepRelative?: boolean;
    isPepAssociate?: boolean;
  };
  company?: {
    isNew?: boolean;
  };
  representative?: {
    isForeign?: boolean;
  };
  owners?: Array<{
    type?: "natural" | "legal";
  }>;
}): ConditionalContext {
  const isPep = contractData.pepDeclaration?.isPep || false;
  const isPepRelative = contractData.pepDeclaration?.isPepRelative || false;
  const isPepAssociate = contractData.pepDeclaration?.isPepAssociate || false;
  const isAnyPep = isPep || isPepRelative || isPepAssociate;
  
  const isNewCompany = contractData.company?.isNew ?? true;
  const isForeignRep = contractData.representative?.isForeign || false;
  
  const owners = contractData.owners || [];
  const hasNaturalOwner = owners.some((o) => o.type === "natural" || !o.type);
  const hasLegalOwner = owners.some((o) => o.type === "legal");

  return {
    isPep,
    isPepRelative,
    isPepAssociate,
    isAnyPep,
    isNotPep: !isAnyPep,
    isNewCompany,
    isExistingCompany: !isNewCompany,
    isForeignRep,
    isHungarianRep: !isForeignRep,
    isNaturalOwner: hasNaturalOwner,
    isLegalOwner: hasLegalOwner,
    hasMultipleOwners: owners.length > 1,
    hasSingleOwner: owners.length <= 1,
  };
}

// Replace all shortcodes with actual values
export function replaceShortcodes(
  template: string,
  data: Record<string, string>,
  conditionalContext?: ConditionalContext
): string {
  let result = template;

  // First process conditional blocks if context provided
  if (conditionalContext) {
    result = processConditionalBlocks(result, conditionalContext);
  }

  // Then replace shortcodes with values
  for (const [code, value] of Object.entries(data)) {
    const escapedCode = code.replace(/[{}]/g, "\\$&");
    result = result.replace(new RegExp(escapedCode, "g"), value);
  }

  return result;
}
