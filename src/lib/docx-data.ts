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
  serviceType?: string;
  monthlyPrice?: number;
  company?: { name?: string; legalForm?: string; registrationNumber?: string; taxNumber?: string; isNew?: boolean };
  owners?: { type?: string; ownershipPercent?: number; natural?: Person; pep?: PepDeclarationInput }[];
  representative?: Person;
  contact?: { isSameAsOwner?: boolean; address?: string };
  representativePep?: PepDeclarationInput;
  pepDeclaration?: PepDeclarationInput;
};

export type DocxDataHelpers = {
  /** The name of a nationality by the value of the wizard's select ("nemet" gives "Német"); an unknown value is returned as it is. */
  nationalityLabel: (value: string) => string;
  /** The English name of a nationality ("nemet" gives "German"); without it the Hungarian name is used. */
  nationalityLabelEn?: (value: string) => string;
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

/** The name of the service provider as the company register has it (legal review 2026-11-26, msg 3896); "E-Marketplace Kft." is only a short form of the code. */
export const PROVIDER_NAME = "E-Marketplace Szolgáltató Kft.";

/** The packages of the price list by their package id (src/lib/pricing-data.ts), and the ids of the price cards (documents of pricingCards) they come from. */
const PACKAGE_IDS = [
  "szekhely-hu", "szekhely-kulfoldi", "kezbesitesi", "szerzodeses-irodaberles", "szekhely-kezbesitesi-hu", "szekhely-kezbesitesi-kulfoldi",
  "iroda-hu", "iroda-kulfoldi", "iroda-kezbesitesi-hu", "iroda-kezbesitesi-kulfoldi",
];
const CARD_IDS: Record<string, string> = {
  "basic-hu": "szekhely-hu", "basic-foreign": "szekhely-kulfoldi", "basic-delivery-agent": "kezbesitesi", "basic-virtual-office": "szerzodeses-irodaberles",
  "bundle-hu": "szekhely-kezbesitesi-hu", "bundle-foreign": "szekhely-kezbesitesi-kulfoldi",
  "office-hu": "iroda-hu", "office-foreign": "iroda-kulfoldi", "full-hu": "iroda-kezbesitesi-hu", "full-foreign": "iroda-kezbesitesi-kulfoldi",
};

/**
 * The package id in its one canonical form, or null when it is not a package of the price list. The wizard stores the package id of the price card, and
 * when a card has no `packageId` field it stores the id of the card document ("bundle-hu"): both forms are known. The service type is looked at only when
 * the contract has no package id at all: the wizard derives it from the card ids, so for a canonical package id it is the fallback "szekhely-hu", never a
 * reason to trust it over the package id.
 */
export function canonicalPackageId(packageId: string | undefined, serviceType?: string | undefined): string | null {
  const own = (packageId || "").trim();
  const candidate = own || (serviceType || "").trim();
  if (PACKAGE_IDS.includes(candidate)) return candidate;
  return CARD_IDS[candidate] || null;
}

/**
 * Which documents a package needs: the seat contract (all but the delivery-only package) and the delivery agent contract (the packages with delivery).
 * `known` is false when the package cannot be recognised: the pages stop then (docxContractProblem) instead of treating it as "seat only" in silence.
 */
export function packageDocuments(packageId: string | undefined, serviceType?: string | undefined): { seat: boolean; delivery: boolean; known: boolean } {
  const id = canonicalPackageId(packageId, serviceType);
  if (id === null) return { seat: true, delivery: false, known: false };
  return { seat: id !== "kezbesitesi", delivery: id.includes("kezbesitesi"), known: true };
}

/**
 * Why the documents cannot be made from this contract (a text for the admin), or null when they can. The text of the contracts depends on two facts that
 * must not be guessed: whether the company is new (in formation) or existing, and which package it has.
 */
export function docxContractProblem(contract: DocxContractInput): string | null {
  if (typeof contract.company?.isNew !== "boolean") {
    return "A beadványban nincs megadva, hogy a cég új (alakuló) vagy már meglévő. A szerződések szövege ettől függ, ezért a letöltés megállt. Add meg a beadvány Cég blokkjában (ceruza ikon, „Új (alakuló) cég?”), és próbáld újra.";
  }
  if (!packageDocuments(contract.packageId, contract.serviceType).known) {
    return `A csomag nem ismerhető fel (csomagazonosító: "${contract.packageId || ""}", szolgáltatástípus: "${contract.serviceType || ""}"). A szerződések szövege a csomagtól függ, ezért a letöltés megállt.`;
  }
  const hianyzik = pepMissingDeclarants(contract);
  if (hianyzik.length > 0) {
    const kik = hianyzik.map(pepDeclarantLabel).join(", ");
    return `A beadványban ${kik} nincs megadva a kiemelt közszereplői (PEP) nyilatkozat mindhárom válasza. A nyilatkozat szövege ettől függ, és meg nem adott válaszból nem szabad „nem minősül kiemelt közszereplőnek” iratot készíteni, ezért a letöltés megállt. Kérd be a hiányzó választ az ügyféltől.`;
  }
  return null;
}

/** The unnumbered "TULAJDONOS_*" keys that describe the contract and not one owner (the number of the owners): ownerDataAliases leaves them as they are. */
const OWNER_KEYS_NOT_PER_OWNER = ["TULAJDONOS_SZAM"];

/**
 * The data of one owner under the tags without a number: {TULAJDONOS_NEV} for the name of owner n, {TULAJDONOS_SZUL_HELY_IDO}, ... A template with the role
 * "kyc" or "pep" uses them and is filled once per owner, so it serves any number of owners. Every key "TULAJDONOS_<n>_<REST>" becomes "TULAJDONOS_<REST>"; the
 * other keys are kept. The unnumbered per-owner keys that the old builder of the page gave for the first owner are first EMPTIED and then filled with this
 * owner's values only: a value this owner has no numbered key for (the old builder numbers some of them only up to the third owner) stays empty and never
 * shows the first owner's data under another owner's name.
 */
export function ownerDataAliases(data: Record<string, string>, ownerNumber: number): Record<string, string> {
  const prefix = `TULAJDONOS_${ownerNumber}_`;
  const result: Record<string, string> = { ...data };
  for (const key of Object.keys(result)) {
    if (key.startsWith("TULAJDONOS_") && !/^TULAJDONOS_\d/.test(key) && !OWNER_KEYS_NOT_PER_OWNER.includes(key)) result[key] = "";
  }
  for (const [key, value] of Object.entries(data)) {
    if (key.startsWith(prefix)) result[`TULAJDONOS_${key.slice(prefix.length)}`] = value;
  }
  return result;
}

/** The smallest share that makes a member a beneficial owner (Pmt. 3. § 38. a): 25 per cent. */
export const PEP_MIN_SHARE = 25;

export const NO_BENEFICIAL_OWNER_WARNING =
  "Nincs 25%-os tulajdonos: a vezető tisztségviselő a tényleges tulajdonos, a PEP-nyilatkozatot és az adatlap II./2. rovatát rá kell kitölteni. Ezt a generátor nem kezeli.";

/** The share of a member as a number between 0 and 100, or null when it is missing or not a number (a string such as "40" or "40%" is read). */
function shareOf(value: unknown): number | null {
  let share: number | null = null;
  if (typeof value === "number") share = value;
  else if (typeof value === "string" && /^\s*\d+([.,]\d+)?\s*%?\s*$/.test(value)) share = parseFloat(value.replace(",", "."));
  return share !== null && Number.isFinite(share) && share >= 0 && share <= 100 ? share : null;
}

/**
 * Meddig követjük a tulajdonosi láncot. A gazda döntése (2026-11-28): a HARMADIK cég után már
 * nem kérdezünk tovább szintet, hanem megnevezteti a tényleges tulajdonost. Ez jobb, mint
 * visszaesni a vezető tisztségviselőre: ott valaki kimondja, ki az, itt csak közelítenénk.
 */
export const MAX_OWNER_CHAIN_DEPTH = 3;

/**
 * A tulajdonosi lánc egy eleme: egy jogi személy tag MÖGÖTT álló tulajdonos.
 *
 * A köztes szintekhez szándékosan kevés adat kell (név, arány, típus). Teljes személyes adat
 * csak attól kell, akiből végül tényleges tulajdonos lesz - ez a felismerés teszi az űrlapot
 * elviselhetővé.
 */
export type ChainOwner = {
  type?: string;
  pep?: PepDeclarationInput;
  ownershipPercent?: unknown;
  name?: string;
  /** Szabályozott piacon jegyzett társaság: a Pmt. nem kívánja a láncot tovább követni. */
  listed?: boolean;
  /** A következő szint. Csak jogi személynél van értelme. */
  owners?: ChainOwner[];
};

/**
 * Egy ág, ahol a feltárás NEM ért véget. A jogi átnézés (2026-11-28) szerint ez nem eredmény,
 * hanem nyitott tétel: a tényleges tulajdonos ilyenkor nem "hiányzik", hanem ISMERETLEN, ezért
 * a Pmt. 3. § 38. f) pontja (vezető tisztségviselő) NEM alkalmazható rá.
 */
export type UnresolvedBranch = {
  path: string;
  reason: "jegyzett-anyaceg" | "harmadik-ceg-utan" | "lanc-hianyzik";
};

/** Egy azonosított tényleges tulajdonos, a láncon átszámolt aránnyal. */
export type BeneficialOwner = {
  /** Emberi szóval, honnan jön: "2. tulajdonos -> Anya Kft. -> Kovács János". */
  path: string;
  name: string;
  /** A százalékok szorzata a láncon. `null`, ha valahol hiányzott az arány. */
  effectiveShare: number | null;
  /** Igaz, ha nem közvetlen tag, hanem a láncon keresztül jutottunk el hozzá. */
  indirect: boolean;
  /** Melyik KÖZVETLEN tag ága alatt találtuk (1-től). Ez címzi meg a beadványban a helyét. */
  ownerNumber: number;
  /** Az út a lánc elemeihez, indexekkel: `owners[ownerNumber-1].legal.owners[i].owners[j]...`.
   *  Közvetlen tagnál üres. Ezen keresztül írható vissza a PEP-válasza. */
  indexPath: number[];
};

/**
 * Egy lépés a láncon lefelé, a Ptk. 8:2. § (4) szerint.
 *
 * Szó szerint (net.jogtar.hu PDF, 2026-11-28-án letöltve és pdftotext-tel olvasva):
 * "A közvetett befolyás mértéke a köztes jogi személy befolyásának olyan hányada, amilyen mértékű
 * befolyással a befolyással rendelkező a köztes jogi személyben rendelkezik. Ha a befolyással
 * rendelkező a szavazatok felét meghaladó mértékű befolyással rendelkezik a köztes jogi
 * személyben, akkor a köztes jogi személynek a jogi személyben fennálló befolyását TELJES
 * EGÉSZÉBEN a befolyással rendelkező közvetett befolyásaként kell figyelembe venni."
 *
 * ⚠ Tehát NEM puszta szorzás. Példa: A birtokolja B 60%-át, B az ügyfél 30%-át. Szorzással 18%
 * jönne ki (nem tényleges tulajdonos), a törvény szerint viszont 30% (tényleges tulajdonos) -
 * a két olvasat MÁS embert nevez meg az aláírandó nyilatkozaton.
 *
 * @param koztesBefolyas a köztes jogi személy befolyása a vizsgált jogi személyben
 * @param reszesedes a befolyással rendelkező részesedése a KÖZTES jogi személyben
 */
function indirectInfluence(koztesBefolyas: number | null, reszesedes: number | null): number | null {
  if (koztesBefolyas === null || reszesedes === null) return null;
  if (reszesedes > 50) return koztesBefolyas;
  return Math.round(((koztesBefolyas * reszesedes) / 100) * 1e6) / 1e6;
}

/**
 * KIK a tényleges tulajdonosok, a közvetett tulajdonlást is követve.
 *
 * A Pmt. szerint tényleges tulajdonos az a természetes személy, aki - közvetlenül VAGY a
 * tulajdonosi láncon keresztül - végül eléri a 25%-ot. Az effektív arány a láncon lévő
 * százalékok szorzata: 100% x 30% = 30%, tehát tényleges tulajdonos; 100% x 20% = 20%, tehát nem.
 *
 * Amit a függvény NEM dönt el, csak megjegyzésben jelez (mert gépből nem állapítható meg):
 * a 25% alatti meghatározó befolyás, és a hiányzó láncadat.
 *
 * ⚠ A `unresolved` ágakat a hívónak KÖTELEZŐ figyelembe vennie: ha van ilyen, a tényleges
 * tulajdonos nem "hiányzik", hanem ismeretlen, ezért a Pmt. 3. § 38. f) pontja (vezető
 * tisztségviselő) nem alkalmazható. Üres `beneficialOwners` + üres `unresolved` az egyetlen
 * eset, amikor tényleg nincs 25%-os természetes személy, és az ügyvezető lép a helyére.
 *
 * ⚠ ISMERT HIÁNY: a Ptk. 8:2. § (5) szerint "a közeli hozzátartozók közvetlen és közvetett
 * tulajdoni részesedését vagy szavazati jogát egybe kell számítani". Ezt a függvény NEM teszi
 * meg, mert az űrlap nem kérdez rokoni kapcsolatot. Két testvér 15-15%-a a törvény szerint
 * együtt 30%, nálunk viszont külön-külön 15% marad, és egyikük sem lesz tényleges tulajdonos.
 * Ezt az átvilágításnál kézzel kell észrevenni, amíg az adat nincs bekérve. A megjegyzés figyelmeztetés,
 * sosem megállítás - ahogy a `pepOwnersOf`-nál is.
 */
export function beneficialOwnersOf(
  owners: { type?: string; ownershipPercent?: unknown; natural?: { fullName?: string }; legal?: { companyName?: string; listed?: boolean; owners?: ChainOwner[] } }[] | undefined,
): { beneficialOwners: BeneficialOwner[]; notes: string[]; unresolved: UnresolvedBranch[] } {
  const notes: string[] = [];
  const talalt: BeneficialOwner[] = [];
  const unresolved: UnresolvedBranch[] = [];

  // `sajatBefolyas` MÁR a csomópont befolyása az ügyfélcégben - a hívó számolta ki a Ptk. 8:2. §
  // (4) szerint. Így a törvényi lépés egy helyen van, és a gyökér (közvetlen tag) nem esik a
  // "felét meghaladó" szabály alá, hiszen ott nincs köztes jogi személy.
  const bejar = (
    csomopont: ChainOwner,
    sajatBefolyas: number | null,
    ut: string,
    cegekSzama: number,
    ownerNumber: number,
    indexPath: number[],
  ): void => {
    const nev = (csomopont.name || "").trim();
    const sajatUt = `${ut} -> ${nev || "(névtelen)"}`;

    if (csomopont.type !== "legal") {
      if (!nev) notes.push(`${ut}: a lánc egyik természetes személyének nincs megadva a neve, ezért nem azonosítható.`);
      talalt.push({ path: sajatUt, name: nev, effectiveShare: sajatBefolyas, indirect: true, ownerNumber, indexPath });
      return;
    }
    if (csomopont.listed) {
      // A jogi átnézés (2026-11-28, 2. pont): a Pmt. 3. § 38. a) pontjának kivétele a jegyzett
      // ÜGYFÉLRE szól, nem a láncban lévő köztes anyacégre - erre a Pmt. szövegében nincs
      // kivétel. A gazda döntése (tg 5380) szerint itt megállunk, de FIGYELMEZTETÉSSEL, és az
      // ág nyitva marad: a részvényeseket a nyilvános bejelentésekből kell ellenőrizni.
      unresolved.push({ path: sajatUt, reason: "jegyzett-anyaceg" });
      notes.push(`${sajatUt}: jegyzett anyacég - a 25%-ot elérő részvényesei a nyilvános részesedés-bejelentésekből ellenőrizendők. Az ág NYITOTT: a tényleges tulajdonos itt nem azonosított.`);
      return;
    }
    if (cegekSzama >= MAX_OWNER_CHAIN_DEPTH) {
      // A jogi átnézés (2026-11-28, 3. pont): a Pmt. 9. § (1), (1a) a teljes szerkezet feltárását
      // kéri, mélységi korlát nélkül. A három cég maradhat gyakorlati korlátnak, de az eredmény
      // NYITOTT, nem kész - és a vezető tisztségviselő nem léphet a helyére.
      unresolved.push({ path: sajatUt, reason: "harmadik-ceg-utan" });
      notes.push(`${sajatUt}: a lánc ${MAX_OWNER_CHAIN_DEPTH} cégnél mélyebb, itt megálltunk. Az ág NYITOTT: a tényleges tulajdonost az ügyfél képviselőjének kell megneveznie (Pmt. 9. § (1b), (1c)), és ezt rögzíteni kell. A vezető tisztségviselő NEM léphet a helyére.`);
      return;
    }
    const gyerekek = csomopont.owners || [];
    if (gyerekek.length === 0) {
      unresolved.push({ path: sajatUt, reason: "lanc-hianyzik" });
      notes.push(`${sajatUt}: jogi személy tulajdonos, de a mögötte álló tulajdonosok nincsenek megadva. Az ág NYITOTT: a tényleges tulajdonos a lánc mögötti természetes személy, ezt az átvilágításnál kell tisztázni. A vezető tisztségviselő NEM léphet a helyére.`);
      return;
    }
    gyerekek.forEach((gyerek, i) => {
      bejar(
        gyerek,
        indirectInfluence(sajatBefolyas, shareOf(gyerek.ownershipPercent)),
        sajatUt,
        cegekSzama + 1,
        ownerNumber,
        [...indexPath, i],
      );
    });
  };

  (owners || []).forEach((owner, index) => {
    const szam = index + 1;
    const gyoker = `${szam}. tulajdonos`;
    const arany = shareOf(owner.ownershipPercent);
    if (owner.type !== "legal") {
      talalt.push({ path: gyoker, name: (owner.natural?.fullName || "").trim(), effectiveShare: arany, indirect: false, ownerNumber: szam, indexPath: [] });
      return;
    }
    // A közvetlen tag befolyása a saját részesedése: itt még nincs köztes jogi személy, tehát a
    // Ptk. 8:2. § (4) "felét meghaladó" szabálya nem alkalmazható rá.
    bejar(
      { type: "legal", ownershipPercent: owner.ownershipPercent, name: owner.legal?.companyName, listed: owner.legal?.listed, owners: owner.legal?.owners },
      arany,
      gyoker,
      0,
      szam,
      [],
    );
  });

  // Ugyanaz a személy több ágon is megjelenhet: a Pmt. szerint az arányai ÖSSZEADÓDNAK. A
  // névegyezés viszont nem azonosság (két Kovács János nem ugyanaz), ezért ahol tényleg
  // összevontunk, arról szólunk, hogy ember nézze meg.
  const csoportok = new Map<string, BeneficialOwner[]>();
  for (const b of talalt) {
    // A KÖZVETLEN tagot a sorszáma azonosítja, nem a neve: ő külön, teljes adatú bejegyzés a
    // beadványban (születési adat, okmány), tehát két azonos nevű közvetlen tag két ember.
    // Összevonni csak a LÁNC elemeit vonjuk össze, ahol a néven kívül nincs más fogódzó.
    // Következmény, amit vállalunk: ha ugyanaz az ember közvetlen tag ÉS a láncon is szerepel,
    // a két aránya nem adódik össze. Ezt a jegyzetek és az ügyintéző veszi észre.
    const kulcs = b.indirect ? b.name.toLowerCase().replace(/\s+/g, " ") : `kozvetlen#${b.ownerNumber}`;
    csoportok.set(kulcs, [...(csoportok.get(kulcs) || []), b]);
  }
  const osszevont: BeneficialOwner[] = [];
  for (const [, tagok] of csoportok) {
    if (tagok.length === 1) {
      osszevont.push(tagok[0]);
      continue;
    }
    const ismeretlen = tagok.some((t) => t.effectiveShare === null);
    const osszeg = ismeretlen ? null : tagok.reduce((sum, t) => sum + (t.effectiveShare || 0), 0);
    notes.push(`"${tagok[0].name}" több ágon is szerepel (${tagok.map((t) => t.path).join("; ")}), ezért az arányaikat összeadtuk${osszeg === null ? "" : ` (${osszeg}%)`}. Ellenőrizd, hogy tényleg ugyanarról a személyről van-e szó.`);
    // Az ÖSSZEVONT személy válaszát az ELSŐ előfordulás helyén tároljuk: egy ember egyszer
    // nyilatkozik, akárhány ágon szerepel.
    osszevont.push({
      path: tagok.map((t) => t.path).join(" + "),
      name: tagok[0].name,
      effectiveShare: osszeg,
      indirect: tagok.some((t) => t.indirect),
      ownerNumber: tagok[0].ownerNumber,
      indexPath: tagok[0].indexPath,
    });
  }

  const beneficialOwners = osszevont.filter((b) => b.effectiveShare === null || b.effectiveShare >= PEP_MIN_SHARE);
  for (const b of osszevont) {
    if (b.effectiveShare !== null && b.effectiveShare < PEP_MIN_SHARE) {
      notes.push(`${b.path}: effektív aránya ${String(b.effectiveShare).replace(".", ",")}%, tehát nem tényleges tulajdonos. Ha mégis meghatározó befolyása van, kézzel kell felvenni.`);
    }
    if (b.effectiveShare === null) {
      notes.push(`${b.path}: az effektív arány nem számolható ki, mert a láncon valahol hiányzik a tulajdoni arány. A nyilatkozat elkészül hozzá, ellenőrizd.`);
    }
  }
  return { beneficialOwners, notes, unresolved };
}

/**
 * Who gets a declaration of public figure status (legal review 2026-11-26, msg 3933, owner message 3936): the BENEFICIAL owners, that is the members with
 * 25 per cent or more, not every member (the data sheet stays per member). `numbers` are the owner numbers (from 1); `notes` are what the admin should
 * be told, as a warning and never as a stop:
 * - a member under 25 per cent gets none (and the note says so, since another way of control is not in the data);
 * - a member whose share is missing or not a number gets one (nothing is dropped on a guess), and the note says to check;
 * - a legal person among the members: the beneficial owner is the natural person behind it, by hand;
 * - nobody reaches 25 per cent (and every share is known): the managing director is the beneficial owner (Pmt. 3. § 38. f), by hand.
 */
/** A wizard PEP-lépésének három kérdése. Mindhárom "igen" ugyanazt jelenti az iratban: a tulajdonos a nyilatkozat szerint érintett. */
export type PepDeclarationInput = { isPep?: boolean; isPepRelative?: boolean; isPepAssociate?: boolean };

/**
 * A PEP-nyilatkozat sablon-feltételének értéke: üres sztring = NEM érintett, "1" = érintett.
 *
 * A sablon `{^TULAJDONOS_PEP}` ága a "nem minősül kiemelt közszereplőnek" mondatot írja ki, a `{#TULAJDONOS_PEP}` ága a másikat.
 * A docxtemplater az üres sztringet hamisnak veszi, ezért elég sztringet adni: a `buildDocxData` amúgy is csak sztringeket ad.
 *
 * ⚠ Hiányzó nyilatkozat esetén üreset ad, tehát az irat a "nem minősül" mondatot írja ki. A wizardban a három érték mindig
 * ki van töltve (alapértelmezésben hamis), de ha egy beadvány mégis nyilatkozat nélkül érkezne, az irat egy olyan állítást
 * tenne, amit senki nem jelentett ki. Ezt a beadvány oldalán kell kizárni, nem itt.
 */
export function pepAnswered(declaration?: PepDeclarationInput): boolean {
  return (
    typeof declaration?.isPep === "boolean" &&
    typeof declaration?.isPepRelative === "boolean" &&
    typeof declaration?.isPepAssociate === "boolean"
  );
}

/**
 * MIÉRT a vezető tisztségviselő nyilatkozik. A kettő nem ugyanaz, és nem szabad összemosni:
 *
 * - "nincs-25-szazalekos": egyetlen tag sem éri el a 25%-ot, ezért a Pmt. 3. § 38. f) szerint
 *   TÉNYLEG a vezető tisztségviselő a tényleges tulajdonos.
 * - "jogi-szemely-tag": a tag jogi személy. Ilyenkor a tényleges tulajdonos a mögötte álló
 *   természetes személy (KÖZVETETT tulajdonlás), nem a mi ügyvezetőnk. Ezt a láncot sem ez az
 *   űrlap, sem a generátor nem követi (lásd pepOwnersOf megjegyzését), ezért az átvilágításnál
 *   kézzel kell tisztázni. Az ügyvezető nyilatkozata itt a legjobb elérhető közelítés, NEM a
 *   jogilag helyes válasz - ezt az űrlapon is ki kell írni, különben az ügyfél és az ügyintéző
 *   azt hiszi, hogy a kérdés el van intézve.
 */
export type PepRepresentativeReason = "nincs-25-szazalekos" | "jogi-szemely-tag";

/** Ki teszi a PEP-nyilatkozatot: egy tulajdonos (sorszámmal), vagy a vezető tisztségviselő. */
export type PepDeclarant =
  | { kind: "owner"; ownerNumber: number }
  /**
   * A láncon át azonosított tényleges tulajdonos. `ownerNumber` a közvetlen tag sorszáma,
   * `indexPath` az út a lánc elemei között - így a válasza oda kerül vissza, ahol ő áll.
   */
  | { kind: "chain"; ownerNumber: number; indexPath: number[]; name: string }
  | { kind: "representative"; reason: PepRepresentativeReason };

type PepContractInput = {
  owners?: {
    type?: string;
    ownershipPercent?: unknown;
    pep?: PepDeclarationInput;
    natural?: { fullName?: string };
    legal?: { companyName?: string; listed?: boolean; owners?: ChainOwner[] };
  }[];
  representativePep?: PepDeclarationInput;
  pepDeclaration?: PepDeclarationInput;
};

/**
 * KIK kötelesek PEP-nyilatkozatot tenni. Ez az EGYETLEN hely, ahol ez eldől - az űrlap,
 * az ellenőrzés és az iratgenerálás mind ezt kérdezi.
 *
 * A szabály a már jogilag átnézett `pepOwnersOf`-ból jön (2026-11-26): a legalább 25%-os
 * természetes személy tagok a tényleges tulajdonosok. Jogi személy tag kimarad, mert ő nem
 * tud nyilatkozni - a mögötte álló természetes személyt a generátor amúgy sem kezeli.
 *
 * Ha egyetlen tag sem éri el a 25%-ot, a Pmt. 3. § 38. f) szerint a VEZETŐ TISZTSÉGVISELŐ a
 * tényleges tulajdonos, tehát ő nyilatkozik. Enélkül egy ilyen cégnél az űrlap senkitől nem
 * kérdezne - az rosszabb lenne, mint a korábbi egyetlen nyilatkozat.
 */
export function pepDeclarantsOf(contract: PepContractInput): PepDeclarant[] {
  const owners = contract.owners || [];
  const { beneficialOwners, unresolved } = beneficialOwnersOf(owners);

  const declarants = beneficialOwners.map((b): PepDeclarant =>
    b.indirect
      ? { kind: "chain", ownerNumber: b.ownerNumber, indexPath: b.indexPath, name: b.name }
      : { kind: "owner", ownerNumber: b.ownerNumber },
  );
  if (declarants.length > 0) return declarants;

  // Senkit nem azonosítottunk. A KETTŐ NEM UGYANAZ:
  // - ha van nyitott ág, a tényleges tulajdonos ISMERETLEN, nem hiányzik. A Pmt. 3. § 38. f)
  //   csak valódi hiányra szól, tehát a vezető tisztségviselő nem léphet a helyére - ilyenkor
  //   nincs kit kérdezni, az ágat az átvilágításnál kell tisztázni (jogi átnézés 2026-11-28).
  // - ha nincs nyitott ág, akkor tényleg nincs 25%-os természetes személy, és a 38. f) szerint
  //   a vezető tisztségviselő a tényleges tulajdonos.
  if (unresolved.length > 0) {
    const jogiSzemelyTag = unresolved.some((u) => u.reason !== "harmadik-ceg-utan");
    return [{ kind: "representative", reason: jogiSzemelyTag ? "jogi-szemely-tag" : "nincs-25-szazalekos" }];
  }
  return [{ kind: "representative", reason: "nincs-25-szazalekos" }];
}

/** A lánc egy elemét címzi meg az indexek mentén. `undefined`, ha az út nem létezik. */
function chainNodeAt(contract: PepContractInput, ownerNumber: number, indexPath: number[]): ChainOwner | undefined {
  let lista = contract.owners?.[ownerNumber - 1]?.legal?.owners;
  let csomopont: ChainOwner | undefined;
  for (const i of indexPath) {
    csomopont = lista?.[i];
    if (!csomopont) return undefined;
    lista = csomopont.owners;
  }
  return csomopont;
}

/**
 * Egy nyilatkozó válasza. Elsőként a sajátja; ha nincs, a beadvány-szintű
 * (`contract.pepDeclaration`) a tartalék.
 *
 * A tartalékra a RÉGI beadványok miatt van szükség: azokban egyetlen nyilatkozat tartozott
 * az egész beadványhoz, és azokból ma is kell iratot tudni készíteni. Új beadványban
 * mindenki a sajátját kapja, mert a PEP-státusz személyenként más lehet - a ClientBoost
 * agent-API is tulajdonosonként kéri (`beneficialOwners[].isPep`).
 */
export function pepDeclarationOf(contract: PepContractInput, declarant: PepDeclarant): PepDeclarationInput | undefined {
  const sajat =
    declarant.kind === "owner"
      ? contract.owners?.[declarant.ownerNumber - 1]?.pep
      : declarant.kind === "chain"
        ? chainNodeAt(contract, declarant.ownerNumber, declarant.indexPath)?.pep
        : contract.representativePep;
  // A láncon álló személynél NINCS örökség-tartalék: a régi beadványokban lánc sem volt, tehát
  // a beadvány-szintű nyilatkozat nem szólhat róla.
  if (declarant.kind === "chain") return sajat;
  return pepAnswered(sajat) ? sajat : contract.pepDeclaration;
}

/** Azok a nyilatkozók, akiknek még nincs megválaszolt nyilatkozatuk. */
export function pepMissingDeclarants(contract: PepContractInput): PepDeclarant[] {
  return pepDeclarantsOf(contract).filter((declarant) => !pepAnswered(pepDeclarationOf(contract, declarant)));
}

/** A nyilatkozó megnevezése hibaüzenethez: "a(z) 2. tulajdonosnál" vagy "a vezető tisztségviselőnél". */
export function pepDeclarantLabel(declarant: PepDeclarant): string {
  if (declarant.kind === "owner") return `a(z) ${declarant.ownerNumber}. tulajdonosnál`;
  if (declarant.kind === "chain") return `${declarant.name || "a lánc végén álló személy"} esetében`;
  return "a vezető tisztségviselőnél";
}

export function pepFlagOf(declaration?: PepDeclarationInput): string {
  if (!declaration) return "";
  return declaration.isPep || declaration.isPepRelative || declaration.isPepAssociate ? "1" : "";
}

/**
 * Figyelmeztetés, ha az ügyfél 25% ALATTI meghatározó befolyást jelentett (Pmt. 3. § 38. b)).
 * Ilyen személyre is tényleges tulajdonosként kell PEP-nyilatkozat, de az ő adatait az űrlap ma
 * csak szövegesen gyűjti, ezért az iratot kézzel kell elkészíteni. Jogi átnézés 2026-11-28, 5. pont.
 */
export function decisiveInfluenceNote(decisiveInfluence?: { exists?: boolean; details?: string }): string | null {
  if (decisiveInfluence?.exists !== true) return null;
  const reszletek = (decisiveInfluence.details || "").trim();
  return `Az ügyfél 25% alatti MEGHATÁROZÓ BEFOLYÁST jelentett${reszletek ? `: "${reszletek}"` : ""}. Az ilyen személy a Pmt. 3. § 38. b) pontja szerint tényleges tulajdonos, tehát rá is kell PEP-nyilatkozat és átvilágítási adatlap. A generátor ezt nem készíti el - kézzel kell.`;
}

/**
 * Mit kell az ügyintézőnek tudnia a LÁNCRÓL az iratok letöltésekor.
 *
 * A gazda döntése (2026-11-28): a nyitott ág és a közvetett tulajdonos csak EGY HIÁNYZÓ
 * nyilatkozatot jelent - a többi irat ettől függetlenül elkészül. Ezért ez figyelmeztetés,
 * sosem megállítás, ahogy a `pepOwnersOf` jegyzetei is.
 *
 * Miért nem készül el a közvetett tulajdonos nyilatkozata magától: az élő PEP-sablon a NEVET
 * kéri, azt a láncból tudjuk - de a PEP-VÁLASZÁT nem, mert őt az űrlap nem kérdezte meg. Meg nem
 * adott válaszból pedig nem szabad "nem minősül kiemelt közszereplőnek" iratot készíteni.
 */
export function chainPepNotes(contract: {
  owners?: { type?: string; ownershipPercent?: unknown; natural?: { fullName?: string }; legal?: { companyName?: string; listed?: boolean; owners?: ChainOwner[] } }[];
}): string[] {
  const { beneficialOwners, unresolved } = beneficialOwnersOf(contract.owners);
  const notes: string[] = [];

  for (const b of beneficialOwners.filter((x) => x.indirect)) {
    const arany = b.effectiveShare === null ? "ismeretlen arány" : `${String(b.effectiveShare).replace(".", ",")}%`;
    notes.push(
      `${b.name || "(névtelen)"} KÖZVETETT tényleges tulajdonos (${arany}, ${b.path}). Rá is kell PEP-nyilatkozat, de a beadvány nem tartalmazza a válaszát - a nyilatkozatot kézzel kell elkészíteni. A többi irat ettől függetlenül elkészül.`,
    );
  }

  for (const u of unresolved) {
    const ok =
      u.reason === "jegyzett-anyaceg"
        ? "jegyzett anyacég: a 25%-ot elérő részvényesek a nyilvános bejelentésekből ellenőrizendők"
        : u.reason === "harmadik-ceg-utan"
          ? `a lánc ${MAX_OWNER_CHAIN_DEPTH} cégnél mélyebb, itt megálltunk`
          : "a cég mögötti tulajdonosok nincsenek rögzítve";
    notes.push(
      `${u.path}: a tényleges tulajdonos NEM azonosított (${ok}). Ezen az ágon hiányozni fog egy PEP-nyilatkozat; a vezető tisztségviselő NEM léphet a helyére. A többi irat elkészül.`,
    );
  }

  return notes;
}

export function pepOwnersOf(owners: { type?: string; ownershipPercent?: unknown }[] | undefined): { numbers: number[]; notes: string[] } {
  const list = owners || [];
  const numbers: number[] = [];
  const notes: string[] = [];
  let someShareUnknown = false;
  let someReaches = false;
  list.forEach((owner, index) => {
    const number = index + 1;
    const share = shareOf(owner.ownershipPercent);
    if (owner.type === "legal") {
      notes.push(`A(z) ${number}. tulajdonos jogi személy: a tényleges tulajdonos a mögötte álló természetes személy (közvetett tulajdon), az ő PEP-nyilatkozatát és adatlapját kézzel kell elkészíteni. Ezt a generátor nem kezeli.`);
    }
    if (share === null) {
      someShareUnknown = true;
      numbers.push(number);
      notes.push(`A(z) ${number}. tulajdonos tulajdoni aránya hiányzik vagy nem szám: a PEP-nyilatkozat elkészül hozzá, ellenőrizd, hogy 25% vagy több-e (tényleges tulajdonos).`);
    } else if (share >= PEP_MIN_SHARE) {
      someReaches = true;
      numbers.push(number);
    } else {
      notes.push(`A(z) ${number}. tulajdonos aránya ${String(share).replace(".", ",")}%: PEP-nyilatkozat nem készül hozzá (a 25% alatti tag nem tényleges tulajdonos; ha mégis meghatározó befolyása van, kézzel kell).`);
    }
  });
  if (list.length > 0 && !someReaches && !someShareUnknown) notes.push(NO_BENEFICIAL_OWNER_WARNING);
  return { numbers, notes };
}

/** A name compared as a person's name: case, spaces and the edges do not matter. */
const sameName = (a: string | undefined, b: string | undefined): boolean => {
  const plain = (s: string | undefined) => (s || "").toLowerCase().replace(/\s+/g, " ").trim();
  return plain(a) !== "" && plain(a) === plain(b);
};

export const DELIVERY_CONTRACT_WARNING =
  "Ennél a beadványnál személyenként külön kézbesítési szerződés kell (a tag nem azonos az ügyvezetővel, vagy jogi személy). A sablon ezt nem kezeli.";

/**
 * A warning (not a stop) for the delivery agent contract: the template has the representative as the Principal, but the law asks for a delivery agent for every
 * foreign natural person and every foreign legal person in the registration application (legal review 2026-11-26, msg 3896 1/e). So the contract needs one
 * agreement per person, with another Principal block, when a member is a legal person, or a natural member is not the representative (the managing director).
 * Null when the package has no delivery agent contract, or when the only member is the representative. A representative or a member whose name is missing cannot
 * be shown to be the same person, so that case warns too.
 */
export function deliveryContractWarning(contract: DocxContractInput): string | null {
  if (!packageDocuments(contract.packageId, contract.serviceType).delivery) return null;
  const owners = contract.owners || [];
  const foreignOrDifferent = owners.some((owner) => owner.type === "legal" || !sameName(owner.natural?.fullName, contract.representative?.fullName));
  return foreignOrDifferent ? DELIVERY_CONTRACT_WARNING : null;
}

/** The monthly net fees of the two contracts of a package, from the monthly price of the package. */
export function feesOf(packageId: string | undefined, monthlyPrice: number | undefined, serviceType?: string | undefined): { seatMonthly: number; deliveryMonthly: number } {
  const monthly = monthlyPrice && monthlyPrice > 0 ? monthlyPrice : 0;
  const { seat, delivery } = packageDocuments(packageId, serviceType);
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

/**
 * The label of the legal forms the wizard stores by a code, in one place (src/lib/contract-shortcode-mapper.ts uses this table too). "other" is "Egyéb" as a
 * label, but it is not a form to add to a company name (see legalFormToAdd).
 */
export const LEGAL_FORM_LABELS: Record<string, string> = {
  kft: "Kft.",
  bt: "Bt.",
  zrt: "Zrt.",
  nyrt: "Nyrt.",
  kkt: "Kkt.",
  ev: "Egyéni vállalkozó",
  other: "Egyéb",
};

/**
 * The legal form is written once, as its label (never the code of the wizard: "kft", "other"): the name of a company already ends with it
 * ("... Kft."), so the form is added only when the name lacks it. A value that is not a code of the wizard is taken as it was typed.
 */
function legalFormToAdd(name: string | undefined, legalForm: string | undefined): string {
  const code = (legalForm || "").trim();
  if (!code) return "";
  if (code.toLowerCase() === "other") return "";
  const form = Object.prototype.hasOwnProperty.call(LEGAL_FORM_LABELS, code.toLowerCase()) ? LEGAL_FORM_LABELS[code.toLowerCase()] : code;
  if (!form) return "";
  const plain = (s: string) => s.toLowerCase().replace(/[.\s]/g, "");
  const ownName = plain(name || "");
  return ownName.endsWith(plain(form)) || ownName.endsWith(plain(code)) ? "" : form;
}

function personData(prefix: string, person: Person, helpers: DocxDataHelpers): Record<string, string> {
  return {
    [`${prefix}_SZUL_NEV`]: (person.birthName || "").trim() || (person.fullName || "").trim(),
    [`${prefix}_ALLAMPOLGARSAG`]: person.nationality ? helpers.nationalityLabel(person.nationality) : "",
    [`${prefix}_ALLAMPOLGARSAG_EN`]: person.nationality ? (helpers.nationalityLabelEn || helpers.nationalityLabel)(person.nationality) : "",
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
  const fees = feesOf(contract.packageId, contract.monthlyPrice, contract.serviceType);
  const documents = packageDocuments(contract.packageId, contract.serviceType);
  const firstNatural = owners.find((o) => o.type !== "legal")?.natural;

  const data: Record<string, string> = {
    // the two conditions of the sections of the contracts (a value is "1" or "": docxtemplater {#UJ_CEG}...{/UJ_CEG} and {^UJ_CEG}...{/UJ_CEG}): the
    // company is new (in formation), the package has the delivery agent mandate. The pages stop before this when either is not known (docxContractProblem).
    UJ_CEG: company.isNew === true ? "1" : "",
    KEZBESITESI_CSOMAG: documents.delivery ? "1" : "",
    SZOLGALTATO_NEV: PROVIDER_NAME,
    // the address of the seat (the old code carried the address of the former one)
    SZEKHELY: OFFICE_ADDRESS,
    KEZBESITESI_CIM: OFFICE_ADDRESS,
    TELJESITES_HELY: OFFICE_ADDRESS,
    // the legal form once ("... Kft. kft" before)
    CEG_FORMA: legalFormToAdd(company.name, company.legalForm),
    // the whole name of the company with its legal form once: what the new templates print where the document names the company
    CEG_TELJES_NEV: [(company.name || "").trim(), legalFormToAdd(company.name, company.legalForm)].filter(Boolean).join(" "),
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
    // A nevet és a lakcímet a personData nem adja (a tulajdonosoknál is külön sor állítja be).
    // Eddig ezt a kettőt CSAK az admin oldal régi, {{...}} alakú térképe töltötte ki, amit a
    // docxDataOf fűz a buildDocxData elé - ha az kikerül, az "Alulírott, ... (eljáró személy)"
    // minden PEP-nyilatkozatról eltűnne. Ezért itt is megadjuk.
    KEPVISELO_NEV: (representative.fullName || "").trim(),
    KEPVISELO_LAKCIM: (representative.address || "").trim(),
    ...personData("KEPVISELO", representative, helpers),
  };

  // every owner, however many there are (the wizard does not limit them; the old builder of the page stops at three): at least three, so the first three are
  // always defined even when empty. The name, the address and the share are given here for every owner as the old builder gives them for the first three
  // (a legal owner has no person data), so a template with the role "kyc" or "pep" (ownerDataAliases) works for the fourth owner and the tenth.
  // A beadvany ma EGY PEP-nyilatkozatot tarol (ContractData.pepDeclaration), a nyilatkozat viszont tulajdonosonkent keszul,
  // ezert minden tulajdonos ugyanazt az erteket kapja. Ha a wizard egyszer tulajdonosonkent kerdez, csak ez a sor valtozik.
  for (let index = 0; index < Math.max(3, owners.length); index++) {
    const owner = owners[index];
    const prefix = `TULAJDONOS_${index + 1}`;
    const natural = owner && owner.type !== "legal" ? owner.natural : undefined;
    Object.assign(data, natural ? personData(prefix, natural, helpers) : personData(prefix, {}, helpers));
    data[`${prefix}_NEV`] = (natural?.fullName || "").trim();
    data[`${prefix}_LAKCIM`] = (natural?.address || "").trim();
    data[`${prefix}_ARANY`] = owner ? String(owner.ownershipPercent || 0) : "";
    data[`${prefix}_PEP`] = pepFlagOf(pepDeclarationOf(contract, { kind: "owner", ownerNumber: index + 1 }));
  }
  return data;
}
