"use client";

import React, { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { usePathname } from "next/navigation";

const faqsHu = [
  {
    question:
      "Milyen székhely címet kapok, ha igénybe veszem a szolgáltatást Budapesten?",
    answer:
      "Cége hivatalos székhelye a 1064 Budapest, Izabella utca 68/B presztízs címen lesz bejegyezve a cégjegyzékben. Ez egy központi, belvárosi lokáció, amely azonnal növeli vállalkozása hitelességét ügyfelek és partnerek előtt. A székhelyszolgáltatás csomagban postakezelés és kézbesítési megbízott is szerepel.",
  },
  {
    question: "Mennyibe kerül a székhelyszolgáltatás díja, és mit tartalmaz a csomag?",
    answer:
      "Olcsó székhelyszolgáltatásunk 8.000 Ft/hó + ÁFA-tól elérhető, amely tartalmazza a postakezelést, levelek továbbítását, levélszkennelést, cégtábla kihelyezést és kézbesítési megbízott biztosítását. Irodabérlést székhelyszolgáltatással együtt 25.000 Ft/hó-tól kínálunk meeting szoba használattal.",
  },
  {
    question: "Használhatok virtuális irodát bérelt home office helyett?",
    answer:
      "Igen! A virtuális iroda bérlés ideális megoldás home office munkavégzéshez, ha nem szeretné otthoni címét cégként bejelenteni. Kis iroda bérlést rugalmas feltételekkel kínálunk, coworking meeting szoba és tárgyalóhasználattal. Irodabérlés hosszú távra 12 hónapos szerződéssel is elérhető.",
  },
  {
    question:
      "Mi történik, ha postai küldemény vagy hatósági levél érkezik a címemre?",
    answer:
      "Minden beérkező postai küldeményről azonnal email értesítést kap, a leveleket beszkenneljük és digitálisan is megkapja. A kézbesítési megbízott szolgáltatás keretében hatósági levelezés fogadása is biztosított. Az eredeti céges postát személyesen átveheti vagy kérheti annak továbbítását más címre.",
  },
  {
    question:
      "Kötelező-e kézbesítési megbízottat biztosítanom a cégemnek?",
    answer:
      "Igen, a magyar jogszabályok szerint minden gazdasági társaságnak rendelkeznie kell kézbesítési megbízottal, aki munkaidőben elérhető a NAV és más hatóságok számára. Kézbesítési megbízott szolgáltatásunk automatikusan része a székhelyszolgáltatás csomagnak, így Ön megfelel a törvényi előírásoknak.",
  },
  {
    question:
      "Használhatom ezt a címet számlázáshoz, bankszámlanyitáshoz és cégkivonatban is?",
    answer:
      "Igen, székhelyszolgáltatásunk teljes körű címszolgáltatás. Használhatja a hivatalos levelezési címet minden üzleti célra: számlázáshoz, bankszámla nyitáshoz, NAV regisztrációhoz, szerződésekben és céges levelezéshez. A székhely a cégjegyzékben is szerepel.",
  },
  {
    question:
      "Tudok-e új céget alapítani ezzel a székhelyszolgáltatással?",
    answer:
      "Igen, székhelyszolgáltatásunk új cégek számára is azonnal elérhető. A cégalapításhoz szükséges minden dokumentumot (székhelyszolgáltatási szerződés, címhasználati megállapodás, használatbavételi nyilatkozat) biztosítjuk. Partnerünk ügyvéddel a cégjegyzékbe bejegyzés is gyorsan intézhető.",
  },
  {
    question: "Milyen irodabérlés lehetőségek állnak rendelkezésre?",
    answer:
      "Több iroda bérlési lehetőséget kínálunk: 1) Virtuális iroda bérlés székhellyel és postakezeléssel, 2) Kis iroda bérlés Budapest központjában rugalmas feltételekkel, 3) Coworking iroda bérlés meeting szoba és tárgyalóhasználattal, 4) Hosszú távú irodabérlés 12 hónapos szerződéssel és szolgáltatásokkal.",
  },
  {
    question:
      "Igénybe vehetik-e külföldi vállalkozók és külföldi cégek is a szolgáltatást?",
    answer:
      "Igen, székhelyszolgáltatásunk kifejezetten ajánlott külföldi vállalkozóknak és külföldi cégeknek, akik magyarországi jelenlétet szeretnének létrehozni. Biztosítjuk a hivatalos székhelyet, kézbesítési megbízottat és postakezelést, így Ön megfelel a magyar jogszabályoknak anélkül, hogy fizikai irodát kellene bérelnie.",
  },
  {
    question:
      "Van-e lehetőség rövid távú irodahasználatra vagy meeting szoba bérlésre?",
    answer:
      "Igen, irodahelyiség bérlés rövid távra is elérhető. Kínálunk óradíjas meeting szoba bérlést tárgyalókhoz és prezentációkhoz, valamint napi coworking iroda használatot. Az irodabérlés szolgáltatással együtt kedvezményes áron foglalhat tárgyalótermet és munkaterületet.",
  },
  {
    question:
      "Milyen előnyei vannak az irodabérlés + székhelyszolgáltatás kombinált csomagnak?",
    answer:
      "Az irodabérlés székhelyszolgáltatással csomag költséghatékony megoldás: 1) Hivatalos székhely + postakezelés + kézbesítési megbízott, 2) Havi 4 alkalom meeting szoba használat, 3) Coworking munkaterület igény szerint, 4) Presztízs cím a belvárosban, 5) Rejtett költségek nélküli átlátható díjazás. Hosszú távra 12 hónapra különleges kedvezmény.",
  },
  {
    question:
      "Hogyan működik a postai küldemény fogadása és a levelek továbbítása?",
    answer:
      "Postai küldemény kezelés automatikus: minden céges postáról email értesítést kap, a leveleket beszkenneljük és PDF-ben elküldjük. Levelek továbbítását kérheti más címre, vagy személyesen is átveheti az irodánkban. A kézbesítési megbízott biztosítása mellett a postakezelés vállalkozás számára teljes körű és biztonságos.",
  },
];

const faqsEn = [
  {
    question:
      "What registered office address do I get if I use your service in Budapest?",
    answer:
      "Your company’s official registered office will be 1064 Budapest, Izabella utca 68/B – a prestige address in downtown Budapest. This central location immediately increases your business credibility with clients and partners. Our package includes mail handling and service address for authorities.",
  },
  {
    question: "How much does the registered office service cost and what is included?",
    answer:
      "Our affordable registered office service starts from 8,000 HUF + VAT / month. This includes mail handling, forwarding, scanning, signage at the building and a service address for authorities. Office rental combined with registered office is available from 25,000 HUF + VAT / month, including access to a meeting room.",
  },
  {
    question: "Can I use a virtual office instead of my home address?",
    answer:
      "Yes. A virtual office is the ideal solution if you work from home but do not want to register your home address as the company seat. We offer flexible small office and coworking options with meeting rooms, and long‑term office rental with a 12‑month contract is also available.",
  },
  {
    question:
      "What happens when mail or an official letter arrives at my registered office?",
    answer:
      "You receive an email notification for each incoming business mail. We scan the letters and send them to you in digital format, and on request we can forward the originals by post or courier. As part of our service address solution, we also receive official correspondence from authorities on your behalf.",
  },
  {
    question: "Is it mandatory to have a service address (kézbesítési megbízott)?",
    answer:
      "Yes, under Hungarian law every company must have an authorised service address that is available to the tax authority and other authorities during working hours. Our service address solution is automatically included in the registered office package, so you will remain fully compliant.",
  },
];

export function FaqSection() {
  const pathname = usePathname();
  const isEnglish = pathname?.startsWith("/en");

  const faqs = isEnglish ? faqsEn : faqsHu;

  const heading = isEnglish ? "Frequently Asked Questions" : "Gyakran Ismételt Kérdések";
  const subheading = isEnglish
    ? "Everything you need to know about our registered office service in Budapest"
    : "Minden, amit tudnia kell a székhelyszolgáltatásunkról";

  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );
  };

  return (
    <section id="gyik" className="w-full bg-background py-20 text-foreground">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold text-foreground md:text-4xl">
            {heading}
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-muted-foreground">
            {subheading}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {faqs.map((item, index) => {
            const isOpen = openItems.includes(index);
            return (
              <div
                key={item.question}
                className={`overflow-hidden rounded-2xl border-2 border-[color:var(--secondary)]/30 bg-[color:var(--card)] transition-colors duration-300 ${
                  isOpen ? "border-[color:var(--secondary)]" : "hover:border-[color:var(--secondary)]"
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleItem(index)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors hover:bg-[color:var(--muted)]/50"
                  aria-expanded={isOpen}
                >
                  <span className="text-balance text-base font-semibold text-[color:var(--foreground)]">
                    {item.question}
                  </span>
                  <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[color:var(--primary)]/10 text-[color:var(--primary)]">
                    {isOpen ? (
                      <Minus className="h-5 w-5" />
                    ) : (
                      <Plus className="h-5 w-5" />
                    )}
                  </span>
                </button>

                <div
                  className={`overflow-hidden px-6 pb-5 pt-2 text-pretty text-base text-muted-foreground transition-all duration-300 ease-in-out ${
                    isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  {item.answer}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
