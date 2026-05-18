/**
 * Contract Shortcode Mapper
 * Maps ContractData from wizard to shortcode values for DOCX templates
 */

import type { ContractData, OwnerData } from "./contract-types"

// ID document type mapping
const ID_TYPE_LABELS: Record<string, string> = {
  personal_id: "Személyi igazolvány",
  passport: "Útlevél",
}

// Legal form mapping
const LEGAL_FORM_LABELS: Record<string, string> = {
  kft: "Kft.",
  bt: "Bt.",
  zrt: "Zrt.",
  nyrt: "Nyrt.",
  kkt: "Kkt.",
  ev: "Egyéni vállalkozó",
  other: "Egyéb",
}

// Service type mapping
const SERVICE_TYPE_LABELS: Record<string, string> = {
  "szekhely-hu": "Székhelyszolgáltatás (magyar)",
  "szekhely-kulfoldi": "Székhelyszolgáltatás (külföldi)",
  "kezbesitesi": "Kézbesítési megbízott",
  "szekhely-kezbesitesi-hu": "Székhely + Kézbesítési (magyar)",
  "szekhely-kezbesitesi-kulfoldi": "Székhely + Kézbesítési (külföldi)",
  "szerzodeses-irodaberles": "Virtuális iroda",
  "iroda-hu": "Iroda csomag (magyar)",
  "iroda-kulfoldi": "Iroda csomag (külföldi)",
  "iroda-kezbesitesi-hu": "Teljes csomag (magyar)",
  "iroda-kezbesitesi-kulfoldi": "Teljes csomag (külföldi)",
}

