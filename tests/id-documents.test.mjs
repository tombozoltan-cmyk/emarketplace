import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { idImageKeysToClear, idImagesFor, uploadedDocumentLabel, withoutOtherTypeImages } from "../src/lib/id-documents.ts";

// The identity document images of the contract wizard and their names in the admin. Run with: npm test.

describe("the images the wizard asks for", () => {
  it("an ID card: front and back, both required (the wording of the form before this change)", () => {
    const images = idImagesFor("personal_id");
    assert.deepEqual(images.map((i) => i.key), ["idFront", "idBack"]);
    assert.ok(images.every((i) => i.required));
    assert.equal(images[0].label.hu, "Személyi igazolvány (előlap)");
    assert.equal(images[1].label.en, "ID Card (back)");
  });

  it("a passport: ONE image, the data page, never an \"ID card\" (the case of an applicant who chose a passport and was asked for an ID card)", () => {
    const images = idImagesFor("passport");
    assert.deepEqual(images.map((i) => i.key), ["passport"]);
    assert.equal(images[0].required, true);
    for (const image of images) assert.ok(!/személyi|ID card/i.test(`${image.label.hu} ${image.label.en} ${image.description.hu} ${image.description.en}`));
    assert.match(images[0].label.hu, /^Útlevél/);
    assert.match(images[0].label.en, /^Passport/);
  });

  it("a missing type is asked as an ID card (the default of the form)", () => {
    assert.deepEqual(idImagesFor(undefined).map((i) => i.key), ["idFront", "idBack"]);
  });

  it("every image has Hungarian and English texts and no em dash", () => {
    for (const type of ["personal_id", "passport"]) {
      for (const image of idImagesFor(type)) {
        for (const text of [image.label.hu, image.label.en, image.description.hu, image.description.en]) {
          assert.ok(text.length > 5);
          assert.ok(!text.includes("—"));
        }
      }
    }
  });
});

describe("changing the document type", () => {
  it("clears the images of the other type and keeps everything else", () => {
    const documents = { idFront: "a", idBack: "b", passport: "c", addressCard: "d", companyExtract: "e" };
    assert.deepEqual(withoutOtherTypeImages(documents, "passport"), { passport: "c", addressCard: "d", companyExtract: "e" });
    assert.deepEqual(withoutOtherTypeImages(documents, "personal_id"), { idFront: "a", idBack: "b", addressCard: "d", companyExtract: "e" });
    assert.deepEqual(idImageKeysToClear("passport"), ["idFront", "idBack"]);
    assert.deepEqual(idImageKeysToClear("personal_id"), ["passport"]);
  });

  it("does not change the object it gets", () => {
    const documents = { idFront: "a", passport: "c" };
    withoutOtherTypeImages(documents, "passport");
    assert.deepEqual(documents, { idFront: "a", passport: "c" });
  });
});

describe("the names of the uploaded images in the admin", () => {
  it("name the image by what was asked when it was uploaded", () => {
    assert.equal(uploadedDocumentLabel("idFront", "personal_id"), "Személyi elő");
    assert.equal(uploadedDocumentLabel("idBack", "personal_id"), "Személyi hát");
    assert.equal(uploadedDocumentLabel("passport", "passport"), "Útlevél (adatoldal)");
    assert.equal(uploadedDocumentLabel("addressCard"), "Lakcímkártya");
    assert.equal(uploadedDocumentLabel("companyExtract"), "Cégkivonat");
    assert.equal(uploadedDocumentLabel("other"), "other");
  });

  it("say so when the application's type does not match (an older application: passport chosen, ID card sides asked), instead of calling it an ID card", () => {
    assert.equal(uploadedDocumentLabel("idFront", "passport"), "Okmány, 1. kép (a megadott típus: útlevél)");
    assert.equal(uploadedDocumentLabel("idBack", "passport"), "Okmány, 2. kép (a megadott típus: útlevél)");
    assert.match(uploadedDocumentLabel("passport", "personal_id"), /a megadott típus: személyi igazolvány/);
    assert.ok(!/Személyi (elő|hát)/.test(uploadedDocumentLabel("idFront", "passport")));
  });
});
