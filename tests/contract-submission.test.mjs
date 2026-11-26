import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { dropUndefined, missingRequiredDocuments, resolveContact } from "../src/lib/contract-submission.ts";
import { idImagesFor } from "../src/lib/id-documents.ts";

// the upload step asks for the images of the chosen type, so the specs come from the same table it uses
const asked = (idType) => idImagesFor(idType);

// What the wizard writes to Firestore. Run with: npm test.

describe("dropUndefined", () => {
  it("removes the key the remove button left behind (Firestore refuses an undefined field)", () => {
    const documents = { idFront: "https://a", idBack: undefined, addressCard: "https://b" };
    const result = dropUndefined(documents);
    assert.deepEqual(result, { idFront: "https://a", addressCard: "https://b" });
    // the key must be GONE, not present with an undefined value: that is what the SDK rejects
    assert.ok(!("idBack" in result));
  });

  it("reaches every depth of the application", () => {
    const application = {
      company: { name: "Teszt Kft.", taxNumber: undefined },
      owners: [{ ownershipPercent: 100, natural: { fullName: "A", motherName: undefined } }],
      uploadedDocuments: { passport: undefined },
    };
    assert.deepEqual(dropUndefined(application), {
      company: { name: "Teszt Kft." },
      owners: [{ ownershipPercent: 100, natural: { fullName: "A" } }],
      uploadedDocuments: {},
    });
  });

  it("keeps false, 0 and the empty string: only undefined goes", () => {
    assert.deepEqual(dropUndefined({ a: false, b: 0, c: "", d: null, e: undefined }), {
      a: false,
      b: 0,
      c: "",
      d: null,
    });
  });

  it("does not walk into a Date or any other class instance, and does not change its input", () => {
    const date = new Date("2026-01-01T00:00:00Z");
    const input = { at: date, nested: { x: undefined } };
    const result = dropUndefined(input);
    assert.equal(result.at, date);
    assert.deepEqual(input.nested, { x: undefined });
  });
});

describe("resolveContact", () => {
  const contact = { isSameAsOwner: true, fullName: "", email: "a@b.hu", emailConfirm: "a@b.hu", phone: "+36", address: "" };

  it("fills the hidden name and address from a natural first owner (the default path of the form)", () => {
    const owner = { type: "natural", ownershipPercent: 100, natural: { fullName: "Teszt Elek", address: "Budapest, Fő u. 1." } };
    const result = resolveContact(contact, owner);
    assert.equal(result.fullName, "Teszt Elek");
    assert.equal(result.address, "Budapest, Fő u. 1.");
    // the applicant's own e-mail and phone are never replaced by the owner's
    assert.equal(result.email, "a@b.hu");
    assert.equal(result.phone, "+36");
  });

  it("uses the representative of a company first owner", () => {
    const owner = { type: "legal", ownershipPercent: 100, legal: { representativeName: "Kovács Anna", address: "Debrecen, Piac u. 2." } };
    const result = resolveContact(contact, owner);
    assert.equal(result.fullName, "Kovács Anna");
    assert.equal(result.address, "Debrecen, Piac u. 2.");
  });

  it("leaves a contact the applicant typed alone", () => {
    const typed = { ...contact, isSameAsOwner: false, fullName: "Más Ember", address: "Szeged" };
    assert.deepEqual(resolveContact(typed, { type: "natural", ownershipPercent: 100, natural: { fullName: "Teszt Elek", address: "Budapest" } }), typed);
  });

  it("never overwrites a value that is already there", () => {
    const partly = { ...contact, fullName: "Saját Név" };
    const result = resolveContact(partly, { type: "natural", ownershipPercent: 100, natural: { fullName: "Teszt Elek", address: "Budapest" } });
    assert.equal(result.fullName, "Saját Név");
    assert.equal(result.address, "Budapest");
  });

  it("gives empty strings, not undefined, when there is nothing to copy", () => {
    const result = resolveContact(contact, undefined);
    assert.equal(result.fullName, "");
    assert.equal(result.address, "");
  });
});

describe("missingRequiredDocuments", () => {
  it("names the two sides of an ID card while they are missing", () => {
    assert.deepEqual(missingRequiredDocuments({}, asked("personal_id")), [
      "Személyi igazolvány (előlap)",
      "Személyi igazolvány (hátlap)",
    ]);
    assert.deepEqual(missingRequiredDocuments({ idFront: "https://a" }, asked("personal_id")), ["Személyi igazolvány (hátlap)"]);
    assert.deepEqual(missingRequiredDocuments({ idFront: "https://a", idBack: "https://b" }, asked("personal_id")), []);
  });

  it("asks for one image for a passport, and does not ask for the ID card sides", () => {
    assert.deepEqual(missingRequiredDocuments({}, asked("passport")), ["Útlevél (adatoldal)"]);
    assert.deepEqual(missingRequiredDocuments({ passport: "https://a" }, asked("passport")), []);
    // an application with ID card images but a passport chosen still misses the passport page
    assert.deepEqual(missingRequiredDocuments({ idFront: "https://a", idBack: "https://b" }, asked("passport")), ["Útlevél (adatoldal)"]);
  });

  it("does not count the optional documents", () => {
    assert.deepEqual(missingRequiredDocuments({ idFront: "a", idBack: "b" }, asked("personal_id")), []);
  });

  it("answers in English too", () => {
    assert.deepEqual(missingRequiredDocuments({}, asked("passport"), "en"), ["Passport (data page)"]);
  });
});
