"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type BlogPost = {
  title: string;
  excerpt: string;
  image: string;
  date: string;
  slug: string;
  category?: string;
};

const blogPostsHu: BlogPost[] = [
  {
    title: "PMT változások 2025-ben – mit jelent a székhelyszolgáltatóknak?",
    excerpt:
      "Ismerje meg az új pénzmosás elleni törvény legfontosabb változásait és azok gyakorlati következményeit a székhelyszolgáltatók számára.",
    image: "/legal-documents-modern-office-desk.jpg",
    date: "2025. január 15.",
    slug: "pmt-valtozasok-2025",
    category: "Jog & Szabályozás",
  },
  {
    title: "Külföldi cégek magyarországi székhelye – fontos új szabályok",
    excerpt:
      "Minden, amit tudnia kell, ha külföldi vállalkozásának magyarországi székhelyet szeretne. Gyakorlati útmutató lépésről lépésre.",
    image: "/international-business-handshake-budapest.jpg",
    date: "2025. január 10.",
    slug: "kulfoldi-cegek-szekhelye",
    category: "Nemzetközi",
  },
  {
    title: "Miért jobb székhelyszolgáltatót használni, mint saját lakcímet?",
    excerpt:
      "Fedezze fel a professzionális székhelyszolgáltatás előnyeit és a lakcím-használat jogi kockázatait. Szakértői tanácsok vállalkozóknak.",
    image: "/professional-business-office-building.jpg",
    date: "2025. január 5.",
    slug: "szekhelyszolgaltato-elonyei",
    category: "Tippek",
  },
  {
    title: "Hogyan zajlik a szerződéskötés gyorsan és egyszerűen?",
    excerpt:
      "Lépésről lépésre bemutatjuk a modern szerződéskötés folyamatát. Gyors, biztonságos és kényelmes megoldás vállalkozóknak.",
    image: "/video-call-business-meeting-laptop.jpg",
    date: "2024. december 28.",
    slug: "online-szerzodeskotes-videoazonositassal",
    category: "Útmutatók",
  },
  {
    title: "Székhely + iroda csomag előnyei külföldi vállalkozóknak",
    excerpt:
      "Miért érdemes kombinálni a székhelyszolgáltatást irodahasználattal? Gyakorlati előnyök és esettanulmányok nemzetközi ügyfelektől.",
    image: "/modern-coworking-space-budapest-office.jpg",
    date: "2024. december 20.",
    slug: "szekhelyszolgaltatas-iroda-csomag",
    category: "Szolgáltatások",
  },
  {
    title: "Adózási változások 2025 - mit kell tudni vállalkozóknak?",
    excerpt:
      "Átfogó útmutató az új adózási szabályokról, határidőkről és a vállalkozásokat érintő legfontosabb változásokról.",
    image: "/financial-charts-calculator-business.jpg",
    date: "2024. december 15.",
    slug: "adozasi-valtozasok-2025",
    category: "Pénzügy",
  },
];

const blogPostsEn: BlogPost[] = [
  {
    title: "PMT changes in 2025 – what do they mean for registered office providers?",
    excerpt:
      "Learn about the most important changes in the new anti‑money laundering regulations and how they affect registered office providers in practice.",
    image: "/legal-documents-modern-office-desk.jpg",
    date: "15 January 2025",
    slug: "pmt-changes-2025",
    category: "Law & Regulation",
  },
  {
    title: "Registered office in Hungary for foreign companies – key new rules",
    excerpt:
      "Everything you need to know if you want to establish a registered office in Hungary for your foreign company. A step‑by‑step practical guide.",
    image: "/international-business-handshake-budapest.jpg",
    date: "10 January 2025",
    slug: "foreign-companies-registered-office-hungary",
    category: "International",
  },
  {
    title: "Why is a professional registered office better than using your home address?",
    excerpt:
      "Discover the advantages of a professional registered office service and the legal risks of using your home address. Expert tips for entrepreneurs.",
    image: "/professional-business-office-building.jpg",
    date: "5 January 2025",
    slug: "registered-office-vs-home-address",
    category: "Tips",
  },
];

export function BlogSection() {
  const pathname = usePathname();
  const isEnglish = pathname?.startsWith("/en");

  const posts = isEnglish ? blogPostsEn : blogPostsHu;

  const first = posts[0];
  const second = posts[1];
  const third = posts[2];

  const heading = isEnglish ? "Blog & Knowledge base" : "Blog & Tudásbázis";
  const subtitle = isEnglish
    ? "Useful information and fresh updates on registered office services, company formation and related legal and financial topics."
    : "Hasznos információk és friss hírek székhelyszolgáltatás, cégalapítás és kapcsolódó jogi, pénzügyi kérdések témájában.";

  const allPostsLabel = isEnglish ? "All articles" : "Összes cikk";
  const blogBasePath = isEnglish ? "/en/blog" : "/blog";

  return (
    <section className="w-full bg-[color:var(--background)] py-12 md:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center md:mb-16">
          <h2 className="mb-3 text-2xl font-bold text-[color:var(--foreground)] md:mb-4 md:text-3xl lg:text-4xl">
            {heading}
          </h2>
          <p className="hidden max-w-2xl text-base text-[color:var(--muted-foreground)] md:mx-auto md:block md:text-xl lg:text-lg">
            {subtitle}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
          {first && <BlogCard key={first.slug} post={first} />}
          {second && (
            <div className="hidden md:block">
              <BlogCard key={second.slug} post={second} />
            </div>
          )}
          {third && (
            <div className="hidden lg:block">
              <BlogCard key={third.slug} post={third} />
            </div>
          )}
        </div>

        <div className="mt-8 text-center md:mt-12">
          <Link href={blogBasePath}>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full border-2 border-[color:var(--primary)] bg-transparent px-8 py-3 text-sm text-[color:var(--primary)] transition-colors hover:bg-[color:var(--primary)] hover:text-white md:text-base"
            >
              {allPostsLabel}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

type BlogCardProps = {
  post: BlogPost;
};

function BlogCard({ post }: BlogCardProps) {
  return (
    <Card className="group flex h-full flex-col overflow-hidden rounded-2xl bg-[color:var(--card)] shadow-none transition-shadow duration-300 hover:shadow-xl">
      <div className="relative h-40 overflow-hidden md:h-48">
        <img
          src={post.image || "/placeholder.svg"}
          alt={`${post.title} - E-Marketplace blog`}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
      </div>
      <CardContent className="flex flex-1 flex-col p-4 md:p-6">
        <span className="mb-2 text-xs font-medium text-[color:var(--primary)] md:text-sm">
          {post.date}
        </span>
        <h3 className="mb-2 text-base font-semibold text-[color:var(--foreground)] text-balance line-clamp-2 md:mb-3 md:text-xl">
          {post.title}
        </h3>
        <p className="mb-3 text-sm text-[color:var(--muted-foreground)] text-pretty line-clamp-2 md:mb-4 md:text-base">
          {post.excerpt}
        </p>
        <Link
          href={"/blog/" + post.slug}
          className="inline-flex items-center text-sm font-medium text-[color:var(--primary)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--background)] md:text-base"
        >
          Tovább →
        </Link>
      </CardContent>
    </Card>
  );
}

