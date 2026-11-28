import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { documentImageWarning } from "../src/lib/id-documents.ts";

// A típus- és méretszűrés már korábban lefut; ez azt fogja meg, ami átmegy rajta, de nem okmány.

describe("a feltöltött kép józansági ellenőrzése", () => {
  it("rendes okmányfotóra nem szól", () => {
    assert.equal(documentImageWarning({ type: "image/jpeg", size: 2_000_000 }, { width: 2400, height: 1600 }), null);
  });

  it("PDF-re sosem szól - annál a felbontás nem értelmezett", () => {
    assert.equal(documentImageWarning({ type: "application/pdf", size: 1000 }), null);
  });

  it("olvashatatlanul kicsi képre szól", () => {
    const w = documentImageWarning({ type: "image/jpeg", size: 500_000 }, { width: 400, height: 300 });
    assert.match(String(w), /kicsi/);
  });

  it("kis PNG-re szól, mert az jellemzően logó vagy képernyőkép", () => {
    const w = documentImageWarning({ type: "image/png", size: 20 * 1024 }, { width: 1200, height: 900 });
    assert.match(String(w), /logó|képernyőkép/);
  });

  it("NAGY png-re nem szól - az lehet valódi szkennelt okmány", () => {
    assert.equal(documentImageWarning({ type: "image/png", size: 900 * 1024 }, { width: 2000, height: 1400 }), null);
  });

  it("felbontás nélkül is működik (ha nem sikerült beolvasni a képet)", () => {
    assert.equal(documentImageWarning({ type: "image/jpeg", size: 2_000_000 }), null);
    assert.match(String(documentImageWarning({ type: "image/png", size: 10 * 1024 })), /logó/);
  });
});
