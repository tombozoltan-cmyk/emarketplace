import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

import {
  CARD_ID_TO_SERVICE_TYPE,
  SERVICE_TYPES,
  SERVICE_TYPE_LABELS,
  serviceTypeForCard,
  serviceTypeLabel,
} from "../src/lib/service-types.ts";

// Melyik szolgáltatást vette meg az ügyfél, és hogy hívjuk. Futtatás: npm test.

describe("a kártyából a szolgáltatástípus", () => {
  it("a kártya kanonikus packageId mezőjét fogadja el - EZ VOLT A HIBA, a régi tábla doc id-vel volt kulcsozva", () => {
    // a pricingCards mind a tíz kártyája a `packageId` mezőben kanonikus értéket hordoz (mérve 2026-11-26)
    assert.equal(serviceTypeForCard("kezbesitesi", "basic-delivery-agent"), "kezbesitesi");
    assert.equal(serviceTypeForCard("iroda-kezbesitesi-hu", "full-hu"), "iroda-kezbesitesi-hu");
    assert.equal(serviceTypeForCard("szerzodeses-irodaberles", "basic-virtual-office"), "szerzodeses-irodaberles");
    // a régi kódban mindegyik "szekhely-hu"-t adott volna
    for (const [packageId, cardId] of [["kezbesitesi", "basic-delivery-agent"], ["iroda-hu", "office-hu"]]) {
      assert.notEqual(serviceTypeForCard(packageId, cardId), "szekhely-hu");
    }
  });

  it("tartalékként a kártya dokumentum-azonosítóját is elfogadja (olyan kártyán, aminek nincs packageId mezője)", () => {
    assert.equal(serviceTypeForCard("basic-delivery-agent"), "kezbesitesi");
    assert.equal(serviceTypeForCard("full-foreign"), "iroda-kezbesitesi-kulfoldi");
    assert.equal(serviceTypeForCard(undefined, "office-foreign"), "iroda-kulfoldi");
  });

  it("ismeretlen kártyára null, nem csendes alapértelmezés", () => {
    assert.equal(serviceTypeForCard("valami-uj-csomag", "valami-uj-kartya"), null);
    assert.equal(serviceTypeForCard(undefined, undefined), null);
    assert.equal(serviceTypeForCard("", ""), null);
  });

  it("a kártya-azonosító tábla mind a tíz kártyát a tíz szolgáltatástípus egyikére képezi", () => {
    const targets = Object.values(CARD_ID_TO_SERVICE_TYPE);
    assert.equal(targets.length, 10);
    assert.equal(new Set(targets).size, 10, "minden szolgáltatástípushoz pontosan egy kártya tartozik");
    for (const target of targets) assert.ok(SERVICE_TYPES.includes(target), target);
  });
});

describe("a szolgáltatás megnevezése", () => {
  it("mind a tíz típushoz van név", () => {
    for (const type of SERVICE_TYPES) {
      assert.ok(SERVICE_TYPE_LABELS[type], type);
      assert.notEqual(serviceTypeLabel(type), type, `${type} nyers azonosítóként jelenne meg`);
    }
    assert.equal(Object.keys(SERVICE_TYPE_LABELS).length, SERVICE_TYPES.length);
  });

  it("a négy iroda-csomag is benne van - ezek maradtak ki az admin táblából", () => {
    for (const type of ["iroda-hu", "iroda-kulfoldi", "iroda-kezbesitesi-hu", "iroda-kezbesitesi-kulfoldi"]) {
      assert.ok(SERVICE_TYPE_LABELS[type], type);
    }
  });

  it("ismeretlen azonosítót önmagával ad vissza, üresre üressel", () => {
    assert.equal(serviceTypeLabel("valami-uj"), "valami-uj");
    assert.equal(serviceTypeLabel(""), "");
    assert.equal(serviceTypeLabel(undefined), "");
  });
});

describe("a functions saját példánya", () => {
  // a functions külön csomag, nem importálhat a src/-ből: a két táblának egyeznie kell
  it("ugyanazt a tíz nevet tartalmazza, mint a src/lib/service-types.ts", () => {
    const source = readFileSync(new URL("../functions/src/index.ts", import.meta.url), "utf8");
    const block = source.match(/const SERVICE_TYPE_LABELS: Record<string, string> = \{([\s\S]*?)\};/);
    assert.ok(block, "a functions-ben nincs SERVICE_TYPE_LABELS tábla");
    const pairs = [...block[1].matchAll(/"([^"]+)":\s*"([^"]+)"/g)].map((m) => [m[1], m[2]]);
    assert.deepEqual(Object.fromEntries(pairs), SERVICE_TYPE_LABELS);
  });

  it("nem maradt benne a régi, német piacos tábla", () => {
    const source = readFileSync(new URL("../functions/src/index.ts", import.meta.url), "utf8");
    // kulcsként keresjük, nem puszta szövegként: a magyarázó komment megnevezi a régi kulcsokat
    assert.doesNotMatch(source, /"szekhely-de"\s*:/, "a 'szekhely-de' kulcs még egy táblában van");
    assert.doesNotMatch(source, /"virtual-de"\s*:/, "a 'virtual-de' kulcs még egy táblában van");
    assert.ok(!source.includes("serviceTypeMap"), "maradt serviceTypeMap tábla");
  });
});
