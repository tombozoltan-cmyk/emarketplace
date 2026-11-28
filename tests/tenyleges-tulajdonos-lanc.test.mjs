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

// --- mit tud meg az ügyintéző a letöltésnél ---------------------------------

import { chainPepNotes } from "../src/lib/docx-data.ts";

describe("a lánc figyelmeztetései az iratletöltésnél", () => {
  it("tiszta, közvetlen tulajdonosoknál nincs mit mondani", () => {
    assert.deepEqual(chainPepNotes({ owners: [szemely("Egyedüli", 100)] }), []);
  });

  it("közvetett tulajdonosnál: megnevezi, és megmondja, miért kézi az irata", () => {
    const n = chainPepNotes({ owners: [ceg("Anya Kft.", 100, { owners: [lancTag("Lánc Mögötti", 60)] })] });
    assert.equal(n.length, 1);
    assert.match(n[0], /Lánc Mögötti/);
    assert.match(n[0], /KÖZVETETT/);
    assert.match(n[0], /nem tartalmazza a válaszát/, "nem a személyes adat hiányzik, hanem a PEP-válasz");
    assert.match(n[0], /A többi irat ettől függetlenül elkészül/, "a gazda döntése: nem állítjuk meg a letöltést");
  });

  it("nyitott ágnál: hiányzó nyilatkozat, de az ügyvezető nem lép a helyére", () => {
    const n = chainPepNotes({ owners: [ceg("Anya Kft.", 100)] });
    assert.equal(n.length, 1);
    assert.match(n[0], /NEM azonosított/);
    assert.match(n[0], /NEM léphet a helyére/);
    assert.match(n[0], /A többi irat elkészül/);
  });

  it("jegyzett anyacégnél a nyilvános bejelentésekre küld", () => {
    const n = chainPepNotes({ owners: [ceg("Nyrt.", 100, { listed: true })] });
    assert.match(n.join(" "), /nyilvános bejelentésekből/);
  });

  it("több ág esetén mindegyikről külön szól", () => {
    const n = chainPepNotes({
      owners: [ceg("A Kft.", 50, { owners: [lancTag("Megvan", 100)] }), ceg("B Kft.", 50)],
    });
    assert.equal(n.length, 2, "egy a közvetett tulajdonosról, egy a nyitott ágról");
  });
});

// --- a lánc embere is nyilatkozik (a kör bezárása) --------------------------

import { pepDeclarantsOf, pepDeclarationOf, pepMissingDeclarants, pepFlagOf } from "../src/lib/docx-data.ts";

const NEM = { isPep: false, isPepRelative: false, isPepAssociate: false };
const IGEN = { isPep: true, isPepRelative: false, isPepAssociate: false };

const lancosBeadvany = () => ({
  owners: [
    ceg("B Holding Kft.", 30, { owners: [lancTag("Lánc Mögötti", 60), lancTag("Kicsi", 40)] }),
    { type: "natural", ownershipPercent: 70, natural: { fullName: "Közvetlen Tag" }, pep: NEM },
  ],
});

