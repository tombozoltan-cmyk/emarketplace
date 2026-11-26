import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { ownerNumberOf, pickContractTemplate, pickOwnerTemplate, planDownloads } from "../src/lib/docx-selection.ts";

// The DOCX template choice of the admin contract page. Run with: npm test (node --test, Node 22.18 or newer, no extra dependency).
// The list below is the names and categories of the templates that exist today (no document content, no customer data), in the order of
// their document ids: the order the page gets them from Firestore.

const TEMPLATES = [
  { id: "13a41b88", category: "Adatlap", name: "{TULAJDONOS_2_NEV}-ÜGYFÉL - ÁTVILÁGÍTÁSI ADATLAP" },
  { id: "40099f3a", category: "Adatlap", name: "{TULAJDONOS_3_NEV}-ÜGYFÉL - ÁTVILÁGÍTÁSI ADATLAP" },
  { id: "4a687f59", category: "Adatlap", name: "{TULAJDONOS_1_NEV} 2025 átvilágitási adatlap" },
  { id: "5ef4ae87", category: "Szerződés", name: "{TULAJDONOS_1_NEV}  Megbízási szerződés" },
  { id: "bafb0d04", category: "Nyilatkozat", name: "{TULAJDONOS_1_NEV} -KIEMELT KÖZSZEREPLŐI NYILATKOZAT " },
  { id: "dc81233d", category: "Nyilatkozat", name: "{TULAJDONOS_3_NEV} -KIEMELT KÖZSZEREPLŐI NYILATKOZAT " },
  { id: "df86fd79", category: "Nyilatkozat", name: "{TULAJDONOS_2_NEV} -KIEMELT KÖZSZEREPLŐI NYILATKOZAT " },
  { id: "f4f5ed85", category: "Nyilatkozat", name: "{CEG_NEV}_Hozzájáruló Nyilatkozat" },
];
const CONSENT_ID = "f4f5ed85";
const idsOf = (plan) => plan.items.map((item) => `${item.kind}${item.ownerNumber ?? ""}:${item.template.id}`);

// The code BEFORE the fix, kept here as the record of the bug: the "download all" button asked for one template per category, the one without an
// owner number, and when there was none, the FIRST of the list.
function legacyByCategory(templates, category) {
  const inCategory = templates.filter((t) => t.category === category);
  return inCategory.find((t) => !ownerNumberOf(t.name)) || inCategory[0];
}

describe("the owner number of a template name", () => {
  it("is the number in {TULAJDONOS_n_NEV}, and null for a name without one", () => {
    assert.equal(ownerNumberOf("{TULAJDONOS_2_NEV}-ÜGYFÉL - ÁTVILÁGÍTÁSI ADATLAP"), 2);
    assert.equal(ownerNumberOf("{TULAJDONOS_1_NEV}  Megbízási szerződés"), 1);
    assert.equal(ownerNumberOf("{CEG_NEV}_Hozzájáruló Nyilatkozat"), null);
    assert.equal(ownerNumberOf("Egyéb irat"), null);
  });
});

describe("the bug of the old \"download all\" (documented)", () => {
  it("took the data sheet of the SECOND owner and the declaration of CONSENT (positive control: the old choice is wrong on today's list)", () => {
    assert.equal(legacyByCategory(TEMPLATES, "Adatlap").id, "13a41b88");
    assert.equal(legacyByCategory(TEMPLATES, "Nyilatkozat").id, CONSENT_ID);
    assert.equal(legacyByCategory(TEMPLATES, "Egyéb"), undefined);
  });

  it("the new plan takes the template of owner 1 for a contract with one owner, and the consent never", () => {
    const plan = planDownloads(TEMPLATES, 1);
    assert.deepEqual(idsOf(plan), ["contract:5ef4ae87", "kyc1:4a687f59", "pep1:bafb0d04"]);
    assert.deepEqual(plan.problems, []);
  });
});

