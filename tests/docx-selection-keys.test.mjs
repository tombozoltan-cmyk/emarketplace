import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { pickByDocKey, pickContractTemplate, pickDeliveryTemplate, pickOwnerTemplate, planDownloads } from "../src/lib/docx-selection.ts";

// The role keys (docKey) of the new templates: how they are chosen, how they go live next to the old templates and how they are rolled back.
// Names and categories only, no document content and no customer data.

const OLD = [
  { id: "13a41b88", category: "Adatlap", name: "{TULAJDONOS_2_NEV}-ÜGYFÉL - ÁTVILÁGÍTÁSI ADATLAP" },
  { id: "40099f3a", category: "Adatlap", name: "{TULAJDONOS_3_NEV}-ÜGYFÉL - ÁTVILÁGÍTÁSI ADATLAP" },
  { id: "4a687f59", category: "Adatlap", name: "{TULAJDONOS_1_NEV} 2025 átvilágitási adatlap" },
  { id: "5ef4ae87", category: "Szerződés", name: "{TULAJDONOS_1_NEV}  Megbízási szerződés" },
  { id: "bafb0d04", category: "Nyilatkozat", name: "{TULAJDONOS_1_NEV} -KIEMELT KÖZSZEREPLŐI NYILATKOZAT " },
  { id: "dc81233d", category: "Nyilatkozat", name: "{TULAJDONOS_3_NEV} -KIEMELT KÖZSZEREPLŐI NYILATKOZAT " },
  { id: "df86fd79", category: "Nyilatkozat", name: "{TULAJDONOS_2_NEV} -KIEMELT KÖZSZEREPLŐI NYILATKOZAT " },
  { id: "f4f5ed85", category: "Nyilatkozat", name: "{CEG_NEV}_Hozzájáruló Nyilatkozat" },
];
const keyed = (id, category, name, docKey) => ({ id, category, name, docKey });
const NEW_CONTRACT = keyed("n-contract", "Szerződés", "Székhelyszolgáltatási szerződés", "contract");
const NEW_DELIVERY = keyed("n-delivery", "Szerződés", "Kézbesítési megbízási szerződés", "delivery-contract");
const NEW_KYC = [1, 2, 3].map((n) => keyed(`n-kyc${n}`, "Adatlap", `Átvilágítási adatlap ${n}`, `kyc-${n}`));
const NEW_PEP = [1, 2, 3].map((n) => keyed(`n-pep${n}`, "Nyilatkozat", `Közszereplői nyilatkozat ${n}`, `pep-${n}`));
const ALL_NEW = [NEW_CONTRACT, NEW_DELIVERY, ...NEW_KYC, ...NEW_PEP];
const idsOf = (plan) => plan.items.map((item) => `${item.kind}${item.ownerNumber ?? ""}:${item.template.id}`);

describe("a template with a role key is chosen by the role only", () => {
  it("wins over the old template of the same document, whatever the name or the order (the new contract goes live by its role)", () => {
    const list = [...OLD, NEW_CONTRACT];
    assert.equal(pickContractTemplate(list).template.id, "n-contract");
    assert.equal(pickContractTemplate([...list].reverse()).template.id, "n-contract");
    // the new contract is the contract; without it the old one is
    assert.equal(pickContractTemplate(OLD).template.id, "5ef4ae87");
  });

  it("the keyed templates do not disturb the older rules while no role is set for that document (a parked template: no key, category Egyéb)", () => {
    const parked = { id: "parked", category: "Egyéb", name: "Új szerződés (még nem él)" };
    assert.equal(pickContractTemplate([...OLD, parked]).template.id, "5ef4ae87");
    assert.deepEqual(idsOf(planDownloads([...OLD, parked], 1)), ["contract:5ef4ae87", "kyc1:4a687f59", "pep1:bafb0d04"]);
  });

  it("two templates with the same role are an error, not a guess", () => {
    const twice = [...OLD, NEW_CONTRACT, { ...NEW_CONTRACT, id: "n-contract-2" }];
    assert.match(pickContractTemplate(twice).error, /'contract' szerephez több sablon/);
    assert.equal(pickByDocKey(OLD, "contract"), null);
  });

  it("deleting the keyed template brings the old one back (the way back)", () => {
    const live = [...OLD, ...ALL_NEW];
    assert.equal(pickContractTemplate(live).template.id, "n-contract");
    const rolledBack = live.filter((t) => t.id !== "n-contract");
    assert.equal(pickContractTemplate(rolledBack).template.id, "5ef4ae87");
  });
});

