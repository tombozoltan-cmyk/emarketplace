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
