"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, FileCheck, Monitor, Scale, Calculator, type LucideIcon } from "lucide-react";

type ServiceItem = {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
};

export function ServicesSection() {
  const pathname = usePathname();
  const isEnglish = pathname?.startsWith("/en");

  const sectionTitle = isEnglish ? "Our Services" : "Szolgáltatásaink";
  const sectionSubtitle = isEnglish
    ? "End-to-end solutions for your company – registered office, office rental and administration."
    : "Teljes körű megoldások vállalkozásoknak – Székhely, Iroda Bérlés és Adminisztráció";

  const services: ServiceItem[] = isEnglish
    ? [
        {
          title: "Registered office service",
          description:
            "Prestige Budapest address, full legal compliance and complete mail handling.",
          icon: Building2,
          href: "/szekhelyszolgaltatas#szekhely",
        },
        {
          title: "Service address for foreigners",
          description:
            "Mandatory service for foreign directors – we receive and forward official mail.",
          icon: FileCheck,
          href: "/szekhelyszolgaltatas#kezbesitoMegbizott",
        },
        {
          title: "Contracted office / virtual office",
          description:
            "Long-term solution with a 12‑month contract, suitable for bank procedures.",
          icon: Monitor,
          href: "/szekhelyszolgaltatas#virtualOffice",
        },
        {
          title: "Company formation & legal support",
          description:
            "Full legal background for company registration and modifications via partner law firms.",
          icon: Scale,
          href: "/szekhelyszolgaltatas#ugyved",
        },
        {
          title: "Accounting",
          description:
            "Trusted accounting partners taking care of your company’s finances and compliance.",
          icon: Calculator,
          href: "/szekhelyszolgaltatas#konyveles",
        },
      ]
    : [
        {
          title: "Székhelyszolgáltatás+",
          description:
            "Budapesti presztízs cím, törvényi megfelelőség, teljes körű postakezeléssel.",
          icon: Building2,
          href: "/szekhelyszolgaltatas#szekhely",
        },
        {
          title: "Kézbesítési megbízott",
          description:
            "Külföldi ügyvezetőknek kötelező szolgáltatás, hivatalos iratok átvétele.",
          icon: FileCheck,
          href: "/szekhelyszolgaltatas#kezbesitoMegbizott",
        },
        {
          title: "Szerződéses Irodabérlés",
          description:
            "Hosszútávú megoldás 12 hónapos szerződéssel, banki ügyintézéshez.",
          icon: Monitor,
          href: "/szekhelyszolgaltatas#virtualOffice",
        },
        {
          title: "Cégalapítás & Jog",
          description:
            "Teljes körű jogi háttér, cégalapítás és módosítás szakértő partnerekkel.",
          icon: Scale,
          href: "/szekhelyszolgaltatas#ugyved",
        },
        {
          title: "Könyvelés",
          description:
            "Megbízható könyvelő partnereink segítenek vállalkozása pénzügyeinek kezelésében.",
          icon: Calculator,
          href: "/szekhelyszolgaltatas#konyveles",
        },
      ];
  return (
    <section className="w-full bg-muted py-16 text-foreground">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 lg:px-0">
        <div className="text-center">
          <h2 className="text-3xl font-semibold text-[color:var(--primary)] md:text-4xl">
            {sectionTitle}
          </h2>
          <p className="mt-3 text-sm font-medium text-muted-foreground md:text-base">
            {sectionSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-5">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <Link
                key={service.title}
                href={service.href}
                className="group flex h-full min-h-[210px] flex-col items-center justify-start gap-3 rounded-[24px] bg-card px-4 py-6 text-sm text-card-foreground shadow-[0_20px_45px_rgba(15,23,42,0.08)] ring-2 ring-[color:var(--border)] transition-all duration-200 hover:-translate-y-2 hover:shadow-[0_30px_70px_rgba(15,23,42,0.2)] hover:ring-[color:var(--primary)] sm:gap-4 sm:rounded-[28px] sm:px-8 sm:py-9 sm:min-h-[260px]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fdf3dd] text-[color:var(--primary)] shadow-[0_10px_22px_rgba(248,220,158,0.7)] transition-transform duration-200 group-hover:-translate-y-1 group-hover:rotate-3 sm:h-16 sm:w-16">
                  <Icon className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={1.8} />
                </div>
                <h3 className="text-center text-sm font-semibold tracking-tight text-foreground">
                  {service.title}
                </h3>
                <p className="text-center text-[12px] leading-relaxed text-muted-foreground sm:text-[13px]">
                  {service.description}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
