import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

// Legal review 2026-11-26 (msg 3896) and code review 3899: the downloads stop when the contract does not say whether the company is new or which package it
// has; the provider is written with its register name in the documents. These are the places in the code that carry it (source checks: the page is a React
// component and the generators are PDF code, neither runs under node --test).

const root = join(import.meta.dirname, "..");
const read = (path) => readFileSync(join(root, path), "utf8").replace(/\r\n/g, "\n");

describe("the contracts page", () => {
  const page = read("src/app/ops/nova/contracts/page.tsx");

  it("stops every DOCX download with the reason before it plans anything, and does not take a missing 'new company' flag for 'new'", () => {
    const run = page.slice(page.indexOf("const runDocxDownloads"));
    assert.ok(run.indexOf("docxContractProblem(selectedContract)") > -1 && run.indexOf("docxContractProblem(selectedContract)") < run.indexOf("planDownloads("));
    assert.ok(/if \(problem\) \{\n\s+alert\(problem\);\n\s+return;/.test(run), "it shows the reason and returns");
    assert.ok(!/isNew \?\? true/.test(page), "no default of 'new company'");
  });

  it("lets the admin say whether the company is new (a contract without the flag could not be fixed in the page otherwise), and shows it", () => {
    assert.ok(page.includes("Új (alakuló) cég? A szerződések szövege ettől függ"));
    assert.ok(page.includes('<option value="new">Új (alakuló) cég</option>') && page.includes('<option value="existing">Meglévő cég</option>'));
    assert.ok(page.includes("Cég típusa"));
    // "Nincs megadva" removes the field (Firestore does not take undefined)
    assert.ok(/delete next\.isNew;/.test(page));
  });

  it("warns about the delivery contract (a member who is not the representative, a legal person) when a delivery contract is in the plan, and does not stop", () => {
    const run = page.slice(page.indexOf("const runDocxDownloads"));
    assert.ok(/items\.some\(\(item\) => item\.kind === "delivery"\) \? deliveryContractWarning\(selectedContract\) : null/.test(run), "only when the plan has the delivery contract");
    assert.ok(/if \(deliveryWarning\) alert\(deliveryWarning\);\n\s+const data = docxDataOf/.test(run), "an alert, then the downloads go on (no return)");
  });

  it("fills the data sheet and the declaration once per owner, with that owner's data under the tags without a number", () => {
    const run = page.slice(page.indexOf("const runDocxDownloads"));
    assert.ok(/item\.kind === "kyc" \|\| item\.kind === "pep" \? ownerDataAliases\(data, item\.ownerNumber \?\? 1\) : data/.test(run));
    // the file name still carries the owner's number and name
    assert.ok(page.includes("`${title}_${ownerNumber}_${safeOwnerName}_${date}.docx`"));
  });

  it("makes the declaration for the beneficial owners only, tells the rest in a note, and never stops for it", () => {
    const run = page.slice(page.indexOf("const runDocxDownloads"));
    // A nyilatkozat a TÉNYLEGES tulajdonosoké. A tervbe csak a KÖZVETLEN tényleges tulajdonosok
    // sorszáma megy (a jogi személy tag így nem kap üres nevű iratot), a láncon át azonosított
    // emberek pedig külön tételként kapják a sajátjukat.
    assert.ok(run.includes("beneficialOwnersOf(owners)"), "a tényleges tulajdonosok listájából dolgozik");
    assert.ok(run.includes("{ pepOwners: kozvetlenTT }"), "a tervbe csak a közvetlen tényleges tulajdonosok mennek");
    assert.ok(/filter\(\(b\) => !b\.indirect\)/.test(run), "a közvetett tulajdonos nem a sorszámán megy");
    assert.ok(run.includes("if (!valasz) continue;"), "válasz nélkül nem készül nyilatkozat a lánc emberéről");
    // the notes are an alert, and the downloads go on: no `return` between building them and the alert
    assert.ok(/const pepNotes = \[[^\]]*pepRule\.notes/.test(run), "the notes of pepOwnersOf are shown");
    assert.ok(run.includes("decisiveInfluenceNote(selectedContract.decisiveInfluence)"), "the decisive influence (under 25 per cent) is told too");
    const buildToAlert = run.slice(run.indexOf("const pepNotes = "), run.indexOf("if (pepNotes.length > 0) alert("));
    assert.ok(buildToAlert.length > 0 && !/\breturn\b/.test(buildToAlert), "the downloads go on (no return before the alert)");
    // when there is no declaration at all, the notes explain it: the generic "no document for this package" is not added
    assert.ok(/if \(pepNotes\.length === 0\) \{\n\s+alert\(/.test(run));
  });

  it("recognises the package from the package id and the service type, in the plan and on the button", () => {
    assert.equal((page.match(/packageDocuments\(selectedContract\.packageId, selectedContract\.serviceType\)/g) || []).length, 3, "plan, empty-plan message, button");
    assert.ok(!/packageDocuments\(selectedContract\.packageId\)/.test(page));
  });

  it("a delivery package whose delivery template is not uploaded says so, instead of 'no document for this package'", () => {
    assert.ok(page.includes("A kézbesítési szerződés sablonja még nincs feltöltve."));
    assert.ok(page.includes("Ehhez a csomaghoz nincs ilyen dokumentum."));
  });
});

describe("the legal form labels", () => {
  it("are kept in one place: the shortcode mapper uses the table of docx-data.ts and holds none of its own (code review 3899 J1, owner 3901)", () => {
    const mapper = read("src/lib/contract-shortcode-mapper.ts");
    assert.ok(mapper.includes('import { LEGAL_FORM_LABELS } from "./docx-data"'));
    assert.ok(!/const LEGAL_FORM_LABELS/.test(mapper), "no second table");
    assert.ok(read("src/lib/docx-data.ts").includes("export const LEGAL_FORM_LABELS"));
  });
});

describe("the provider's name in the documents", () => {
  it("is the register name in the DOCX data, the postal authorisation and the generated PDFs", () => {
    assert.ok(read("src/app/ops/nova/contracts/page.tsx").includes('"{{SZOLGALTATO_NEV}}": PROVIDER_NAME'));
    assert.ok(read("src/app/ops/nova/contracts/page.tsx").includes("name: PROVIDER_NAME,"));
    for (const file of ["src/lib/pdf-generators/postal-authorization-html.ts", "src/lib/pdf-generators/kyc-form-html.ts", "src/lib/pdf-generators/contract-documents.ts"]) {
      const source = read(file);
      // a string the code prints, or text of the HTML (a comment of the code may still say the short name)
      assert.ok(!/["'`]E-Marketplace Kft\.["'`]|E-Marketplace Kft\. aláírása|\|\| "E-Marketplace Kft/.test(source), `${file}: the old short name is not printed on a document`);
      assert.ok(source.includes("E-Marketplace Szolgáltató Kft."), file);
    }
  });

  it("positive control: the old short name is what the check looks for", () => {
    for (const old of ['name: "E-Marketplace Kft.",', "      E-Marketplace Kft. aláírása", 'x || "E-Marketplace Kft."']) {
      assert.ok(/["'`]E-Marketplace Kft\.["'`]|E-Marketplace Kft\. aláírása|\|\| "E-Marketplace Kft/.test(old), old);
    }
  });
});
