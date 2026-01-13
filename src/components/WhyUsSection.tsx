"use client";

import React from "react";
import { MapPin, Zap, Shield, TrendingUp } from "lucide-react";
import { usePathname } from "next/navigation";

const reasonsHu = [
  {
    title: "Központi budapesti lokáció",
    description:
      "1064 Budapest, Izabella utca 68/B – presztízs székhely cím a belvárosban, amely azonnal növeli cége hitelességét.",
    icon: MapPin,
  },
  {
    title: "Gyors ügyintézés",
    description:
      "Digitalizált folyamatok, online kommunikáció és gyors reakcióidő – hogy a cégügyei ne álljanak meg.",
    icon: Zap,
  },
  {
    title: "100% jogi megfelelés",
    description:
      "Tapasztalt jogi partnereink segítenek, hogy székhelye minden hatósági előírásnak megfeleljen.",
    icon: Shield,
  },
  {
    title: "Költséghatékony megoldás",
    description:
      "Székhely, postakezelés és iroda bérlés egy csomagban – kedvező díjak, átlátható költségekkel.",
    icon: TrendingUp,
  },
];

const reasonsEn = [
  {
    title: "Central Budapest location",
    description:
      "1064 Budapest, Izabella utca 68/B – a prestige business address in downtown Budapest that instantly boosts your company’s credibility.",
    icon: MapPin,
  },
  {
    title: "Fast administration",
    description:
      "Digital processes, online communication and quick response times – so your company administration never gets stuck.",
    icon: Zap,
  },
  {
    title: "100% legal compliance",
    description:
      "Experienced legal partners ensure that your registered office fully complies with all regulatory requirements.",
    icon: Shield,
  },
  {
    title: "Cost‑effective solution",
    description:
      "Registered office, mail handling and office use in one package – transparent pricing without hidden fees.",
    icon: TrendingUp,
  },
];

export function WhyUsSection() {
  const pathname = usePathname();
  const isEnglish = pathname?.startsWith("/en");

  const heading = isEnglish ? "Why choose us?" : "Miért válasszon minket?";
  const subtitle = isEnglish
    ? "Premium registered office service in Budapest – safe, compliant and cost‑effective for your business."
    : "Prémium székhelyszolgáltatás Budapesten – biztonságos, jogszerű és költséghatékony megoldás vállalkozásának.";

  const reasons = isEnglish ? reasonsEn : reasonsHu;

  return (
    <section className="w-full bg-secondary py-16 text-slate-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 lg:px-0">
        <div className="text-center">
          <h2 className="text-2xl font-semibold md:text-3xl">
            {heading}
          </h2>
          <p className="mt-3 text-sm text-slate-200 md:text-base">
            {subtitle}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {reasons.map((item) => {
            const Icon = item.icon;
            return (
              <article
                key={item.title}
                className="flex h-full flex-col gap-3 rounded-2xl bg-card p-6 text-sm text-card-foreground shadow-[0_18px_40px_rgba(0,0,0,0.65)] ring-1 ring-black/10"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fdf3dd] text-[color:var(--primary)]">
                  <Icon className="h-5 w-5" strokeWidth={1.9} />
                </div>
                <h3 className="text-sm font-semibold tracking-tight text-foreground">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
