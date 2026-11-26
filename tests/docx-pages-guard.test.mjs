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

  it("recognises the package from the package id and the service type, in the plan and on the button", () => {
    assert.equal((page.match(/packageDocuments\(selectedContract\.packageId, selectedContract\.serviceType\)/g) || []).length, 3, "plan, empty-plan message, button");
    assert.ok(!/packageDocuments\(selectedContract\.packageId\)/.test(page));
  });

  it("a delivery package whose delivery template is not uploaded says so, instead of 'no document for this package'", () => {
    assert.ok(page.includes("A kézbesítési szerződés sablonja még nincs feltöltve."));
    assert.ok(page.includes("Ehhez a csomaghoz nincs ilyen dokumentum."));
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
