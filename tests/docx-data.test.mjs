import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { DELIVERY_CONTRACT_WARNING, DELIVERY_FEE, LEGAL_FORM_LABELS, deliveryContractWarning, OFFICE_ADDRESS, PROVIDER_NAME, buildDocxData, canonicalPackageId, docxContractProblem, feesOf, packageDocuments } from "../src/lib/docx-data.ts";

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
    assert.deepEqual(packageDocuments("szekhely-hu"), { seat: true, delivery: false, known: true });
    assert.deepEqual(packageDocuments("szekhely-kulfoldi"), { seat: true, delivery: false, known: true });
    assert.deepEqual(packageDocuments("szekhely-kezbesitesi-hu"), { seat: true, delivery: true, known: true });
    assert.deepEqual(packageDocuments("szekhely-kezbesitesi-kulfoldi"), { seat: true, delivery: true, known: true });
    assert.deepEqual(packageDocuments("kezbesitesi"), { seat: false, delivery: true, known: true });
    assert.deepEqual(packageDocuments("iroda-kezbesitesi-hu"), { seat: true, delivery: true, known: true });
    assert.deepEqual(packageDocuments("iroda-hu"), { seat: true, delivery: false, known: true });
  });

  // code review 3899 J2: the wizard stores the id of the price CARD when the card has no packageId field
  it("the ids of the price cards are known too (a contract made from a card without a packageId field)", () => {
    const expected = { "basic-hu": [true, false], "basic-foreign": [true, false], "basic-delivery-agent": [false, true], "basic-virtual-office": [true, false], "bundle-hu": [true, true], "bundle-foreign": [true, true], "office-hu": [true, false], "office-foreign": [true, false], "full-hu": [true, true], "full-foreign": [true, true] };
    for (const [id, [seat, delivery]] of Object.entries(expected)) assert.deepEqual(packageDocuments(id), { seat, delivery, known: true }, id);
    assert.equal(canonicalPackageId("bundle-foreign"), "szekhely-kezbesitesi-kulfoldi");
  });

  it("an unknown package is not guessed: it is reported as unknown (the pages stop), and the service type only helps when there is no package id", () => {
    assert.equal(packageDocuments(undefined).known, false);
    assert.equal(packageDocuments("").known, false);
    assert.equal(packageDocuments("valami-uj-csomag").known, false);
    // an unknown package id is not rescued by the service type (it is the fallback "szekhely-hu" of the wizard for ids it does not know)
    assert.equal(packageDocuments("valami-uj-csomag", "szekhely-hu").known, false);
    // no package id at all: the service type decides
    assert.deepEqual(packageDocuments(undefined, "szekhely-kezbesitesi-hu"), { seat: true, delivery: true, known: true });
    // a package id wins over the service type
    assert.deepEqual(packageDocuments("szekhely-kezbesitesi-kulfoldi", "szekhely-hu"), { seat: true, delivery: true, known: true });
  });

  it("the documents are not made when the company is new or existing is not said, or the package is unknown; the message says what is missing", () => {
    assert.equal(docxContractProblem(contract()), null);
    assert.equal(docxContractProblem(contract({ company: { name: "Minta Kft.", isNew: false } })), null, "an existing company is fine");
    const noFlag = docxContractProblem(contract({ company: { name: "Minta Kft.", legalForm: "kft" } }));
    assert.match(noFlag, /új \(alakuló\) vagy már meglévő/);
    assert.match(docxContractProblem(contract({ packageId: "valami-uj-csomag", serviceType: "szekhely-hu" })), /A csomag nem ismerhető fel \(csomagazonosító: "valami-uj-csomag", szolgáltatástípus: "szekhely-hu"\)/);
    assert.match(docxContractProblem(contract({ packageId: undefined, serviceType: undefined })), /A csomag nem ismerhető fel/);
    // a string "false" or a missing flag is not a yes or a no
    assert.ok(docxContractProblem(contract({ company: { name: "Minta Kft.", isNew: "false" } })));
  });

  // legal review 2026-11-26 (msg 3896 1/e): the delivery contract template has the representative as the Principal; a warning, never a stop
  it("the delivery contract warns when a member is not the representative or is a legal person, and says nothing otherwise", () => {
    const warn = (extra) => deliveryContractWarning(contract(extra));
    // the one member is the representative: nothing to say
    assert.equal(warn(), null);
    assert.equal(warn({ owners: [{ type: "natural", natural: person({ fullName: "  teszt   ELEMÉR " }) }] }), null, "case and spaces do not make another person");
    // the member is another person
    assert.equal(warn({ owners: [{ type: "natural", natural: person({ fullName: "Másik Személy" }) }] }), DELIVERY_CONTRACT_WARNING);
    // two members: one of them is not the representative
    assert.equal(warn({ owners: [{ type: "natural", natural: person() }, { type: "natural", natural: person({ fullName: "Másik Személy" }) }] }), DELIVERY_CONTRACT_WARNING);
    // a legal person among the members (also a foreign one: the law is about foreign persons, the check only sees the type)
    assert.equal(warn({ owners: [{ type: "legal" }] }), DELIVERY_CONTRACT_WARNING);
    assert.equal(warn({ owners: [{ type: "natural", natural: person() }, { type: "legal" }] }), DELIVERY_CONTRACT_WARNING);
    // a missing name cannot show that the member is the representative
    assert.equal(warn({ representative: person({ fullName: "" }) }), DELIVERY_CONTRACT_WARNING);
    assert.equal(warn({ owners: [{ type: "natural", natural: person({ fullName: "" }) }] }), DELIVERY_CONTRACT_WARNING);
    // a package without the delivery agent contract has nothing to warn about, whoever the members are
    assert.equal(warn({ packageId: "szekhely-hu", owners: [{ type: "legal" }] }), null);
    // the text is the one of the legal review
    assert.equal(DELIVERY_CONTRACT_WARNING, "Ennél a beadványnál személyenként külön kézbesítési szerződés kell (a tag nem azonos az ügyvezetővel, vagy jogi személy). A sablon ezt nem kezeli.");
  });

  it("the two conditions of the contract sections: a company in formation, and a package with the delivery agent mandate", () => {
    const data = (extra) => buildDocxData(contract(extra), helpers);
    assert.equal(data().UJ_CEG, "1");
    assert.equal(data({ company: { name: "Minta Kft.", isNew: false } }).UJ_CEG, "");
    assert.equal(data().KEZBESITESI_CSOMAG, "1");
    assert.equal(data({ packageId: "szekhely-hu" }).KEZBESITESI_CSOMAG, "");
    assert.equal(data({ packageId: "bundle-hu" }).KEZBESITESI_CSOMAG, "1");
  });

  it("the service provider is written with its register name in every document", () => {
    assert.equal(PROVIDER_NAME, "E-Marketplace Szolgáltató Kft.");
    assert.equal(buildDocxData(contract(), helpers).SZOLGALTATO_NEV, PROVIDER_NAME);
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
    assert.equal(buildDocxData(contract({ company: { name: "Minta Kereskedelmi", legalForm: "kft", isNew: false } }), helpers).CEG_FORMA, "Kft.");
    assert.equal(buildDocxData(contract({ company: { name: "Minta Zrt.", legalForm: "zrt" } }), helpers).CEG_FORMA, "");
    assert.equal(buildDocxData(contract({ company: { name: "Minta", legalForm: "" } }), helpers).CEG_FORMA, "");
  });

  // code review 3899 J1: the wizard stores the legal form as a code ("kft", "ev", "other"); the document gets its label, never the code
  it("the legal form is its label, not the code of the wizard: Kft., Bt., Zrt., Nyrt., Kkt., Egyéni vállalkozó; \"other\" adds nothing", () => {
    const form = (legalForm, name = "Minta Kereskedelmi") => buildDocxData(contract({ company: { name, legalForm } }), helpers).CEG_FORMA;
    assert.deepEqual(["kft", "bt", "zrt", "nyrt", "kkt", "ev", "other"].map((code) => form(code)), ["Kft.", "Bt.", "Zrt.", "Nyrt.", "Kkt.", "Egyéni vállalkozó", ""]);
    // the labels the shortcode mapper prints for CEG_FORMA of the old templates are the same table ("other" is "Egyéb" there, and adds nothing to a name here)
    assert.deepEqual(LEGAL_FORM_LABELS, { kft: "Kft.", bt: "Bt.", zrt: "Zrt.", nyrt: "Nyrt.", kkt: "Kkt.", ev: "Egyéni vállalkozó", other: "Egyéb" });
    assert.equal(form("KFT"), "Kft.", "a code in capitals is the same code");
    assert.equal(form("kft", "Minta Kft"), "", "the name already ends with it, with or without the dot");
    assert.equal(form("bt", "Minta Bt."), "");
    assert.equal(form("Kft.", "Minta Kft."), "", "a label typed as it is is a form the name may already carry");
    assert.equal(form("Kft.", "Minta"), "Kft.", "a value that is not a code is taken as it was typed");
    for (const code of ["kft", "bt", "zrt", "nyrt", "kkt", "ev", "other"]) assert.ok(!new RegExp(`(^| )${code}$`).test(buildDocxData(contract({ company: { name: "Minta", legalForm: code } }), helpers).CEG_TELJES_NEV), `${code} is not printed as a code`);
  });

  it("the whole company name has the legal form once, with no stray space", () => {
    const whole = (company) => buildDocxData(contract({ company }), helpers).CEG_TELJES_NEV;
    assert.equal(whole({ name: "Minta Kereskedelmi", legalForm: "kft" }), "Minta Kereskedelmi Kft.");
    assert.equal(whole({ name: "Minta Kereskedelmi", legalForm: "other" }), "Minta Kereskedelmi");
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
