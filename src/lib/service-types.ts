// Melyik szolgáltatást vette meg az ügyfél, és hogy hívjuk azt emberi szóval.
// Egy helyen, mert eddig négy külön táblában élt, két hibával:
//
//   1. A wizard a `serviceType`-ot a `PACKAGE_TO_SERVICE` táblából vette, ami az
//      ár-kártyák DOKUMENTUM-AZONOSÍTÓIVAL van kulcsozva ("basic-hu", "office-hu"),
//      a keresés viszont a kártya `packageId` MEZŐJÉVEL történt, ami kanonikus
//      ("szekhely-hu", "iroda-hu"). A két készlet metszete üres, tehát a keresés
//      MINDIG elvétett, és minden beküldés `serviceType: "szekhely-hu"` lett -
//      akkor is, ha az ügyfél csak kézbesítési megbízottat vagy teljes iroda
//      csomagot vett. Mérve a `pricingCards` mindhárom tíz kártyáján (2026-11-26).
//   2. A functions három, egymással egyező táblája egy korábbi, német piacra
//      szánt termékből maradt ("szekhely-de", "virtual-de"), a tíz valódi
//      szolgáltatás közül egyet ismert. Ami nem volt benne, nyers azonosítóként
//      ment ki az ügyfélnek és az adminnak szóló e-mailbe.
//
// A labelek az ügyfélnek kimenő iratokba és levelekbe kerülnek, ezért a lista
// teljes: mind a tíz szolgáltatástípus benne van. A functions (külön csomag, nem
// importálhat innen) saját példányt tart, és a tests/service-types.test.mjs
// tartja egyenlőként a kettőt - ugyanaz a minta, mint a DOCKEYS-nál.

// Only erasable TypeScript syntax is used here (no enums, no namespaces), so the tests can load this file with `node --test` as it is.

/** A tíz szolgáltatástípus kanonikus azonosítója, ahogy a `contracts` sorban áll. */
export const SERVICE_TYPES = [
  "szekhely-hu",
  "szekhely-kulfoldi",
  "kezbesitesi",
  "szerzodeses-irodaberles",
  "szekhely-kezbesitesi-hu",
  "szekhely-kezbesitesi-kulfoldi",
  "iroda-hu",
  "iroda-kulfoldi",
  "iroda-kezbesitesi-hu",
  "iroda-kezbesitesi-kulfoldi",
];

/** A szolgáltatás megnevezése emberi szóval. Ez megy az iratokba és a levelekbe. */
export const SERVICE_TYPE_LABELS: Record<string, string> = {
  "szekhely-hu": "Székhelyszolgáltatás (magyar)",
  "szekhely-kulfoldi": "Székhelyszolgáltatás (külföldi)",
  kezbesitesi: "Kézbesítési megbízott",
  "szerzodeses-irodaberles": "Virtuális iroda",
  "szekhely-kezbesitesi-hu": "Székhely + Kézbesítési (magyar)",
  "szekhely-kezbesitesi-kulfoldi": "Székhely + Kézbesítési (külföldi)",
  "iroda-hu": "Iroda csomag (magyar)",
  "iroda-kulfoldi": "Iroda csomag (külföldi)",
  "iroda-kezbesitesi-hu": "Teljes csomag (magyar)",
  "iroda-kezbesitesi-kulfoldi": "Teljes csomag (külföldi)",
};

/**
 * A szolgáltatás megnevezése, vagy - ha az azonosítót nem ismerjük - maga az
 * azonosító. Nyers azonosító sosem jobb, mint egy név, de a semminél igen: így
 * legalább látszik, melyik beadványnál kell utánanézni.
 */
export function serviceTypeLabel(serviceType: string | undefined): string {
  const id = (serviceType || "").trim();
  if (!id) return "";
  return SERVICE_TYPE_LABELS[id] || id;
}

/**
 * Az ár-kártyák dokumentum-azonosítója a kanonikus szolgáltatástípusra. Csak
 * tartalék: a kártyák ma a `packageId` mezőben már a kanonikus értéket hordozzák,
 * ez a tábla azokra a kártyákra van, amelyeknek nincs `packageId` mezője (ilyenkor
 * a wizard a dokumentum azonosítóját tárolja).
 */
export const CARD_ID_TO_SERVICE_TYPE: Record<string, string> = {
  "basic-hu": "szekhely-hu",
  "basic-foreign": "szekhely-kulfoldi",
  "basic-delivery-agent": "kezbesitesi",
  "basic-virtual-office": "szerzodeses-irodaberles",
  "bundle-hu": "szekhely-kezbesitesi-hu",
  "bundle-foreign": "szekhely-kezbesitesi-kulfoldi",
  "office-hu": "iroda-hu",
  "office-foreign": "iroda-kulfoldi",
  "full-hu": "iroda-kezbesitesi-hu",
  "full-foreign": "iroda-kezbesitesi-kulfoldi",
};

