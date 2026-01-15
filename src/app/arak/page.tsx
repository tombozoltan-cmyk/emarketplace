import type { Metadata } from "next";
import {
  Building2,
  Globe,
  Users,
} from "lucide-react";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PricingCardsGrid } from "@/components/PricingCardsGrid";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QuoteButton } from "@/components/QuoteButton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: "Székhelyszolgáltatás Árak 2025 | Díjak és Csomagok Budapesten",
  description:
    "Székhelyszolgáltatás árak 2025-ben Budapest belvárosában: székhely 8.000 Ft/hó, kézbesítési megbízott, kombinált csomagok és virtuális iroda átlátható, rejtett költségek nélküli díjakkal.",
  alternates: {
    canonical: "https://e-marketplace.hu/arak",
    languages: {
      hu: "https://e-marketplace.hu/arak",
      en: "https://e-marketplace.hu/en/pricing",
      de: "https://e-marketplace.hu/de/preise",
      es: "https://e-marketplace.hu/es/precios",
    },
  },
};

export default function PricingPage() {
  return (
    <main className="flex min-h-screen w-full flex-col bg-[color:var(--background)] text-[color:var(--foreground)]">
      <Header />

      {/* HERO */}
      <section className="relative overflow-hidden bg-[color:var(--muted)] pt-16 pb-12 md:pt-24 md:pb-20 lg:pt-32 lg:pb-28">
        {/* Egyszerű bubble dekoráció */}
        <div className="pointer-events-none absolute -left-16 -top-32 h-64 w-64 rounded-full bg-[color:var(--primary)]/15 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-[-6rem] h-72 w-72 rounded-full bg-[color:var(--secondary)]/15 blur-3xl" />

        <div className="relative mx-auto flex min-h-[220px] max-w-4xl flex-col items-center justify-center px-4 text-center sm:min-h-[260px] sm:px-6 lg:min-h-[320px] lg:justify-end lg:pb-8 lg:px-8">
          <h1 className="mb-4 text-balance text-3xl font-bold text-[color:var(--foreground)] md:mb-6 md:text-4xl lg:text-5xl xl:text-6xl">
            <span>Átlátható Árazás,</span>{" "}
            <span className="text-[color:var(--primary)]">Rejtett Költségek Nélkül</span>
          </h1>
          <p className="mx-auto mb-6 max-w-2xl text-pretty text-base text-[color:var(--muted-foreground)] md:mb-8 md:text-lg lg:text-xl">
            Hiszünk abban, hogy egy vállalkozás elindítása nem kell, hogy bonyolult vagy drága legyen. Átlátható csomagjainkkal pontosan látja, mit kap a pénzéért.
          </p>
          <QuoteButton className="rounded-full bg-[color:var(--primary)] px-6 py-3 text-sm text-[color:var(--background)] hover:bg-[color:var(--primary)]/90 md:px-8 md:py-4 md:text-base">
            Ajánlatot kérek
          </QuoteButton>
        </div>
      </section>

      {/* ALAP CSOMAGOK */}
      <section className="bg-[color:var(--background)] py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center md:mb-10">
            <h2 className="mb-3 text-2xl font-bold text-[color:var(--foreground)] md:mb-4 md:text-3xl">
              Alap Székhelyszolgáltatás Csomagok
            </h2>
            <p className="mx-auto max-w-2xl text-sm text-[color:var(--muted-foreground)] md:text-base">
              Válassza ki az Ön vállalkozásához illő székhelycsomagot. Nincsenek rejtett költségek, minden tartalmazza a postakezelést és az értesítéseket.
            </p>
          </div>

          <PricingCardsGrid group="basic" language="hu" />
        </div>
      </section>

      {/* KOMBINÁLT CSOMAGOK (BUNDLE) */}
      <section className="bg-[color:var(--secondary)]/15 py-12 md:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center md:mb-10">
            <h2 className="mb-3 text-2xl font-bold text-[color:var(--foreground)] md:mb-4 md:text-3xl">
              Kombinált Székhely + Kézbesítési csomagok
            </h2>
            <p className="mx-auto max-w-2xl text-sm text-[color:var(--muted-foreground)] md:text-base">
              Kedvezményes csomagok, ha a székhelyszolgáltatást és a kézbesítési megbízottat egyben veszi igénybe.
            </p>
          </div>

          <PricingCardsGrid group="bundles" language="hu" />
        </div>
      </section>

      {/* IRODA CSOMAGOK */}
      <section className="bg-[color:var(--background)] py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <h2 className="mb-4 text-3xl font-bold text-[color:var(--foreground)]">
              Kombinált Iroda Csomagok
            </h2>
            <p className="mx-auto max-w-2xl text-sm text-[color:var(--muted-foreground)] md:text-base">
              Székhelyszolgáltatás és irodahasználat egyben – ha nemcsak hivatalos címet, hanem alkalmi munkavégzésre alkalmas irodát is szeretne.
            </p>
          </div>

          <PricingCardsGrid group="officeBundles" language="hu" />
        </div>
      </section>

      {/* TELJES KÖRŰ CSOMAGOK */}
      <section className="bg-[color:var(--muted)] py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <h2 className="mb-4 text-3xl font-bold text-[color:var(--foreground)]">
              Teljes körű vállalkozói csomagok
            </h2>
            <p className="mx-auto max-w-2xl text-sm text-[color:var(--muted-foreground)] md:text-base">
              Ha mindent egyben szeretne: székhely, iroda és kézbesítési megbízott kedvezményes havi díjjal.
            </p>
          </div>

          <PricingCardsGrid group="fullEntrepreneur" language="hu" />
        </div>
      </section>

      {/* ÖSSZEHASONLÍTÁS SZEKCIÓ */}
      <section className="bg-[color:var(--background)] py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <h2 className="mb-4 text-3xl font-bold text-[color:var(--foreground)]">
              Melyik csomag Önnek való?
            </h2>
            <p className="mx-auto max-w-3xl text-sm text-[color:var(--muted-foreground)] md:text-base">
              Segítünk kiválasztani az Ön vállalkozásához leginkább illeszkedő csomagot. Nézze meg, hogy induló, növekvő vagy külföldi vállalkozásként melyik megoldás támogatja legjobban a céljait.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Indulóknak */}
            <Card className="h-full bg-[color:var(--card)] shadow-sm">
              <CardContent className="p-6 text-center">
                <Building2 className="mx-auto mb-4 h-10 w-10 text-[color:var(--primary)]" />
                <h3 className="mb-2 text-lg font-semibold text-[color:var(--foreground)]">
                  Indulóknak
                </h3>
                <p className="mb-4 text-sm text-[color:var(--muted-foreground)]">
                  Ha most alapítja vállalkozását, és fontos az alacsony fix költség, miközben hivatalos budapesti címet szeretne.
                </p>
                <p className="text-sm font-semibold text-[color:var(--foreground)]">
                  Ajánlott: Alap székhely csomag + Kézbesítési megbízott
                </p>
              </CardContent>
            </Card>

            {/* Növekvőknek */}
            <Card className="h-full bg-[color:var(--card)] shadow-sm">
              <CardContent className="p-6 text-center">
                <Users className="mx-auto mb-4 h-10 w-10 text-[color:var(--secondary)]" />
                <h3 className="mb-2 text-lg font-semibold text-[color:var(--foreground)]">
                  Növekvőknek
                </h3>
                <p className="mb-4 text-sm text-[color:var(--muted-foreground)]">
                  Ha rendszeresen találkozik ügyfelekkel, és szüksége van alkalmi irodahasználatra tárgyalásokhoz vagy csapatmegbeszélésekhez.
                </p>
                <p className="text-sm font-semibold text-[color:var(--foreground)]">
                  Ajánlott: Székhely + Iroda csomag
                </p>
              </CardContent>
            </Card>

            {/* Külföldi vállalkozóknak */}
            <Card className="h-full bg-[color:var(--card)] shadow-sm">
              <CardContent className="p-6 text-center">
                <Globe className="mx-auto mb-4 h-10 w-10 text-[color:var(--primary)]" />
                <h3 className="mb-2 text-lg font-semibold text-[color:var(--foreground)]">
                  Külföldi vállalkozóknak
                </h3>
                <p className="mb-4 text-sm text-[color:var(--muted-foreground)]">
                  Ha magyar bankszámlát szeretne nyitni, hivatalos magyar címet és angol nyelvű szerződéseket igényel a partnerei felé.
                </p>
                <p className="text-sm font-semibold text-[color:var(--foreground)]">
                  Ajánlott: Virtuális iroda vagy Teljes csomag külföldi vállalkozóknak
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ SZEKCIÓ – designos, lenyíló accordion */}
      <section className="bg-[color:var(--muted)] py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <h2 className="mb-3 text-3xl font-bold text-[color:var(--foreground)]">
              Gyakran Ismételt Kérdések
            </h2>
            <p className="mx-auto max-w-2xl text-sm text-[color:var(--muted-foreground)] md:text-base">
              Összegyűjtöttük a legfontosabb kérdéseket a székhelyszolgáltatás és a csomagjaink díjai kapcsán.
            </p>
          </div>

          <Accordion
            type="single"
            collapsible
            className="space-y-3"
          >
            <AccordionItem value="faq-1" className="overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] shadow-sm">
              <AccordionTrigger className="px-5 py-4 text-left text-base font-semibold text-[color:var(--foreground)] md:px-6 md:py-5 md:text-lg">
                Milyen gyakran kell fizetnem?
              </AccordionTrigger>
              <AccordionContent className="px-5 pb-5 pt-0 text-sm text-[color:var(--muted-foreground)] md:px-6 md:pb-6 md:text-base">
                Minden csomagunk esetében 1 évre előre kell fizetni, ami jelentős kedvezményt jelent a havi díjakhoz képest. Így Önnek nem kell havonta számlákkal foglalkoznia, és biztonságban tudhatja székhelyét.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="faq-2" className="overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] shadow-sm">
              <AccordionTrigger className="px-5 py-4 text-left text-base font-semibold text-[color:var(--foreground)] md:px-6 md:py-5 md:text-lg">
                Van-e rejtett költség?
              </AccordionTrigger>
              <AccordionContent className="px-5 pb-5 pt-0 text-sm text-[color:var(--muted-foreground)] md:px-6 md:pb-6 md:text-base">
                Nincsenek rejtett költségek. Az áraink tartalmazzák a teljes körű postakezelést és szkennelést, valamint az emailes értesítéseket. Külön díjat csak extra igénybevett szolgáltatások (pl. plusz irodahasználat) esetén számítunk fel.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="faq-3" className="overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] shadow-sm">
              <AccordionTrigger className="px-5 py-4 text-left text-base font-semibold text-[color:var(--foreground)] md:px-6 md:py-5 md:text-lg">
                Mi a különbség a virtuális iroda és a székhely között?
              </AccordionTrigger>
              <AccordionContent className="px-5 pb-5 pt-0 text-sm text-[color:var(--muted-foreground)] md:px-6 md:pb-6 md:text-base">
                A székhelyszolgáltatás elsősorban a hivatalos cégcím biztosításáról szól, míg a virtuális iroda 12 hónapos, bankok által is elfogadott bérleti szerződéssel jár, amely irodahasználatot is tartalmaz. Ha banki hitelhez vagy komolyabb partnerekhez kell szerződéses iroda, a virtuális iroda a megfelelő választás.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="faq-4" className="overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] shadow-sm">
              <AccordionTrigger className="px-5 py-4 text-left text-base font-semibold text-[color:var(--foreground)] md:px-6 md:py-5 md:text-lg">
                Hogyan működik a postakezelés?
              </AccordionTrigger>
              <AccordionContent className="px-5 pb-5 pt-0 text-sm text-[color:var(--muted-foreground)] md:px-6 md:pb-6 md:text-base">
                Minden Önnek érkező postai küldeményt átvesszünk, iktatunk és beszkennelünk. A szkennelt dokumentumokat emailben továbbítjuk, igény esetén pedig futárral vagy postán továbbítjuk az eredeti példányt is.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="faq-5" className="overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] shadow-sm">
              <AccordionTrigger className="px-5 py-4 text-left text-base font-semibold text-[color:var(--foreground)] md:px-6 md:py-5 md:text-lg">
                Mikor kötelező kézbesítési megbízottat igénybe venni?
              </AccordionTrigger>
              <AccordionContent className="px-5 pb-5 pt-0 text-sm text-[color:var(--muted-foreground)] md:px-6 md:pb-6 md:text-base">
                Minden olyan külföldi ügyvezető vagy tulajdonos esetében kötelező kézbesítési megbízottat megjelölni, akinek nincs magyarországi lakcíme. Ebben a csomagjaink teljes körű megoldást nyújtanak, amely jogszabályoknak megfelelő.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* ZÁRÓ CTA */}
      <section className="bg-gradient-to-b from-[color:var(--primary)]/5 to-[color:var(--background)] py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-6 text-3xl font-bold text-[color:var(--foreground)]">
            Készen áll vállalkozása indítására?
          </h2>
          <p className="mb-4 text-sm text-[color:var(--muted-foreground)] md:mb-6 md:text-base">
            Foglaljon időpontot most, és indítsa el vállalkozását profi székhelyszolgáltatással, átlátható árakkal és rejtett költségek nélkül.
          </p>
          <QuoteButton className="rounded-full bg-[color:var(--primary)] px-8 py-3 text-sm font-semibold text-[color:var(--background)] hover:bg-[color:var(--primary)]/90 md:text-base">
            Ajánlatot kérek
          </QuoteButton>
        </div>
      </section>

      <Footer />
    </main>
  );
}
