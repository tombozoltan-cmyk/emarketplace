import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { NO_BENEFICIAL_OWNER_WARNING, PEP_MIN_SHARE, buildDocxData, ownerDataAliases, pepOwnersOf } from "../src/lib/docx-data.ts";
import { pickOwnerTemplate, planDownloads } from "../src/lib/docx-selection.ts";

// Owner decision (tg 5059): the data sheet and the declaration of the owners for ANY number of owners: one template with the role "kyc" / "pep" (tags without a
// number), filled once per owner. All the data is made up. (Only the owners get a declaration: tg 5061, the managing director who is not an owner gets none.)

const keyed = (id, category, name, docKey) => ({ id, category, name, docKey });
const KYC = keyed("kyc-all", "Adatlap", "Átvilágítási adatlap (minden tulajdonos)", "kyc");
const PEP = keyed("pep-all", "Nyilatkozat", "Közszereplői nyilatkozat (minden tulajdonos)", "pep");
const NUMBERED = [1, 2, 3].flatMap((n) => [keyed(`kyc${n}`, "Adatlap", `adatlap ${n}`, `kyc-${n}`), keyed(`pep${n}`, "Nyilatkozat", `nyilatkozat ${n}`, `pep-${n}`)]);
const OLD = [
  { id: "old-kyc1", category: "Adatlap", name: "{TULAJDONOS_1_NEV} átvilágítási adatlap" },
  { id: "old-pep1", category: "Nyilatkozat", name: "{TULAJDONOS_1_NEV} -KIEMELT KÖZSZEREPLŐI NYILATKOZAT" },
];
const NO_CONTRACTS = { seat: false, delivery: false };

const person = (name, extra = {}) => ({ fullName: name, birthName: "", nationality: "nemet", birthPlace: "Teststadt", birthDate: "1980-02-03", motherName: "Minta Mária", address: `1000 Teststadt, ${name} utca 1.`, idType: "passport", idNumber: "X1234567", ...extra });
const NAMES = ["Első Teszt", "Második Teszt", "Harmadik Teszt", "Negyedik Teszt", "Ötödik Teszt", "Hatodik Teszt", "Hetedik Teszt"];
const contractOf = (count) => ({
  packageId: "szekhely-hu",
  monthlyPrice: 10000,
  company: { name: "Minta Kft.", legalForm: "kft", isNew: true },
  representative: person("Képviselő Teszt"),
  owners: NAMES.slice(0, count).map((name, index) => ({ type: "natural", ownershipPercent: Math.floor(100 / count) + (index === 0 ? 100 % count : 0), natural: person(name) })),
  contact: { isSameAsOwner: true },
});
const helpers = { nationalityLabel: (value) => ({ nemet: "Német" })[value] || value };

describe("a template with the role kyc or pep serves every owner", () => {
  for (const count of [1, 3, 5, 12]) {
    it(`${count} owner(s): one data sheet and one declaration for each, from the one template, no problem (the old limit of three is gone)`, () => {
      const plan = planDownloads([KYC, PEP], count, NO_CONTRACTS);
      assert.deepEqual(plan.problems, []);
      assert.equal(plan.items.length, 2 * count);
      for (let owner = 1; owner <= count; owner++) {
        assert.ok(plan.items.some((item) => item.kind === "kyc" && item.ownerNumber === owner && item.template.id === "kyc-all"), `data sheet of owner ${owner}`);
        assert.ok(plan.items.some((item) => item.kind === "pep" && item.ownerNumber === owner && item.template.id === "pep-all"), `declaration of owner ${owner}`);
      }
    });
  }

  it("wins over the numbered roles and over the old templates, whatever the order of the list; they all come back when it is deleted", () => {
    for (const list of [[...OLD, ...NUMBERED, KYC, PEP], [KYC, PEP, ...NUMBERED, ...OLD], [...NUMBERED, ...OLD, PEP, KYC]]) {
      assert.equal(pickOwnerTemplate(list, "Adatlap", 2).template.id, "kyc-all");
      assert.equal(pickOwnerTemplate(list, "Nyilatkozat", 5).template.id, "pep-all");
    }
    // deleted: the numbered ones (up to three owners, a fourth is reported as before), then the old ones
    assert.equal(pickOwnerTemplate([...OLD, ...NUMBERED], "Adatlap", 2).template.id, "kyc2");
    assert.match(pickOwnerTemplate([...OLD, ...NUMBERED], "Adatlap", 4).error, /Nincs 'kyc-4' szerepű sablon/);
    assert.equal(pickOwnerTemplate(OLD, "Adatlap", 1).template.id, "old-kyc1");
  });

  it("the data sheet and the declaration are independent: only one of the two roles uploaded leaves the other to the older rules", () => {
    const onlyKyc = planDownloads([...OLD, KYC], 1, NO_CONTRACTS);
    assert.deepEqual(onlyKyc.items.map((item) => `${item.kind}:${item.template.id}`), ["kyc:kyc-all", "pep:old-pep1"]);
  });

  it("two templates with the same role are an error for every owner, not a guess", () => {
    const twice = [KYC, { ...KYC, id: "kyc-all-2" }, PEP];
    assert.match(pickOwnerTemplate(twice, "Adatlap", 1).error, /'kyc' szerephez több sablon/);
    assert.equal(planDownloads(twice, 2, NO_CONTRACTS).problems.length, 2);
  });
});

