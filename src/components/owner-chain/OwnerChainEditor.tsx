"use client";

import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { OwnerChainNode, OwnerType } from "@/lib/contract-types";
import { MAX_OWNER_CHAIN_DEPTH, beneficialOwnersOf } from "@/lib/docx-data";

/**
 * A jogi személy tag MÖGÖTTI tulajdonosi lánc rögzítése, az átvilágításhoz.
 *
 * A köztes szintekhez szándékosan kevés adat kell: név, arány, típus. Teljes személyes adat csak
 * attól kell, akiből végül tényleges tulajdonos lesz - azt az ügyfél-átvilágítási adatlapnál
 * veszik fel. Ez a szerkesztő a SZERKEZETET gyűjti, nem a személyek adatait.
 *
 * A mélység a `beneficialOwnersOf` szabályát követi: legfeljebb `MAX_OWNER_CHAIN_DEPTH` cég, utána
 * a tényleges tulajdonost meg kell nevezni. A jogi átnézés (2026-11-28, 3. pont) szerint a megállás
 * nem lezárás: az ág nyitott marad, és a vezető tisztségviselő NEM léphet a helyére.
 */

type EditorProps = {
  owners: OwnerChainNode[];
  onChange: (owners: OwnerChainNode[]) => void;
  /** Hány cég áll e lista FELETT a láncban. A közvetlen jogi személy tag gyermekeinél 1. */
  companyDepth: number;
};

const uresSor = (): OwnerChainNode => ({ type: "natural", name: "", ownershipPercent: "" });

export function OwnerChainEditor({ owners, onChange, companyDepth }: EditorProps) {
  // Tovább csak akkor ágazhatunk, ha a következő cég még belefér a követett mélységbe.
  const lehetCeg = companyDepth < MAX_OWNER_CHAIN_DEPTH;

  const modosit = (index: number, updates: Partial<OwnerChainNode>) => {
    onChange(owners.map((sor, i) => (i === index ? { ...sor, ...updates } : sor)));
  };

  return (
    <div className="space-y-3">
      {owners.length === 0 && (
        <p className="text-xs text-[color:var(--muted-foreground)]">
          Nincs megadva, ki áll e mögött a cég mögött. Amíg üres, a tényleges tulajdonos ezen az ágon
          ismeretlen marad.
        </p>
      )}

      {owners.map((sor, index) => {
        const jogi = sor.type === "legal";
        return (
          <div key={index} className="rounded-md border border-[color:var(--border)] p-3 space-y-2">
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <label className="text-[color:var(--muted-foreground)] text-xs">
                  {jogi ? "Cég neve" : "Név"}
                </label>
                <Input
                  value={sor.name || ""}
                  onChange={(e) => modosit(index, { name: e.target.value })}
                  className="h-8 text-sm"
                  placeholder={jogi ? "Pl.: Anya Holding Kft." : "Pl.: Kovács János"}
                />
              </div>
              <div className="w-24">
                <label className="text-[color:var(--muted-foreground)] text-xs">Arány (%)</label>
                <Input
                  value={String(sor.ownershipPercent ?? "")}
                  onChange={(e) => modosit(index, { ownershipPercent: e.target.value })}
                  className="h-8 text-sm"
                  placeholder="100"
                />
              </div>
              <div className="w-36">
                <label className="text-[color:var(--muted-foreground)] text-xs">Típus</label>
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
                  <option value="natural">Természetes személy</option>
                  {lehetCeg && <option value="legal">Jogi személy</option>}
                </select>
              </div>
              <button
                type="button"
                onClick={() => onChange(owners.filter((_, i) => i !== index))}
                className="mt-5 p-1 text-[color:var(--muted-foreground)] hover:text-red-600 rounded"
                title="Sor törlése"
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
                  Szabályozott piacon jegyzett (tőzsdei) társaság
                </label>
                {sor.listed ? (
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    A lánc itt megáll. A 25%-ot elérő részvényeseket a nyilvános
                    részesedés-bejelentésekből kell ellenőrizni — az ág nyitott marad.
                  </p>
                ) : (
                  <div className="pl-3 border-l-2 border-[color:var(--border)]">
                    <p className="text-xs text-[color:var(--muted-foreground)] mb-2">
                      Ki áll a(z) {sor.name || "cég"} mögött?
                    </p>
                    <OwnerChainEditor
                      owners={sor.owners || []}
                      onChange={(gyerekek) => modosit(index, { owners: gyerekek })}
                      companyDepth={companyDepth + 1}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        );
      })}

      {!lehetCeg && (
        <p className="text-xs text-amber-700 dark:text-amber-300">
          Ez a {MAX_OWNER_CHAIN_DEPTH}. cég a láncban: mélyebbre már nem megyünk. Itt a tényleges
          tulajdonost névvel kell megadni (természetes személyként). Ha nem ismert, az ág nyitva
          marad — a vezető tisztségviselő nem léphet a helyére.
        </p>
      )}

      <button
        type="button"
        onClick={() => onChange([...owners, uresSor()])}
        className="flex items-center gap-1 text-xs text-[color:var(--primary)] hover:underline"
      >
        <Plus className="w-3 h-3" /> Tulajdonos hozzáadása
      </button>
    </div>
  );
}

/** Amit a megadott láncból a szabály kiolvas: kiket azonosítottunk, és hol maradt nyitott ág. */
export function OwnerChainSummary({
  owners,
}: {
  owners: Parameters<typeof beneficialOwnersOf>[0];
}) {
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
                  {b.name || "(névtelen)"}{" "}
                  <span className="text-[color:var(--muted-foreground)]">
                    {b.indirect ? "közvetett" : "közvetlen"} · {b.path}
                  </span>
                </span>
                <span className="font-semibold text-[color:var(--primary)] whitespace-nowrap">
                  {b.effectiveShare === null ? "? %" : `${String(b.effectiveShare).replace(".", ",")}%`}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {unresolved.length > 0 && (
        <div className="rounded-md border border-amber-300 bg-amber-50 p-2 dark:border-amber-800 dark:bg-amber-950">
          <p className="font-semibold text-amber-800 dark:text-amber-200">
            Nyitott ág ({unresolved.length}) — a tényleges tulajdonos itt nem azonosított
          </p>
          <p className="mt-1 text-amber-800 dark:text-amber-200">
            Amíg nyitott ág van, a vezető tisztségviselő nem léphet a tényleges tulajdonos helyére
            (Pmt. 3. § 38. f) csak valódi hiányra szól).
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
