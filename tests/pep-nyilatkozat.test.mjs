import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";

import {
  buildDocxData,
  docxContractProblem,
  ownerDataAliases,
  pepAnswered,
  pepDeclarantLabel,
  pepDeclarantsOf,
  pepDeclarationOf,
  pepFlagOf,
  pepMissingDeclarants,
} from "../src/lib/docx-data.ts";

// A PEP-nyilatkozat két, egymást kizáró mondatot hordoz: "nem minősül kiemelt közszereplőnek"
// és a másik. A sablon `{^TULAJDONOS_PEP}` / `{#TULAJDONOS_PEP}` ága választ közülük, a jelzőt
// a kód adja - nyilatkozónként. Minden adat kitalált: nincs benne valódi személy és valódi cég.

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

const tulajdonos = (szazalek, pep, extra = {}) => ({
  type: "natural",
  ownershipPercent: szazalek,
  natural: szemely({ fullName: `Tulajdonos ${szazalek}` }),
  ...(pep ? { pep } : {}),
  ...extra,
});

const beadvany = (extra = {}) => ({
  packageId: "szekhely-hu",
  serviceType: "szekhely-hu",
  monthlyPrice: 10000,
  company: { name: "Teszt Kft.", legalForm: "kft", isNew: false, registrationNumber: "01-09-000000" },
  representative: szemely({ fullName: "Teszt Ügyvezető" }),
  owners: [tulajdonos(100, { isPep: false, isPepRelative: false, isPepAssociate: false })],
  ...extra,
});

const NEM = { isPep: false, isPepRelative: false, isPepAssociate: false };
const IGEN = { isPep: true, isPepRelative: false, isPepAssociate: false };

// --- a válasz megléte ---------------------------------------------------------

describe("mikor számít megválaszoltnak a nyilatkozat", () => {
  it("hiányzó nyilatkozat: nincs megválaszolva", () => {
    assert.equal(pepAnswered(undefined), false);
  });

  it("két válasz a háromból: még nincs megválaszolva", () => {
    assert.equal(pepAnswered({ isPep: false, isPepRelative: false }), false);
  });

  it("mindhárom megvan: megválaszolva - a kimondott 'nem' is válasz", () => {
    assert.equal(pepAnswered(NEM), true);
  });
});

describe("a PEP-jelző képzése", () => {
  it("hiányzó nyilatkozatnál üres", () => {
    assert.equal(pepFlagOf(undefined), "");
  });

  it("mindhárom kérdésre nem: üres", () => {
    assert.equal(pepFlagOf(NEM), "");
  });

  it("bármelyik igen: a második mondat ága", () => {
    assert.equal(pepFlagOf(IGEN), "1");
    assert.equal(pepFlagOf({ isPep: false, isPepRelative: true, isPepAssociate: false }), "1");
    assert.equal(pepFlagOf({ isPep: false, isPepRelative: false, isPepAssociate: true }), "1");
  });
});

// --- ki nyilatkozik ----------------------------------------------------------