// legal review 2026-11-26 (msg 3933), owner message 3936: the declaration of public figure status is for the BENEFICIAL owners (25 per cent or more); the data
// sheet stays for every member; what the admin should know is a note (a warning), never a stop
describe("the declaration is made for the members with 25 per cent or more", () => {
  const owners = (...shares) => shares.map((ownershipPercent) => ({ type: "natural", ownershipPercent }));
  const plan = (shares) => {
    const rule = pepOwnersOf(owners(...shares));
    return { rule, plan: planDownloads([KYC, PEP], shares.length, NO_CONTRACTS, { pepOwners: rule.numbers }) };
  };
  const count = (result, kind) => result.plan.items.filter((item) => item.kind === kind).length;

  it("3 members 60/30/10: 3 data sheets, 2 declarations (the 10 per cent member has none) and a note about the third", () => {
    const result = plan([60, 30, 10]);
    assert.deepEqual(result.rule.numbers, [1, 2]);
    assert.equal(count(result, "kyc"), 3);
    assert.equal(count(result, "pep"), 2);
    assert.deepEqual(result.plan.items.filter((item) => item.kind === "pep").map((item) => item.ownerNumber), [1, 2]);
    assert.equal(result.rule.notes.length, 1);
    assert.match(result.rule.notes[0], /3\. tulajdonos aránya 10%: PEP-nyilatkozat nem készül/);
  });

  it("4 members 20/20/20/40: 1 declaration (the fourth), 4 data sheets", () => {
    const result = plan([20, 20, 20, 40]);
    assert.deepEqual(result.rule.numbers, [4]);
    assert.equal(count(result, "kyc"), 4);
    assert.equal(count(result, "pep"), 1);
    assert.equal(result.plan.items.find((item) => item.kind === "pep").ownerNumber, 4);
    assert.ok(!result.rule.notes.includes(NO_BENEFICIAL_OWNER_WARNING));
  });

  it("5 members of 20 per cent: no declaration, 5 data sheets, and the warning that the managing director is the beneficial owner", () => {
    const result = plan([20, 20, 20, 20, 20]);
    assert.deepEqual(result.rule.numbers, []);
    assert.equal(count(result, "kyc"), 5);
    assert.equal(count(result, "pep"), 0);
    assert.ok(result.rule.notes.includes(NO_BENEFICIAL_OWNER_WARNING));
    assert.equal(NO_BENEFICIAL_OWNER_WARNING, "Nincs 25%-os tulajdonos: a vezető tisztségviselő a tényleges tulajdonos, a PEP-nyilatkozatot és az adatlap II./2. rovatát rá kell kitölteni. Ezt a generátor nem kezeli.");
  });

  it("the limit is 25 per cent and over: 25 gets one, 24.9 does not; one owner of 100 gets one and no note", () => {
    assert.deepEqual(pepOwnersOf(owners(25, 75)).numbers, [1, 2]);
    assert.deepEqual(pepOwnersOf(owners(24.9, 75.1)).numbers, [2]);
    assert.deepEqual(pepOwnersOf(owners(100)), { numbers: [1], notes: [] });
    assert.equal(PEP_MIN_SHARE, 25);
  });

  it("a share that is missing or not a number is not dropped on a guess: the declaration is made, with a note to check; \"40%\" and \"40,5\" are read as numbers", () => {
    for (const bad of [undefined, null, "", "sok", NaN, -5, 250]) {
      const rule = pepOwnersOf(owners(bad, 30));
      assert.deepEqual(rule.numbers, [1, 2], String(bad));
      assert.match(rule.notes.join(" "), /1\. tulajdonos tulajdoni aránya hiányzik vagy nem szám/, String(bad));
    }
    assert.deepEqual(pepOwnersOf(owners("40%", "10")).numbers, [1]);
    assert.deepEqual(pepOwnersOf(owners("40,5", 10)).numbers, [1]);
    // an unknown share is no proof that nobody reaches 25: no "no beneficial owner" warning then
    assert.ok(!pepOwnersOf(owners(undefined, 10)).notes.includes(NO_BENEFICIAL_OWNER_WARNING));
  });

  it("a legal person among the members gets a note (the natural person behind it, by hand); the rest of the rule is the same", () => {
    const rule = pepOwnersOf([{ type: "legal", ownershipPercent: 60 }, { type: "natural", ownershipPercent: 40 }]);
    assert.deepEqual(rule.numbers, [1, 2]);
    assert.match(rule.notes.join(" "), /1\. tulajdonos jogi személy: a tényleges tulajdonos a mögötte álló természetes személy/);
  });

  it("no owners: nothing, and no warning (the page tells that there is no owner)", () => {
    assert.deepEqual(pepOwnersOf([]), { numbers: [], notes: [] });
    assert.deepEqual(pepOwnersOf(undefined), { numbers: [], notes: [] });
  });

  it("without the option every owner gets a declaration, as before (the plan does not decide who is a beneficial owner)", () => {
    assert.equal(planDownloads([KYC, PEP], 4, NO_CONTRACTS).items.filter((item) => item.kind === "pep").length, 4);
  });
});

