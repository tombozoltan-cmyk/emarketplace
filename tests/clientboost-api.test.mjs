import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  CLIENTBOOST_DEFAULT_TIMEOUT_MS,
  CLIENTBOOST_KEY_PREFIX,
  CLIENTBOOST_WHOAMI_PATH,
  ClientBoostApiError,
  ClientBoostConfigError,
  callClientBoost,
  clientboostConfig,
  clientboostWhoami,
  looksLikeClientBoostKey,
} from "../src/lib/clientboost-api.ts";

const KULCS = "sszk_probakulcs_1234567890";
const BEALLITAS = { baseUrl: "https://pelda.invalid", apiKey: KULCS };

/** Rögzíti, mivel hívták, és a megadott választ adja. Hálózatra nem megy. */
const hamisFetch = (valasz = {}) => {
  const hivasok = [];
  const fn = async (url, init) => {
    hivasok.push({ url, init });
    return new Response(valasz.torzs ?? "{}", {
      status: valasz.status ?? 200,
      headers: { "content-type": "application/json" },
    });
  };
  fn.hivasok = hivasok;
  return fn;
};

// --- konfiguráció -----------------------------------------------------------

test("hiányzó környezeti változóknál dob, és mindkettőt megnevezi", () => {
  assert.throws(
    () => clientboostConfig({}),
    (hiba) =>
      hiba instanceof ClientBoostConfigError &&
      hiba.message.includes("CLIENTBOOST_API_URL") &&
      hiba.message.includes("CLIENTBOOST_API_KEY"),
  );
});

test("csak a hiányzó változót nevezi meg", () => {
  assert.throws(
    () => clientboostConfig({ CLIENTBOOST_API_URL: "https://pelda.invalid" }),
    (hiba) =>
      hiba.message.includes("CLIENTBOOST_API_KEY") && !hiba.message.includes("CLIENTBOOST_API_URL"),
  );
});

test("a sima http-t elutasítja, mert a kulcs fejlécben utazik", () => {
  assert.throws(
    () => clientboostConfig({ CLIENTBOOST_API_URL: "http://pelda.invalid", CLIENTBOOST_API_KEY: KULCS }),
    ClientBoostConfigError,
  );
});

test("a lezáró perjelet levágja, hogy ne legyen dupla perjel az útvonalban", () => {
  const c = clientboostConfig({
    CLIENTBOOST_API_URL: "https://pelda.invalid///",
    CLIENTBOOST_API_KEY: KULCS,
  });
  assert.equal(c.baseUrl, "https://pelda.invalid");
});

test("a kulcs alakját józansági szinten ellenőrzi", () => {
  assert.equal(looksLikeClientBoostKey(KULCS), true);
  assert.equal(looksLikeClientBoostKey("rossz_kulcs"), false);
  assert.equal(looksLikeClientBoostKey(CLIENTBOOST_KEY_PREFIX), false);
});

// --- szállítás --------------------------------------------------------------

test("a kulcs Bearer fejlécben megy, és nem az URL-ben", async () => {
  const f = hamisFetch();
  await callClientBoost("/agent-api/whoami", { config: BEALLITAS, fetchImpl: f });

  const { url, init } = f.hivasok[0];
  assert.equal(url, "https://pelda.invalid/agent-api/whoami");
  assert.equal(init.headers.Authorization, `Bearer ${KULCS}`);
  assert.equal(init.headers.Accept, "application/json");
  assert.ok(!url.includes(KULCS), "a kulcs nem kerülhet az URL-be");
});

test("GET-nél nincs törzs és nincs Content-Type", async () => {
  const f = hamisFetch();
  await callClientBoost("/agent-api/whoami", { config: BEALLITAS, fetchImpl: f });

  const { init } = f.hivasok[0];
  assert.equal(init.body, undefined);
  assert.equal(init.headers["Content-Type"], undefined);
});

test("POST-nál a törzs JSON, és az Idempotency-Key átmegy", async () => {
  const f = hamisFetch();
  await callClientBoost("/agent-api/intake", {
    config: BEALLITAS,
    fetchImpl: f,
    method: "POST",
    body: { proba: 1 },
    idempotencyKey: "kulcs-42",
  });

  const { init } = f.hivasok[0];
  assert.equal(init.method, "POST");
  assert.equal(init.body, '{"proba":1}');
  assert.equal(init.headers["Content-Type"], "application/json");
  assert.equal(init.headers["Idempotency-Key"], "kulcs-42");
});

test("Idempotency-Key nélkül nem tesz oda üres fejlécet", async () => {
  const f = hamisFetch();
  await callClientBoost("/agent-api/intake", { config: BEALLITAS, fetchImpl: f, method: "POST", body: {} });
  assert.equal(f.hivasok[0].init.headers["Idempotency-Key"], undefined);
});

test("perjel nélküli útvonalat elutasít", async () => {
  await assert.rejects(
    () => callClientBoost("agent-api/whoami", { config: BEALLITAS, fetchImpl: hamisFetch() }),
    ClientBoostConfigError,
  );
});

