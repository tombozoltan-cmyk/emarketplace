import type { Metadata } from "next";
import { Building2, Globe, Users } from "lucide-react";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PricingCardsGrid } from "@/components/PricingCardsGrid";
import { QuoteButton } from "@/components/QuoteButton";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: "Registered Office Pricing 2025 | Transparent Packages in Budapest",
  description:
    "Registered office pricing in 2025 in downtown Budapest: address from 8,000 HUF/month, service address / delivery agent, bundle packages and virtual office with transparent fees and no hidden costs.",
  alternates: {
    canonical: "https://e-marketplace.hu/en/pricing",
    languages: {
      hu: "https://e-marketplace.hu/arak",
      en: "https://e-marketplace.hu/en/pricing",
    },
  },
};

export default function PricingPageEn() {
  return (
    <main className="flex min-h-screen w-full flex-col bg-[color:var(--background)] text-[color:var(--foreground)]">
      <Header />

      <section className="relative overflow-hidden bg-[color:var(--muted)] pt-16 pb-12 md:pt-24 md:pb-20 lg:pt-32 lg:pb-28">
        <div className="pointer-events-none absolute -left-16 -top-32 h-64 w-64 rounded-full bg-[color:var(--primary)]/15 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-[-6rem] h-72 w-72 rounded-full bg-[color:var(--secondary)]/15 blur-3xl" />

        <div className="relative mx-auto flex min-h-[220px] max-w-4xl flex-col items-center justify-center px-4 text-center sm:min-h-[260px] sm:px-6 lg:min-h-[320px] lg:justify-end lg:pb-8 lg:px-8">
          <h1 className="mb-4 text-balance text-3xl font-bold text-[color:var(--foreground)] md:mb-6 md:text-4xl lg:text-5xl xl:text-6xl">
            <span>Transparent pricing,</span>{" "}
            <span className="text-[color:var(--primary)]">no hidden fees</span>
          </h1>
          <p className="mx-auto mb-6 max-w-2xl text-pretty text-base text-[color:var(--muted-foreground)] md:mb-8 md:text-lg lg:text-xl">
            We believe starting a business shouldn’t be complicated or expensive. With our clear packages you always know exactly what you get.
          </p>
          <QuoteButton className="rounded-full bg-[color:var(--primary)] px-6 py-3 text-sm text-[color:var(--background)] hover:bg-[color:var(--primary)]/90 md:px-8 md:py-4 md:text-base">
            Request a quote
          </QuoteButton>
        </div>
      </section>

      <section className="bg-[color:var(--background)] py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center md:mb-10">
            <h2 className="mb-3 text-2xl font-bold text-[color:var(--foreground)] md:mb-4 md:text-3xl">
              Basic registered office packages
            </h2>
            <p className="mx-auto max-w-2xl text-sm text-[color:var(--muted-foreground)] md:text-base">
              Choose the package that fits your business. No hidden costs — all packages include mail handling and notifications.
            </p>
          </div>

          <PricingCardsGrid group="basic" language="en" />
        </div>
      </section>

      <section className="bg-[color:var(--secondary)]/15 py-12 md:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center md:mb-10">
            <h2 className="mb-3 text-2xl font-bold text-[color:var(--foreground)] md:mb-4 md:text-3xl">
              Registered office + delivery agent bundles
            </h2>
            <p className="mx-auto max-w-2xl text-sm text-[color:var(--muted-foreground)] md:text-base">
              Discounted bundles when you order registered office service and delivery agent together.
            </p>
          </div>

          <PricingCardsGrid group="bundles" language="en" />
        </div>
      </section>

      <section className="bg-[color:var(--background)] py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <h2 className="mb-4 text-3xl font-bold text-[color:var(--foreground)]">
              Office bundles
            </h2>
            <p className="mx-auto max-w-2xl text-sm text-[color:var(--muted-foreground)] md:text-base">
              Registered office service and office use together — for those who want more than an address and need occasional office access.
            </p>
          </div>

          <PricingCardsGrid group="officeBundles" language="en" />
        </div>
      </section>

      <section className="bg-[color:var(--muted)] py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <h2 className="mb-4 text-3xl font-bold text-[color:var(--foreground)]">
              Full entrepreneur packages
            </h2>
            <p className="mx-auto max-w-2xl text-sm text-[color:var(--muted-foreground)] md:text-base">
              Everything in one: registered office, office use and delivery agent with discounted monthly pricing.
            </p>
          </div>

          <PricingCardsGrid group="fullEntrepreneur" language="en" />
        </div>
      </section>

      <section className="bg-[color:var(--background)] py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <h2 className="mb-4 text-3xl font-bold text-[color:var(--foreground)]">Which package is right for you?</h2>
            <p className="mx-auto max-w-3xl text-sm text-[color:var(--muted-foreground)] md:text-base">
              We help you choose the best fit. See which option supports you best as a new founder, a growing company or an international business.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <Card className="h-full bg-[color:var(--card)] shadow-sm">
              <CardContent className="p-6 text-center">
                <Building2 className="mx-auto mb-4 h-10 w-10 text-[color:var(--primary)]" />
                <h3 className="mb-2 text-lg font-semibold text-[color:var(--foreground)]">For starters</h3>
                <p className="mb-4 text-sm text-[color:var(--muted-foreground)]">
                  If you’re just starting and want low fixed costs while having an official Budapest address.
                </p>
                <p className="text-sm font-semibold text-[color:var(--foreground)]">
                  Recommended: basic registered office + delivery agent
                </p>
              </CardContent>
            </Card>

            <Card className="h-full bg-[color:var(--card)] shadow-sm">
              <CardContent className="p-6 text-center">
                <Users className="mx-auto mb-4 h-10 w-10 text-[color:var(--secondary)]" />
                <h3 className="mb-2 text-lg font-semibold text-[color:var(--foreground)]">For growing teams</h3>
                <p className="mb-4 text-sm text-[color:var(--muted-foreground)]">
                  If you meet clients regularly and need occasional office use for meetings and team sessions.
                </p>
                <p className="text-sm font-semibold text-[color:var(--foreground)]">Recommended: registered office + office bundle</p>
              </CardContent>
            </Card>

            <Card className="h-full bg-[color:var(--card)] shadow-sm">
              <CardContent className="p-6 text-center">
                <Globe className="mx-auto mb-4 h-10 w-10 text-[color:var(--primary)]" />
                <h3 className="mb-2 text-lg font-semibold text-[color:var(--foreground)]">For international founders</h3>
                <p className="mb-4 text-sm text-[color:var(--muted-foreground)]">
                  If you need a Hungarian address, English documentation and a setup that supports Hungarian banking.
                </p>
                <p className="text-sm font-semibold text-[color:var(--foreground)]">
                  Recommended: virtual office or full package for foreign clients
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="bg-[color:var(--muted)] py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <h2 className="mb-3 text-3xl font-bold text-[color:var(--foreground)]">Frequently asked questions</h2>
            <p className="mx-auto max-w-2xl text-sm text-[color:var(--muted-foreground)] md:text-base">
              The most common questions about registered office services and package pricing.
            </p>
          </div>

          <Accordion type="single" collapsible className="space-y-3">
            <AccordionItem value="faq-1" className="overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] shadow-sm">
              <AccordionTrigger className="px-5 py-4 text-left text-base font-semibold text-[color:var(--foreground)] md:px-6 md:py-5 md:text-lg">
                How often do I need to pay?
              </AccordionTrigger>
              <AccordionContent className="px-5 pb-5 pt-0 text-sm text-[color:var(--muted-foreground)] md:px-6 md:pb-6 md:text-base">
                Most packages are paid annually in advance, which is more convenient and typically more cost‑effective than monthly billing.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="faq-2" className="overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] shadow-sm">
              <AccordionTrigger className="px-5 py-4 text-left text-base font-semibold text-[color:var(--foreground)] md:px-6 md:py-5 md:text-lg">
                Are there any hidden costs?
              </AccordionTrigger>
              <AccordionContent className="px-5 pb-5 pt-0 text-sm text-[color:var(--muted-foreground)] md:px-6 md:pb-6 md:text-base">
                No hidden costs. Prices include mail handling and scanning as well as email notifications. Extra fees apply only for additional optional services.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="faq-3" className="overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] shadow-sm">
              <AccordionTrigger className="px-5 py-4 text-left text-base font-semibold text-[color:var(--foreground)] md:px-6 md:py-5 md:text-lg">
                What is the difference between a virtual office and a registered office?
              </AccordionTrigger>
              <AccordionContent className="px-5 pb-5 pt-0 text-sm text-[color:var(--muted-foreground)] md:px-6 md:pb-6 md:text-base">
                Registered office service provides your official company address. A virtual office includes a bank‑accepted office rental contract and limited office use — useful when you need a formal office agreement.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="faq-4" className="overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] shadow-sm">
              <AccordionTrigger className="px-5 py-4 text-left text-base font-semibold text-[color:var(--foreground)] md:px-6 md:py-5 md:text-lg">
                How does mail handling work?
              </AccordionTrigger>
              <AccordionContent className="px-5 pb-5 pt-0 text-sm text-[color:var(--muted-foreground)] md:px-6 md:pb-6 md:text-base">
                We receive your mail, register it and scan it. We send the scanned documents via email and can forward originals by courier or post if needed.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="faq-5" className="overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] shadow-sm">
              <AccordionTrigger className="px-5 py-4 text-left text-base font-semibold text-[color:var(--foreground)] md:px-6 md:py-5 md:text-lg">
                When is a delivery agent mandatory?
              </AccordionTrigger>
              <AccordionContent className="px-5 pb-5 pt-0 text-sm text-[color:var(--muted-foreground)] md:px-6 md:pb-6 md:text-base">
                A delivery agent is required when a foreign director or owner does not have a registered Hungarian address. Our packages provide a compliant solution.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      <section className="bg-gradient-to-b from-[color:var(--primary)]/5 to-[color:var(--background)] py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-6 text-3xl font-bold text-[color:var(--foreground)]">
            Ready to start your business?
          </h2>
          <p className="mb-4 text-sm text-[color:var(--muted-foreground)] md:mb-6 md:text-base">
            Request a quote and start with a professional registered office solution — transparent pricing and no hidden fees.
          </p>
          <QuoteButton className="rounded-full bg-[color:var(--primary)] px-8 py-3 text-sm font-semibold text-[color:var(--background)] hover:bg-[color:var(--primary)]/90 md:text-base">
            Request a quote
          </QuoteButton>
        </div>
      </section>

      <Footer />
    </main>
  );
}
