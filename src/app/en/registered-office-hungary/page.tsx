import type React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  Building,
  Building2,
  Calculator,
  CheckCircle2,
  FileCheck,
  Globe,
  Mail,
  Monitor,
  Shield,
  Scale,
  Briefcase,
  TrendingDown,
  Users,
} from "lucide-react";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QuoteButton } from "@/components/QuoteButton";

export const metadata: Metadata = {
  title:
    "Registered Office Service in Downtown Budapest | PMT-compliant address + service agent",
  description:
    "Official registered office service in Budapest (VI. district, Izabella utca 68/B). From 8,000 HUF/month + VAT, service address / delivery agent, mail handling, scanning and company signboard for new and existing companies.",
  alternates: {
    canonical: "https://e-marketplace.hu/en/registered-office-hungary",
    languages: {
      hu: "https://e-marketplace.hu/szekhelyszolgaltatas",
      en: "https://e-marketplace.hu/en/registered-office-hungary",
    },
  },
};

type NavButtonProps = {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
};

function NavButton({ icon: Icon, label, href }: NavButtonProps) {
  return (
    <a
      href={href}
      className="group flex items-center justify-center gap-2 rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-3 text-center text-xs font-semibold text-[color:var(--foreground)] shadow-sm transition hover:-translate-y-0.5 hover:border-[color:var(--primary)] hover:shadow-md md:p-4 md:text-sm"
    >
      <Icon className="h-4 w-4 text-[color:var(--primary)] md:h-5 md:w-5" />
      <span>{label}</span>
    </a>
  );
}

