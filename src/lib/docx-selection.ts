// Which DOCX template each admin download uses. Pure functions (no Firestore, no React) so every button of the contracts page, and the
// "download all" button, ask the SAME code and get the same template.
//
// The templates are stored in the `docxTemplates` collection with a category ("Szerződés", "Adatlap", "Nyilatkozat", ...), a name and, for the new
// templates, a role key `docKey`:
//   contract           the seat contract            delivery-contract   the delivery agent contract
//   kyc                the data sheet of EVERY owner pep                the declaration of EVERY owner (tags without a number, one run per owner)
//   kyc-1 .. kyc-3     the data sheet of owner n    pep-1 .. pep-3      the declaration of owner n (the older way, up to three owners)
// "kyc" / "pep" win over "kyc-n" / "pep-n", which win over the older rules by name. A template with a docKey is chosen ONLY by its role, never by category or name; a template without one follows the older rules: the documents of
// one owner carry the owner's number in the name ("{TULAJDONOS_2_NEV} ..."), a name without a number belongs to no owner (the contract, the
// declaration of consent), so it is never offered for an owner's document. There is no "first one in the list" fallback: the list order is the
// order of the document ids, which changes when a template is uploaded.
//
// Going live with the new templates: upload them with their docKey; the role then wins over the old template of the same document (all the owner
// documents together: as soon as any "kyc-n" exists, the data sheet of every owner comes from the keyed ones). Deleting the keyed template brings the
// old one back. A template uploaded WITHOUT a docKey in the category "Egyéb" is never chosen.

// Only erasable TypeScript syntax is used here (no enums, no namespaces), so the tests can load this file with `node --test` as it is.

export type DocxTemplateRef = { id: string; name: string; category: string; docKey?: string };

export type TemplatePick = { template: DocxTemplateRef; error?: undefined } | { template?: undefined; error: string };

export const CATEGORY_CONTRACT = "Szerződés";
export const CATEGORY_KYC = "Adatlap";
export const CATEGORY_PEP = "Nyilatkozat";

export const DOCKEY_CONTRACT = "contract";
export const DOCKEY_DELIVERY = "delivery-contract";
export const DOCKEYS_OWNER = { kyc: "kyc", pep: "pep" } as const;

/**
 * Every role a template can have, with the label the upload form shows. functions/src/index.ts (uploadDocxTemplate) checks the same list; a test
 * keeps the two equal.
 */
export const DOCKEY_LABELS: Record<string, string> = {
  [DOCKEY_CONTRACT]: "Székhelyszolgáltatási szerződés",
  [DOCKEY_DELIVERY]: "Kézbesítési megbízási szerződés",
  // one template for every owner, however many there are: it uses the tags without a number ({TULAJDONOS_NEV}) and is filled once per owner
  [DOCKEYS_OWNER.kyc]: "Átvilágítási adatlap (minden tulajdonos, sorszám nélküli címkékkel)",
  [DOCKEYS_OWNER.pep]: "Közszereplői nyilatkozat (minden tulajdonos, sorszám nélküli címkékkel)",
  // the older way, one template per owner number (up to three); a template with the role without a number wins over these
  "kyc-1": "Átvilágítási adatlap, 1. tulajdonos",
  "kyc-2": "Átvilágítási adatlap, 2. tulajdonos",
  "kyc-3": "Átvilágítási adatlap, 3. tulajdonos",
  "pep-1": "Közszereplői nyilatkozat, 1. tulajdonos",
  "pep-2": "Közszereplői nyilatkozat, 2. tulajdonos",
  "pep-3": "Közszereplői nyilatkozat, 3. tulajdonos",
};
export const DOCKEYS = Object.keys(DOCKEY_LABELS);

/** The owner number in a template name ("{TULAJDONOS_2_NEV} ..." gives 2), or null when the name has none. */
export function ownerNumberOf(templateName: string): number | null {
  const match = templateName.match(/\{TULAJDONOS_(\d)_NEV\}/);
  return match ? parseInt(match[1], 10) : null;
}

const names = (templates: DocxTemplateRef[]) => templates.map((t) => `"${t.name.trim()}"`).join(", ");

/** The templates the older rules look at: those without a role key. */
const withoutKey = (templates: DocxTemplateRef[]) => templates.filter((t) => !t.docKey);

/** The template of a role: null when no template has it, an error when several do. */
export function pickByDocKey(templates: DocxTemplateRef[], docKey: string): TemplatePick | null {
  const matching = templates.filter((t) => t.docKey === docKey);
  if (matching.length === 0) return null;
  if (matching.length === 1) return { template: matching[0] };
  return { error: `A '${docKey}' szerephez több sablon is van (${names(matching)}).` };
}

/**
 * The seat contract. A template with the role "contract" wins. Otherwise the older rules, on the category "Szerződés": one template: that one;
 * several: the one without an owner number if there is exactly one (an uploaded template that is meant to replace the old one), otherwise an error
 * that names them (nothing is guessed).
 */
