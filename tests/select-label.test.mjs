import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createElement as h } from "react";
import { labelForValue } from "../src/components/ui/select-label.ts";

// A valosagot utanzo fa: a feliratok a NEM beillesztett (zart) lista alatt ulnek.
const lista = (...elemek) => h("div", null, h("button", null, "trigger"), h("div", null, ...elemek));
const tetel = (value, label) => h("div", { value }, label);

test("a felirat a zárt lista elemei közül is előkerül", () => {
  const fa = lista(tetel("magyar", "Magyar"), tetel("nemet", "Német"));
  assert.equal(labelForValue(fa, "magyar"), "Magyar");
  assert.equal(labelForValue(fa, "nemet"), "Német");
});

test("a felirat KÖVETI az értéket, ugyanazon a fán", () => {
  // ez a beragadt felirat elleni őrszem: korábban egy kattintás feliratát
  // tárolta a komponens, és az ott maradt a megváltozott érték mellett is
  const fa = lista(tetel("magyar", "Magyar"), tetel("nemet", "Német"));
  const elobb = labelForValue(fa, "nemet");
  const utobb = labelForValue(fa, "magyar");
  assert.equal(elobb, "Német");
  assert.equal(utobb, "Magyar");
  assert.notEqual(elobb, utobb);
});

test("ismeretlen értékre nincs felirat, így a helykitöltő marad", () => {
  const fa = lista(tetel("magyar", "Magyar"));
  assert.equal(labelForValue(fa, "klingon"), undefined);
});

test("üres vagy hiányzó érték nem ad feliratot", () => {
  const fa = lista(tetel("magyar", "Magyar"));
  assert.equal(labelForValue(fa, ""), undefined);
  assert.equal(labelForValue(fa, undefined), undefined);
});

test("a nem szöveges feliratot nem találja ki", () => {
  const fa = lista(h("div", { value: "x" }, h("span", null, "ikon")));
  assert.equal(labelForValue(fa, "x"), undefined);
});

test("az első egyező elem felirata számít, és a mélyebb szinteket is bejárja", () => {
  const fa = h("div", null, h("div", null, h("div", null, tetel("mely", "Mély"))));
  assert.equal(labelForValue(fa, "mely"), "Mély");
});

// --- őrszem a forráson: ne térjen vissza az állapotból olvasott felirat ---
test("a Select nem tárolja állapotban a feliratot", () => {
  const forras = readFileSync(new URL("../src/components/ui/select.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(forras, /setDisplayLabel/, "a setDisplayLabel visszakerült a Select-be");
  assert.doesNotMatch(
    forras,
    /useState<string \| undefined>\(\)/,
    "a felirat megint helyi állapotból jön",
  );
  assert.match(forras, /labelForValue\(children, value\)/, "a felirat már nem az értékből származik");
});
