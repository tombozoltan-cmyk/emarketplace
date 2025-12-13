"use client";

import React from "react";
import { Clock, Globe2, Mail, FileText, Building2, CheckCircle2 } from "lucide-react";
import { usePathname } from "next/navigation";

const offersHu = [
  {
    title: "Hosszú távú szerződési lehetőség",
    description:
      "Stabil, több éves székhely- és irodamegoldások kiszámítható díjakkal.",
    icon: Clock,
  },
  {
    title: "Külföldi vállalkozások számára",
    description:
      "Teljes körű támogatás külföldi tulajdonú cégek magyarországi székhelyéhez.",
    icon: Globe2,
  },
  {
    title: "Levelezés átvétel és továbbítás",
    description:
      "Hivatalos küldemények átvétele, szkennelése és továbbítása e-mailben vagy postán.",
    icon: Mail,
  },
  {
    title: "Kézbesítési megbízott",
    description:
      "Törvényben előírt kézbesítési megbízotti szolgáltatás külföldi ügyvezetőknek.",
    icon: FileText,
  },
  {
    title: "Iroda és tárgyaló bérlet",
    description:
      "Rugalmas iroda- és tárgyalóhasználat Budapest belvárosában, székhellyel kombinálva.",
    icon: Building2,
  },
  {
    title: "NAV értesítések kezelése",
    description:
      "Hatósági és NAV értesítések szakszerű átvétele, rögzítése és továbbítása.",
    icon: CheckCircle2,
  },
];

const offersEn = [
  {
    title: "Long‑term contract options",
    description:
      "Stable, multi‑year registered office and office solutions with predictable pricing.",
    icon: Clock,
  },
  {
    title: "For foreign‑owned companies",
    description:
      "Full support for foreign‑owned companies establishing a registered office in Hungary.",
    icon: Globe2,
  },
  {
    title: "Mail reception and forwarding",
    description:
      "Receiving, scanning and forwarding official mail by email or post.",
    icon: Mail,
  },
  {
    title: "Service address for authorities",
    description:
      "Legally required service address for foreign directors and owners.",
    icon: FileText,
  },
  {
    title: "Office and meeting room rental",
    description:
      "Flexible office and meeting room use in downtown Budapest, combined with registered office service.",
    icon: Building2,
  },
  {
    title: "Handling tax authority notices",
    description:
      "Professional receipt, logging and forwarding of tax authority and other official notifications.",
    icon: CheckCircle2,
  },
];

export function OffersSection() {
  const pathname = usePathname();
  const isEnglish = pathname?.startsWith("/en");

  const heading = isEnglish ? "What we offer" : "Amit kínálunk";
  const subtitle = isEnglish
    ? "A comprehensive service package tailored to the needs of modern entrepreneurs."
    : "Komplex szolgáltatáscsomag modern vállalkozói igényre szabva";

  const offers = isEnglish ? offersEn : offersHu;
  return (
    <section className="w-full bg-background py-16 text-foreground">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 lg:px-0">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-foreground md:text-3xl">
            {heading}
          </h2>
          <p className="mt-3 text-sm font-medium text-muted-foreground md:text-base">
            {subtitle}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {offers.map((offer) => {
            const Icon = offer.icon;
            return (
              <article
                key={offer.title}
                className="group flex h-full flex-col gap-3 rounded-2xl bg-card p-6 text-sm text-card-foreground shadow-[0_10px_24px_rgba(15,23,42,0.10)] ring-1 ring-[color:var(--border)]/70 transition-all duration-200 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(15,23,42,0.16)] hover:ring-[color:var(--primary)]"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fdf3dd] text-[color:var(--primary)] transition-transform duration-200 group-hover:-translate-y-1 group-hover:rotate-3">
                  <Icon className="h-5 w-5" strokeWidth={1.9} />
                </div>
                <h3 className="text-sm font-semibold tracking-tight text-foreground">
                  {offer.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {offer.description}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
