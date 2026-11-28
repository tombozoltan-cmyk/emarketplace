import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { MAX_OWNER_CHAIN_DEPTH, PEP_MIN_SHARE, beneficialOwnersOf } from "../src/lib/docx-data.ts";

// A Pmt. szerint tényleges tulajdonos az a természetes személy, aki közvetlenül VAGY a
// tulajdonosi láncon keresztül végül eléri a 25%-ot. Minden adat kitalált.

const szemely = (nev, szazalek) => ({ type: "natural", ownershipPercent: szazalek, natural: { fullName: nev } });
const ceg = (nev, szazalek, extra = {}) => ({
  type: "legal",
  ownershipPercent: szazalek,
  legal: { companyName: nev, ...extra },
});
const lancTag = (nev, szazalek, extra = {}) => ({ type: "natural", ownershipPercent: szazalek, name: nev, ...extra });
const lancCeg = (nev, szazalek, extra = {}) => ({ type: "legal", ownershipPercent: szazalek, name: nev, ...extra });

const nevek = (eredmeny) => eredmeny.beneficialOwners.map((b) => b.name);
const aranyOf = (eredmeny, nev) => eredmeny.beneficialOwners.find((b) => b.name === nev)?.effectiveShare;

describe("közvetlen tulajdonos", () => {
  it("a 100%-os természetes személy tényleges tulajdonos", () => {
    const e = beneficialOwnersOf([szemely("Egyedüli Tag", 100)]);
    assert.deepEqual(nevek(e), ["Egyedüli Tag"]);
    assert.equal(e.beneficialOwners[0].indirect, false);
  });

  it("a 25% alatti közvetlen tag kimarad, de szól róla", () => {
    const e = beneficialOwnersOf([szemely("Nagy Tag", 90), szemely("Kis Tag", 10)]);
    assert.deepEqual(nevek(e), ["Nagy Tag"]);
    assert.match(e.notes.join(" "), /Kis Tag|10%/);
  });

  it("pont 25% még tényleges tulajdonos", () => {
    const e = beneficialOwnersOf([szemely("A", 75), szemely("B", PEP_MIN_SHARE)]);
    assert.equal(nevek(e).length, 2);
  });
});

describe("közvetett tulajdonlás: az arányok szorzódnak", () => {
  it("100% cég -> 30% személy = 30%, tehát tényleges tulajdonos", () => {
    const e = beneficialOwnersOf([ceg("Anya Kft.", 100, { owners: [lancTag("Lánc Mögötti", 30), lancTag("Másik", 70)] })]);
    assert.equal(aranyOf(e, "Lánc Mögötti"), 30);
    assert.equal(e.beneficialOwners.find((b) => b.name === "Lánc Mögötti").indirect, true);
  });

  it("100% cég -> 20% személy = 20%, tehát NEM tényleges tulajdonos", () => {
    const e = beneficialOwnersOf([ceg("Anya Kft.", 100, { owners: [lancTag("Kicsi", 20), lancTag("Nagy", 80)] })]);
    assert.ok(!nevek(e).includes("Kicsi"));
    assert.match(e.notes.join(" "), /Kicsi/);
  });

  it("két szint: 50% cég -> 60% cég -> 100% személy = 30%", () => {
    const e = beneficialOwnersOf([
      szemely("Közvetlen", 50),
      ceg("Anya Kft.", 50, { owners: [lancCeg("Nagyanya Kft.", 60, { owners: [lancTag("Végső Tulajdonos", 100)] })] }),
    ]);
    assert.equal(aranyOf(e, "Végső Tulajdonos"), 30);
  });

  it("az útvonal megmutatja, honnan jön", () => {
    const e = beneficialOwnersOf([ceg("Anya Kft.", 100, { owners: [lancTag("Lánc Mögötti", 100)] })]);
    assert.equal(e.beneficialOwners[0].path, "1. tulajdonos -> Anya Kft. -> Lánc Mögötti");
  });
});