// Format date to Hungarian format
function formatDate(dateStr: string): string {
  if (!dateStr) return ""
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return dateStr
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}.`
}

// Format date with text (Hungarian)
function formatDateText(dateStr: string): string {
  if (!dateStr) return ""
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return dateStr
  const months = [
    "január", "február", "március", "április", "május", "június",
    "július", "augusztus", "szeptember", "október", "november", "december"
  ]
  return `${date.getFullYear()}. ${months[date.getMonth()]} ${date.getDate()}.`
}

// Format price with thousand separators
function formatPrice(price: number): string {
  return price.toLocaleString("hu-HU") + " Ft"
}

// Get owner shortcodes for a specific owner index (1, 2, 3)
function getOwnerShortcodes(owner: OwnerData | undefined, index: number): Record<string, string> {
  const prefix = `TULAJDONOS_${index}`
  const codes: Record<string, string> = {}

  if (!owner) {
    // Return empty values for non-existent owner
    codes[`${prefix}_NEV`] = ""
    codes[`${prefix}_SZUL_NEV`] = ""
    codes[`${prefix}_SZUL_HELY`] = ""
    codes[`${prefix}_SZUL_DATUM`] = ""
    codes[`${prefix}_ANYJA_NEVE`] = ""
    codes[`${prefix}_LAKCIM`] = ""
    codes[`${prefix}_OKMANY_TIPUS`] = ""
    codes[`${prefix}_OKMANY_SZAM`] = ""
    codes[`${prefix}_ALLAMPOLGARSAG`] = ""
    codes[`${prefix}_ARANY`] = ""
    codes[`${prefix}_TIPUS`] = ""
    codes[`${prefix}_CEG_NEV`] = ""
    codes[`${prefix}_CEG_ROVID`] = ""
    codes[`${prefix}_CEG_SZEKHELY`] = ""
    codes[`${prefix}_CEG_CEGJSZ`] = ""
    codes[`${prefix}_CEG_FOTEV`] = ""
    codes[`${prefix}_CEG_KEPVISELO`] = ""
    codes[`${prefix}_CEG_KEPV_BEOSZTAS`] = ""
    return codes
  }

  codes[`${prefix}_ARANY`] = String(owner.ownershipPercent || "")
  codes[`${prefix}_TIPUS`] = owner.type === "natural" ? "természetes személy" : "jogi személy"

  if (owner.type === "natural" && owner.natural) {
    const n = owner.natural
    codes[`${prefix}_NEV`] = n.fullName || ""
    codes[`${prefix}_SZUL_NEV`] = n.birthName || ""
    codes[`${prefix}_SZUL_HELY`] = n.birthPlace || ""
    codes[`${prefix}_SZUL_DATUM`] = formatDate(n.birthDate)
    codes[`${prefix}_ANYJA_NEVE`] = n.motherName || ""
    codes[`${prefix}_LAKCIM`] = n.address || ""
    codes[`${prefix}_OKMANY_TIPUS`] = ID_TYPE_LABELS[n.idType] || n.idType || ""
    codes[`${prefix}_OKMANY_SZAM`] = n.idNumber || ""
    codes[`${prefix}_ALLAMPOLGARSAG`] = n.nationality || ""
    // Clear legal entity fields
    codes[`${prefix}_CEG_NEV`] = ""
    codes[`${prefix}_CEG_ROVID`] = ""
    codes[`${prefix}_CEG_SZEKHELY`] = ""
    codes[`${prefix}_CEG_CEGJSZ`] = ""
    codes[`${prefix}_CEG_FOTEV`] = ""
    codes[`${prefix}_CEG_KEPVISELO`] = ""
    codes[`${prefix}_CEG_KEPV_BEOSZTAS`] = ""
  } else if (owner.type === "legal" && owner.legal) {
    const l = owner.legal
    codes[`${prefix}_CEG_NEV`] = l.companyName || ""
    codes[`${prefix}_CEG_ROVID`] = l.shortName || ""
    codes[`${prefix}_CEG_SZEKHELY`] = l.address || ""
    codes[`${prefix}_CEG_CEGJSZ`] = l.registrationNumber || ""
    codes[`${prefix}_CEG_FOTEV`] = l.mainActivity || ""
    codes[`${prefix}_CEG_KEPVISELO`] = l.representativeName || ""
    codes[`${prefix}_CEG_KEPV_BEOSZTAS`] = l.representativePosition || ""
    // Clear natural person fields
    codes[`${prefix}_NEV`] = ""
    codes[`${prefix}_SZUL_NEV`] = ""
    codes[`${prefix}_SZUL_HELY`] = ""
    codes[`${prefix}_SZUL_DATUM`] = ""
    codes[`${prefix}_ANYJA_NEVE`] = ""
    codes[`${prefix}_LAKCIM`] = ""
    codes[`${prefix}_OKMANY_TIPUS`] = ""
    codes[`${prefix}_OKMANY_SZAM`] = ""
    codes[`${prefix}_ALLAMPOLGARSAG`] = ""
  }

  return codes
}

/**
 * Main function: Map ContractData to shortcode values
 * Returns a Record<string, string> where keys are shortcode names (without braces)
 * and values are the actual data to replace
 */
export function mapContractToShortcodes(contract: ContractData, contractId?: string): Record<string, string> {
  const now = new Date()
  const codes: Record<string, string> = {}

  // === Company data ===
  codes["CEG_NEV"] = contract.company.name || ""
  codes["CEG_ROVID_NEV"] = contract.company.shortName || ""
  codes["CEG_FORMA"] = LEGAL_FORM_LABELS[contract.company.legalForm] || contract.company.legalForm || ""
  codes["CEGJEGYZEKSZAM"] = contract.company.registrationNumber || ""
  codes["ADOSZAM"] = contract.company.taxNumber || ""
  codes["FOTEV"] = contract.company.mainActivity || ""
  codes["SZEKHELY"] = contract.company.currentAddress || "Budapest, 1064 Izabella u. 68/b"

  // === Owner data (up to 3 owners) ===
  for (let i = 1; i <= 3; i++) {
    const ownerCodes = getOwnerShortcodes(contract.owners[i - 1], i)
    Object.assign(codes, ownerCodes)
  }
  codes["TULAJDONOS_SZAM"] = String(contract.owners.length)

  // === Representative data ===
  const rep = contract.representative
  codes["KEPVISELO_NEV"] = rep.fullName || ""
  codes["KEPVISELO_SZUL_NEV"] = rep.birthName || ""
  codes["KEPVISELO_SZUL_HELY"] = rep.birthPlace || ""
  codes["KEPVISELO_SZUL_DATUM"] = formatDate(rep.birthDate)
  codes["KEPVISELO_ANYJA_NEVE"] = rep.motherName || ""
  codes["KEPVISELO_LAKCIM"] = rep.address || ""
  codes["KEPVISELO_OKMANY_TIPUS"] = ID_TYPE_LABELS[rep.idType] || rep.idType || ""
  codes["KEPVISELO_OKMANY_SZAM"] = rep.idNumber || ""
  codes["KEPVISELO_BEOSZTAS"] = rep.position || ""
  codes["KEPVISELO_ALLAMPOLGARSAG"] = rep.nationality || ""

  // === Contact data ===
  const contact = contract.contact
  if (contact.isSameAsOwner && contract.owners[0]?.natural) {
    codes["KAPCSOLAT_NEV"] = contract.owners[0].natural.fullName || ""
    codes["KAPCSOLAT_CIM"] = contract.owners[0].natural.address || ""
  } else {
    codes["KAPCSOLAT_NEV"] = contact.fullName || ""
    codes["KAPCSOLAT_CIM"] = contact.address || ""
  }
  codes["KAPCSOLAT_EMAIL"] = contact.email || ""
  codes["KAPCSOLAT_TELEFON"] = contact.phone || ""

  // === PEP declaration ===
  const pep = contract.pepDeclaration
  const isPep = pep.isPep || pep.isPepRelative || pep.isPepAssociate
  codes["PEP_STATUS"] = isPep ? "Igen" : "Nem"
  codes["PEP_RESZLETEK"] = pep.pepDetails || ""
  codes["PEP_NYILATKOZAT"] = isPep ? "minősül" : "nem minősül"

  // === Service data ===
  codes["SZOLGALTATAS_TIPUS"] = SERVICE_TYPE_LABELS[contract.serviceType] || contract.serviceType || ""
  codes["CSOMAG_NEV"] = contract.packageId || ""
  codes["HAVI_DIJ"] = formatPrice(contract.monthlyPrice || 0)
  codes["EVES_DIJ"] = formatPrice(contract.annualPrice || 0)

  // === Business data ===
  codes["KOCKAZAT_SZINT"] = "Átlagos" // Default - can be overridden by admin
  codes["TELJESITES_HELY"] = "Budapest, 1064 Izabella u. 68/b"
  codes["UZLETI_CEL"] = "Székhely biztosítása határozatlan időtartamra, küldemények átvétele és az ügyfél értesítése"

  // === Dates ===
  codes["DATUM"] = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, "0")}.${String(now.getDate()).padStart(2, "0")}.`
  codes["DATUM_SZO"] = formatDateText(now.toISOString())
  codes["EV"] = String(now.getFullYear())

  // === Meta ===
  codes["SZERZODES_ID"] = contractId || contract.id || ""
  codes["KEZBESITESI_CIM"] = "Budapest, 1064 Izabella u. 68/b"

  return codes
}