export default function RegisteredOfficeHungaryPage() {
  return (
    <main className="flex min-h-screen w-full flex-col bg-[color:var(--background)] text-[color:var(--foreground)]">
      <Header />

      {/* HERO */}
      <section className="relative w-full overflow-hidden bg-[color:var(--muted)]/70 py-12 md:py-16 lg:py-32">
        <div className="pointer-events-none absolute -left-10 -top-32 h-64 w-64 rounded-full bg-[color:var(--primary)]/15 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 bottom-[-6rem] h-72 w-72 rounded-full bg-[color:var(--secondary)]/15 blur-3xl" />

        <div className="relative mx-auto flex max-w-5xl flex-col gap-6 px-4 text-center sm:px-6 lg:px-8">
          <div className="mb-3 flex w-full justify-center md:mb-4">
            <div className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[color:var(--primary)]/10 px-3 py-1 text-xs font-medium text-[color:var(--primary)] md:w-auto md:px-4 md:py-1.5 md:text-sm">
              <Building2 className="h-3 w-3 md:h-4 md:w-4" />
              <span>Official registered office service+</span>
            </div>
          </div>

          <h1 className="text-balance text-2xl font-bold text-[color:var(--foreground)] md:text-3xl lg:text-6xl">
            <span>Registered office service+</span>{" "}
            <span className="text-[color:var(--primary)]">in Budapest</span>
          </h1>

          <p className="text-pretty text-base text-[color:var(--muted-foreground)] md:text-lg lg:text-2xl">
            A cost‑effective solution for new and existing companies — service address / delivery agent + mail handling.
          </p>

          <p className="text-sm text-[color:var(--muted-foreground)] md:text-base lg:text-lg">
            <span className="font-medium">Prestige Budapest business address from</span>{" "}
            <span className="font-bold text-[color:var(--primary)]">8,000 HUF/month + VAT</span>{" "}
            <span className="hidden md:inline">— PMT compliant | For new companies too</span>
          </p>

          <div className="mt-2 flex flex-col items-center justify-center gap-2 sm:flex-row md:mt-4 md:gap-3 lg:gap-4">
            <Link href="/en/contract" className="w-full sm:w-auto">
              <Button className="w-full rounded-full bg-[color:var(--primary)] px-5 py-4 text-sm text-[color:var(--primary-foreground)] hover:bg-[color:var(--primary)]/90 md:w-auto md:px-6 md:py-5 md:text-base lg:px-8 lg:py-6 lg:text-lg">
                Start contract process
                <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
              </Button>
            </Link>
            <QuoteButton className="w-full rounded-full px-5 py-4 text-sm md:w-auto md:px-6 md:py-5 md:text-base lg:px-8 lg:py-6 lg:text-lg" variant="outline">
              Request a quote
            </QuoteButton>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-2 md:mt-10 md:gap-3 lg:gap-4">
            <NavButton icon={Building2} label="Registered office" href="#szekhely" />
            <NavButton icon={Globe} label="For foreign founders" href="#kuldfoldi" />
            <NavButton icon={Mail} label="Service address" href="#kezbesitoMegbizott" />
            <NavButton icon={Briefcase} label="Virtual office" href="#virtualOffice" />
            <NavButton icon={Scale} label="Company formation & legal" href="#ugyved" />
            <NavButton icon={Calculator} label="Accounting" href="#konyveles" />
          </div>
        </div>
      </section>

      {/* REGISTERED OFFICE SECTION (translated) */}
      <section id="szekhely" className="scroll-mt-24 py-8 md:scroll-mt-32 md:py-12 lg:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mb-4 flex w-full justify-center md:mb-6">
            <div className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[color:var(--primary)]/10 px-3 py-1 text-xs font-medium text-[color:var(--primary)] md:w-auto md:px-4 md:py-1.5 md:text-sm">
              <Building2 className="h-3 w-3 md:h-4 md:w-4" />
              <span>Official registered office service+</span>
            </div>
          </div>

          <h2 className="mb-4 text-center text-xl font-bold text-[color:var(--foreground)] md:mb-6 md:text-2xl lg:mb-8 lg:text-4xl">
            What is a registered office service?
          </h2>
          <p className="mb-8 text-center text-sm text-[color:var(--muted-foreground)] md:mb-12 md:text-base lg:text-lg">
            A registered office service gives your business a premium, central Budapest address without having to rent or buy a physical office.
          </p>

          <div className="grid gap-4 md:grid-cols-2 md:gap-6">
            <Card className="h-full border-l-4 border-l-[color:var(--primary)] shadow-none transition-shadow hover:shadow-xl">
              <CardContent className="p-3 md:p-4 lg:p-6">
                <div className="mb-2 flex items-start gap-2 md:mb-3">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--primary)] md:h-5 md:w-5" />
                  <h3 className="min-w-0 flex-1 break-words text-sm font-semibold text-[color:var(--foreground)] md:text-base lg:text-lg">
                    What problem does it solve?
                  </h3>
                </div>
                <ul className="space-y-2 text-sm text-[color:var(--muted-foreground)] md:space-y-3 md:text-base">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--primary)] md:h-5 md:w-5" />
                    <span className="min-w-0 flex-1 break-words">
                      You don’t have your own office, but you need an official address for registration.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--primary)] md:h-5 md:w-5" />
                    <span className="min-w-0 flex-1 break-words">
                      You don’t want to use your home address for business purposes.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--primary)] md:h-5 md:w-5" />
                    <span className="min-w-0 flex-1 break-words">
                      You want a prestigious Budapest address to increase credibility.
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="h-full border-l-4 border-l-[color:var(--secondary)] shadow-none transition-shadow hover:shadow-xl">
              <CardContent className="p-3 md:p-4 lg:p-6">
                <div className="mb-2 flex items-start gap-2 md:mb-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--secondary)] md:h-5 md:w-5" />
                  <h3 className="min-w-0 flex-1 break-words text-sm font-semibold text-[color:var(--foreground)] md:text-base lg:text-lg">
                    What does the service include?
                  </h3>
                </div>
                <ul className="space-y-2 text-sm text-[color:var(--muted-foreground)] md:space-y-3 md:text-base">
                  <li className="flex items-start gap-2">
                    <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--secondary)] md:h-5 md:w-5" />
                    <span className="min-w-0 flex-1 break-words">
                      Official registered office at a prestige Budapest address.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--secondary)] md:h-5 md:w-5" />
                    <span className="min-w-0 flex-1 break-words">
                      Receiving and forwarding letters and official documents.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--secondary)] md:h-5 md:w-5" />
                    <span className="min-w-0 flex-1 break-words">
                      Providing the documents required for court registration.
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section
        id="kuldfoldi"
        className="scroll-mt-32 bg-[color:var(--background)] py-12 md:py-20"
      >
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mb-4 flex w-full justify-center md:mb-6">
            <div className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[color:var(--primary)]/10 px-3 py-1 text-xs font-medium text-[color:var(--primary)] md:w-auto md:px-4 md:py-1.5 md:text-sm">
              <AlertCircle className="h-3 w-3 md:h-4 md:w-4" />
              <span>Problems & solutions</span>
            </div>
          </div>

          <h2 className="mb-6 text-center text-2xl font-bold text-[color:var(--foreground)] md:mb-8 md:text-3xl lg:text-4xl">
            What challenges does it solve?
          </h2>
          <p className="mb-12 text-center text-lg text-[color:var(--muted-foreground)]">
            Practical answers to common administrative and compliance challenges.
          </p>

          <div className="grid gap-8 md:grid-cols-2">
            {[
              {
                title: "I don’t have my own property",
                description:
                  "We provide a prestige Budapest address accepted for company registration, with company signboard placement.",
              },
              {
                title: "I don’t want to use my home address",
                description:
                  "Protect your privacy — authority checks and official mail are handled at your service address, not your home.",
              },
              {
                title: "A full office is too expensive",
                description:
                  "From 8,000 HUF/month you get essential administrative services without renting a full office.",
              },
              {
                title: "I’m foreign and don’t have a Hungarian address",
                description:
                  "Official registered office + service address / delivery agent solution to support company formation in Hungary.",
              },
              {
                title: "Handling post and official letters takes too much time",
                description:
                  "We receive, scan and forward your official mail quickly so you can focus on your business.",
              },
            ].map((item, index) => (
              <Card
                key={item.title}
                className={`h-full border-2 border-[color:var(--border)] bg-[color:var(--card)] transition-all hover:border-[color:var(--primary)] hover:shadow-lg ${
                  index === 4 ? "md:col-span-2 md:mx-auto md:max-w-xl" : ""
                }`}
              >
                <CardContent className="p-6">
                  <div className="mb-4 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-[color:var(--primary)]" />
                    <h3 className="text-lg font-bold text-[color:var(--foreground)] md:text-xl">
                      {item.title}
                    </h3>
                  </div>
                  <p className="text-sm text-[color:var(--muted-foreground)] md:text-base">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section
        id="kezbesitoMegbizott"
        className="scroll-mt-32 bg-[color:var(--muted)]/60 py-8 md:py-16"
      >
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mb-4 flex w-full justify-center md:mb-6">
            <div className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[color:var(--primary)]/10 px-3 py-1 text-xs font-medium text-[color:var(--primary)] md:w-auto md:px-4 md:py-1.5 md:text-sm">
              <Globe className="h-3 w-3 md:h-4 md:w-4" />
              <span>Mandatory for foreign directors</span>
            </div>
          </div>

          <h2 className="mb-4 text-center text-2xl font-bold text-[color:var(--foreground)] md:mb-6 md:text-3xl">
            Service address / delivery agent
          </h2>
          <p className="mb-6 text-center text-base text-[color:var(--muted-foreground)] md:mb-10 md:text-lg">
            Under Hungarian company law, foreign persons who become directors or owners of a Hungarian company and do not have a registered Hungarian address must appoint a service address / delivery agent.
          </p>

          <div className="grid gap-4 md:grid-cols-2 md:gap-6">
            <Card className="h-full border-l-4 border-l-[color:var(--primary)] bg-[color:var(--card)] shadow-none transition-shadow hover:shadow-xl">
              <CardContent className="p-4 md:p-6">
                <div className="mb-3 flex items-center gap-2 md:mb-4">
                  <Shield className="h-5 w-5 text-[color:var(--primary)]" />
                  <h3 className="text-lg font-bold text-[color:var(--foreground)] md:text-xl">
                    What problems do we solve?
                  </h3>
                </div>
                <ul className="space-y-2 text-sm text-[color:var(--muted-foreground)] md:space-y-3 md:text-base">
                  {[
                    "We help ensure legal compliance for company registration.",
                    "We act as the official point of contact and receive authority documents.",
                    "You avoid rejections due to administrative mistakes.",
                  ].map((line) => (
                    <li key={line} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--primary)] md:h-5 md:w-5" />
                      <span className="min-w-0 flex-1 break-words">{line}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="h-full border-l-4 border-l-[color:var(--primary)] bg-[color:var(--card)] shadow-none transition-shadow hover:shadow-xl">
              <CardContent className="p-4 md:p-6">
                <div className="mb-3 flex items-center gap-2 md:mb-4">
                  <Users className="h-5 w-5 text-[color:var(--primary)]" />
                  <h3 className="text-lg font-bold text-[color:var(--foreground)] md:text-xl">
                    Who needs it?
                  </h3>
                </div>
                <ul className="space-y-2 text-sm text-[color:var(--muted-foreground)] md:space-y-3 md:text-base">
                  {[
                    "Foreign directors.",
                    "Foreign owners / shareholders.",
                    "Anyone without a registered Hungarian address.",
                  ].map((line) => (
                    <li key={line} className="flex items-start gap-2">
                      <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--primary)] md:h-5 md:w-5" />
                      <span className="min-w-0 flex-1 break-words">{line}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-4 text-center shadow-md md:mt-8 md:p-6 lg:p-8">
            <h3 className="mb-2 text-lg font-bold text-[color:var(--foreground)] md:mb-3 md:text-xl">
              How does it work?
            </h3>
            <p className="mb-4 text-sm text-[color:var(--muted-foreground)] md:mb-6 md:text-base">
              We sign a service agreement where we undertake to receive official documents and forward them to you within 15 days. The appointment is certified by a lawyer and submitted to the Court of Registration.
            </p>
            <QuoteButton
              packageId="kezbesitesi"
              className="w-full rounded-full bg-[color:var(--primary)] px-4 py-2 text-sm text-[color:var(--background)] hover:bg-[color:var(--primary)]/90 md:w-auto md:px-6 md:py-3 md:text-base"
            >
              Request a delivery agent
            </QuoteButton>
          </div>
        </div>
      </section>

      <section
        id="virtualOffice"
        className="scroll-mt-20 bg-[color:var(--muted)]/60 py-20"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-4 flex w-full justify-center md:mb-6">
            <div className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[color:var(--primary)]/10 px-3 py-1 text-xs font-medium text-[color:var(--primary)] md:w-auto md:px-4 md:py-1.5 md:text-sm">
              <Monitor className="h-3 w-3 md:h-4 md:w-4" />
              <span>Long‑term solution</span>
            </div>
          </div>

          <h2 className="mb-6 text-center text-2xl font-bold text-[color:var(--foreground)] md:mb-8 md:text-3xl lg:text-4xl">
            Long‑term office rental (contract)
          </h2>

          <p className="mb-12 max-w-3xl text-center text-lg text-[color:var(--muted-foreground)] md:mx-auto">
            With a 1‑year contract we provide an office agreement for companies that need a valid office contract for banking or official purposes, including up to 4 office uses per month.
          </p>

          <div className="grid gap-8 md:grid-cols-2">
            <Card className="h-full border-2 border-red-200 bg-[color:var(--card)] transition-all hover:border-red-300 hover:shadow-xl">
              <CardContent className="p-8">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100">
                    <AlertCircle className="h-6 w-6 text-red-600" />
                  </div>
                  <h3 className="text-xl font-bold text-[color:var(--foreground)]">
                    What problem does it solve?
                  </h3>
                </div>
                <ul className="space-y-4 text-sm text-[color:var(--muted-foreground)] md:text-base">
                  {[
                    "A formal office contract required for bank financing.",
                    "Proving stability for supplier contracts or larger partners.",
                    "A registered Hungarian address and office contract for company formation.",
                    "Occasional meeting space for remote teams.",
                    "Increased credibility with a professional Budapest address.",
                  ].map((line) => (
                    <li key={line} className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
                        <span className="text-xs font-bold text-red-600">!</span>
                      </span>
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="h-full border-2 border-[color:var(--primary)]/30 bg-[color:var(--primary)]/5 transition-all hover:border-[color:var(--primary)] hover:shadow-xl">
              <CardContent className="p-8">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[color:var(--primary)]/10">
                    <CheckCircle2 className="h-6 w-6 text-[color:var(--primary)]" />
                  </div>
                  <h3 className="text-xl font-bold text-[color:var(--foreground)]">
                    What’s included?
                  </h3>
                </div>
                <ul className="space-y-4 text-sm text-[color:var(--muted-foreground)] md:text-base">
                  {[
                    "1‑year rental contract (paid in advance).",
                    "Up to 4 office uses per month (meeting room / desk).",
                    "Prestige Budapest address (1064 Budapest, Izabella utca 68/B).",
                    "Company signboard placement on the building.",
                    "A contract accepted by banks and authorities.",
                  ].map((line) => (
                    <li key={line} className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-[color:var(--primary)]" />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 rounded-2xl bg-[color:var(--primary)] p-4 text-center text-[color:var(--primary-foreground)] md:mt-10 md:p-8">
            <h3 className="mb-2 text-lg font-bold md:mb-3 md:text-2xl">
              Request long‑term office rental
            </h3>
            <p className="mb-4 text-sm text-white/90 md:mb-6 md:text-base">
              A secure solution for banking and business verification.
            </p>
            <QuoteButton
              size="lg"
              packageId="szerzodeses-irodaberles"
              className="rounded-full bg-white px-4 py-2 text-sm text-[color:var(--primary)] hover:bg-white/90 md:px-6 md:py-3 md:text-base"
            >
              Request a quote
            </QuoteButton>
          </div>
        </div>
      </section>

      <section
        id="ugyved"
        className="scroll-mt-32 bg-[color:var(--muted)]/60 py-12 md:py-20"
      >
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mb-4 flex w-full justify-center md:mb-6">
            <div className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[color:var(--primary)]/10 px-3 py-1 text-xs font-medium text-[color:var(--primary)] md:w-auto md:px-4 md:py-1.5 md:text-sm">
              <FileCheck className="h-3 w-3 md:h-4 md:w-4" />
              <span>Company formation & legal services</span>
            </div>
          </div>

          <h2 className="mb-6 text-center text-2xl font-bold text-[color:var(--foreground)] md:mb-8 md:text-3xl lg:text-4xl">
            Company formation & legal
          </h2>
          <p className="mb-12 text-center text-lg text-[color:var(--muted-foreground)]">
            With trusted legal partners we support company formation, amendments, and any legal matters related to registered office services.
          </p>

          <div className="grid gap-8 md:grid-cols-2">
            <Card className="h-full border-l-4 border-l-[color:var(--primary)] bg-[color:var(--card)] shadow-none transition-shadow hover:shadow-xl">
              <CardContent className="p-6">
                <div className="mb-4 flex items-center gap-2">
                  <Building className="h-5 w-5 text-[color:var(--primary)]" />
                  <h3 className="text-lg font-bold text-[color:var(--foreground)] md:text-xl">
                    Company formation
                  </h3>
                </div>
                <ul className="space-y-3 text-sm text-[color:var(--muted-foreground)] md:text-base">
                  {[
                    "New company formation with full legal representation.",
                    "Drafting the deed of foundation / articles.",
                    "Preparing documentation for the Court of Registration.",
                    "Aligning registered office service agreement with the formation process.",
                  ].map((line) => (
                    <li key={line} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[color:var(--primary)]" />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="h-full border-l-4 border-l-[color:var(--secondary)] bg-[color:var(--card)] shadow-none transition-shadow hover:shadow-xl">
              <CardContent className="p-6">
                <div className="mb-4 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-[color:var(--secondary)]" />
                  <h3 className="text-lg font-bold text-[color:var(--foreground)] md:text-xl">
                    Legal consulting
                  </h3>
                </div>
                <ul className="space-y-3 text-sm text-[color:var(--muted-foreground)] md:text-base">
                  {[
                    "Consultation on registered office service related legal questions.",
                    "Handling company amendments, ownership or registered office changes.",
                    "Supporting PMT and other regulatory compliance.",
                    "Ongoing legal support on request.",
                  ].map((line) => (
                    <li key={line} className="flex items-start gap-2">
                      <ArrowRight className="mt-0.5 h-5 w-5 shrink-0 text-[color:var(--secondary)]" />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-6 text-center shadow-md md:mt-10 md:p-8">
            <h3 className="mb-2 text-base font-bold text-[color:var(--foreground)] md:mb-3 md:text-lg lg:text-xl">
              Need legal support for company formation or amendments?
            </h3>
            <p className="mb-4 text-sm text-[color:var(--muted-foreground)] md:mb-6 md:text-base">
              Contact us and we’ll connect you with experienced legal partners working seamlessly with registered office services.
            </p>
            <Link href="/en/contact#ugyved" className="inline-block">
              <Button className="rounded-full bg-[color:var(--secondary)] px-4 py-2 text-sm text-[color:var(--background)] hover:bg-[color:var(--secondary)]/90 md:px-6 md:py-4 md:text-base lg:px-8 lg:py-6 lg:text-lg">
                Contact a legal partner
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section
        id="konyveles"
        className="scroll-mt-32 bg-[color:var(--background)] py-12 md:py-20"
      >
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mb-4 flex w-full justify-center md:mb-6">
            <div className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[color:var(--primary)]/10 px-3 py-1 text-xs font-medium text-[color:var(--primary)] md:w-auto md:px-4 md:py-1.5 md:text-sm">
              <FileCheck className="h-3 w-3 md:h-4 md:w-4" />
              <span>Accounting & financial support</span>
            </div>
          </div>

          <h2 className="mb-6 text-center text-2xl font-bold text-[color:var(--foreground)] md:mb-8 md:text-3xl lg:text-4xl">
            Accounting
          </h2>
          <p className="mb-12 text-center text-lg text-[color:var(--muted-foreground)]">
            We work with reliable accounting partners who understand the specifics of registered office services and the related Hungarian tax regulations.
          </p>

          <div className="grid gap-4 md:grid-cols-3 md:gap-6">
            {[
              {
                title: "Full‑service accounting",
                description:
                  "Monthly bookkeeping, tax filings, annual reports and deadline monitoring.",
                icon: FileCheck,
              },
              {
                title: "Tax & compliance monitoring",
                description:
                  "Continuous updates on tax changes and your obligations.",
                icon: Shield,
              },
              {
                title: "Advisory for founders",
                description:
                  "Support in choosing the optimal tax regime and financial structure.",
                icon: Users,
              },
            ].map((service) => {
              const Icon = service.icon;
              return (
                <Card
                  key={service.title}
                  className="h-full border-2 border-[color:var(--border)] bg-[color:var(--card)] text-center transition-all hover:border-[color:var(--primary)] hover:shadow-lg"
                >
                  <CardContent className="p-3 md:p-6">
                    <div className="mb-2 flex items-center justify-center gap-2 md:mb-4 md:flex-col">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[color:var(--primary)]/10 md:h-16 md:w-16 md:rounded-xl">
                        <Icon className="h-5 w-5 text-[color:var(--primary)] md:h-8 md:w-8" />
                      </div>
                      <h3 className="text-sm font-semibold text-[color:var(--foreground)] md:text-xl">
                        {service.title}
                      </h3>
                    </div>
                    <p className="text-xs text-[color:var(--muted-foreground)] md:text-base">
                      {service.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="mt-8 rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-4 text-center shadow-md md:mt-10 md:p-6 lg:p-8">
            <h3 className="mb-2 text-base font-bold text-[color:var(--foreground)] md:mb-3 md:text-lg lg:text-xl">
              Need a reliable accountant?
            </h3>
            <p className="mb-4 text-sm text-[color:var(--muted-foreground)] md:mb-6 md:text-base">
              We can recommend an accounting partner familiar with registered office specifics and international client needs.
            </p>
            <Link href="/en/contact#konyveles" className="inline-block">
              <Button className="rounded-full bg-[color:var(--primary)] px-4 py-2 text-sm text-[color:var(--background)] hover:bg-[color:var(--primary)]/90 md:px-6 md:py-4 md:text-base lg:px-8 lg:py-6 lg:text-lg">
                Request accounting assistance
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
