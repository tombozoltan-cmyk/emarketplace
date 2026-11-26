import assert from "node:assert/strict";
import { describe, it, mock } from "node:test";

import PizZip from "pizzip";

import { cleanDocxXml, generateDocxFromTemplate } from "../src/docx.ts";

// The DOCX generation of the admin documents (functions/src/docx.ts). Run with: npm test (node --test, Node 22.18 or newer, no extra dependency).
// The test document is built here: a minimal docx with a made-up text; no real template and no customer data.

const CONTENT_TYPES = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>`;
const RELS = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`;

function docx(paragraphsXml) {
  const zip = new PizZip();
  zip.file("[Content_Types].xml", CONTENT_TYPES);
  zip.file("_rels/.rels", RELS);
  zip.file("word/document.xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${paragraphsXml}</w:body></w:document>`);
  return zip.generate({ type: "nodebuffer" });
}
const paragraph = (...runs) => `<w:p>${runs.map((text) => `<w:r><w:t xml:space="preserve">${text}</w:t></w:r>`).join("")}</w:p>`;
const textOf = (buffer) => new PizZip(buffer).files["word/document.xml"].asText().replace(/<\/w:p>/g, "\n").replace(/<[^>]+>/g, "");

describe("generateDocxFromTemplate", () => {
  it("fills the tags from the data", () => {
    const out = textOf(generateDocxFromTemplate(docx(paragraph("Név: {TULAJDONOS_1_NEV}, cég: {CEG_NEV}")), { TULAJDONOS_1_NEV: "Teszt Elek", CEG_NEV: "Minta Kft." }));
    assert.match(out, /Név: Teszt Elek, cég: Minta Kft\./);
  });

  it("fills a tag that Word has split over several runs", () => {
    const buffer = docx(paragraph("Cég: {CEG_", "NEV}", " vége"));
    assert.ok(!cleanDocxXml(new PizZip(buffer).files["word/document.xml"].asText()).includes("</w:t></w:r><w:r><w:t xml:space=\"preserve\">NEV}"), "the cleanup joins the split tag");
    assert.match(textOf(generateDocxFromTemplate(buffer, { CEG_NEV: "Minta Kft." })), /Cég: Minta Kft\. vége/);
  });

  it("a tag without a value is written as nothing, never as \"undefined\", and its name goes to the log (positive control: the data has the other tag)", () => {
    const warn = mock.method(console, "warn", () => {});
    try {
      const out = textOf(generateDocxFromTemplate(docx(paragraph("Van: {VAN}; nincs: [{NINCS}]")), { VAN: "igen" }));
      assert.ok(!out.includes("undefined"), "no \"undefined\" text");
      assert.match(out, /Van: igen; nincs: \[\]/);
      assert.equal(warn.mock.calls.length, 1);
      assert.deepEqual(warn.mock.calls[0].arguments, ["Template tags without a value:", "NINCS"]);
    } finally {
      warn.mock.restore();
    }
  });

  it("an empty value is written as nothing and is not reported (the data had the tag)", () => {
    const warn = mock.method(console, "warn", () => {});
    try {
      const out = textOf(generateDocxFromTemplate(docx(paragraph("Cím: [{TULAJDONOS_1_LAKCIM}]")), { TULAJDONOS_1_LAKCIM: "" }));
      assert.match(out, /Cím: \[\]/);
      assert.equal(warn.mock.calls.length, 0);
    } finally {
      warn.mock.restore();
    }
  });

  it("the date tags are filled from today when the data has none", () => {
    const out = textOf(generateDocxFromTemplate(docx(paragraph("{EV}.{NAP}.")), {}));
    assert.match(out, new RegExp(`^${new Date().getFullYear()}\\.\\d+\\.`));
  });
});