describe("a láncon azonosított embert is megkérdezi az űrlap", () => {
  it("a 25%-ot elérő lánc-tulajdonos nyilatkozóként jelenik meg, címmel együtt", () => {
    const kik = pepDeclarantsOf(lancosBeadvany());
    const lanc = kik.find((d) => d.kind === "chain");
    assert.ok(lanc, "a lánc embere nincs a kérdezettek között");
    assert.equal(lanc.name, "Lánc Mögötti");
    assert.equal(lanc.ownerNumber, 1);
    assert.deepEqual(lanc.indexPath, [0], "cím nélkül nem lenne hova visszaírni a válaszát");
  });

  it("a 25% alattit nem kérdezi meg", () => {
    const nevek = pepDeclarantsOf(lancosBeadvany()).map((d) => (d.kind === "chain" ? d.name : d.kind));
    assert.ok(!nevek.includes("Kicsi"), "a 12%-os ember nem tényleges tulajdonos");
  });

  it("a jogi személy tag maga NEM nyilatkozó - helyette a mögötte álló ember", () => {
    const kik = pepDeclarantsOf(lancosBeadvany());
    assert.ok(!kik.some((d) => d.kind === "owner" && d.ownerNumber === 1), "a cég nem tud nyilatkozni");
  });

  it("a válasza a lánc elemébe kerül, és onnan olvassuk vissza", () => {
    const b = lancosBeadvany();
    const lanc = pepDeclarantsOf(b).find((d) => d.kind === "chain");
    assert.equal(pepMissingDeclarants(b).length, 1, "kezdetben épp az ő válasza hiányzik");
    b.owners[0].legal.owners[lanc.indexPath[0]].pep = IGEN;
    assert.equal(pepFlagOf(pepDeclarationOf(b, lanc)), "1");
    assert.equal(pepMissingDeclarants(b).length, 0, "ezzel mindenki nyilatkozott");
  });

  it("a lánc emberénél NINCS örökség-tartalék: a régi beadványokban lánc sem volt", () => {
    const b = { ...lancosBeadvany(), pepDeclaration: IGEN };
    const lanc = pepDeclarantsOf(b).find((d) => d.kind === "chain");
    assert.equal(pepDeclarationOf(b, lanc), undefined, "a beadvány-szintű nyilatkozat nem szólhat róla");
  });

  it("két azonos nevű KÖZVETLEN tagot nem von össze - két ember, két nyilatkozat", () => {
    const ket = {
      owners: [
        { type: "natural", ownershipPercent: 50, natural: { fullName: "Kovács János" } },
        { type: "natural", ownershipPercent: 50, natural: { fullName: "Kovács János" } },
      ],
    };
    assert.deepEqual(pepDeclarantsOf(ket), [
      { kind: "owner", ownerNumber: 1 },
      { kind: "owner", ownerNumber: 2 },
    ]);
  });
});

// --- az adatlap II./2 "érdekeltség" mezője (PEI útmutató 2026-11-28) --------

import { INTEREST_SENIOR_OFFICER, SECTION_II1_NOT_APPLICABLE, interestDecisiveInfluence, ownershipInterestText } from "../src/lib/docx-data.ts";

describe("a tulajdonosi érdekeltség szövege", () => {
  it("közvetlen tagnál a jelleg ÉS az arány is ott van", () => {
    const t = ownershipInterestText({ indirect: false, effectiveShare: 60, path: "1. tulajdonos" });
    assert.equal(t, "közvetlen tulajdon, 60%");
  });

  it("a láncon át: megnevezi a köztes céget és a jogalapot", () => {
    const t = ownershipInterestText({ indirect: true, effectiveShare: 30, path: "x" }, "B Holding Kft.");
    assert.match(t, /közvetett/);
    assert.match(t, /B Holding Kft\.-n keresztül/);
    assert.match(t, /30%/);
    assert.match(t, /Ptk\. 8:2\. § \(4\)/, "az útmutató a jogalapot is kéri a mezőbe");
  });

  it("soha nem áll ott csak a százalék - ez az útmutató gyakori hibája", () => {
    for (const t of [
      ownershipInterestText({ indirect: false, effectiveShare: 100, path: "x" }),
      ownershipInterestText({ indirect: true, effectiveShare: 25, path: "x" }, "A Kft."),
      INTEREST_SENIOR_OFFICER,
      interestDecisiveInfluence("szavazategyezség"),
    ]) {
      assert.ok(/[a-záéíóöőúüű]/i.test(String(t).replace(/[\d,.%]/g, "")), `csak szám áll benne: ${t}`);
    }
  });

  it("ismeretlen aránynál sem hazudik számot", () => {
    const t = ownershipInterestText({ indirect: true, effectiveShare: null, path: "x" }, "A Kft.");
    assert.match(t, /nem állapítható meg/);
  });

  it("a vezető tisztségviselő esete megnevezi, miért ő", () => {
    assert.match(INTEREST_SENIOR_OFFICER, /38\. f\)/);
    assert.match(INTEREST_SENIOR_OFFICER, /a\) és b\) szerinti személy nincs/);
  });

  it("a meghatározó befolyás a 38. b)-re hivatkozik, az indokkal", () => {
    assert.match(interestDecisiveInfluence("vétójog"), /vétójog/);
    assert.match(interestDecisiveInfluence(), /38\. b\)/);
  });

  it("a II./1 nem marad szó nélkül, és megmondja, hol a nyilatkozat", () => {
    assert.match(SECTION_II1_NOT_APPLICABLE, /Nem alkalmazandó/);
    assert.match(SECTION_II1_NOT_APPLICABLE, /II\.\/2/);
    assert.match(SECTION_II1_NOT_APPLICABLE, /9\. § \(1b\)/);
  });
});
