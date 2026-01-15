import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BlogGrid } from "@/components/BlogGrid";

export const metadata: Metadata = {
  title: "Blog & Tudásbázis | E-Marketplace Kft.",
  description:
    "Szakmai cikkek székhelyszolgáltatásról Budapesten, cégalapításról, kézbesítési megbízottról és jogszabályi változásokról. Tudásbázis vállalkozásindításhoz és működtetéshez.",
};

export default function BlogPage() {
  return (
    <main className="flex min-h-screen w-full flex-col bg-[color:var(--background)] text-[color:var(--foreground)]">
      <Header />

      {/* HERO */}
      <section className="relative overflow-hidden bg-[color:var(--secondary)] py-12 md:py-20 lg:py-32">
        {/* Dekoratív buborékok */}
        <div className="pointer-events-none absolute right-10 top-10 h-32 w-32 rounded-full bg-[color:var(--primary)]/10 blur-2xl" />
        <div className="pointer-events-none absolute bottom-20 left-20 h-40 w-40 rounded-full bg-[color:var(--primary)]/5 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="mb-3 flex items-center gap-2 text-[color:var(--primary)] md:mb-4">
            <div className="h-px w-8 bg-[color:var(--primary)] md:w-12" />
            <span className="text-xs font-medium uppercase tracking-wider md:text-sm">Blog</span>
          </div>
          <h1 className="mb-4 text-balance text-3xl font-bold text-white md:mb-6 md:text-4xl lg:text-6xl">
            Blog
          </h1>
          <p className="text-pretty text-base text-white/80 md:text-lg">
            Hasznos információk és szakértői tanácsok vállalkozásoknak.
          </p>
        </div>
      </section>

      {/* BLOG GRID */}
      <section className="bg-[color:var(--secondary)]/5 py-12 md:py-16 lg:py-20">
        <BlogGrid language="hu" />
      </section>

      <Footer />
    </main>
  );
}
