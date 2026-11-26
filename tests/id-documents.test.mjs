import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { idImagesFor, idTypeLabel, idTypeNote, idTypesFor, isHungarianNationality, uploadedDocumentLabel, validIdType, withoutIdImages } from "../src/lib/id-documents.ts";

// The identity document of the contract wizard: the types by nationality, the images by type, the names in the admin. Run with: npm test.

describe("the document types by nationality (the lawyer's list, review 2026-11-26)", () => {
  it("a Hungarian citizen: ID card, passport, card driving licence (the ID card first, the form's default)", () => {
    assert.deepEqual(idTypesFor("magyar"), ["personal_id", "passport", "drivers_license"]);
    assert.equal(isHungarianNationality("magyar"), true);
  });

  it("a foreign citizen: passport or ID card, NEVER a driving licence (the passport first)", () => {
    for (const nationality of ["nemet", "amerikai", "angol", "", undefined]) {
      assert.deepEqual(idTypesFor(nationality), ["passport", "personal_id"], String(nationality));
      assert.ok(!idTypesFor(nationality).includes("drivers_license"));
    }
    assert.equal(isHungarianNationality("nemet"), false);
  });

  it("a type the nationality does not allow becomes the default of the nationality; an allowed one stays", () => {
    assert.equal(validIdType("magyar", "drivers_license"), "drivers_license");
    assert.equal(validIdType("nemet", "drivers_license"), "passport");
    assert.equal(validIdType("nemet", "personal_id"), "personal_id");
    assert.equal(validIdType("magyar", undefined), "personal_id");
    assert.equal(validIdType("amerikai", undefined), "passport");
  });

  it("the labels exist in both languages for every type, and the notes say what the lawyer asked", () => {
    for (const type of ["personal_id", "passport", "drivers_license"]) {
      for (const lang of ["hu", "en"]) assert.ok(idTypeLabel(type, lang).length > 3, `${type} ${lang}`);
    }
    assert.equal(idTypeLabel("passport", "hu"), "Útlevél");
    assert.match(idTypeLabel("drivers_license", "hu"), /kártya formátumú/);
    // a foreign ID card: only if it entitles to stay in Hungary; a driving licence: card format only; the others have no note
    assert.match(idTypeNote("personal_id", "nemet", "hu"), /magyarországi tartózkodásra jogosít/);
    assert.match(idTypeNote("personal_id", "nemet", "en"), /entitles you to stay in Hungary/);
    assert.equal(idTypeNote("personal_id", "magyar", "hu"), null);
    assert.match(idTypeNote("drivers_license", "magyar", "hu"), /kártya formátumú/);
    assert.equal(idTypeNote("passport", "nemet", "hu"), null);
  });
});

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

  it("a card driving licence: front and back, called a driving licence, never an \"ID card\"", () => {
    const images = idImagesFor("drivers_license");
    assert.deepEqual(images.map((i) => i.key), ["idFront", "idBack"]);
    assert.ok(images.every((i) => i.required));
    assert.equal(images[0].label.hu, "Vezetői engedély (előlap)");
    assert.equal(images[1].label.en, "Driving licence (back)");
    for (const image of images) assert.ok(!/személyi|ID card|útlevél|passport/i.test(`${image.label.hu} ${image.label.en} ${image.description.hu} ${image.description.en}`));
  });

  it("a missing type is asked as an ID card (the default of the form)", () => {
    assert.deepEqual(idImagesFor(undefined).map((i) => i.key), ["idFront", "idBack"]);
  });

  it("every image has Hungarian and English texts and no em dash", () => {
    for (const type of ["personal_id", "passport", "drivers_license"]) {
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
  it("removes every identity document image and keeps everything else (an ID card and a driving licence share the keys but are different documents)", () => {
    const documents = { idFront: "a", idBack: "b", passport: "c", addressCard: "d", companyExtract: "e" };
    assert.deepEqual(withoutIdImages(documents), { addressCard: "d", companyExtract: "e" });
  });

  it("does not change the object it gets", () => {
    const documents = { idFront: "a", passport: "c" };
    withoutIdImages(documents);
    assert.deepEqual(documents, { idFront: "a", passport: "c" });
  });
});

describe("the names of the uploaded images in the admin", () => {
  it("name the image by what was asked when it was uploaded", () => {
    assert.equal(uploadedDocumentLabel("idFront", "personal_id"), "Személyi elő");
    assert.equal(uploadedDocumentLabel("idBack", "personal_id"), "Személyi hát");
    assert.equal(uploadedDocumentLabel("passport", "passport"), "Útlevél (adatoldal)");
    assert.equal(uploadedDocumentLabel("idFront", "drivers_license"), "Vezetői engedély, előlap");
    assert.equal(uploadedDocumentLabel("idBack", "drivers_license"), "Vezetői engedély, hátlap");
    assert.equal(uploadedDocumentLabel("addressCard"), "Lakcímkártya");
    assert.equal(uploadedDocumentLabel("companyExtract"), "Cégkivonat");
    assert.equal(uploadedDocumentLabel("other"), "other");
  });

  it("say so when the application's type does not match (an older application: passport chosen, ID card sides asked), instead of calling it an ID card", () => {
    assert.equal(uploadedDocumentLabel("idFront", "passport"), "Okmány, 1. kép (a megadott típus: útlevél)");
    assert.equal(uploadedDocumentLabel("idBack", "passport"), "Okmány, 2. kép (a megadott típus: útlevél)");
    assert.match(uploadedDocumentLabel("passport", "personal_id"), /a megadott típus: személyi igazolvány/);
    assert.match(uploadedDocumentLabel("passport", "drivers_license"), /a megadott típus: vezetői engedély/);
    assert.ok(!/Személyi (elő|hát)/.test(uploadedDocumentLabel("idFront", "passport")));
  });
});
