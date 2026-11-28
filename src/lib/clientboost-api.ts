/**
 * ClientBoost Agent API - vékony HTTP-kliens.
 *
 * Az összeköttetés EGYIRÁNYÚ: az e-marketplace a kliens, a ClientBoost adja a
 * végpontokat. Ez a modul csak a szállítást végzi (alap-URL, hitelesítő fejléc,
 * időtúllépés, hibaalak) és a `whoami` próbahívást. Az ügyfél-átvilágítási
 * adatot átadó hívások NINCSENEK benne: azok a mezőszintű szerződés-leírásra
 * várnak, hogy ne legyen két elcsúszó séma.
 *
 * Környezeti változók (MINDKETTŐ szerveroldali):
 * - CLIENTBOOST_API_URL: alap-URL, pl. a QA vagy a PROD hoszt
 * - CLIENTBOOST_API_KEY: az admin által kiállított kulcs (`sszk_` előtaggal)
 *
 * ⛔ `NEXT_PUBLIC_` előtaggal EGYIKET SE állítsd be. A Next az ilyen változókat
 * a kliens-csomagba fordítja, tehát a kulcs kikerülne a böngészőbe. Ezért itt
 * szándékosan NINCS `NEXT_PUBLIC_` tartalék - a `cegjelzo-api.ts`-ben egy ilyen
 * tartalék korábban épp ezt a hibát hordozta.
 *
 * A kulcs a Secret Managerbe tartozik, és az `apphosting.yaml` `secret:`
 * hivatkozással veszi fel, RUNTIME-láthatósággal (ahogy a Cégjelző-kulcs).
 * ⚠ A hivatkozás csak AKKOR kerülhet be a yaml-be, amikor a titok már létezik:
 * különben a következő App Hosting rollout elbukik, és a main minden merge-nél
 * magától telepít.
 */

// =============================================================================
// Állandók
// =============================================================================

/** A kiállított kulcsok előtagja. Csak józansági ellenőrzésre használjuk. */
export const CLIENTBOOST_KEY_PREFIX = "sszk_";

/** Alapértelmezett időtúllépés egy hívásra, milliszekundumban. */
export const CLIENTBOOST_DEFAULT_TIMEOUT_MS = 15_000;

/** A `whoami` útvonala - önazonosítás, próbához. Nem visz adatot. */
export const CLIENTBOOST_WHOAMI_PATH = "/agent-api/whoami";

// =============================================================================
// Hibák
// =============================================================================

/** A konfiguráció hiányos vagy hibás. Nem jutottunk el hálózati hívásig. */
export class ClientBoostConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ClientBoostConfigError";
  }
}

/**
 * A ClientBoost nem 2xx-et adott, vagy a hívás nem jutott célba.
 *
 * A `message` szándékosan csak az állapotkódot és a szerver hibakódját hordozza.
 * A válasz törzsét NEM írjuk bele: egy validációs hiba visszaidézheti azt az
 * adatot, amit küldtünk, és az személyes adat lehet.
 */
export class ClientBoostApiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, hint?: string) {
    super(
      `ClientBoost Agent API hiba: HTTP ${status}` +
        (code ? ` (${code})` : "") +
        (hint ? ` - ${hint}` : ""),
    );
    this.name = "ClientBoostApiError";
    this.status = status;
    this.code = code;
  }
}

// =============================================================================
// Konfiguráció
// =============================================================================

export type ClientBoostConfig = {
  /** Alap-URL, lezáró perjel nélkül. */
  baseUrl: string;
  /** A hitelesítő kulcs. Soha ne naplózd és ne add vissza a válaszban. */
  apiKey: string;
};

type EnvLike = Record<string, string | undefined>;

/**
 * Beolvassa és ellenőrzi a konfigurációt. Hiányzó értéknél DOB, nem csendben
 * üres kulccsal hív: egy 401-et sokkal nehezebb visszafejteni, mint egy
 * beszédes indulási hibát.
 */
export function clientboostConfig(env: EnvLike = process.env): ClientBoostConfig {
  const baseUrlRaw = (env.CLIENTBOOST_API_URL || "").trim();
  const apiKey = (env.CLIENTBOOST_API_KEY || "").trim();

  const hiany: string[] = [];
  if (!baseUrlRaw) hiany.push("CLIENTBOOST_API_URL");
  if (!apiKey) hiany.push("CLIENTBOOST_API_KEY");
  if (hiany.length > 0) {
    throw new ClientBoostConfigError(
      `A ClientBoost Agent API nincs beállítva. Hiányzó környezeti változó: ${hiany.join(", ")}.`,
    );
  }

  if (!/^https:\/\//i.test(baseUrlRaw)) {
    // A kulcs fejlécben megy: sima HTTP-n ez a hálózaton olvasható lenne.
    throw new ClientBoostConfigError(
      "A CLIENTBOOST_API_URL csak https:// lehet, mert a kulcs fejlécben utazik.",
    );
  }

  return { baseUrl: baseUrlRaw.replace(/\/+$/, ""), apiKey };
}

