import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { buildDocxData, ownerDataAliases, pepFlagOf } from "../src/lib/docx-data.ts";

// A PEP-nyilatkozat két, egymást kizáró mondatot hordoz: "nem minősül kiemelt közszereplőnek" és a másik.
// A sablon `{^TULAJDONOS_PEP}` / `{#TULAJDONOS_PEP}` ága választ közülük, ezt a jelzőt a kód adja.
// Minden adat kitalált: nincs benne valódi személy és valódi cég.

const helpers = { nationalityLabel: (ertek) => ertek };

const szemely = (extra = {}) => ({
  fullName: "Teszt Elemér",
  nationality: "magyar",
  birthPlace: "Tesztváros",
  birthDate: "1980-02-03",
  motherName: "Minta Mária",
  address: "1234 Tesztváros, Példa utca 1.",
  idType: "passport",
  idNumber: "X1234567",
  ...extra,
});

const beadvany = (pepDeclaration, tulajdonosok = 1) => ({
  packageId: "szekhely-hu",
  monthlyPrice: 10000,
  company: { name: "Teszt Kft.", legalForm: "kft" },
  representative: szemely({ fullName: "Teszt Eljáró" }),
  owners: Array.from({ length: tulajdonosok }, (_, i) => ({
    type: "natural",
    ownershipPercent: Math.round(100 / tulajdonosok),
    natural: szemely({ fullName: `Teszt Tulajdonos ${i + 1}` }),
  })),
  pepDeclaration,
});

describe("a PEP-jelző képzése", () => {
  it("hiányzó nyilatkozatnál üres - az irat a 'nem minősül' mondatot írja ki", () => {
    assert.equal(pepFlagOf(undefined), "");
  });

  it("mindhárom kérdésre nem: üres", () => {
    assert.equal(pepFlagOf({ isPep: false, isPepRelative: false, isPepAssociate: false }), "");
  });

  it("maga a közszereplő: igaz", () => {
    assert.equal(pepFlagOf({ isPep: true, isPepRelative: false, isPepAssociate: false }), "1");
  });

  it("közeli hozzátartozó is igaz - ez is a második mondat alá esik", () => {
    assert.equal(pepFlagOf({ isPep: false, isPepRelative: true, isPepAssociate: false }), "1");
  });

  it("közeli kapcsolatban álló személy is igaz", () => {
    assert.equal(pepFlagOf({ isPep: false, isPepRelative: false, isPepAssociate: true }), "1");
  });
});

describe("a jelző eljut a sablonig", () => {
  it("minden tulajdonos megkapja a számozott kulcsot", () => {
    const adat = buildDocxData(beadvany({ isPep: true }, 2), helpers);
    assert.equal(adat.TULAJDONOS_1_PEP, "1");
    assert.equal(adat.TULAJDONOS_2_PEP, "1");
  });

  it("a sorszám nélküli sablon a saját tulajdonosa értékét kapja", () => {
    const adat = buildDocxData(beadvany({ isPep: true }, 2), helpers);
    assert.equal(ownerDataAliases(adat, 1).TULAJDONOS_PEP, "1");
    assert.equal(ownerDataAliases(adat, 2).TULAJDONOS_PEP, "1");
  });

  it("nem közszereplőnél üres, tehát a sablon a 'nem minősül' ágat választja", () => {
    const adat = buildDocxData(beadvany({ isPep: false, isPepRelative: false, isPepAssociate: false }), helpers);
    assert.equal(adat.TULAJDONOS_1_PEP, "");
    assert.equal(ownerDataAliases(adat, 1).TULAJDONOS_PEP, "");
  });

  it("nyilatkozat nélküli beadványnál sem dől el magától: üres marad", () => {
    const adat = buildDocxData(beadvany(undefined), helpers);
    assert.equal(adat.TULAJDONOS_1_PEP, "");
  });

  it("a jelző sztring, mert a buildDocxData csak sztringeket ad - a docxtemplater az üreset veszi hamisnak", () => {
    const adat = buildDocxData(beadvany({ isPep: true }), helpers);
    for (const [kulcs, ertek] of Object.entries(adat)) {
      assert.equal(typeof ertek, "string", `${kulcs} nem sztring`);
    }
  });
});

