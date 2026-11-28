"use client";

import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { OwnerChainNode, OwnerType } from "@/lib/contract-types";
import { MAX_OWNER_CHAIN_DEPTH, beneficialOwnersOf } from "@/lib/docx-data";

/**
 * A cég mögötti tulajdonosi lánc rögzítése.
 *
 * Két helyen fut: az ÜGYFÉL űrlapján és az IRODA admin felületén. A kettőnek más szöveg kell, és
 * ezt nem lehet egy szöveggel megúszni: az ügyfélnek a §-hivatkozás és a belső eljárás semmit nem
 * mond, az irodának viszont pont az a hasznos. Ezért minden magyarázatnak két változata van
 * (`audience`), és a különbség szándékos, nem elfelejtett egységesítés.
 *
 * Amit gyűjt: csak NÉV, ARÁNY, TÍPUS. Teljes személyes adat csak attól kell, akiből végül
 * tényleges tulajdonos lesz - azt az átvilágítási adatlapnál veszik fel.
 */

export type ChainAudience = "ugyfel" | "iroda";

type EditorProps = {
  owners: OwnerChainNode[];
  onChange: (owners: OwnerChainNode[]) => void;
  /** Hány cég áll e lista FELETT a láncban. A közvetlen jogi személy tag gyermekeinél 1. */
  companyDepth: number;
  audience: ChainAudience;
};

const uresSor = (): OwnerChainNode => ({ type: "natural", name: "", ownershipPercent: "" });

/** Minden magyarázat két hangnemben. Az ügyfélé köznyelvi, az irodáé pontos. */
const SZOVEG = {
  ures: {
    ugyfel: "Még nincs megadva, ki a cég tulajdonosa. Ha tudja, írja be — ezzel gyorsul az ügyintézés.",
    iroda:
      "Nincs rögzítve, ki áll e mögött a cég mögött. Amíg üres, a tényleges tulajdonos ezen az ágon nem azonosított.",
  },
  jegyzettJelolo: {
    ugyfel: "Ez a cég tőzsdén jegyzett",
    iroda: "Szabályozott piacon jegyzett (tőzsdei) társaság",
  },
  jegyzettMagyarazat: {
    ugyfel: "Tőzsdei cégnél nem kérjük a tulajdonosok felsorolását: azt nyilvános adatbázisból nézzük meg.",
    iroda:
      "A lánc itt megáll. A 25%-ot elérő részvényeseket a nyilvános részesedés-bejelentésekből kell ellenőrizni. Az azonosítás ezen az ágon hiányos marad, és a vezető tisztségviselő nem léphet a tényleges tulajdonos helyére (Pmt. 3. § 38. f) csak valódi hiányra szól).",
  },
  melyseg: {
    ugyfel:
      "Itt már nem kérdezünk tovább céget. Kérjük, írja be annak a személynek a nevét, akié végső soron a tulajdon. Ha nem tudja, hagyja üresen — kollégánk egyeztet Önnel.",
    iroda: `Ez a ${MAX_OWNER_CHAIN_DEPTH}. cég a láncban, mélyebbre nem megyünk. Itt a tényleges tulajdonost névvel kell megadni. Ha nem ismert, az azonosítás hiányos marad, és a vezető tisztségviselő nem léphet a helyére.`,
  },
  hozzaad: { ugyfel: "Tulajdonos hozzáadása", iroda: "Tulajdonos hozzáadása" },
  nevCeg: { ugyfel: "A cég neve", iroda: "Cég neve" },
  nevSzemely: { ugyfel: "Név", iroda: "Név" },
  arany: { ugyfel: "Tulajdonrész (%)", iroda: "Arány (%)" },
  tipus: { ugyfel: "Ki ez?", iroda: "Típus" },
  szemely: { ugyfel: "Magánszemély", iroda: "Természetes személy" },
  ceg: { ugyfel: "Egy másik cég", iroda: "Jogi személy" },
} as const;

