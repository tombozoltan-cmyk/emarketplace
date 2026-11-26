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