/**
 * Replace all shortcodes in a text with their values
 * Handles both {CODE} and {{CODE}} formats
 */
export function replaceShortcodes(text: string, codes: Record<string, string>): string {
  let result = text

  for (const [key, value] of Object.entries(codes)) {
    // Replace {CODE} format
    result = result.replace(new RegExp(`\\{${key}\\}`, "g"), value)
    // Replace {{CODE}} format (legacy)
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), value)
  }

  return result
}

/**
 * Get all available shortcode keys
 */
export function getAllShortcodeKeys(): string[] {
  const dummyContract: ContractData = {
    status: "draft",
    language: "hu",
    serviceType: "szekhely-hu",
    packageId: "",
    monthlyPrice: 0,
    annualPrice: 0,
    company: {
      isNew: true,
      name: "",
      shortName: "",
      legalForm: "kft",
      mainActivity: "",
    },
    owners: [{ type: "natural", ownershipPercent: 100 }],
    representative: {
      fullName: "",
      birthName: "",
      nationality: "",
      birthPlace: "",
      birthDate: "",
      motherName: "",
      address: "",
      idType: "personal_id",
      idNumber: "",
      isForeign: false,
      position: "",
    },
    contact: {
      isSameAsOwner: true,
      fullName: "",
      email: "",
      emailConfirm: "",
      phone: "",
    },
    pepDeclaration: {
      isPep: false,
      isPepRelative: false,
      isPepAssociate: false,
    },
    uploadedDocuments: {},
    generatedDocuments: {},
  }

  return Object.keys(mapContractToShortcodes(dummyContract))
}

export type ShortcodeMap = Record<string, string>