export function OwnerChainEditor({ owners, onChange, companyDepth, audience }: EditorProps) {
  const sz = <K extends keyof typeof SZOVEG>(kulcs: K) => SZOVEG[kulcs][audience];
  // Tovább csak akkor ágazhatunk, ha a következő cég még belefér a követett mélységbe.
  const lehetCeg = companyDepth < MAX_OWNER_CHAIN_DEPTH;

  const modosit = (index: number, updates: Partial<OwnerChainNode>) => {
    onChange(owners.map((sor, i) => (i === index ? { ...sor, ...updates } : sor)));
  };

  return (
    <div className="space-y-3">
      {owners.length === 0 && <p className="text-xs text-[color:var(--muted-foreground)]">{sz("ures")}</p>}

      {owners.map((sor, index) => {
        const jogi = sor.type === "legal";
        return (
          <div key={index} className="rounded-md border border-[color:var(--border)] p-3 space-y-2">
            {/* flex-wrap: beágyazva a konténer keskeny, ilyenkor a mezők TÖRDELŐDNEK, nem
                préselődnek össze. Képernyő-törésponttal ez nem oldható meg, mert nem a
                képernyő szűk, hanem a befoglaló doboz. */}
            <div className="flex flex-wrap items-start gap-2">
              <div className="min-w-[11rem] flex-1">
                <label className="text-[color:var(--muted-foreground)] text-xs">
                  {jogi ? sz("nevCeg") : sz("nevSzemely")}
                </label>
                <Input
                  value={sor.name || ""}
                  onChange={(e) => modosit(index, { name: e.target.value })}
                  className="h-8 text-sm"
                  placeholder={jogi ? "Pl.: Anya Holding Kft." : "Pl.: Kovács János"}
                />
              </div>
              <div className="w-28">
                <label className="text-[color:var(--muted-foreground)] text-xs">{sz("arany")}</label>
                <Input
                  value={String(sor.ownershipPercent ?? "")}
                  onChange={(e) => modosit(index, { ownershipPercent: e.target.value })}
                  className="h-8 text-sm"
                  placeholder="100"
                />
              </div>
              <div className="w-40">
                <label className="text-[color:var(--muted-foreground)] text-xs">{sz("tipus")}</label>
                <select
                  value={jogi ? "legal" : "natural"}
                  onChange={(e) =>
                    modosit(index, {
                      type: e.target.value as OwnerType,
                      // típusváltásnál a másik ág adatai nem maradhatnak ott félrevezetőnek
                      ...(e.target.value === "legal" ? {} : { owners: undefined, listed: undefined }),
                    })
                  }
                  className="h-8 w-full rounded-md border border-[color:var(--border)] bg-[color:var(--background)] px-2 text-sm"
                >
                  <option value="natural">{sz("szemely")}</option>
                  {lehetCeg && <option value="legal">{sz("ceg")}</option>}
                </select>
              </div>
              <button
                type="button"
                onClick={() => onChange(owners.filter((_, i) => i !== index))}
                className="mt-5 p-1 text-[color:var(--muted-foreground)] hover:text-red-600 rounded"
                title="Sor törlése"
                aria-label="Sor törlése"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {jogi && (
              <>
                <label className="flex items-center gap-2 text-xs text-[color:var(--muted-foreground)]">
                  <input
                    type="checkbox"
                    checked={Boolean(sor.listed)}
                    onChange={(e) => modosit(index, { listed: e.target.checked })}
                  />
                  {sz("jegyzettJelolo")}
                </label>
                {sor.listed ? (
                  <p className="text-xs text-amber-700 dark:text-amber-300">{sz("jegyzettMagyarazat")}</p>
                ) : (
                  <div className="pl-2 border-l-2 border-[color:var(--border)]">
                    <p className="text-xs text-[color:var(--muted-foreground)] mb-2">
                      {audience === "ugyfel"
                        ? `És ki a tulajdonosa a(z) ${sor.name || "ennek a cégnek"}?`
                        : `Ki áll a(z) ${sor.name || "cég"} mögött?`}
                    </p>
                    <OwnerChainEditor
                      owners={sor.owners || []}
                      onChange={(gyerekek) => modosit(index, { owners: gyerekek })}
                      companyDepth={companyDepth + 1}
                      audience={audience}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        );
      })}

      {!lehetCeg && <p className="text-xs text-amber-700 dark:text-amber-300">{sz("melyseg")}</p>}

      <button
        type="button"
        onClick={() => onChange([...owners, uresSor()])}
        className="flex items-center gap-1 text-xs text-[color:var(--primary)] hover:underline"
      >
        <Plus className="w-3 h-3" /> {sz("hozzaad")}
      </button>
    </div>
  );
}

/**
 * Amit a megadott láncból a szabály kiolvas. Ez IRODAI nézet: az ügyfélnek nem mutatjuk, mert a
 * százalékok és az útvonalak az ügyintézés eszközei, nem az ügyfél döntéséhez kellenek.
 */
export function OwnerChainSummary({ owners }: { owners: Parameters<typeof beneficialOwnersOf>[0] }) {
  const { beneficialOwners, notes, unresolved } = beneficialOwnersOf(owners);

  return (
    <div className="space-y-3 text-xs">
      <div>
        <p className="font-semibold text-[color:var(--foreground)]">
          Tényleges tulajdonosok a megadott lánc alapján ({beneficialOwners.length})
        </p>
        {beneficialOwners.length === 0 ? (
          <p className="text-[color:var(--muted-foreground)]">
            A megadott adatokból egyetlen természetes személy sem éri el a 25%-ot.
          </p>
        ) : (
          <ul className="mt-1 space-y-1">
            {beneficialOwners.map((b, i) => (
              <li key={i} className="flex items-baseline justify-between gap-2">
                <span>
                  {b.name || "(nincs megadva a neve)"}{" "}
                  <span className="text-[color:var(--muted-foreground)]">
                    {b.indirect ? "a cégen keresztül" : "közvetlen tag"} · {b.path}
                  </span>
                </span>
                <span className="font-semibold text-[color:var(--primary)] whitespace-nowrap">
                  {b.effectiveShare === null
                    ? "arány ismeretlen"
                    : `${String(b.effectiveShare).replace(".", ",")}%`}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {unresolved.length > 0 && (
        <div className="rounded-md border border-amber-300 bg-amber-50 p-2 dark:border-amber-800 dark:bg-amber-950">
          <p className="font-semibold text-amber-800 dark:text-amber-200">
            Hiányzó azonosítás {unresolved.length} ágon — itt nem derült ki, ki a tényleges tulajdonos
          </p>
          <p className="mt-1 text-amber-800 dark:text-amber-200">
            Ezeken az ágakon hiányozni fog egy-egy PEP-nyilatkozat, és a vezető tisztségviselő nem
            léphet a tényleges tulajdonos helyére (Pmt. 3. § 38. f) csak valódi hiányra szól). A többi
            irat ettől függetlenül elkészül.
          </p>
        </div>
      )}

      {notes.length > 0 && (
        <ul className="space-y-1 text-[color:var(--muted-foreground)]">
          {notes.map((note, i) => (
            <li key={i}>• {note}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