describe("ahol a gép megáll, és szól", () => {
  it("a lánc nincs megadva: nem találunk ki senkit, hanem jelezzük", () => {
    const e = beneficialOwnersOf([ceg("Anya Kft.", 100)]);
    assert.deepEqual(e.beneficialOwners, []);
    assert.match(e.notes.join(" "), /nincsenek megadva|átvilágításnál/);
  });

  it("tőzsdei anyacégnél a láncot nem követjük tovább", () => {
    const e = beneficialOwnersOf([ceg("Tőzsdei Nyrt.", 100, { listed: true, owners: [lancTag("Nem kell", 100)] })]);
    assert.deepEqual(e.beneficialOwners, []);
    assert.match(e.notes.join(" "), /szabályozott piacon/);
  });

  it(`a ${MAX_OWNER_CHAIN_DEPTH}. cég után megáll, és megnevezteti a tényleges tulajdonost`, () => {
    const e = beneficialOwnersOf([
      ceg("C1", 100, {
        owners: [lancCeg("C2", 100, { owners: [lancCeg("C3", 100, { owners: [lancCeg("C4", 100, { owners: [lancTag("Mély", 100)] })] })] })],
      }),
    ]);
    assert.ok(!nevek(e).includes("Mély"), "a negyedik cégbe már nem megyünk bele");
    assert.match(e.notes.join(" "), new RegExp(`${MAX_OWNER_CHAIN_DEPTH} cégnél mélyebb`));
    assert.match(e.notes.join(" "), /meg kell nevezni a tényleges tulajdonost/);
  });

  it(`pontosan ${MAX_OWNER_CHAIN_DEPTH} cég még végigkövethető`, () => {
    const e = beneficialOwnersOf([
      ceg("C1", 100, { owners: [lancCeg("C2", 100, { owners: [lancCeg("C3", 100, { owners: [lancTag("Elérhető", 100)] })] })] }),
    ]);
    assert.deepEqual(nevek(e), ["Elérhető"]);
  });

  it("hiányzó arány: nem nullának vesszük, hanem ismeretlennek, és bent marad", () => {
    const e = beneficialOwnersOf([ceg("Anya Kft.", 100, { owners: [{ type: "natural", name: "Arány Nélküli" }] })]);
    assert.deepEqual(nevek(e), ["Arány Nélküli"]);
    assert.equal(aranyOf(e, "Arány Nélküli"), null);
    assert.match(e.notes.join(" "), /nem számolható ki/);
  });

  it("névtelen láncelemre szól, mert az nem azonosítható", () => {
    const e = beneficialOwnersOf([ceg("Anya Kft.", 100, { owners: [{ type: "natural", ownershipPercent: 100 }] })]);
    assert.match(e.notes.join(" "), /nincs megadva a neve/);
  });
});

describe("ugyanaz a személy több ágon", () => {
  it("az arányok összeadódnak, és szólunk, hogy ember nézze meg", () => {
    // 15% + 15% = 30%: külön-külön egyik sem érné el a 25%-ot, együtt igen.
    const e = beneficialOwnersOf([
      ceg("A Kft.", 50, { owners: [lancTag("Kétszer Szereplő", 30)] }),
      ceg("B Kft.", 50, { owners: [lancTag("Kétszer Szereplő", 30)] }),
    ]);
    assert.deepEqual(nevek(e), ["Kétszer Szereplő"]);
    assert.equal(aranyOf(e, "Kétszer Szereplő"), 30);
    assert.match(e.notes.join(" "), /több ágon is szerepel/);
    assert.match(e.notes.join(" "), /ugyanarról a személyről/);
  });

  it("az összevonás nem némán történik - a név egyezése nem azonosság", () => {
    const e = beneficialOwnersOf([
      ceg("A Kft.", 50, { owners: [lancTag("Kovács János", 100)] }),
      ceg("B Kft.", 50, { owners: [lancTag("kovács jános", 100)] }),
    ]);
    assert.equal(e.beneficialOwners.length, 1, "a kis- és nagybetű nem csinál két embert");
    assert.match(e.notes.join(" "), /Ellenőrizd/);
  });
});
