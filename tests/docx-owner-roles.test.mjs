import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { buildDocxData, ownerDataAliases } from "../src/lib/docx-data.ts";
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
    // an owner with no data leaves the unnumbered keys as they were (the page does not ask for such an owner)
    assert.equal(ownerDataAliases(base, 9).TULAJDONOS_NEV, "első");
  });
});