// --- hibák ------------------------------------------------------------------

test("a 401-et állapotkóddal és szerver-hibakóddal adja vissza", async () => {
  const f = hamisFetch({
    status: 401,
    torzs: '{"statusCode":401,"code":"AGENT_API_UNAUTHORIZED","message":"Unauthorized"}',
  });

  await assert.rejects(
    () => callClientBoost("/agent-api/whoami", { config: BEALLITAS, fetchImpl: f }),
    (hiba) =>
      hiba instanceof ClientBoostApiError &&
      hiba.status === 401 &&
      hiba.code === "AGENT_API_UNAUTHORIZED",
  );
});

test("a hibaszöveg nem idézi a válasz törzsét - az visszaidézhetne személyes adatot", async () => {
  const f = hamisFetch({
    status: 422,
    torzs: '{"code":"VALIDATION","message":"invalid","field":"owners[0].address","value":"Minta utca 1."}',
  });

  await assert.rejects(
    () => callClientBoost("/agent-api/intake", { config: BEALLITAS, fetchImpl: f, method: "POST", body: {} }),
    (hiba) => {
      assert.ok(!hiba.message.includes("Minta utca"), "a törzs értéke nem kerülhet a hibaszövegbe");
      assert.ok(!hiba.message.includes("owners[0]"), "a mezőnév sem kerülhet a hibaszövegbe");
      assert.equal(hiba.code, "VALIDATION");
      return true;
    },
  );
});

test("a hibaszöveg soha nem tartalmazza a kulcsot", async () => {
  const f = hamisFetch({ status: 403, torzs: '{"code":"FORBIDDEN"}' });
  await assert.rejects(
    () => callClientBoost("/agent-api/whoami", { config: BEALLITAS, fetchImpl: f }),
    (hiba) => !hiba.message.includes(KULCS) && !String(hiba.stack).includes(KULCS),
  );
});

test("elérhetetlen szervernél beszédes hibakódot ad, nem nyers hálózati hibát", async () => {
  const f = async () => {
    throw new TypeError("fetch failed");
  };
  await assert.rejects(
    () => callClientBoost("/agent-api/whoami", { config: BEALLITAS, fetchImpl: f }),
    (hiba) => hiba instanceof ClientBoostApiError && hiba.code === "CLIENTBOOST_UNREACHABLE",
  );
});

test("van alapértelmezett időtúllépés, tehát egy néma szerver nem akasztja meg a kérést", () => {
  assert.ok(CLIENTBOOST_DEFAULT_TIMEOUT_MS > 0 && CLIENTBOOST_DEFAULT_TIMEOUT_MS <= 30_000);
});

// --- végpont ----------------------------------------------------------------

test("a whoami GET-tel a saját útvonalára megy", async () => {
  const f = hamisFetch({ torzs: '{"tenantId":"t1","scopes":["intake:create"]}' });
  const eredmeny = await clientboostWhoami({ config: BEALLITAS, fetchImpl: f });

  assert.equal(f.hivasok[0].url, `https://pelda.invalid${CLIENTBOOST_WHOAMI_PATH}`);
  assert.equal(f.hivasok[0].init.method, "GET");
  assert.deepEqual(eredmeny.scopes, ["intake:create"]);
});

// --- forrás-őrök ------------------------------------------------------------

const FORRAS = readFileSync(new URL("../src/lib/clientboost-api.ts", import.meta.url), "utf8");

test("a modulban nincs NEXT_PUBLIC_ tartalék - azt a Next a kliens-csomagba fordítaná", () => {
  const kodsorok = FORRAS.split("\n").filter((sor) => !sor.trimStart().startsWith("*"));
  assert.doesNotMatch(kodsorok.join("\n"), /process\.env\.NEXT_PUBLIC_/);
});

test("a modul nem naplóz: a kérés törzse és a kulcs nem kerülhet a naplóba", () => {
  assert.doesNotMatch(FORRAS, /console\.(log|warn|error|info|debug)\(/);
});

test("az adat-átadó hívások még nincsenek benne - a mezőszintű leírásra várnak", () => {
  // BOTLASZTÓ. Amikor ez elbukik, valaki adat-átadó hívást tett a kliensbe.
  // Ilyenkor ELŐBB az apphosting.yaml CLIENTBOOST_API_URL értékét kell a PROD
  // hosztra (https://backend.smartszekhely.hu) cserélni, és éles kulcsot tenni
  // a CLIENTBOOST_API_KEY titokba. A 2026-11-27-i kulcs QA-ra szól: amíg az áll
  // ott, az ügyfél-átvilágítási adat a teszt-környezetbe menne.
  assert.doesNotMatch(
    FORRAS,
    /\/agent-api\/intake/,
    "adat-átadó hívás került a kliensbe: előbb PROD hosztra és éles kulcsra kell váltani (lásd apphosting.yaml)",
  );
});