describe("the owner documents with roles", () => {
  it("as soon as any data sheet has a role, the data sheet of EVERY owner comes from the keyed ones (never a mix of old and new)", () => {
    const list = [...OLD, NEW_KYC[0]];
    assert.equal(pickOwnerTemplate(list, "Adatlap", 1).template.id, "n-kyc1");
    assert.match(pickOwnerTemplate(list, "Adatlap", 2).error, /'kyc-2' szerepű/);
    // the declarations are still the old ones (their own kind has no role yet)
    assert.equal(pickOwnerTemplate(list, "Nyilatkozat", 1).template.id, "bafb0d04");
  });

  it("the full new set: the plan for three owners, the consent template of the old list is not in it either", () => {
    const plan = planDownloads([...OLD, ...ALL_NEW], 3, { seat: true, delivery: true });
    assert.deepEqual(idsOf(plan), ["contract:n-contract", "delivery:n-delivery", "kyc1:n-kyc1", "pep1:n-pep1", "kyc2:n-kyc2", "pep2:n-pep2", "kyc3:n-kyc3", "pep3:n-pep3"]);
    assert.deepEqual(plan.problems, []);
    assert.ok(!plan.items.some((item) => item.template.id === "f4f5ed85"));
  });

  it("a fourth owner has no template: reported, as before", () => {
    const plan = planDownloads([...OLD, ...ALL_NEW], 4);
    assert.deepEqual(plan.problems.map((p) => p.kind), ["kyc", "pep"]);
  });
});

describe("the delivery contract and the package", () => {
  it("is planned for a package with delivery when its template is uploaded", () => {
    const plan = planDownloads([...OLD, NEW_DELIVERY], 1, { seat: true, delivery: true });
    assert.deepEqual(idsOf(plan), ["contract:5ef4ae87", "delivery:n-delivery", "kyc1:4a687f59", "pep1:bafb0d04"]);
  });

  it("is not a problem while it is not uploaded yet: nothing is planned for it and nothing is reported", () => {
    const plan = planDownloads(OLD, 1, { seat: true, delivery: true });
    assert.deepEqual(idsOf(plan), ["contract:5ef4ae87", "kyc1:4a687f59", "pep1:bafb0d04"]);
    assert.deepEqual(plan.problems, []);
    assert.equal(pickDeliveryTemplate(OLD), null);
  });

  it("a package without delivery gets no delivery contract even if the template exists; a delivery-only package gets no seat contract", () => {
    assert.ok(!planDownloads([...OLD, NEW_DELIVERY], 1, { seat: true, delivery: false }).items.some((i) => i.kind === "delivery"));
    const deliveryOnly = planDownloads([...OLD, NEW_DELIVERY], 1, { seat: false, delivery: true });
    assert.deepEqual(idsOf(deliveryOnly), ["delivery:n-delivery", "kyc1:4a687f59", "pep1:bafb0d04"]);
  });

  it("two delivery templates are an error", () => {
    const plan = planDownloads([...OLD, NEW_DELIVERY, { ...NEW_DELIVERY, id: "n-delivery-2" }], 1, { seat: true, delivery: true });
    assert.deepEqual(plan.problems.map((p) => p.kind), ["delivery"]);
  });
});