describe("a mai korlát, hogy ne felejtsük el", () => {
  it("a beadvány EGY nyilatkozatot tárol, ezért két tulajdonos ma ugyanazt kapja", () => {
    // Ez nem kívánság, hanem a mai állapot rögzítése: a PEP-státusz személyenként más lehet,
    // de a wizard egyszer kérdez. Ha egyszer tulajdonosonként kérdez, ez a teszt fog elbukni - jogosan.
    const adat = buildDocxData(beadvany({ isPepRelative: true }, 3), helpers);
    assert.equal(adat.TULAJDONOS_1_PEP, "1");
    assert.equal(adat.TULAJDONOS_2_PEP, "1");
    assert.equal(adat.TULAJDONOS_3_PEP, "1");
  });
});

// --- a meg nem adott válasz nem fordulhat "nem"-re ---------------------------

import { docxContractProblem } from "../src/lib/docx-data.ts";
import { readFileSync } from "node:fs";

const beadvanyPepNelkul = (pepDeclaration) => ({
  packageId: "szekhely-hu",
  serviceType: "szekhely-hu",
  monthlyPrice: 10000,
  company: { name: "Teszt Kft.", legalForm: "kft", isNew: false, registrationNumber: "01-09-000000" },
  representative: szemely({ fullName: "Teszt Eljáró" }),
  owners: [{ type: "natural", ownershipPercent: 100, natural: szemely() }],
  pepDeclaration,
});

describe("az iratgenerálás megáll, ha a nyilatkozat nincs megadva", () => {
  it("mindhárom válasz megvan: nincs PEP-miatti akadály", () => {
    const gond = docxContractProblem(beadvanyPepNelkul({ isPep: false, isPepRelative: false, isPepAssociate: false }));
    assert.equal(gond, null);
  });

  it("a kimondott 'nem' rendben van - ettől még készülhet irat", () => {
    const gond = docxContractProblem(beadvanyPepNelkul({ isPep: true, isPepRelative: false, isPepAssociate: false }));
    assert.equal(gond, null);
  });

  it("teljesen hiányzó nyilatkozatnál megáll, és megmondja, miért", () => {
    const gond = docxContractProblem(beadvanyPepNelkul(undefined));
    assert.match(String(gond), /PEP|közszerepl/);
  });

  it("egyetlen hiányzó válasz is megállítja - nem pótoljuk 'nem'-mel", () => {
    const gond = docxContractProblem(beadvanyPepNelkul({ isPep: false, isPepRelative: false }));
    assert.match(String(gond), /PEP|közszerepl/);
  });
});

// --- forrás-őrök a wizardon (a hook aliasos importjai miatt nem tölthető be) --

const WIZARD = readFileSync(new URL("../src/components/contract-wizard/hooks/useContractWizard.ts", import.meta.url), "utf8");
const LEPES = readFileSync(new URL("../src/components/contract-wizard/steps/Step6PepDeclaration.tsx", import.meta.url), "utf8");

describe("a wizard nem válaszol az ügyfél helyett", () => {
  it("a kezdőállapot nem állít be PEP-választ", () => {
    const kezdo = WIZARD.slice(WIZARD.indexOf("pepDeclaration: {"), WIZARD.indexOf("uploadedDocuments"));
    assert.doesNotMatch(kezdo, /isPep(Relative|Associate)?:\s*(true|false)/);
  });

  it("a lépés mindhárom válasz meglétét megköveteli", () => {
    for (const kulcs of ["isPep", "isPepRelative", "isPepAssociate"]) {
      assert.match(
        WIZARD,
        new RegExp(`typeof data\\.pepDeclaration\\.${kulcs} !== "boolean"`),
        `${kulcs}: nincs meglét-ellenőrzés, így üresen is tovább lehetne lépni`,
      );
    }
  });

  it("a rádiógombok üresek, amíg nincs válasz", () => {
    for (const kulcs of ["isPep", "isPepRelative", "isPepAssociate"]) {
      assert.match(
        LEPES,
        new RegExp(`data\\.${kulcs} === undefined \\? ""`),
        `${kulcs}: a gomb előre kiválasztott állapotban jelenne meg`,
      );
    }
  });
});
