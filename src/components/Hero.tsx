"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { QuoteButton } from "@/components/QuoteButton";

export function Hero() {
  const pathname = usePathname();
  const isEnglish = pathname?.startsWith("/en");

  const badgeText = isEnglish
    ? "Premium Registered Office Service"
    : "Prémium Székhelyszolgáltatás+";

  const title = isEnglish
    ? "Premium Registered Office in Budapest"
    : "Prémium Székhelyszolgáltatás+ Budapest";

  const subtitle = isEnglish
    ? "Official registered office for companies in central Budapest. Service address, mail handling and virtual office in one place. Ideal for new ventures and foreign-owned companies."
    : "Hivatalos székhely cégeknek Budapest központjában. Kézbesítési megbízott, postakezelés és virtuális iroda bérlés egy helyen. Új vállalkozások és külföldi cégek számára is!";

  const primaryCta = isEnglish ? "Request an offer" : "Ajánlatot kérek";
  const secondaryCta = isEnglish ? "View pricing" : "Árak megtekintése";
  const pricingHref = isEnglish ? "/en/pricing" : "/arak";

  const statClients = isEnglish ? "Satisfied clients" : "Elégedett ügyfél";
  const statUptime = isEnglish ? "Uptime" : "Rendelkezésre állás";
  const statSupport = isEnglish ? "Customer support" : "Ügyfélszolgálat";
  const statLocation = isEnglish ? "Premium location" : "Prémium székhely";

  return (
    <section className="relative w-full overflow-hidden bg-secondary text-slate-50">
      {/* Dekoratív blobok */}
      <div className="pointer-events-none absolute -left-10 -top-32 h-64 w-64 rounded-full bg-primary/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-6rem] right-[-4rem] h-72 w-72 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative mx-auto flex max-w-6xl flex-col gap-12 px-4 pb-24 pt-24 md:pt-36 lg:pt-40 lg:flex-row lg:items-center lg:px-0">
        {/* Bal oszlop – tartalom */}
        <div className="relative flex-1 space-y-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            {badgeText}
          </p>
          <h1 className="text-3xl font-black leading-tight md:text-4xl lg:text-5xl">
            {title}
          </h1>
          <p className="max-w-xl text-base text-slate-200 md:text-lg">
            {subtitle}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <QuoteButton
              className="rounded-full bg-primary px-7 py-3 text-sm font-semibold text-[color:var(--primary-foreground)] shadow-lg shadow-primary/30 hover:scale-[1.02] hover:bg-primary hover:shadow-xl transition"
            >
              {primaryCta}
            </QuoteButton>
            <Link
              href={pricingHref}
              className="inline-flex items-center justify-center rounded-full border border-primary/70 bg-transparent px-7 py-3 text-sm font-semibold text-primary hover:bg-primary/10 transition"
            >
              {secondaryCta}
            </Link>
          </div>

          {/* Statisztika dobozok */}
          <div className="mt-6 grid grid-cols-2 gap-4 text-xs text-slate-100 sm:grid-cols-3 lg:grid-cols-4">
            <div className="rounded-2xl bg-white/5 px-4 py-3 ring-1 ring-white/10">
              <div className="text-base font-bold text-primary md:text-lg">500+</div>
              <div className="text-[11px] md:text-xs">{statClients}</div>
            </div>
            <div className="rounded-2xl bg-white/5 px-4 py-3 ring-1 ring-white/10">
              <div className="text-base font-bold text-primary md:text-lg">99.9%</div>
              <div className="text-[11px] md:text-xs">{statUptime}</div>
            </div>
            <div className="rounded-2xl bg-white/5 px-4 py-3 ring-1 ring-white/10">
              <div className="text-base font-bold text-primary md:text-lg">24/7</div>
              <div className="text-[11px] md:text-xs">{statSupport}</div>
            </div>
            <div className="rounded-2xl bg-white/5 px-4 py-3 ring-1 ring-white/10">
              <div className="text-base font-bold text-primary md:text-lg">Budapest</div>
              <div className="text-[11px] md:text-xs">{statLocation}</div>
            </div>
          </div>
        </div>

        {/* Jobb oszlop – Kép (mobilon rejtve) */}
        <div className="hidden lg:flex relative flex-1 items-start justify-center mt-24 lg:mt-24 -ml-[200px]">
          <div className="relative w-full max-w-full">
            {/* Sejtelmes karika a férfi mögött */}
            <div className="absolute top-[15%] left-[20%] w-40 h-40 rounded-full bg-primary/25 blur-3xl pointer-events-none" />
            <div className="absolute top-[35%] left-[40%] w-28 h-28 rounded-full bg-primary/20 blur-2xl pointer-events-none" />
            <Image
              src="https://firebasestorage.googleapis.com/v0/b/emarketplace-8aab1.firebasestorage.app/o/image%2Femarketplace_geader-people.png?alt=media&token=ab27955b-1120-4bcf-9f1f-8f690ab86591"
              alt="E-Marketplace csapat"
              width={2000}
              height={1600}
              className="w-full h-auto object-contain rounded-2xl scale-[1.6] relative z-10"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
