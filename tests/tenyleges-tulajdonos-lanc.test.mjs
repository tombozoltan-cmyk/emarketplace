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

  it("két szint, végig 50% feletti részesedéssel: a befolyás teljes egészében továbbadódik", () => {
    // Anya Kft. 50%-os KÖZVETLEN tag, tehát az ő befolyása 50% (itt nincs köztes jogi személy).
    // Nagyanya 60%-kal bír Anyában: 60 > 50, tehát Anya teljes 50%-a átszáll rá.
    // A Végső Tulajdonos 100%-kal bír Nagyanyában: szintén teljes egészében. Eredmény: 50%.
    // Szorzással 30% jött volna ki - a Ptk. 8:2. § (4) második mondata írja felül.
    const e = beneficialOwnersOf([
      szemely("Közvetlen", 50),
      ceg("Anya Kft.", 50, { owners: [lancCeg("Nagyanya Kft.", 60, { owners: [lancTag("Végső Tulajdonos", 100)] })] }),
    ]);
    assert.equal(aranyOf(e, "Végső Tulajdonos"), 50);
  });

  it("a felét MEGHALADÓ részesedés a köztes cég befolyását teljes egészében átviszi", () => {
    // Ptk. 8:2. § (4) második mondata. A birtokolja B 60%-át, B az ügyfél 30%-át.
    // Szorzással 18% (nem tényleges tulajdonos), a törvény szerint 30% (tényleges tulajdonos).
    const e = beneficialOwnersOf([ceg("B Kft.", 30, { owners: [lancTag("A Személy", 60)] })]);
    assert.equal(aranyOf(e, "A Személy"), 30);
    assert.deepEqual(nevek(e), ["A Személy"], "a törvényi szabály szerint tényleges tulajdonos");
  });

  it("pontosan 50% NEM haladja meg a felét: ott marad a hányad-szabály", () => {
    // "a szavazatok felét MEGHALADÓ" - az 50% még nem haladja meg.
    const e = beneficialOwnersOf([ceg("B Kft.", 60, { owners: [lancTag("Fele Tulajdonos", 50)] })]);
    assert.equal(aranyOf(e, "Fele Tulajdonos"), 30);
  });

  it("51% már meghaladja: a teljes befolyás száll át", () => {
    const e = beneficialOwnersOf([ceg("B Kft.", 60, { owners: [lancTag("Többségi", 51)] })]);
    assert.equal(aranyOf(e, "Többségi"), 60);
  });

  it("a közvetlen tagra nem alkalmazzuk a szabályt - ott nincs köztes jogi személy", () => {
    // Ha a 60%-os közvetlen tag "teljes egészében" számítana, 100% jönne ki, ami értelmetlen.
    const e = beneficialOwnersOf([szemely("Közvetlen Többségi", 60), szemely("Kisebbségi", 40)]);
    assert.equal(aranyOf(e, "Közvetlen Többségi"), 60);
  });

  it("az útvonal megmutatja, honnan jön", () => {
    const e = beneficialOwnersOf([ceg("Anya Kft.", 100, { owners: [lancTag("Lánc Mögötti", 100)] })]);
    assert.equal(e.beneficialOwners[0].path, "1. tulajdonos -> Anya Kft. -> Lánc Mögötti");
  });
});

describe("ahol a gép megáll, és szól", () => {
  it("a lánc nincs megadva: nem találunk ki senkit, az ág NYITOTT marad", () => {
    const e = beneficialOwnersOf([ceg("Anya Kft.", 100)]);
    assert.deepEqual(e.beneficialOwners, []);
    assert.deepEqual(e.unresolved.map((u) => u.reason), ["lanc-hianyzik"]);
    assert.match(e.notes.join(" "), /NYITOTT/);
    assert.match(e.notes.join(" "), /NEM léphet a helyére/, "a 38. f) itt nem alkalmazható");
  });

  it("jegyzett anyacégnél megállunk, de a Pmt. kivételére NEM hivatkozunk", () => {
    // Jogi átnézés 2026-11-28, 2. pont: a Pmt. 3. § 38. a) kivétele a jegyzett ÜGYFÉLRE szól,
    // nem a láncban lévő köztes anyacégre. A gazda döntése: megállás figyelmeztetéssel.
    const e = beneficialOwnersOf([ceg("Tőzsdei Nyrt.", 100, { listed: true, owners: [lancTag("Nem kell", 100)] })]);
    assert.deepEqual(e.beneficialOwners, []);
    assert.deepEqual(e.unresolved.map((u) => u.reason), ["jegyzett-anyaceg"]);
    assert.match(e.notes.join(" "), /nyilvános részesedés-bejelentésekből/);
    assert.doesNotMatch(e.notes.join(" "), /a Pmt\. szerint a láncot itt nem kell/, "ilyen kivétel nincs");
  });

  it(`a ${MAX_OWNER_CHAIN_DEPTH}. cég után megáll, de ez NYITOTT tétel, nem eredmény`, () => {
    const e = beneficialOwnersOf([
      ceg("C1", 100, {
        owners: [lancCeg("C2", 100, { owners: [lancCeg("C3", 100, { owners: [lancCeg("C4", 100, { owners: [lancTag("Mély", 100)] })] })] })],
      }),
    ]);
    assert.ok(!nevek(e).includes("Mély"), "a negyedik cégbe már nem megyünk bele");
    assert.deepEqual(e.unresolved.map((u) => u.reason), ["harmadik-ceg-utan"]);
    assert.match(e.notes.join(" "), /NEM léphet a helyére/);
    assert.match(e.notes.join(" "), /9\. § \(1b\), \(1c\)/, "a képviselő nevezi meg");
  });

  it("ha minden ág lezárult, az unresolved üres - csak ekkor léphet be a 38. f)", () => {
    const e = beneficialOwnersOf([szemely("Egyedüli", 100)]);
    assert.deepEqual(e.unresolved, []);
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