describe("the plan of the downloads", () => {
  it("has the data sheet and the declaration of every owner, in the owner's own template", () => {
    assert.deepEqual(idsOf(planDownloads(TEMPLATES, 2)), ["contract:5ef4ae87", "kyc1:4a687f59", "pep1:bafb0d04", "kyc2:13a41b88", "pep2:df86fd79"]);
    assert.deepEqual(idsOf(planDownloads(TEMPLATES, 3)), ["contract:5ef4ae87", "kyc1:4a687f59", "pep1:bafb0d04", "kyc2:13a41b88", "pep2:df86fd79", "kyc3:40099f3a", "pep3:dc81233d"]);
  });

  it("the consent declaration is never in a plan, for any number of owners, and not for any owner number", () => {
    for (let owners = 0; owners <= 5; owners++) assert.ok(!planDownloads(TEMPLATES, owners).items.some((item) => item.template.id === CONSENT_ID), `${owners} owners`);
    for (let n = 1; n <= 5; n++) assert.notEqual(pickOwnerTemplate(TEMPLATES, "Nyilatkozat", n).template?.id, CONSENT_ID, `owner ${n}`);
  });

  it("does not depend on the order of the list (a new upload changes the order of the document ids)", () => {
    const reference = idsOf(planDownloads(TEMPLATES, 3));
    assert.deepEqual(idsOf(planDownloads([...TEMPLATES].reverse(), 3)), reference);
    assert.deepEqual(idsOf(planDownloads([...TEMPLATES].sort((a, b) => (a.name < b.name ? -1 : 1)), 3)), reference);
  });

  it("tells what is missing instead of guessing: a fourth owner has no template, and a plan for no owner has only the contract", () => {
    const plan = planDownloads(TEMPLATES, 4);
    assert.deepEqual(plan.problems.map((p) => p.kind), ["kyc", "pep"]);
    assert.match(plan.problems[0].message, /4\. tulajdonoshoz/);
    assert.equal(plan.items.length, 1 + 3 * 2);
    assert.deepEqual(idsOf(planDownloads(TEMPLATES, 0)), ["contract:5ef4ae87"]);
  });

  it("a missing category is a problem of its kind and the other documents still come", () => {
    const withoutContract = TEMPLATES.filter((t) => t.category !== "Szerződés");
    const plan = planDownloads(withoutContract, 1);
    assert.deepEqual(plan.problems.map((p) => p.kind), ["contract"]);
    assert.deepEqual(idsOf(plan), ["kyc1:4a687f59", "pep1:bafb0d04"]);
  });
});

describe("the contract template", () => {
  it("is the one template of the category, whatever its name", () => {
    assert.equal(pickContractTemplate(TEMPLATES).template.id, "5ef4ae87");
  });

  it("a template without an owner number that is added next to the old one replaces it (the upload of the new contract is a deliberate switch)", () => {
    const replaced = [...TEMPLATES, { id: "aaaa0001", category: "Szerződés", name: "Megbízási szerződés (új)" }];
    assert.equal(pickContractTemplate(replaced).template.id, "aaaa0001");
    assert.equal(pickContractTemplate([...replaced].reverse()).template.id, "aaaa0001");
  });

  it("is an error, not a guess, when the choice is ambiguous or there is none", () => {
    const twoNumbered = [...TEMPLATES, { id: "aaaa0002", category: "Szerződés", name: "{TULAJDONOS_1_NEV} másik" }];
    assert.match(pickContractTemplate(twoNumbered).error, /több sablon van/);
    const twoUnnumbered = [...TEMPLATES.filter((t) => t.category !== "Szerződés"), { id: "x1", category: "Szerződés", name: "A" }, { id: "x2", category: "Szerződés", name: "B" }];
    assert.match(pickContractTemplate(twoUnnumbered).error, /több sablon van/);
    assert.match(pickContractTemplate([]).error, /Nincs 'Szerződés' kategóriájú/);
  });
});

describe("the template of one owner's document", () => {
  it("is exactly the one with the owner's number; none or two is an error", () => {
    assert.equal(pickOwnerTemplate(TEMPLATES, "Adatlap", 2).template.id, "13a41b88");
    assert.match(pickOwnerTemplate(TEMPLATES, "Adatlap", 4).error, /Nincs 'Adatlap' sablon a\(z\) 4\. tulajdonoshoz/);
    const twice = [...TEMPLATES, { id: "bbbb0001", category: "Adatlap", name: "{TULAJDONOS_2_NEV} másolat" }];
    assert.match(pickOwnerTemplate(twice, "Adatlap", 2).error, /több sablon is van/);
  });
});
