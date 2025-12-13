"use client";

import React from "react";
import { Star } from "lucide-react";
import { usePathname } from "next/navigation";

const testimonialsHu = [
  {
    quote:
      "A székhelyszolgáltatás professzionális, gyors ügyintézés, rugalmas megoldások.",
    name: "Szakmaverzum Médiaszolgáltató és Kommunikációs",
    company: "",
  },
  {
    quote:
      "Kiváló szolgáltatás nemzetközi cégeknek. Az angol nyelvű kommunikáció zökkenőmentes volt.",
    name: "Bitcoin Solutions",
    company: "",
  },
  {
    quote:
      "A postakezelés egyszerű és gyors. Az emailben kapott dokumentumok mindig elérhetők.",
    name: "Art Invoice Hungary",
    company: "",
  },
  {
    quote:
      "A központi budapesti lokáció kiváló előny ügyfeleinknek. Presztízs cím!",
    name: "Energy Solver Centrum",
    company: "",
  },
  {
    quote:
      "Rugalmas irodahasználat, modern környezet. Nagyszerű kiegészítő szolgáltatások.",
    name: "hello Solutions",
    company: "",
  },
  {
    quote:
      "Versenyképes árak, kiváló ár-érték arány. Kezdő vállalkozásoknak ajánlom!",
    name: "JPK Consulting",
    company: "",
  },
];

const testimonialsEn = [
  {
    quote:
      "Professional registered office service with fast administration and flexible solutions.",
    name: "Szakmaverzum Media Services & Communications",
    company: "",
  },
  {
    quote:
      "Excellent service for international companies. English communication was smooth and efficient.",
    name: "Bitcoin Solutions",
    company: "",
  },
  {
    quote:
      "Mail handling is simple and fast. The scanned documents are always easy to access.",
    name: "Art Invoice Hungary",
    company: "",
  },
  {
    quote:
      "The central Budapest location is a great advantage for our clients – a real prestige address.",
    name: "Energy Solver Centrum",
    company: "",
  },
  {
    quote:
      "Flexible office use in a modern environment. Great additional services.",
    name: "hello Solutions",
    company: "",
  },
  {
    quote:
      "Competitive pricing and excellent value for money. Highly recommended for new businesses.",
    name: "JPK Consulting",
    company: "",
  },
];

function Stars() {
  return (
    <div className="flex gap-1 text-[color:var(--primary)]">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star key={index} className="h-3 w-3 fill-[color:var(--primary)]" />
      ))}
    </div>
  );
}

export function TestimonialsSection() {
  const pathname = usePathname();
  const isEnglish = pathname?.startsWith("/en");

  const baseTestimonials = isEnglish ? testimonialsEn : testimonialsHu;
  const items = [...baseTestimonials, ...baseTestimonials];

  const heading = isEnglish ? "What our clients say" : "Ügyfeleink véleménye";
  const subtitle = isEnglish
    ? "More than 500 satisfied clients have chosen our registered office service in Budapest."
    : "Több mint 500+ elégedett ügyfél választotta székhelyszolgáltatásunkat Budapesten";
  const footerNote = isEnglish
    ? "We only display genuine reviews and feedback from our real clients."
    : "Csak valódi ügyfeleink értékeléseit és visszajelzéseit jelenítjük meg.";

  return (
    <section className="w-full bg-[color:var(--background)] py-16 text-slate-900 md:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center md:mb-10">
          <h2 className="text-2xl font-semibold text-[color:var(--secondary)] md:text-3xl">
            {heading}
          </h2>
          <p className="mt-2 text-sm text-slate-500 md:text-base">
            {subtitle}
          </p>
        </div>

        <div className="relative w-full overflow-hidden">
          <div className="flex gap-4 md:gap-6 animate-testimonials-scroll">
            {items.map((item, index) => (
              <figure
                key={`${item.name}-${index}`}
                className="flex min-w-[260px] max-w-xs flex-1 flex-col justify-between rounded-2xl bg-[color:var(--card)] p-6 text-sm shadow-[0_8px_18px_rgba(15,23,42,0.08)] ring-1 ring-[color:var(--border)]/60 md:min-w-[320px] lg:min-w-[360px]"
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <Stars />
                </div>
                <blockquote className="text-sm leading-relaxed text-slate-700 md:text-base">
                  “{item.quote}”
                </blockquote>
                <figcaption className="mt-4 text-xs font-medium text-slate-900 md:text-sm">
                  <div>{item.name}</div>
                  {item.company && (
                    <div className="text-slate-500">{item.company}</div>
                  )}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500 md:text-sm">
          {footerNote}
        </p>
      </div>
    </section>
  );
}