describe("ki köteles nyilatkozni", () => {
  it("egyedüli 100%-os tag: ő", () => {
    const kik = pepDeclarantsOf(beadvany());
    assert.deepEqual(kik, [{ kind: "owner", ownerNumber: 1 }]);
  });

  it("két 50%-os tag: mind a kettő - a státusz személyenként más lehet", () => {
    const kik = pepDeclarantsOf(beadvany({ owners: [tulajdonos(50, NEM), tulajdonos(50, NEM)] }));
    assert.deepEqual(kik, [
      { kind: "owner", ownerNumber: 1 },
      { kind: "owner", ownerNumber: 2 },
    ]);
  });

  it("a 25% alatti tag nem tényleges tulajdonos: tőle nem kérünk nyilatkozatot", () => {
    const kik = pepDeclarantsOf(beadvany({ owners: [tulajdonos(90, NEM), tulajdonos(10, NEM)] }));
    assert.deepEqual(kik, [{ kind: "owner", ownerNumber: 1 }]);
  });

  it("pont 25% még tényleges tulajdonos", () => {
    const kik = pepDeclarantsOf(beadvany({ owners: [tulajdonos(75, NEM), tulajdonos(25, NEM)] }));
    assert.equal(kik.length, 2);
  });

  it("hiányzó tulajdoni aránynál inkább kérdezünk, mint hogy kihagyjuk", () => {
    const kik = pepDeclarantsOf(beadvany({ owners: [{ type: "natural", natural: szemely() }] }));
    assert.deepEqual(kik, [{ kind: "owner", ownerNumber: 1 }]);
  });

  it("ha senki nem éri el a 25%-ot, a vezető tisztségviselő nyilatkozik (Pmt. 3. § 38. f))", () => {
    const ot = [tulajdonos(20, NEM), tulajdonos(20, NEM), tulajdonos(20, NEM), tulajdonos(20, NEM), tulajdonos(20, NEM)];
    assert.deepEqual(pepDeclarantsOf(beadvany({ owners: ot })), [
      { kind: "representative", reason: "nincs-25-szazalekos" },
    ]);
  });

  it("jogi személy tagnál MÁS az ok, és ezt a nyilatkozó is hordozza", () => {
    // A tényleges tulajdonos a mögötte álló természetes személy (KÖZVETETT tulajdonlás), nem a
    // mi ügyvezetőnk. Ezt a láncot nem követjük, ezért az ügyvezető csak a legjobb elérhető
    // közelítés - az űrlap ezt ki is írja. A két okot nem szabad összemosni: ha összemosódna,
    // az ügyfél azt olvasná, hogy "egyetlen tag sem éri el a 25%-ot", holott a tag 100%-os.
    const kik = pepDeclarantsOf(beadvany({ owners: [{ type: "legal", ownershipPercent: 100 }] }));
    assert.deepEqual(kik, [{ kind: "representative", reason: "jogi-szemely-tag" }]);
  });

  it("a 25% alatti tagokból álló cégnél viszont tényleg az ügyvezető a tényleges tulajdonos", () => {
    const ot = [tulajdonos(20, NEM), tulajdonos(20, NEM), tulajdonos(20, NEM), tulajdonos(20, NEM), tulajdonos(20, NEM)];
    assert.equal(pepDeclarantsOf(beadvany({ owners: ot }))[0].reason, "nincs-25-szazalekos");
  });

  it("SOHA nem ad üres listát - különben az űrlap senkitől nem kérdezne", () => {
    for (const owners of [[], undefined, [{ type: "legal", ownershipPercent: 100 }]]) {
      assert.ok(pepDeclarantsOf(beadvany({ owners })).length > 0);
    }
  });

  it("a megnevezés emberi szóval megy a hibaüzenetbe", () => {
    assert.match(pepDeclarantLabel({ kind: "owner", ownerNumber: 2 }), /2\. tulajdonos/);
    assert.match(pepDeclarantLabel({ kind: "representative", reason: "nincs-25-szazalekos" }), /vezető tisztségviselő/);
  });
});

// --- kinek a válasza számít ---------------------------------------------------

describe("melyik választ kapja a nyilatkozó", () => {
  it("a saját válasza, nem a másiké", () => {
    const b = beadvany({ owners: [tulajdonos(50, IGEN), tulajdonos(50, NEM)] });
    assert.equal(pepFlagOf(pepDeclarationOf(b, { kind: "owner", ownerNumber: 1 })), "1");
    assert.equal(pepFlagOf(pepDeclarationOf(b, { kind: "owner", ownerNumber: 2 })), "");
  });

  it("RÉGI beadványnál a beadvány-szintű nyilatkozat a tartalék", () => {
    // Régen egyetlen nyilatkozat tartozott az egész beadványhoz. Azokból ma is kell iratot készíteni.
    const regi = beadvany({ owners: [tulajdonos(50), tulajdonos(50)], pepDeclaration: IGEN });
    assert.equal(pepFlagOf(pepDeclarationOf(regi, { kind: "owner", ownerNumber: 1 })), "1");
    assert.equal(pepFlagOf(pepDeclarationOf(regi, { kind: "owner", ownerNumber: 2 })), "1");
  });

  it("a saját válasz erősebb az örökségnél", () => {
    const vegyes = beadvany({ owners: [tulajdonos(50, NEM), tulajdonos(50)], pepDeclaration: IGEN });
    assert.equal(pepFlagOf(pepDeclarationOf(vegyes, { kind: "owner", ownerNumber: 1 })), "", "a sajátja: nem");
    assert.equal(pepFlagOf(pepDeclarationOf(vegyes, { kind: "owner", ownerNumber: 2 })), "1", "nincs sajátja: öröklés");
  });

  it("a vezető tisztségviselő a saját mezőjéből kapja", () => {
    const ot = [tulajdonos(20, NEM), tulajdonos(20, NEM), tulajdonos(20, NEM), tulajdonos(20, NEM), tulajdonos(20, NEM)];
    const b = beadvany({ owners: ot, representativePep: IGEN });
    assert.equal(pepFlagOf(pepDeclarationOf(b, { kind: "representative", reason: "nincs-25-szazalekos" })), "1");
  });
});

