"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { QuoteButton } from "@/components/QuoteButton";

export function FinalCtaSection() {
  const pathname = usePathname();
  const isEnglish = pathname?.startsWith("/en");

  const heading = isEnglish ? "Ready to get started?" : "Készen áll az indulásra?";
  const text = isEnglish
    ? "Request a personalised offer today and we will help you find the best registered office and office solution for your company in Budapest."
    : "Kérjen személyre szabott ajánlatot még ma, és segítünk megtalálni az Ön vállalkozásának legjobb székhely- és irodamegoldását Budapesten.";
  const buttonLabel = isEnglish ? "Request a free quote" : "Ingyenes ajánlatot kérek";

  return (
    <section className="w-full bg-secondary py-16 text-slate-50">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 text-center lg:px-0">
        <h2 className="text-2xl font-semibold md:text-3xl lg:text-4xl">
          {heading}
        </h2>
        <p className="max-w-2xl text-sm text-slate-200 md:text-base">
          {text}
        </p>
        <QuoteButton className="mt-2 rounded-full bg-primary px-8 py-3 text-sm font-semibold text-secondary shadow-lg shadow-primary/40 hover:scale-[1.03] hover:bg-primary hover:shadow-xl transition">
          {buttonLabel}
        </QuoteButton>
      </div>
    </section>
  );
}
