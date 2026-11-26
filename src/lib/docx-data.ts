// The data the DOCX templates are filled with, beyond what the contracts page builds for the old templates (buildShortcodeDataFromContract there).
// Pure functions (no Firestore, no React), so the new templates and the tests use the same rules. The page merges this over the old data: the keys
// here either are new, or correct an old value (the address of the seat, the nationality as a name, the double legal form).
//
// The templates are tagged with {NAME} (docxtemplater, single braces); this module gives the values. A value that is not known is "" (the template
// then shows nothing), never undefined.

// Only erasable TypeScript syntax is used here (no enums, no namespaces), so the tests can load this file with `node --test` as it is.

type Person = {
  fullName?: string;
  birthName?: string;
  nationality?: string;
  birthPlace?: string;
  birthDate?: string;
  motherName?: string;
  address?: string;
  idType?: string;
  idNumber?: string;
};

/** What this module reads of a contract: a ContractData (the wizard's data) fits. */
export type DocxContractInput = {
  packageId?: string;
  monthlyPrice?: number;
  company?: { name?: string; legalForm?: string; registrationNumber?: string; taxNumber?: string; isNew?: boolean };
  owners?: { type?: string; ownershipPercent?: number; natural?: Person }[];
  representative?: Person;
  contact?: { isSameAsOwner?: boolean; address?: string };
};

export type DocxDataHelpers = {
  /** The name of a nationality by the value of the wizard's select ("nemet" gives "Német"); an unknown value is returned as it is. */
  nationalityLabel: (value: string) => string;
};

/** The address of the registered seat the company provides (the one of the contracts and the PDF): not the old address the page had in its code. */
export const OFFICE_ADDRESS = "1064 Budapest, Izabella utca 68/b.";

/**
 * The monthly net fee of the delivery agent mandate in a full package (seat + delivery): the seat fee of a full package is the package price minus
 * this (the earlier rule of the documents: a full package must not bill the seat twice). Example of a full package: 10 000 (seat) + 5 000 (delivery).
 */
export const DELIVERY_FEE = 5000;

export const REGISTRATION_PENDING_BILINGUAL = "…………………… (bejegyzés alatt / registration pending)";
export const REGISTRATION_PENDING_HU = "bejegyzés alatt";

const ID_TYPE_NAMES: Record<string, string> = {
  personal_id: "Személyi igazolvány",
  passport: "Útlevél",
  drivers_license: "Vezetői engedély",
};

/** Which documents a package needs: the seat contract (all but the delivery-only package) and the delivery agent contract (the packages with delivery). */
export function packageDocuments(packageId: string | undefined): { seat: boolean; delivery: boolean } {
  const id = packageId || "";
  return { seat: id !== "kezbesitesi", delivery: id.includes("kezbesitesi") };
}

/** The monthly net fees of the two contracts of a package, from the monthly price of the package. */
export function feesOf(packageId: string | undefined, monthlyPrice: number | undefined): { seatMonthly: number; deliveryMonthly: number } {
  const monthly = monthlyPrice && monthlyPrice > 0 ? monthlyPrice : 0;
  const { seat, delivery } = packageDocuments(packageId);
  if (seat && delivery) return { seatMonthly: Math.max(0, monthly - DELIVERY_FEE), deliveryMonthly: Math.min(monthly, DELIVERY_FEE) };
  if (delivery) return { seatMonthly: 0, deliveryMonthly: monthly };
  return { seatMonthly: monthly, deliveryMonthly: 0 };
}

const group = (amount: number, separator: string) => String(Math.round(amount)).replace(/\B(?=(\d{3})+(?!\d))/g, separator);
const hu = (amount: number) => group(amount, " ");
const en = (amount: number) => group(amount, ",");

const join = (...parts: (string | undefined)[]) => parts.map((p) => (p || "").trim()).filter(Boolean).join(", ");

/** "Személyi igazolvány 123456AB": the type and the number, with a space (the old templates had them side by side without one). */
function idText(person: Person): string {
  return [ID_TYPE_NAMES[person.idType || ""] || person.idType || "", person.idNumber || ""].map((s) => s.trim()).filter(Boolean).join(" ");
}