describe("kinek hiányzik még a válasza", () => {
  it("minden válasz megvan: senkinek", () => {
    assert.deepEqual(pepMissingDeclarants(beadvany({ owners: [tulajdonos(50, NEM), tulajdonos(50, IGEN)] })), []);
  });

  it("az egyiké hiányzik: csak őt nevezi meg", () => {
    const hianyzik = pepMissingDeclarants(beadvany({ owners: [tulajdonos(50, NEM), tulajdonos(50)] }));
    assert.deepEqual(hianyzik, [{ kind: "owner", ownerNumber: 2 }]);
  });

  it("régi beadványnál az öröklött nyilatkozat elég", () => {
    const regi = beadvany({ owners: [tulajdonos(50), tulajdonos(50)], pepDeclaration: NEM });
    assert.deepEqual(pepMissingDeclarants(regi), []);
  });

  it("semmi sincs: mindkettő hiányzik", () => {
    assert.equal(pepMissingDeclarants(beadvany({ owners: [tulajdonos(50), tulajdonos(50)] })).length, 2);
  });
});

// --- a sablonig -------------------------------------------------------------

describe("a jelző eljut a sablonig", () => {
  it("minden tulajdonos a SAJÁT válaszát kapja, nem a másikét", () => {
    const adat = buildDocxData(beadvany({ owners: [tulajdonos(50, IGEN), tulajdonos(50, NEM)] }), helpers);
    assert.equal(adat.TULAJDONOS_1_PEP, "1");
    assert.equal(adat.TULAJDONOS_2_PEP, "");
  });

  it("a sorszám nélküli sablon a saját tulajdonosa értékét kapja", () => {
    const adat = buildDocxData(beadvany({ owners: [tulajdonos(50, IGEN), tulajdonos(50, NEM)] }), helpers);
    assert.equal(ownerDataAliases(adat, 1).TULAJDONOS_PEP, "1");
    assert.equal(ownerDataAliases(adat, 2).TULAJDONOS_PEP, "");
  });

  it("minden érték sztring - a docxtemplater az üreset veszi hamisnak", () => {
    const adat = buildDocxData(beadvany({ owners: [tulajdonos(100, IGEN)] }), helpers);
    for (const [kulcs, ertek] of Object.entries(adat)) {
      assert.equal(typeof ertek, "string", `${kulcs} nem sztring`);
    }
  });
});

// --- az iratgenerálás megáll hiányzó válasznál -------------------------------

describe("az iratgenerálás megáll, ha a nyilatkozat nincs megadva", () => {
  it("minden válasz megvan: nincs PEP-miatti akadály", () => {
    assert.equal(docxContractProblem(beadvany()), null);
  });

  it("régi beadvány az öröklött nyilatkozattal: szintén rendben", () => {
    const regi = beadvany({ owners: [tulajdonos(100)], pepDeclaration: NEM });
    assert.equal(docxContractProblem(regi), null);
  });

  it("hiányzó válasznál megáll, és megnevezi, kinél", () => {
    const gond = docxContractProblem(beadvany({ owners: [tulajdonos(50, NEM), tulajdonos(50)] }));
    assert.match(String(gond), /2\. tulajdonos/);
    assert.match(String(gond), /nem minősül kiemelt közszereplőnek/);
  });

  it("egyetlen hiányzó válasz is megállítja - nem pótoljuk 'nem'-mel", () => {
    const gond = docxContractProblem(beadvany({ owners: [tulajdonos(100, { isPep: false, isPepRelative: false })] }));
    assert.match(String(gond), /PEP|közszerepl/);
  });
});

// --- forrás-őrök az űrlapon (a hook aliasos importjai miatt nem tölthető be) --

const WIZARD = readFileSync(new URL("../src/components/contract-wizard/hooks/useContractWizard.ts", import.meta.url), "utf8");
const LEPES = readFileSync(new URL("../src/components/contract-wizard/steps/Step6PepDeclaration.tsx", import.meta.url), "utf8");

