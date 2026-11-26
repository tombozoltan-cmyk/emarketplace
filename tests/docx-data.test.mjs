import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { DELIVERY_FEE, OFFICE_ADDRESS, buildDocxData, feesOf, packageDocuments } from "../src/lib/docx-data.ts";

// The data of the DOCX templates beyond the old builder of the contracts page. All the data here is made up (no real person, no real company).

const NATIONALITIES = { magyar: "Magyar", nemet: "Német", amerikai: "Amerikai" };
const helpers = { nationalityLabel: (value) => NATIONALITIES[value] || value };

const person = (extra = {}) => ({
  fullName: "Teszt Elemér",
  birthName: "",
  nationality: "nemet",
  birthPlace: "Teststadt",
  birthDate: "1980-02-03",
  motherName: "Minta Mária",
  address: "1234 Teststadt, Beispiel Str. 1.",
  idType: "passport",
  idNumber: "X1234567",
  ...extra,
});
const contract = (extra = {}) => ({
  packageId: "szekhely-kezbesitesi-kulfoldi",
  monthlyPrice: 15000,
  company: { name: "Minta Kereskedelmi Kft.", legalForm: "kft", registrationNumber: "", taxNumber: "", isNew: true },
  owners: [{ type: "natural", ownershipPercent: 100, natural: person() }],
  representative: person(),
  contact: { isSameAsOwner: true, address: "" },
  ...extra,
});

describe("the packages and their fees", () => {
  it("which contracts a package needs", () => {
    assert.deepEqual(packageDocuments("szekhely-hu"), { seat: true, delivery: false });
    assert.deepEqual(packageDocuments("szekhely-kulfoldi"), { seat: true, delivery: false });
    assert.deepEqual(packageDocuments("szekhely-kezbesitesi-hu"), { seat: true, delivery: true });
    assert.deepEqual(packageDocuments("szekhely-kezbesitesi-kulfoldi"), { seat: true, delivery: true });
    assert.deepEqual(packageDocuments("kezbesitesi"), { seat: false, delivery: true });
    assert.deepEqual(packageDocuments(undefined), { seat: true, delivery: false });
  });

  it("a full package: the seat fee is the package price minus the delivery fee (the seat is not billed twice)", () => {
    assert.deepEqual(feesOf("szekhely-kezbesitesi-kulfoldi", 15000), { seatMonthly: 10000, deliveryMonthly: DELIVERY_FEE });
    assert.deepEqual(feesOf("szekhely-hu", 10000), { seatMonthly: 10000, deliveryMonthly: 0 });
    assert.deepEqual(feesOf("kezbesitesi", 5000), { seatMonthly: 0, deliveryMonthly: 5000 });
    // a price lower than the delivery fee does not make a negative seat fee
    assert.deepEqual(feesOf("szekhely-kezbesitesi-hu", 3000), { seatMonthly: 0, deliveryMonthly: 3000 });
    assert.deepEqual(feesOf("szekhely-hu", undefined), { seatMonthly: 0, deliveryMonthly: 0 });
  });

  it("the fees are written for the contract: the month and the 12 months, Hungarian with a space, English with a comma", () => {
    const data = buildDocxData(contract(), helpers);
    assert.equal(data.SZEKHELY_HAVI_DIJ, "10 000");
    assert.equal(data.SZEKHELY_EVES_DIJ, "120 000");
    assert.equal(data.KEZBESITESI_HAVI_DIJ, "5 000");
    assert.equal(data.KEZBESITESI_EVES_DIJ, "60 000");
    assert.equal(data.SZEKHELY_HAVI_DIJ_EN, "10,000");
    assert.equal(data.KEZBESITESI_EVES_DIJ_EN, "60,000");
  });
});

describe("the company", () => {
  it("the legal form is written once: not added when the name already ends with it, added when it does not", () => {
    assert.equal(buildDocxData(contract(), helpers).CEG_FORMA, "");
    assert.equal(buildDocxData(contract({ company: { name: "Minta Kereskedelmi", legalForm: "kft", isNew: false } }), helpers).CEG_FORMA, "kft");
    assert.equal(buildDocxData(contract({ company: { name: "Minta Zrt.", legalForm: "zrt" } }), helpers).CEG_FORMA, "");
    assert.equal(buildDocxData(contract({ company: { name: "Minta", legalForm: "" } }), helpers).CEG_FORMA, "");
  });

  it("the whole company name has the legal form once, with no stray space", () => {
    const whole = (company) => buildDocxData(contract({ company }), helpers).CEG_TELJES_NEV;
    assert.equal(whole({ name: "Minta Kereskedelmi", legalForm: "kft" }), "Minta Kereskedelmi kft");
    assert.equal(whole({ name: "Minta Zrt.", legalForm: "zrt" }), "Minta Zrt.");
    assert.equal(whole({ name: "  Minta  ", legalForm: "" }), "Minta");
    assert.equal(whole({ name: "", legalForm: "" }), "");
  });

  it("a company in formation has no registration and tax number: the contracts say so in both languages, the data sheet in Hungarian", () => {
    const data = buildDocxData(contract(), helpers);
    assert.equal(data.CEGJEGYZEKSZAM_SZOVEG, "…………………… (bejegyzés alatt / registration pending)");
    assert.equal(data.ADOSZAM_SZOVEG, "…………………… (bejegyzés alatt / registration pending)");
    assert.equal(data.CEGJEGYZEKSZAM_ADATLAP, "bejegyzés alatt");
    assert.equal(data.ADOSZAM_ADATLAP, "bejegyzés alatt");
  });

  it("an existing company has its numbers written; a company marked new but with a number still shows no number only when it has none", () => {
    const existing = buildDocxData(contract({ company: { name: "Minta Kft.", legalForm: "kft", registrationNumber: "01-09-111111", taxNumber: "12345678-2-42", isNew: false } }), helpers);
    assert.equal(existing.CEGJEGYZEKSZAM_SZOVEG, "01-09-111111");
    assert.equal(existing.ADOSZAM_SZOVEG, "12345678-2-42");
    assert.equal(existing.CEGJEGYZEKSZAM_ADATLAP, "01-09-111111");
    // an existing company that has not given a tax number yet is shown as pending, never as an empty line
    const noTax = buildDocxData(contract({ company: { name: "Minta Kft.", legalForm: "kft", registrationNumber: "01-09-111111", taxNumber: "", isNew: false } }), helpers);
    assert.equal(noTax.ADOSZAM_ADATLAP, "bejegyzés alatt");
  });

  it("the address of the seat is the current one, never the old address the page had in its code", () => {
    const data = buildDocxData(contract(), helpers);
    for (const key of ["SZEKHELY", "KEZBESITESI_CIM", "TELJESITES_HELY"]) {
      assert.equal(data[key], OFFICE_ADDRESS);
      assert.ok(!/Váci/.test(data[key]));
    }
    assert.match(OFFICE_ADDRESS, /Izabella utca 68\/b/);
  });
});