/**
 * A kiválasztott ár-kártyához tartozó szolgáltatástípus. Kettőt fogad el, mert a
 * kártyákon kétféle alak fordul elő: a `packageId` mező kanonikus értékét, és - ha
 * az nincs - a kártya dokumentum-azonosítóját.
 *
 * `null`, ha egyik alak sem ismerős: a hívó akkor dönt, mit tesz, de nem kap
 * csendben egy alapértelmezést, mert korábban épp az ment minden beküldésbe.
 */
export function serviceTypeForCard(packageId: string | undefined, cardId?: string | undefined): string | null {
  const own = (packageId || "").trim();
  if (SERVICE_TYPES.includes(own)) return own;
  if (CARD_ID_TO_SERVICE_TYPE[own]) return CARD_ID_TO_SERVICE_TYPE[own];
  const id = (cardId || "").trim();
  if (SERVICE_TYPES.includes(id)) return id;
  return CARD_ID_TO_SERVICE_TYPE[id] || null;
}

// Mit jegyzünk fel a beküldéskor arról, hogy az ügyfél MIT LÁTOTT az ár-kártyán.
//
// Eddig csak a `packageId` és a két szám (havi/éves díj) került a beadványba. A kártya
// megnevezése és a kiírt ár-szöveg nem, pedig az iratot és a levelet az ügyfél ezek alapján
// fogadta el. Ha az árlista később változik, a régi beadványból ma nem derül ki, milyen
// megnevezéssel és milyen árszöveggel kötötték.
//
// Három szabály, és ezek szándékosak:
//   1. Az ár-szöveg SZÖVEG MARAD. Nem alakítjuk, és nem számolunk belőle: a `monthlyPrice`
//      továbbra is külön, a maga útján készül. Aki összeget akar, azt használja.
//   2. Ha a kártyán nincs szöveg, a mező ÜRESEN marad. Nem teszünk a helyére se
//      alapértelmezést, se az azonosítót: a hiányzó adat maradjon látható hiánynak.
//   3. Régi sorokra nem megy vissza semmi: ez csak az új beküldésekre vonatkozik.
//
// Csak törölhető TypeScript-nyelvtan van itt, hogy a `node --test` be tudja tölteni.

export type ServiceCardText = { hu: string; en: string };

/** A kártyából csak ennyi kell ide; a teljes PricingCard ennél bővebb. */
export type ServiceCardLike = {
  id?: string;
  packageId?: string;
  title?: ServiceCardText;
  price?: ServiceCardText;
  priceNote?: ServiceCardText;
};

export type ServiceSelection = {
  serviceType: string;
  packageId: string;
  monthlyPrice: number;
  annualPrice: number;
  /** A kártya megnevezése, ahogy az ügyfél látta. Üres kártyaszövegnél nincs megadva. */
  packageLabel?: string;
  /** A kiírt ár, SZÖVEGKÉNT (pl. "24 000 Ft + ÁFA / hó"). Soha ne számolj belőle. */
  priceText?: string;
};

export type ServiceSelectionResult = {
  selection: ServiceSelection;
  /** Hamis, ha az ár-kártyát nem ismertük fel: a hívó ilyenkor jelez a konzolra. */
  recognised: boolean;
};

/** A kártya szövege a választott nyelven, magyar tartalékkal. Üresre üreset ad. */
export function cardText(text: ServiceCardText | undefined, language: string): string {
  if (!text) return "";
  const chosen = language === "en" ? text.en : text.hu;
  return String(chosen || text.hu || "").trim();
}

/** A havi díj SZÁMKÉNT, a számlázáshoz. Ez nem helyettesíti az ár-szöveget, és fordítva sem. */
export function parseMonthlyPrice(priceText: string): number {
  const digits = String(priceText || "").replace(/[^\d]/g, "");
  return parseInt(digits, 10) || 0;
}

/** Az ár-szöveg úgy, ahogy a kártyán állt: az ár és a hozzá írt megjegyzés egyben. */
export function priceTextOf(card: ServiceCardLike, language: string): string {
  return [cardText(card.price, language), cardText(card.priceNote, language)]
    .filter((part) => part.length > 0)
    .join(" ");
}

export function buildServiceSelection(
  card: ServiceCardLike,
  language: string,
  fallbackServiceType = "szekhely-hu",
): ServiceSelectionResult {
  const packageId = String(card.packageId || "").trim();
  const resolved = serviceTypeForCard(packageId, card.id);
  const monthlyPrice = parseMonthlyPrice(cardText(card.price, language));

  const packageLabel = cardText(card.title, language);
  const priceText = priceTextOf(card, language);

  const selection: ServiceSelection = {
    serviceType: resolved || fallbackServiceType,
    packageId,
    monthlyPrice,
    // ahogy eddig is: az éves díj a havi tizenkétszerese
    annualPrice: monthlyPrice * 12,
  };
  // üres kártyaszöveg esetén a kulcs KIMARAD, nem kerül a helyére semmi
  if (packageLabel) selection.packageLabel = packageLabel;
  if (priceText) selection.priceText = priceText;

  return { selection, recognised: resolved !== null };
}