export function pickContractTemplate(templates: DocxTemplateRef[]): TemplatePick {
  const keyed = pickByDocKey(templates, DOCKEY_CONTRACT);
  if (keyed) return keyed;
  const inCategory = withoutKey(templates).filter((t) => t.category === CATEGORY_CONTRACT);
  if (inCategory.length === 0) return { error: `Nincs '${CATEGORY_CONTRACT}' kategóriájú DOCX sablon feltöltve.` };
  if (inCategory.length === 1) return { template: inCategory[0] };
  const unnumbered = inCategory.filter((t) => ownerNumberOf(t.name) === null);
  if (unnumbered.length === 1) return { template: unnumbered[0] };
  return { error: `A '${CATEGORY_CONTRACT}' kategóriában több sablon van (${names(inCategory)}), nem egyértelmű, melyiket kell használni.` };
}

/** The delivery agent contract: only by its role (there is no older template of it): null when it is not uploaded yet. */
export function pickDeliveryTemplate(templates: DocxTemplateRef[]): TemplatePick | null {
  return pickByDocKey(templates, DOCKEY_DELIVERY);
}

const roleOf = (category: string): "kyc" | "pep" | null => (category === CATEGORY_KYC ? "kyc" : category === CATEGORY_PEP ? "pep" : null);

/**
 * The template of one owner's document (category "Adatlap" or "Nyilatkozat"). A template with the role "kyc" (or "pep"), without a number, is THE template of
 * every owner, whatever the number of owners (the page fills it once per owner with that owner's data); two of them are an error. Otherwise, when any
 * template has a role "kyc-n" (or "pep-n"), the documents of that kind come only from the keyed ones: the template with exactly this owner's role.
 * Otherwise the older rule: exactly the template whose name carries this owner number.
 */
export function pickOwnerTemplate(templates: DocxTemplateRef[], category: string, ownerNumber: number): TemplatePick {
  const role = roleOf(category);
  const forEveryOwner = role ? pickByDocKey(templates, role) : null;
  if (forEveryOwner) return forEveryOwner;
  if (role && templates.some((t) => (t.docKey || "").startsWith(`${role}-`))) {
    return pickByDocKey(templates, `${role}-${ownerNumber}`) || { error: `Nincs '${role}-${ownerNumber}' szerepű sablon a(z) ${ownerNumber}. tulajdonoshoz.` };
  }
  const matching = withoutKey(templates).filter((t) => t.category === category && ownerNumberOf(t.name) === ownerNumber);
  if (matching.length === 1) return { template: matching[0] };
  if (matching.length === 0) return { error: `Nincs '${category}' sablon a(z) ${ownerNumber}. tulajdonoshoz.` };
  return { error: `A '${category}' kategóriában a(z) ${ownerNumber}. tulajdonoshoz több sablon is van (${names(matching)}).` };
}

export type DownloadKind = "contract" | "delivery" | "kyc" | "pep";
export type DownloadItem = { kind: DownloadKind; ownerNumber: number | null; template: DocxTemplateRef };
export type DownloadProblem = { kind: DownloadKind; message: string };

/**
 * The documents the page generates: the seat contract and the delivery contract (as the package needs them), then for every owner the data sheet and
 * the declaration. The "download all" button and the single buttons all take their templates from this plan. `problems` says what could not be
 * planned (a missing template, an ambiguous category), so the page can tell it instead of downloading a wrong document in silence. `documents` says
 * which contracts the package needs (default: the seat contract only, as before). A delivery contract that is not uploaded yet is not a problem:
 * nothing is planned for it.
 */
export function planDownloads(
  templates: DocxTemplateRef[],
  ownerCount: number,
  documents: { seat: boolean; delivery: boolean } = { seat: true, delivery: false },
  /** `pepOwners`: the owner numbers that get a declaration (the beneficial owners, see pepOwnersOf in docx-data.ts); without it every owner gets one. */
  options: { pepOwners?: number[] } = {}
): { items: DownloadItem[]; problems: DownloadProblem[] } {
  const items: DownloadItem[] = [];
  const problems: DownloadProblem[] = [];
  if (documents.seat) {
    const contract = pickContractTemplate(templates);
    if (contract.template) items.push({ kind: "contract", ownerNumber: null, template: contract.template });
    else problems.push({ kind: "contract", message: contract.error });
  }
  if (documents.delivery) {
    const delivery = pickDeliveryTemplate(templates);
    if (delivery?.template) items.push({ kind: "delivery", ownerNumber: null, template: delivery.template });
    else if (delivery) problems.push({ kind: "delivery", message: delivery.error });
  }
  for (let ownerNumber = 1; ownerNumber <= ownerCount; ownerNumber++) {
    for (const [kind, category] of [["kyc", CATEGORY_KYC], ["pep", CATEGORY_PEP]] as const) {
      if (kind === "pep" && options.pepOwners && !options.pepOwners.includes(ownerNumber)) continue;
      const pick = pickOwnerTemplate(templates, category, ownerNumber);
      if (pick.template) items.push({ kind, ownerNumber, template: pick.template });
      else problems.push({ kind, message: pick.error });
    }
  }
  return { items, problems };
}