describe("the persons", () => {
  it("the nationality is a name, not the key of the select (the old documents showed \"nemet\")", () => {
    const data = buildDocxData(contract(), helpers);
    assert.equal(data.KEPVISELO_ALLAMPOLGARSAG, "Német");
    assert.equal(data.TULAJDONOS_1_ALLAMPOLGARSAG, "Német");
    assert.equal(buildDocxData(contract({ representative: person({ nationality: "magyar" }) }), helpers).KEPVISELO_ALLAMPOLGARSAG, "Magyar");
  });

  it("the English name of the nationality comes from its own helper; without one the Hungarian name is used, and no nationality is empty", () => {
    const withEn = { nationalityLabel: (value) => NATIONALITIES[value] || value, nationalityLabelEn: (value) => ({ nemet: "German", magyar: "Hungarian" })[value] || value };
    const data = buildDocxData(contract(), withEn);
    assert.equal(data.KEPVISELO_ALLAMPOLGARSAG, "Német");
    assert.equal(data.KEPVISELO_ALLAMPOLGARSAG_EN, "German");
    assert.equal(data.TULAJDONOS_1_ALLAMPOLGARSAG_EN, "German");
    assert.equal(buildDocxData(contract(), helpers).KEPVISELO_ALLAMPOLGARSAG_EN, "Német");
    assert.equal(buildDocxData(contract(), withEn).TULAJDONOS_3_ALLAMPOLGARSAG_EN, "");
  });

  it("the birth name is the name itself when the applicant gave none", () => {
    assert.equal(buildDocxData(contract(), helpers).KEPVISELO_SZUL_NEV, "Teszt Elemér");
    assert.equal(buildDocxData(contract({ representative: person({ birthName: "Régi Név" }) }), helpers).KEPVISELO_SZUL_NEV, "Régi Név");
  });

  it("the place and date of birth, and the document: the document type and its number are written with a space between them", () => {
    const data = buildDocxData(contract(), helpers);
    assert.equal(data.KEPVISELO_SZUL_HELY_IDO, "Teststadt, 1980-02-03");
    assert.equal(data.KEPVISELO_OKMANY, "Útlevél X1234567");
    assert.equal(data.TULAJDONOS_1_OKMANY, "Útlevél X1234567");
    const licence = buildDocxData(contract({ representative: person({ idType: "drivers_license", idNumber: "AB123456" }) }), helpers);
    assert.equal(licence.KEPVISELO_OKMANY, "Vezetői engedély AB123456");
    assert.equal(buildDocxData(contract({ representative: person({ idNumber: "" }) }), helpers).KEPVISELO_OKMANY, "Útlevél");
    assert.equal(buildDocxData(contract({ representative: person({ birthPlace: "", birthDate: "1980-02-03" }) }), helpers).KEPVISELO_SZUL_HELY_IDO, "1980-02-03");
  });

  it("the three owners: owner 2 and 3 are empty when there is none (nothing is made up), a legal owner has no person data", () => {
    const data = buildDocxData(contract(), helpers);
    assert.equal(data.TULAJDONOS_2_OKMANY, "");
    assert.equal(data.TULAJDONOS_3_ALLAMPOLGARSAG, "");
    assert.equal(data.TULAJDONOS_2_SZUL_NEV, "");
    const legal = buildDocxData(contract({ owners: [{ type: "legal", ownershipPercent: 100 }, { type: "natural", ownershipPercent: 0, natural: person({ fullName: "Második Elemér" }) }] }), helpers);
    assert.equal(legal.TULAJDONOS_1_OKMANY, "");
    assert.equal(legal.TULAJDONOS_2_SZUL_NEV, "Második Elemér");
  });

  it("the contact address is the owner's when the contact is the owner and gave none of its own", () => {
    assert.equal(buildDocxData(contract(), helpers).KAPCSOLAT_CIM, "1234 Teststadt, Beispiel Str. 1.");
    assert.equal(buildDocxData(contract({ contact: { isSameAsOwner: false, address: "" } }), helpers).KAPCSOLAT_CIM, "");
    assert.equal(buildDocxData(contract({ contact: { isSameAsOwner: true, address: "1111 Másik utca 2." } }), helpers).KAPCSOLAT_CIM, "1111 Másik utca 2.");
  });

  it("every value is a string (a template never gets undefined)", () => {
    for (const value of Object.values(buildDocxData({}, helpers))) assert.equal(typeof value, "string");
  });
});