describe("a wizard nem válaszol az ügyfél helyett", () => {
  it("a kezdőállapot egyáltalán nem állít be PEP-választ", () => {
    const kezdo = WIZARD.slice(WIZARD.indexOf("getDefaultContractData"), WIZARD.indexOf("// Lépés validációk"));
    assert.doesNotMatch(kezdo, /isPep(Relative|Associate)?:/);
    assert.doesNotMatch(kezdo, /pepDeclaration:/);
  });

  it("a lépés a közös szabályt kérdezi meg, nem saját másolatot tart", () => {
    assert.match(WIZARD, /pepMissingDeclarants\(data\)/, "nincs meglét-ellenőrzés, így üresen is tovább lehetne lépni");
  });

  it("a rádiógomb üres, amíg nincs válasz", () => {
    assert.match(LEPES, /valasz === undefined \? ""/, "a gomb előre kiválasztott állapotban jelenne meg");
  });

  it("a jogi személyes ág nem állítja, hogy az ügyvezető a tényleges tulajdonos", () => {
    const WIZARD_TSX = readFileSync(new URL("../src/components/contract-wizard/ContractWizard.tsx", import.meta.url), "utf8");
    assert.match(WIZARD_TSX, /reason === "jogi-szemely-tag"/, "a két ok nincs megkülönböztetve az űrlapon");
    assert.match(WIZARD_TSX, /közvetett tulajdonlás/, "nem mondja ki, hogy a lánc mögötti ember a tényleges tulajdonos");
  });

  it("minden nyilatkozó külön azonosítót kap - különben a gombok összeakadnának", () => {
    assert.match(LEPES, /\$\{sor\.azonosito\}-no/);
    assert.match(LEPES, /pepDetails-\$\{key\}/);
  });
});

// --- az eljáró személy neve az iraton ----------------------------------------

describe("az eljáró személy neve nem függhet a régi térképtől", () => {
  it("a buildDocxData maga adja a képviselő nevét és lakcímét", () => {
    // A PEP-nyilatkozat első szava: "Alulírott, {KEPVISELO_NEV} (eljáró személy)". Ezt eddig
    // CSAK az admin oldal régi, {{...}} alakú térképe töltötte ki. Ha az kikerül, az irat
    // névtelenül menne ki. Mérve: a sablon élőben is ezt a kulcsot kéri.
    const adat = buildDocxData(beadvany(), helpers);
    assert.equal(adat.KEPVISELO_NEV, "Teszt Ügyvezető");
    assert.equal(adat.KEPVISELO_LAKCIM, "1234 Tesztváros, Példa utca 1.");
  });

  it("hiányzó képviselőnél üres sztring, nem undefined", () => {
    const adat = buildDocxData({ ...beadvany(), representative: undefined }, helpers);
    assert.equal(adat.KEPVISELO_NEV, "");
  });
});

// --- 25% alatti meghatározó befolyás (jogi átnézés 2026-11-28, 5. pont) ------

import { decisiveInfluenceNote } from "../src/lib/docx-data.ts";

describe("a 25% alatti meghatározó befolyás kötelező kérdés", () => {
  it("nem jelentett befolyásnál nincs figyelmeztetés", () => {
    assert.equal(decisiveInfluenceNote({ exists: false }), null);
    assert.equal(decisiveInfluenceNote(undefined), null);
  });

  it("jelentett befolyásnál szól, hogy rá is kell nyilatkozat, és hogy kézzel", () => {
    const note = decisiveInfluenceNote({ exists: true, details: "Kovács János, szavazategyezség" });
    assert.match(String(note), /tényleges tulajdonos/);
    assert.match(String(note), /38\. b\)/);
    assert.match(String(note), /kézzel/);
    assert.match(String(note), /Kovács János/, "a megadott indok is benne van");
  });

  it("részletek nélkül is szól - a hiány nem némíthatja el", () => {
    assert.match(String(decisiveInfluenceNote({ exists: true })), /MEGHATÁROZÓ BEFOLYÁST/);
  });
});

describe("az űrlap megköveteli a választ (forrás-őrök)", () => {
  it("a lépés ellenőrzi, hogy válaszoltak-e", () => {
    assert.match(WIZARD, /typeof data\.decisiveInfluence\?\.exists !== "boolean"/);
  });

  it("igen válasznál a megnevezés is kötelező", () => {
    assert.match(WIZARD, /decisiveInfluence\.exists && !data\.decisiveInfluence\.details\?\.trim\(\)/);
  });

  it("a rádiógomb üresen indul, nincs előre bejelölt 'nem'", () => {
    assert.match(LEPES, /decisiveInfluence\.exists === undefined \? ""/);
  });
});