describe("the data of one owner under the tags without a number", () => {
  for (const count of [1, 3, 5]) {
    it(`${count} owner(s): each data sheet and each declaration gets the name, the birth place and date, the nationality, the address and the share of ITS owner`, () => {
      const contract = contractOf(count);
      const data = buildDocxData(contract, helpers);
      const plan = planDownloads([KYC, PEP], count, NO_CONTRACTS);
      assert.equal(plan.items.length, 2 * count);
      for (const item of plan.items) {
        const own = ownerDataAliases(data, item.ownerNumber);
        const owner = contract.owners[item.ownerNumber - 1];
        assert.equal(own.TULAJDONOS_NEV, owner.natural.fullName, `${item.kind} ${item.ownerNumber}: name`);
        assert.equal(own.TULAJDONOS_SZUL_NEV, owner.natural.fullName, "birth name (the name itself when none is given)");
        assert.equal(own.TULAJDONOS_SZUL_HELY_IDO, "Teststadt, 1980-02-03");
        assert.equal(own.TULAJDONOS_ALLAMPOLGARSAG, "Német");
        assert.equal(own.TULAJDONOS_LAKCIM, owner.natural.address);
        assert.equal(own.TULAJDONOS_ARANY, String(owner.ownershipPercent));
        // the other owners are not in it, and the numbered keys are still there
        for (const other of contract.owners) if (other !== owner) assert.notEqual(own.TULAJDONOS_NEV, other.natural.fullName);
        assert.equal(own[`TULAJDONOS_${item.ownerNumber}_NEV`], owner.natural.fullName);
      }
      // five owners: five data sheets and five declarations, each with its own name (the names are all different)
      if (count === 5) {
        const names = plan.items.filter((item) => item.kind === "pep").map((item) => ownerDataAliases(data, item.ownerNumber).TULAJDONOS_NEV);
        assert.deepEqual(names, NAMES.slice(0, 5));
        assert.equal(new Set(names).size, 5);
      }
    });
  }

  it("beyond the third owner the name, the address and the share exist too (the old builder of the page stops at three)", () => {
    const data = buildDocxData(contractOf(7), helpers);
    for (let n = 1; n <= 7; n++) {
      assert.equal(data[`TULAJDONOS_${n}_NEV`], NAMES[n - 1]);
      assert.ok(data[`TULAJDONOS_${n}_LAKCIM`].includes(NAMES[n - 1]));
      assert.ok(Number(data[`TULAJDONOS_${n}_ARANY`]) > 0);
    }
    // a contract with fewer owners than three still has all three empty (as before): nothing is made up
    const one = buildDocxData(contractOf(1), helpers);
    assert.equal(one.TULAJDONOS_2_NEV, "");
    assert.equal(one.TULAJDONOS_3_ARANY, "");
  });

  it("a legal owner has no person data (as before), and its share is still written", () => {
    const contract = { ...contractOf(2), owners: [{ type: "legal", ownershipPercent: 60 }, { type: "natural", ownershipPercent: 40, natural: person("Második Teszt") }] };
    const first = ownerDataAliases(buildDocxData(contract, helpers), 1);
    assert.equal(first.TULAJDONOS_NEV, "");
    assert.equal(first.TULAJDONOS_ARANY, "60");
    assert.equal(ownerDataAliases(buildDocxData(contract, helpers), 2).TULAJDONOS_NEV, "Második Teszt");
  });

  it("the unnumbered keys of the old builder (the first owner) are replaced by this owner's, other keys are untouched", () => {
    const base = { TULAJDONOS_NEV: "első", TULAJDONOS_2_NEV: "második", CEG_NEV: "Minta" };
    assert.deepEqual(ownerDataAliases(base, 2), { TULAJDONOS_NEV: "második", TULAJDONOS_2_NEV: "második", CEG_NEV: "Minta" });
    // an owner with no data gets the unnumbered keys EMPTIED, never the first owner's value (the page does not ask for such an owner)
    assert.equal(ownerDataAliases(base, 9).TULAJDONOS_NEV, "");
    assert.deepEqual(ownerDataAliases(base, 9), { TULAJDONOS_NEV: "", TULAJDONOS_2_NEV: "második", CEG_NEV: "Minta" });
  });

  it("5 owners, the old builder of the page (unnumbered keys of the first owner; SZUL_HELY, SZUL_DATUM, ANYJA_NEVE, OKMANY_TIPUS, OKMANY_SZAM numbered only up to the third): the fourth and the fifth owner never get the first owner's value", () => {
    const OLD_ONLY = ["SZUL_HELY", "SZUL_DATUM", "ANYJA_NEVE", "OKMANY_TIPUS", "OKMANY_SZAM"];
    const contract = contractOf(5);
    const data = buildDocxData(contract, helpers);
    // what the page's old builder adds (src/app/ops/nova/contracts/page.tsx, the first natural owner under the unnumbered keys, the first three under the numbered ones)
    contract.owners.forEach((owner, index) => {
      for (const key of OLD_ONLY) {
        const value = `${key} of ${owner.natural.fullName}`;
        if (index === 0) data[`TULAJDONOS_${key}`] = value;
        if (index < 3) data[`TULAJDONOS_${index + 1}_${key}`] = value;
      }
    });
    data.TULAJDONOS_SZAM = "5";
    data.TULAJDONOS_NEV = NAMES[0];
    data.TULAJDONOS_ARANY = "100";
    for (let n = 1; n <= 5; n++) {
      const own = ownerDataAliases(data, n);
      const owner = contract.owners[n - 1];
      assert.equal(own.TULAJDONOS_NEV, NAMES[n - 1], `owner ${n}: name`);
      assert.equal(own.TULAJDONOS_LAKCIM, owner.natural.address, `owner ${n}: address`);
      assert.equal(own.TULAJDONOS_ARANY, String(owner.ownershipPercent), `owner ${n}: share`);
      assert.equal(own.TULAJDONOS_SZAM, "5", `owner ${n}: the number of the owners is not a per-owner key`);
      for (const key of OLD_ONLY) {
        // the first three have their own value (numbered key); the fourth and the fifth are empty, not the first owner's
        assert.equal(own[`TULAJDONOS_${key}`], n <= 3 ? `${key} of ${NAMES[n - 1]}` : "", `owner ${n}: ${key}`);
        assert.notEqual(own[`TULAJDONOS_${key}`], n === 1 ? undefined : `${key} of ${NAMES[0]}`, `owner ${n}: ${key} is not the first owner's`);
      }
    }
  });
});
