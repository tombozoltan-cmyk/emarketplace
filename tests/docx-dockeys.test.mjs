import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import { DOCKEYS, DOCKEY_LABELS, DOCKEY_CONTRACT, DOCKEY_DELIVERY, pickByDocKey } from "../src/lib/docx-selection.ts";

// The roles of the templates: the upload form offers the list of src/lib/docx-selection.ts, the upload function checks its own copy; the two must
// be the same list, and every role must be one the selection can find.

const functionsSource = readFileSync(join(import.meta.dirname, "..", "functions", "src", "index.ts"), "utf8");

describe("the roles of the templates", () => {
  it("the upload function accepts exactly the roles the upload form offers", () => {
    const match = functionsSource.match(/const DOCX_DOCKEYS = \[([^\]]*)\];/);
    assert.ok(match, "the list DOCX_DOCKEYS is in functions/src/index.ts");
    const inFunctions = [...match[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]);
    assert.deepEqual(inFunctions, DOCKEYS);
  });

  it("are the contract, the delivery contract and the data sheet and declaration of three owners, each with a label", () => {
    assert.deepEqual(DOCKEYS, [DOCKEY_CONTRACT, DOCKEY_DELIVERY, "kyc", "pep", "kyc-1", "kyc-2", "kyc-3", "pep-1", "pep-2", "pep-3"]);
    for (const key of DOCKEYS) assert.ok(DOCKEY_LABELS[key] && DOCKEY_LABELS[key].length > 5, key);
    assert.equal(new Set(Object.values(DOCKEY_LABELS)).size, DOCKEYS.length, "the labels are different");
  });

  it("every role is found by the selection (a template with it is a pick, not an error)", () => {
    for (const key of DOCKEYS) {
      const pick = pickByDocKey([{ id: "x", name: "n", category: "Egyéb", docKey: key }], key);
      assert.equal(pick?.template?.id, "x", key);
    }
    // positive control: a role outside the list is found by nothing
    assert.equal(pickByDocKey([{ id: "x", name: "n", category: "Egyéb", docKey: "kyc-4" }], "kyc-3"), null);
  });

  it("the upload function refuses an unknown role, refuses a second template of one role, and stores the role only when there is one", () => {
    assert.match(functionsSource, /if \(docKey && !DOCX_DOCKEYS\.includes\(docKey\)\)/);
    assert.match(functionsSource, /where\("docKey", "==", docKey\)/);
    assert.match(functionsSource, /\.\.\.\(docKey \? \{ docKey \} : \{\}\)/);
  });

  it("the document generation does not log the name of a person", () => {
    assert.ok(!/TULAJDONOS_1_NEV: finalData\.TULAJDONOS_1_NEV/.test(functionsSource));
  });
});
