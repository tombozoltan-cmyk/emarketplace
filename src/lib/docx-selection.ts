// Which DOCX template each admin download uses. Pure functions (no Firestore, no React) so every button of the contracts page, and the
// "download all" button, ask the SAME code and get the same template.
//
// The templates are stored in the `docxTemplates` collection with a category ("Szerződés", "Adatlap", "Nyilatkozat", ...) and a name. The
// documents of one owner carry the owner's number in the name: "{TULAJDONOS_2_NEV} ...". A template whose name has no number belongs to no
// owner (the contract, the declaration of consent), so it is never offered for an owner's document. There is no "first one in the list" fallback:
// the list order is the order of the document ids, which changes when a template is uploaded.

// Only erasable TypeScript syntax is used here (no enums, no namespaces), so the tests can load this file with `node --test` as it is.

export type DocxTemplateRef = { id: string; name: string; category: string };

export type TemplatePick = { template: DocxTemplateRef; error?: undefined } | { template?: undefined; error: string };

export const CATEGORY_CONTRACT = "Szerződés";
export const CATEGORY_KYC = "Adatlap";
export const CATEGORY_PEP = "Nyilatkozat";

/** The owner number in a template name ("{TULAJDONOS_2_NEV} ..." gives 2), or null when the name has none. */
export function ownerNumberOf(templateName: string): number | null {
  const match = templateName.match(/\{TULAJDONOS_(\d)_NEV\}/);
  return match ? parseInt(match[1], 10) : null;
}

const names = (templates: DocxTemplateRef[]) => templates.map((t) => `"${t.name.trim()}"`).join(", ");

/**
 * The contract template: the category "Szerződés". One template: that one. Several: the one without an owner number if there is exactly one
 * (an uploaded template that is meant to replace the old one), otherwise an error that names them (nothing is guessed).
 */
export function pickContractTemplate(templates: DocxTemplateRef[]): TemplatePick {
  const inCategory = templates.filter((t) => t.category === CATEGORY_CONTRACT);
  if (inCategory.length === 0) return { error: `Nincs '${CATEGORY_CONTRACT}' kategóriájú DOCX sablon feltöltve.` };
  if (inCategory.length === 1) return { template: inCategory[0] };
  const unnumbered = inCategory.filter((t) => ownerNumberOf(t.name) === null);
  if (unnumbered.length === 1) return { template: unnumbered[0] };
  return { error: `A '${CATEGORY_CONTRACT}' kategóriában több sablon van (${names(inCategory)}), nem egyértelmű, melyiket kell használni.` };
}

/** The template of one owner's document (category "Adatlap" or "Nyilatkozat"): exactly the one whose name carries this owner number. */
export function pickOwnerTemplate(templates: DocxTemplateRef[], category: string, ownerNumber: number): TemplatePick {
  const matching = templates.filter((t) => t.category === category && ownerNumberOf(t.name) === ownerNumber);
  if (matching.length === 1) return { template: matching[0] };
  if (matching.length === 0) return { error: `Nincs '${category}' sablon a(z) ${ownerNumber}. tulajdonoshoz.` };
  return { error: `A '${category}' kategóriában a(z) ${ownerNumber}. tulajdonoshoz több sablon is van (${names(matching)}).` };
}

export type DownloadKind = "contract" | "kyc" | "pep";
export type DownloadItem = { kind: DownloadKind; ownerNumber: number | null; template: DocxTemplateRef };
export type DownloadProblem = { kind: DownloadKind; message: string };

/**
 * The documents the page generates: the contract, then for every owner the data sheet and the declaration. The "download all" button and the
 * single buttons all take their templates from this plan. `problems` says what could not be planned (a missing template, an ambiguous category),
 * so the page can tell it instead of downloading a wrong document in silence.
 */
export function planDownloads(templates: DocxTemplateRef[], ownerCount: number): { items: DownloadItem[]; problems: DownloadProblem[] } {
  const items: DownloadItem[] = [];
  const problems: DownloadProblem[] = [];
  const contract = pickContractTemplate(templates);
  if (contract.template) items.push({ kind: "contract", ownerNumber: null, template: contract.template });
  else problems.push({ kind: "contract", message: contract.error });
  for (let ownerNumber = 1; ownerNumber <= ownerCount; ownerNumber++) {
    for (const [kind, category] of [["kyc", CATEGORY_KYC], ["pep", CATEGORY_PEP]] as const) {
      const pick = pickOwnerTemplate(templates, category, ownerNumber);
      if (pick.template) items.push({ kind, ownerNumber, template: pick.template });
      else problems.push({ kind, message: pick.error });
    }
  }
  return { items, problems };
}
