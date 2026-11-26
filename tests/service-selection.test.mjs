import test from "node:test";
import assert from "node:assert/strict";
import { buildServiceSelection, cardText, parseMonthlyPrice, priceTextOf } from "../src/lib/service-types.ts";

const kartya = (tulajdonsagok = {}) => ({
  id: "teljes-magyar",
  packageId: "iroda-kezbesitesi-hu",
  title: { hu: "Teljes csomag magyar vállalkozóknak", en: "Full package for Hungarian businesses" },
  price: { hu: "24 000 Ft", en: "24,000 HUF" },
  priceNote: { hu: "+ ÁFA / hó", en: "+ VAT / month" },
  ...tulajdonsagok,
});

test("a megnevezés és az ár-szöveg a kártyáról jön, a választott nyelven", () => {
  const { selection } = buildServiceSelection(kartya(), "hu");
  assert.equal(selection.packageLabel, "Teljes csomag magyar vállalkozóknak");
  assert.equal(selection.priceText, "24 000 Ft + ÁFA / hó");
  assert.equal(selection.serviceType, "iroda-kezbesitesi-hu");
  assert.equal(selection.packageId, "iroda-kezbesitesi-hu");
});

test("angolul az angol szöveg kerül bele", () => {
  const { selection } = buildServiceSelection(kartya(), "en");
  assert.equal(selection.packageLabel, "Full package for Hungarian businesses");
  assert.equal(selection.priceText, "24,000 HUF + VAT / month");
});

test("hiányzó angol szövegnél a magyar a tartalék", () => {
  const { selection } = buildServiceSelection(kartya({ title: { hu: "Csak magyarul", en: "" } }), "en");
  assert.equal(selection.packageLabel, "Csak magyarul");
});

test("ÜRES kártyaszövegnél a mező KIMARAD - nem kerül a helyére semmi", () => {
  const { selection } = buildServiceSelection(
    kartya({ title: { hu: "", en: "" }, price: { hu: "", en: "" }, priceNote: { hu: "", en: "" } }),
    "hu",
  );
  assert.equal("packageLabel" in selection, false, "a packageLabel kulcsnak ki kell maradnia");
  assert.equal("priceText" in selection, false, "a priceText kulcsnak ki kell maradnia");
  // és semmilyen pótlék nem szivárog be helyette
  assert.notEqual(selection.packageLabel, selection.packageId);
});

test("a havi díj az ÁRBÓL jön, NEM az ár-szövegből", () => {
  // éles őrszem: ha valaki a tárolt ár-szövegből (ár + megjegyzés) számolna,
  // a megjegyzés számjegyei is beleragadnának, és 24 000 helyett 240 002 jönne ki
  const c = kartya({ priceNote: { hu: "+ ÁFA / hó, 2 éves hűség", en: "+ VAT / month, 2 years" } });
  const { selection } = buildServiceSelection(c, "hu");
  assert.equal(selection.priceText, "24 000 Ft + ÁFA / hó, 2 éves hűség");
  assert.equal(selection.monthlyPrice, 24000);
  assert.notEqual(selection.monthlyPrice, parseMonthlyPrice(selection.priceText));
});

test("az ár-szöveg szó szerint az marad, ami a kártyán állt", () => {
  const c = kartya({ price: { hu: "15000 Ft", en: "" }, priceNote: { hu: "", en: "" } });
  assert.equal(priceTextOf(c, "hu"), "15000 Ft");
  // nem szépítjük, nem formázzuk át
  assert.equal(buildServiceSelection(c, "hu").selection.priceText, "15000 Ft");
});

test("ismeretlen kártyánál alapértelmezett a típus, de jelezzük, és a packageId megmarad", () => {
  const { selection, recognised } = buildServiceSelection(
    kartya({ id: "valami-uj", packageId: "valami-uj" }),
    "hu",
  );
  assert.equal(recognised, false);
  assert.equal(selection.serviceType, "szekhely-hu");
  assert.equal(selection.packageId, "valami-uj");
  // a megnevezést és az árat ilyenkor is eltesszük: épp ez mondja meg, mit vett az ügyfél
  assert.equal(selection.packageLabel, "Teljes csomag magyar vállalkozóknak");
});

test("ismert kártyánál nincs figyelmeztetés", () => {
  assert.equal(buildServiceSelection(kartya(), "hu").recognised, true);
});

test("a cardText és a parseMonthlyPrice üres bemenetet is elvisel", () => {
  assert.equal(cardText(undefined, "hu"), "");
  assert.equal(parseMonthlyPrice(""), 0);
  assert.equal(parseMonthlyPrice("ingyenes"), 0);
});