/** The legal form is written once: the name of a company already ends with it ("... Kft."), so the form is added only when the name lacks it. */
function legalFormToAdd(name: string | undefined, legalForm: string | undefined): string {
  const form = (legalForm || "").trim();
  if (!form) return "";
  const plain = (s: string) => s.toLowerCase().replace(/[.\s]/g, "");
  return plain(name || "").endsWith(plain(form)) ? "" : form;
}

function personData(prefix: string, person: Person, helpers: DocxDataHelpers): Record<string, string> {
  return {
    [`${prefix}_SZUL_NEV`]: (person.birthName || "").trim() || (person.fullName || "").trim(),
    [`${prefix}_ALLAMPOLGARSAG`]: person.nationality ? helpers.nationalityLabel(person.nationality) : "",
    [`${prefix}_SZUL_HELY_IDO`]: join(person.birthPlace, person.birthDate),
    [`${prefix}_OKMANY`]: idText(person),
  };
}

export function buildDocxData(contract: DocxContractInput, helpers: DocxDataHelpers): Record<string, string> {
  const company = contract.company || {};
  const owners = contract.owners || [];
  const representative = contract.representative || {};
  const pending = Boolean(company.isNew) || !(company.registrationNumber || "").trim();
  const taxPending = Boolean(company.isNew) || !(company.taxNumber || "").trim();
  const fees = feesOf(contract.packageId, contract.monthlyPrice);
  const firstNatural = owners.find((o) => o.type !== "legal")?.natural;

  const data: Record<string, string> = {
    // the address of the seat (the old code carried the address of the former one)
    SZEKHELY: OFFICE_ADDRESS,
    KEZBESITESI_CIM: OFFICE_ADDRESS,
    TELJESITES_HELY: OFFICE_ADDRESS,
    // the legal form once ("... Kft. kft" before)
    CEG_FORMA: legalFormToAdd(company.name, company.legalForm),
    // a company in formation has no registration and tax number yet: the contracts say so in both languages, the data sheet in Hungarian
    CEGJEGYZEKSZAM_SZOVEG: pending ? REGISTRATION_PENDING_BILINGUAL : (company.registrationNumber || "").trim(),
    ADOSZAM_SZOVEG: taxPending ? REGISTRATION_PENDING_BILINGUAL : (company.taxNumber || "").trim(),
    CEGJEGYZEKSZAM_ADATLAP: pending ? REGISTRATION_PENDING_HU : (company.registrationNumber || "").trim(),
    ADOSZAM_ADATLAP: taxPending ? REGISTRATION_PENDING_HU : (company.taxNumber || "").trim(),
    // the fees of the two contracts (net, per month, and for 12 months in advance), in the Hungarian and the English way of writing the number
    SZEKHELY_HAVI_DIJ: hu(fees.seatMonthly),
    SZEKHELY_EVES_DIJ: hu(fees.seatMonthly * 12),
    KEZBESITESI_HAVI_DIJ: hu(fees.deliveryMonthly),
    KEZBESITESI_EVES_DIJ: hu(fees.deliveryMonthly * 12),
    SZEKHELY_HAVI_DIJ_EN: en(fees.seatMonthly),
    SZEKHELY_EVES_DIJ_EN: en(fees.seatMonthly * 12),
    KEZBESITESI_HAVI_DIJ_EN: en(fees.deliveryMonthly),
    KEZBESITESI_EVES_DIJ_EN: en(fees.deliveryMonthly * 12),
    // the contact address: of the person when the contact is the owner and has none of its own
    KAPCSOLAT_CIM: (contract.contact?.address || "").trim() || (contract.contact?.isSameAsOwner ? (firstNatural?.address || "").trim() : ""),
    ...personData("KEPVISELO", representative, helpers),
  };

  for (let index = 0; index < 3; index++) {
    const owner = owners[index];
    const prefix = `TULAJDONOS_${index + 1}`;
    const natural = owner && owner.type !== "legal" ? owner.natural : undefined;
    Object.assign(data, natural ? personData(prefix, natural, helpers) : personData(prefix, {}, helpers));
  }
  return data;
}