/**
 * Igaz, ha a kulcs a kiállított alakra hasonlít. Csak józansági ellenőrzés:
 * egy elgépelt vagy fél kulcs így a hívás előtt kiderül.
 */
export function looksLikeClientBoostKey(apiKey: string): boolean {
  return apiKey.startsWith(CLIENTBOOST_KEY_PREFIX) && apiKey.length > CLIENTBOOST_KEY_PREFIX.length + 8;
}

// =============================================================================
// Szállítás
// =============================================================================

export type ClientBoostCallOptions = {
  method?: "GET" | "POST";
  /** JSON-törzs. Csak POST-nál van értelme. */
  body?: unknown;
  /**
   * `Idempotency-Key` fejléc. A bekérés létrehozásánál KÖTELEZŐ, különben egy
   * megismételt hívás két bekérést csinál.
   */
  idempotencyKey?: string;
  timeoutMs?: number;
  /** Teszthez befecskendezhető `fetch`. Éles futásnál hagyd el. */
  fetchImpl?: typeof fetch;
  config?: ClientBoostConfig;
};

/**
 * Egy hívás a ClientBoost Agent API-ra.
 *
 * A kulcs `Authorization: Bearer <kulcs>` fejlécben megy. Query-paraméterbe
 * soha nem tesszük: a szerver nem is fogadja el így, és a kulcs bekerülne a
 * hozzáférési naplókba.
 */
export async function callClientBoost<T = unknown>(
  path: string,
  options: ClientBoostCallOptions = {},
): Promise<T> {
  if (typeof window !== "undefined") {
    // Ha ez a modul a böngészőbe kerülne, a kulcs is vele menne.
    throw new ClientBoostConfigError(
      "A ClientBoost-kliens csak szerveroldalon futhat: a kulcs nem kerülhet a böngészőbe.",
    );
  }

  const config = options.config ?? clientboostConfig();
  const method = options.method ?? "GET";
  const timeoutMs = options.timeoutMs ?? CLIENTBOOST_DEFAULT_TIMEOUT_MS;
  const hivo = options.fetchImpl ?? fetch;

  if (!path.startsWith("/")) {
    throw new ClientBoostConfigError(`Az útvonalnak perjellel kell kezdődnie: ${path}`);
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${config.apiKey}`,
    Accept: "application/json",
  };
  if (options.idempotencyKey) headers["Idempotency-Key"] = options.idempotencyKey;
  if (options.body !== undefined) headers["Content-Type"] = "application/json";

  const vezerlo = new AbortController();
  const ido = setTimeout(() => vezerlo.abort(), timeoutMs);

  let valasz: Response;
  try {
    valasz = await hivo(`${config.baseUrl}${path}`, {
      method,
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: vezerlo.signal,
    });
  } catch {
    // Hálózati hiba vagy időtúllépés. A kérés törzsét nem idézzük.
    const ok = vezerlo.signal.aborted ? `időtúllépés ${timeoutMs} ms után` : "hálózati hiba";
    throw new ClientBoostApiError(0, "CLIENTBOOST_UNREACHABLE", ok);
  } finally {
    clearTimeout(ido);
  }

  const szoveg = await valasz.text();
  let torzs: unknown = null;
  if (szoveg) {
    try {
      torzs = JSON.parse(szoveg);
    } catch {
      torzs = null;
    }
  }

  if (!valasz.ok) {
    const kod =
      torzs && typeof torzs === "object" && typeof (torzs as { code?: unknown }).code === "string"
        ? (torzs as { code: string }).code
        : "";
    throw new ClientBoostApiError(valasz.status, kod);
  }

  return torzs as T;
}

// =============================================================================
// Végpontok
// =============================================================================

export type ClientBoostWhoami = {
  /** A kulcshoz tartozó tenant azonosítója, ha a szerver megadja. */
  tenantId?: string;
  /** A kulcsra engedélyezett műveletek. */
  scopes?: string[];
  [tovabbi: string]: unknown;
};

/**
 * Önazonosítás. Ez a próbahívás: nem visz és nem hoz ügyfél-adatot, viszont
 * megmutatja, hogy az alap-URL, a kulcs és a jogosultságok rendben vannak-e.
 */
export async function clientboostWhoami(
  options: Omit<ClientBoostCallOptions, "method" | "body" | "idempotencyKey"> = {},
): Promise<ClientBoostWhoami> {
  return callClientBoost<ClientBoostWhoami>(CLIENTBOOST_WHOAMI_PATH, {
    ...options,
    method: "GET",
  });
}
