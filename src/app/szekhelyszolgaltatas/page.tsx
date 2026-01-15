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
  Home,
  Mail,
  Monitor,
  PiggyBank,
  Rocket,
  Scale,
  Shield,
  TrendingDown,
  Users,
  Briefcase,
  Clock,
  MapPin,
} from "lucide-react";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QuoteButton } from "@/components/QuoteButton";

export const metadata: Metadata = {
  title:
    "Székhelyszolgáltatás Budapest belvárosában | PMT megfelelő székhely + kézbesítési megbízott",
  description:
    "Hivatalos székhelyszolgáltatás Budapest VI. kerület, Izabella utca 68/B címen. 8.000 Ft/hó + ÁFA, kézbesítési megbízott, postakezelés, levélszkennelés és cégtábla új és működő cégeknek.",
  alternates: {
    canonical: "https://e-marketplace.hu/szekhelyszolgaltatas",
    languages: {
      hu: "https://e-marketplace.hu/szekhelyszolgaltatas",
      en: "https://e-marketplace.hu/en/registered-office-hungary",
      de: "https://e-marketplace.hu/de/firmenadresse-ungarn",
      es: "https://e-marketplace.hu/es/oficina-virtual-hungria",
    },
  },
};

export default function SzekhelyszolgaltatasPage() {
  return (
    <main className="flex min-h-screen w-full flex-col bg-[color:var(--background)] text-[color:var(--foreground)]">
      <Header />

      {/* HERO */}
      <section className="relative w-full overflow-hidden bg-[color:var(--muted)]/70 py-12 md:py-16 lg:py-32">
        {/* Egyszerű bubble dekoráció */}
        <div className="pointer-events-none absolute -left-10 -top-32 h-64 w-64 rounded-full bg-[color:var(--primary)]/15 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 bottom-[-6rem] h-72 w-72 rounded-full bg-[color:var(--secondary)]/15 blur-3xl" />

        <div className="relative mx-auto flex max-w-5xl flex-col gap-6 px-4 text-center sm:px-6 lg:px-8">
          {/* Badge */}
          <div className="mb-3 flex w-full justify-center md:mb-4">
            <div className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[color:var(--primary)]/10 px-3 py-1 text-xs font-medium text-[color:var(--primary)] md:w-auto md:px-4 md:py-1.5 md:text-sm">
              <Building2 className="h-3 w-3 md:h-4 md:w-4" />
              <span>Hivatalos Székhelyszolgáltatás+</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-balance text-2xl font-bold text-[color:var(--foreground)] md:text-3xl lg:text-6xl">
            <span>Székhelyszolgáltatás+</span>{" "}
            <span className="text-[color:var(--primary)]">Budapesten</span>
          </h1>

          {/* Subtitle */}
          <p className="text-pretty text-base text-[color:var(--muted-foreground)] md:text-lg lg:text-2xl">
            Költséghatékony megoldás új és működő cégeknek – Kézbesítési megbízott + postakezelés
          </p>

          {/* Ár információ */}
          <p className="text-sm text-[color:var(--muted-foreground)] md:text-base lg:text-lg">
            <span className="font-medium">Presztízs budapesti székhely cím már</span>{" "}
            <span className="font-bold text-[color:var(--primary)]">8.000 Ft/hó + ÁFA</span>{" "}
            <span className="hidden md:inline">– PMT megfelelő | Új cégeknek is</span>
          </p>

          {/* CTA gombok */}
          <div className="mt-2 flex flex-col items-center justify-center gap-2 sm:flex-row md:mt-4 md:gap-3 lg:gap-4">
            <Link href="/szerzodes" className="w-full sm:w-auto">
              <Button className="w-full rounded-full bg-[color:var(--primary)] px-5 py-4 text-sm text-[color:var(--primary-foreground)] hover:bg-[color:var(--primary)]/90 md:w-auto md:px-6 md:py-5 md:text-base lg:px-8 lg:py-6 lg:text-lg">
                Szerződéskötés indítása
                <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
              </Button>
            </Link>
            <QuoteButton className="w-full rounded-full px-5 py-4 text-sm md:w-auto md:px-6 md:py-5 md:text-base lg:px-8 lg:py-6 lg:text-lg" variant="outline">
              Ajánlatot kérek
            </QuoteButton>
          </div>

          {/* Navigációs gombok */}
          <div className="mt-8 grid grid-cols-2 gap-2 md:mt-10 md:gap-3 lg:gap-4">
            <NavButton
              icon={Building2}
              label="Székhelyszolgáltatás+"
              href="#szekhely"
            />
            <NavButton
              icon={Globe}
              label="Külföldi Vállalkozóknak"
              href="#kuldfoldi"
            />
            <NavButton
              icon={Mail}
              label="Kézbesítési Megbízott"
              href="#kezbesitoMegbizott"
            />
            <NavButton
              icon={Briefcase}
              label="Virtuális iroda"
              href="#virtualOffice"
            />
            <NavButton
              icon={Scale}
              label="Cégalapítás & Jog"
              href="#ugyved"
            />
            <NavButton
              icon={Calculator}
              label="Könyvelés"
              href="#konyveles"
            />
          </div>
        </div>
      </section>

      {/* SZÉKHELYSZOLGÁLTATÁS SZEKCIÓ */}
      <section
        id="szekhely"
        className="scroll-mt-24 py-8 md:scroll-mt-32 md:py-12 lg:py-20"
      >
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Badge */}
          <div className="mb-4 flex w-full justify-center md:mb-6">
            <div className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[color:var(--primary)]/10 px-3 py-1 text-xs font-medium text-[color:var(--primary)] md:w-auto md:px-4 md:py-1.5 md:text-sm">
              <Building2 className="h-3 w-3 md:h-4 md:w-4" />
              <span>Hivatalos Székhelyszolgáltatás+</span>
            </div>
          </div>

          {/* Cím + leírás */}
          <h2 className="mb-4 text-center text-xl font-bold text-[color:var(--foreground)] md:mb-6 md:text-2xl lg:mb-8 lg:text-4xl">
            Mi az a székhelyszolgáltatás?
          </h2>
          <p className="mb-8 text-center text-sm text-[color:var(--muted-foreground)] md:mb-12 md:text-base lg:text-lg">
            A székhelyszolgáltatás olyan üzleti megoldás, amellyel vállalkozása egy prémium, központi budapesti címet kaphat anélkül, hogy fizikai irodát kellene bérelnie vagy vásárolnia.
          </p>

          {/* 2 kártya */}
          <div className="grid gap-4 md:grid-cols-2 md:gap-6">
            <Card className="h-full border-l-4 border-l-[color:var(--primary)] shadow-none transition-shadow hover:shadow-xl">
              <CardContent className="p-3 md:p-4 lg:p-6">
                <div className="mb-2 flex items-start gap-2 md:mb-3">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--primary)] md:h-5 md:w-5" />
                  <h3 className="min-w-0 flex-1 break-words text-sm font-semibold text-[color:var(--foreground)] md:text-base lg:text-lg">
                    Milyen problémát old meg?
                  </h3>
                </div>
                <ul className="space-y-2 text-sm text-[color:var(--muted-foreground)] md:space-y-3 md:text-base">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--primary)] md:h-5 md:w-5" />
                    <span className="min-w-0 flex-1 break-words">
                      Nincs saját irodája, de cégjegyzéshez szükséges hivatalos cím.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--primary)] md:h-5 md:w-5" />
                    <span className="min-w-0 flex-1 break-words">
                      Otthoni címet nem szeretne használni üzleti célra.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--primary)] md:h-5 md:w-5" />
                    <span className="min-w-0 flex-1 break-words">
                      Presztízs budapesti cím kell cégének a hitelesség érdekében.
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="h-full border-l-4 border-l-[color:var(--secondary)] shadow-none transition-shadow hover:shadow-xl">
              <CardContent className="p-3 md:p-4 lg:p-6">
                <div className="mb-2 flex items-start gap-2 md:mb-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--secondary)] md:h-5 md:w-5" />
                  <h3 className="min-w-0 flex-1 break-words text-sm font-semibold text-foreground md:text-base lg:text-lg">
                    Mit tartalmaz a szolgáltatás?
                  </h3>
                </div>
                <ul className="space-y-2 text-sm text-[color:var(--muted-foreground)] md:space-y-3 md:text-base">
                  <li className="flex items-start gap-2">
                    <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--secondary)] md:h-5 md:w-5" />
                    <span className="min-w-0 flex-1 break-words">
                      Hivatalos székhely biztosítása presztízs budapesti címen.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--secondary)] md:h-5 md:w-5" />
                    <span className="min-w-0 flex-1 break-words">
                      Levelek és hivatalos iratok átvétele és továbbítása.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--secondary)] md:h-5 md:w-5" />
                    <span className="min-w-0 flex-1 break-words">
                      Cégbírósági bejegyzéshez szükséges dokumentumok biztosítása.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--secondary)] md:h-5 md:w-5" />
                    <span className="min-w-0 flex-1 break-words">
                      Folyamatos elérhetőség és ügyfélszolgálat.
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Fontos információs doboz */}
          <div className="mt-6 mb-6 rounded-r-lg border-l-4 border-l-[color:var(--primary)] bg-[color:var(--primary)]/5 p-3 text-sm text-[color:var(--muted-foreground)] md:mt-8 md:mb-8 md:p-4 lg:mb-12 lg:p-6 md:text-base">
            <span className="font-semibold text-foreground">Fontos:</span>{" "}
            Magyarországon minden cégnek kötelező hivatalos székhellyel rendelkeznie, amelyet a cégjegyzékbe be kell jegyezni. A székhelyszolgáltatás ezt a törvényi kötelezettséget teszi költséghatékonnyá és rugalmassá.
          </div>

          {/* CTA doboz */}
          <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--muted)] p-3 text-center shadow-md md:rounded-2xl md:p-4 lg:p-6">
            <h3 className="mb-2 text-sm font-bold text-[color:var(--foreground)] md:mb-3 md:text-base lg:text-lg">
              Készen áll a székhelyszolgáltatás igénybevételére?
            </h3>
            <p className="mb-4 text-sm text-[color:var(--muted-foreground)] md:mb-6 md:text-base">
              Foglaljon időpontot ingyenes konzultációra, és szakértőink segítenek a megfelelő csomag kiválasztásában!
            </p>
            <QuoteButton className="w-full rounded-full bg-[color:var(--secondary)] px-4 py-2 text-sm text-[color:var(--secondary-foreground)] hover:bg-[color:var(--secondary)]/90 md:w-auto md:px-8 md:py-3 md:text-base">
              Ajánlatot kérek
            </QuoteButton>
          </div>
        </div>
      </section>

      {/* KINEK AJÁNLJUK SZEKCIÓ */}
      <section className="bg-[color:var(--background)] py-12 md:py-16 lg:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-3 text-center text-2xl font-bold text-[color:var(--foreground)] md:mb-4 md:text-3xl lg:text-4xl">
            Kinek ajánljuk a székhelyszolgáltatást?
          </h2>
          <p className="mb-8 max-w-3xl text-center text-sm text-[color:var(--muted-foreground)] md:mb-12 md:text-base lg:mb-16 lg:text-lg lg:leading-relaxed lg:mx-auto">
            A székhelyszolgáltatás széles körben használt megoldás különböző vállalkozási formák és élethelyzetek számára.
          </p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
            {/* Induló vállalkozások */}
            <Card className="h-full border-2 border-[color:var(--border)] bg-[color:var(--card)] transition-all hover:border-[color:var(--primary)] hover:shadow-lg">
              <CardContent className="p-3 md:p-4 lg:p-6">
                <div className="mb-2 flex items-center gap-2 md:mb-3 md:flex-col md:items-start">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[color:var(--primary)]/10 md:h-14 md:w-14 md:rounded-xl lg:h-16 lg:w-16">
                    <Rocket className="h-5 w-5 text-[color:var(--primary)] md:h-7 md:w-7 lg:h-8 lg:w-8" />
                  </div>
                  <h3 className="text-sm font-semibold text-[color:var(--foreground)] md:text-lg lg:text-xl">
                    Induló vállalkozások
                  </h3>
                </div>
                <p className="text-xs text-[color:var(--muted-foreground)] md:text-base">
                  Akik saját irodát még nem tudnak vagy nem akarnak bérelni a kezdeti szakaszban.
                </p>
              </CardContent>
            </Card>

            {/* Home office dolgozók */}
            <Card className="h-full border-2 border-[color:var(--border)] bg-[color:var(--card)] transition-all hover:border-[color:var(--primary)] hover:shadow-lg">
              <CardContent className="p-3 md:p-4 lg:p-6">
                <div className="mb-2 flex items-center gap-2 md:mb-3 md:flex-col md:items-start">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[color:var(--primary)]/10 md:h-14 md:w-14 md:rounded-xl lg:h-16 lg:w-16">
                    <Home className="h-5 w-5 text-[color:var(--primary)] md:h-7 md:w-7 lg:h-8 lg:w-8" />
                  </div>
                  <h3 className="text-sm font-semibold text-[color:var(--foreground)] md:text-lg lg:text-xl">
                    Home office dolgozók
                  </h3>
                </div>
                <p className="text-xs text-[color:var(--muted-foreground)] md:text-base">
                  Akik nem szeretnék otthoni címüket cégként bejelenteni a magánélet védelme érdekében.
                </p>
              </CardContent>
            </Card>

            {/* Külföldi cégek */}
            <Card className="h-full border-2 border-[color:var(--border)] bg-[color:var(--card)] transition-all hover:border-[color:var(--primary)] hover:shadow-lg">
              <CardContent className="p-3 md:p-4 lg:p-6">
                <div className="mb-2 flex items-center gap-2 md:mb-3 md:flex-col md:items-start">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[color:var(--primary)]/10 md:h-14 md:w-14 md:rounded-xl lg:h-16 lg:w-16">
                    <Globe className="h-5 w-5 text-[color:var(--primary)] md:h-7 md:w-7 lg:h-8 lg:w-8" />
                  </div>
                  <h3 className="text-sm font-semibold text-[color:var(--foreground)] md:text-lg lg:text-xl">
                    Külföldi cégek
                  </h3>
                </div>
                <p className="text-xs text-[color:var(--muted-foreground)] md:text-base">
                  Akik magyar piacon szeretnének megjelenni, de nincs fizikai irodájuk Magyarországon.
                </p>
              </CardContent>
            </Card>

            {/* Egyéni vállalkozók */}
            <Card className="h-full border-2 border-[color:var(--border)] bg-[color:var(--card)] transition-all hover:border-[color:var(--primary)] hover:shadow-lg">
              <CardContent className="p-3 md:p-4 lg:p-6">
                <div className="mb-2 flex items-center gap-2 md:mb-3 md:flex-col md:items-start">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[color:var(--primary)]/10 md:h-14 md:w-14 md:rounded-xl lg:h-16 lg:w-16">
                    <Users className="h-5 w-5 text-[color:var(--primary)] md:h-7 md:w-7 lg:h-8 lg:w-8" />
                  </div>
                  <h3 className="text-sm font-semibold text-[color:var(--foreground)] md:text-lg lg:text-xl">
                    Egyéni vállalkozók
                  </h3>
                </div>
                <p className="text-xs text-[color:var(--muted-foreground)] md:text-base">
                  Akik prémium megjelenést szeretnének költséghatékony megoldással.
                </p>
              </CardContent>
            </Card>

            {/* Többszörös telephelyek */}
            <Card className="h-full border-2 border-[color:var(--border)] bg-[color:var(--card)] transition-all hover:border-[color:var(--primary)] hover:shadow-lg">
              <CardContent className="p-3 md:p-4 lg:p-6">
                <div className="mb-2 flex items-center gap-2 md:mb-3 md:flex-col md:items-start">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[color:var(--primary)]/10 md:h-14 md:w-14 md:rounded-xl lg:h-16 lg:w-16">
                    <Building className="h-5 w-5 text-[color:var(--primary)] md:h-7 md:w-7 lg:h-8 lg:w-8" />
                  </div>
                  <h3 className="text-sm font-semibold text-[color:var(--foreground)] md:text-lg lg:text-xl">
                    Többszörös telephelyek
                  </h3>
                </div>
                <p className="text-xs text-[color:var(--muted-foreground)] md:text-base">
                  Akik több helyszínen működnek és központi székhelyet keresnek.
                </p>
              </CardContent>
            </Card>

            {/* Adóoptimalizálók */}
            <Card className="h-full border-2 border-[color:var(--border)] bg-[color:var(--card)] transition-all hover:border-[color:var(--primary)] hover:shadow-lg">
              <CardContent className="p-3 md:p-4 lg:p-6">
                <div className="mb-2 flex items-center gap-2 md:mb-3 md:flex-col md:items-start">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[color:var(--primary)]/10 md:h-14 md:w-14 md:rounded-xl lg:h-16 lg:w-16">
                    <TrendingDown className="h-5 w-5 text-[color:var(--primary)] md:h-7 md:w-7 lg:h-8 lg:w-8" />
                  </div>
                  <h3 className="text-sm font-semibold text-[color:var(--foreground)] md:text-lg lg:text-xl">
                    Adóoptimalizálók
                  </h3>
                </div>
                <p className="text-xs text-[color:var(--muted-foreground)] md:text-base">
                  Akik iparűzési adó megtakarítást szeretnének elérni (amennyiben nincs telephely).
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* KÉZBESÍTÉSI MEGBÍZOTT SZEKCIÓ */}
      <section
        id="kezbesitoMegbizott"
        className="scroll-mt-32 bg-[color:var(--muted)]/60 py-8 md:py-16"
      >
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Badge */}
          <div className="mb-4 flex w-full justify-center md:mb-6">
            <div className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[color:var(--primary)]/10 px-3 py-1 text-xs font-medium text-[color:var(--primary)] md:w-auto md:px-4 md:py-1.5 md:text-sm">
              <Globe className="h-3 w-3 md:h-4 md:w-4" />
              <span>Külföldi ügyfeleknek kötelező</span>
            </div>
          </div>

          {/* Cím + leírás */}
          <h2 className="mb-4 text-center text-2xl font-bold text-[color:var(--foreground)] md:mb-6 md:text-3xl">
            Kézbesítési Megbízott Szolgáltatás
          </h2>
          <p className="mb-6 text-center text-base text-[color:var(--muted-foreground)] md:mb-10 md:text-lg">
            A hatályos magyar jogszabályok (Ctv.) értelmében minden olyan külföldi személynek, aki magyar cégben tisztséget vállal vagy tulajdonos lesz, és nem rendelkezik magyarországi lakcímmel, kötelező kézbesítési megbízottat megjelölnie.
          </p>

          {/* 2 kártya */}
          <div className="grid gap-4 md:grid-cols-2 md:gap-6">
            <Card className="h-full border-l-4 border-l-[color:var(--primary)] bg-[color:var(--card)] shadow-none transition-shadow hover:shadow-xl">
              <CardContent className="p-4 md:p-6">
                <div className="mb-3 flex items-center gap-2 md:mb-4">
                  <Shield className="h-5 w-5 text-[color:var(--primary)]" />
                  <h3 className="text-lg font-bold text-[color:var(--foreground)] md:text-xl">
                    Milyen problémákat oldunk meg?
                  </h3>
                </div>
                <ul className="space-y-2 text-sm text-[color:var(--muted-foreground)] md:space-y-3 md:text-base">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--primary)] md:h-5 md:w-5" />
                    <span className="min-w-0 flex-1 break-words">
                      Biztosítjuk a törvényi megfelelést a cégbejegyzéshez.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--primary)] md:h-5 md:w-5" />
                    <span className="min-w-0 flex-1 break-words">
                      Hivatalos kapcsolattartóként átvesszük a hatósági iratokat.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--primary)] md:h-5 md:w-5" />
                    <span className="min-w-0 flex-1 break-words">
                      Elkerülheti, hogy adminisztrációs hiba miatt elutasítsák a cégalapítást.
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="h-full border-l-4 border-l-[color:var(--primary)] bg-[color:var(--card)] shadow-none transition-shadow hover:shadow-xl">
              <CardContent className="p-4 md:p-6">
                <div className="mb-3 flex items-center gap-2 md:mb-4">
                  <Users className="h-5 w-5 text-[color:var(--primary)]" />
                  <h3 className="text-lg font-bold text-[color:var(--foreground)] md:text-xl">
                    Kinek kötelező?
                  </h3>
                </div>
                <ul className="space-y-2 text-sm text-[color:var(--muted-foreground)] md:space-y-3 md:text-base">
                  <li className="flex items-start gap-2">
                    <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--primary)] md:h-5 md:w-5" />
                    <span className="min-w-0 flex-1 break-words">
                      Külföldi állampolgárságú ügyvezetőknek.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--primary)] md:h-5 md:w-5" />
                    <span className="min-w-0 flex-1 break-words">
                      Külföldi illetőségű cégtulajdonosoknak (tagoknak).
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--primary)] md:h-5 md:w-5" />
                    <span className="min-w-0 flex-1 break-words">
                      Akiknek nincs magyarországi bejelentett lakcíme.
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* CTA doboz */}
          <div className="mt-6 rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-4 text-center shadow-md md:mt-8 md:p-6 lg:p-8">
            <h3 className="mb-2 text-lg font-bold text-[color:var(--foreground)] md:mb-3 md:text-xl">
              Hogyan működik?
            </h3>
            <p className="mb-4 text-sm text-[color:var(--muted-foreground)] md:mb-6 md:text-base">
              Megbízási szerződést kötünk, amelyben vállaljuk az iratok átvételét és 15 napon belüli továbbítását az Ön részére. Ezt a megbízást az ügyvéd ellenjegyzi és benyújtja a Cégbíróságra.
            </p>
            <Button className="w-full rounded-full bg-[color:var(--primary)] px-4 py-2 text-sm text-[color:var(--primary-foreground)] hover:bg-[color:var(--primary)]/90 md:w-auto md:px-6 md:py-3 md:text-base">
              Kézbesítési megbízottat kérek
            </Button>
          </div>
        </div>
      </section>

      {/* HOSSZÚ TÁVÚ SZERZŐDÉSES IRODABÉRLÉS / VIRTUÁLIS IRODA */}
      <section
        id="virtualOffice"
        className="scroll-mt-20 bg-[color:var(--muted)]/60 py-20"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {/* Badge */}
          <div className="mb-4 flex w-full justify-center md:mb-6">
            <div className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[color:var(--primary)]/10 px-3 py-1 text-xs font-medium text-[color:var(--primary)] md:w-auto md:px-4 md:py-1.5 md:text-sm">
              <Monitor className="h-3 w-3 md:h-4 md:w-4" />
              <span>Hosszú távú megoldás</span>
            </div>
          </div>

          {/* Cím */}
          <h2 className="mb-6 text-center text-2xl font-bold text-[color:var(--foreground)] md:mb-8 md:text-3xl lg:text-4xl">
            Hosszú Távú Szerződéses Irodabérlés
          </h2>

          {/* Leírás */}
          <p className="mb-12 max-w-3xl text-center text-lg text-[color:var(--muted-foreground)] md:mx-auto">
            1 éves szerződéssel irodát biztosítunk olyan vállalkozásoknak, akiknek banki vagy más hivatalos igazoláshoz szükségük van érvényes irodai szerződésre. Havi 4 alkalom irodahasználattal.
          </p>

          {/* 2 nagy kártya */}
          <div className="grid gap-8 md:grid-cols-2">
            {/* Piros téma: Milyen problémákat old meg? */}
            <Card className="h-full border-2 border-red-200 bg-[color:var(--card)] transition-all hover:border-red-300 hover:shadow-xl">
              <CardContent className="p-8">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100">
                    <AlertCircle className="h-6 w-6 text-red-600" />
                  </div>
                  <h3 className="text-xl font-bold text-[color:var(--foreground)]">
                    Milyen problémákat old meg?
                  </h3>
                </div>
                <ul className="space-y-4 text-sm text-[color:var(--muted-foreground)] md:text-base">
                  {[
                    "Banki hiteligényléshez szükséges hivatalos irodai szerződés.",
                    "Beszállítói szerződésekhez vagy nagyobb partnereknek bizonyítani kell a cég stabilitását.",
                    "Cégalapításhoz regisztrált magyar cím és iroda szükséges.",
                    "Távmunkában dolgozó csapat számára alkalmi találkozó helyszín.",
                    "Üzleti hitelesség növelése professzionális budapesti címmel.",
                  ].map((text) => (
                    <li key={text} className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
                        <span className="text-xs font-bold text-red-600">!</span>
                      </span>
                      <span>{text}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Sárga téma: Mit tartalmaz a szolgáltatás? */}
            <Card className="h-full border-2 border-[color:var(--primary)]/30 bg-[color:var(--primary)]/5 transition-all hover:border-[color:var(--primary)] hover:shadow-xl">
              <CardContent className="p-8">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[color:var(--primary)]/10">
                    <CheckCircle2 className="h-6 w-6 text-[color:var(--primary)]" />
                  </div>
                  <h3 className="text-xl font-bold text-[color:var(--foreground)]">
                    Mit tartalmaz a szolgáltatás?
                  </h3>
                </div>
                <ul className="space-y-4 text-sm text-[color:var(--muted-foreground)] md:text-base">
                  {[
                    "1 éves bérleti szerződés (előre fizetendő).",
                    "Havi 4 alkalommal irodahasználat (meeting szoba, munkahely).",
                    "Presztízs budapesti cím (1064 Budapest, Izabella utca 68/B).",
                    "Cégtábla kihelyezés az épületen.",
                    "Bankok és hivatalok számára hiteles szerződés.",
                  ].map((text) => (
                    <li key={text} className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-[color:var(--primary)]" />
                      <span>{text}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Nagy sárga CTA doboz */}
          <div className="mt-8 rounded-2xl bg-[color:var(--primary)] p-4 text-center text-[color:var(--primary-foreground)] md:mt-10 md:p-8">
            <h3 className="mb-2 text-lg font-bold md:mb-3 md:text-2xl">
              Igényeljen hosszú távú irodabérlést!
            </h3>
            <p className="mb-4 text-sm text-white/90 md:mb-6 md:text-base">
              Biztonságos megoldás banki és üzleti igazolásokhoz.
            </p>
            <QuoteButton
              size="lg"
              className="rounded-full bg-white px-4 py-2 text-sm text-[color:var(--primary)] hover:bg-white/90 md:px-6 md:py-3 md:text-base"
            >
              Ajánlatot kérek
            </QuoteButton>
          </div>
        </div>
      </section>

      {/* CÉGALAPÍTÁS & JOG SZEKCIÓ */}
      <section
        id="ugyved"
        className="scroll-mt-32 bg-[color:var(--muted)]/60 py-12 md:py-20"
      >
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Badge */}
          <div className="mb-4 flex w-full justify-center md:mb-6">
            <div className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[color:var(--primary)]/10 px-3 py-1 text-xs font-medium text-[color:var(--primary)] md:w-auto md:px-4 md:py-1.5 md:text-sm">
              <FileCheck className="h-3 w-3 md:h-4 md:w-4" />
              <span>Cégalapítás & Jogi szolgáltatások</span>
            </div>
          </div>

          {/* Cím + leírás */}
          <h2 className="mb-6 text-center text-2xl font-bold text-[color:var(--foreground)] md:mb-8 md:text-3xl lg:text-4xl">
            Cégalapítás & Jog
          </h2>
          <p className="mb-12 text-center text-lg text-[color:var(--muted-foreground)]">
            Teljes körű jogi háttérrel segítünk cégalapításban, módosításban és a székhelyszolgáltatáshoz kapcsolódó jogi kérdésekben.
          </p>

          {/* 2 kártya */}
          <div className="grid gap-8 md:grid-cols-2">
            {/* Cégalapítás */}
            <Card className="h-full border-l-4 border-l-[color:var(--primary)] bg-[color:var(--card)] shadow-none transition-shadow hover:shadow-xl">
              <CardContent className="p-6">
                <div className="mb-4 flex items-center gap-2">
                  <Building className="h-5 w-5 text-[color:var(--primary)]" />
                  <h3 className="text-lg font-bold text-[color:var(--foreground)] md:text-xl">
                    Cégalapítás
                  </h3>
                </div>
                <ul className="space-y-3 text-sm text-[color:var(--muted-foreground)] md:text-base">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[color:var(--primary)]" />
                    <span>Új cég alapítása teljes körű jogi képviselettel.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[color:var(--primary)]" />
                    <span>Társasági szerződés és alapszabály elkészítése.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[color:var(--primary)]" />
                    <span>Cégbírósági bejegyzéshez szükséges dokumentáció összeállítása.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[color:var(--primary)]" />
                    <span>Székhelyszolgáltatási szerződés integrálása a cégalapítási folyamatba.</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Jogi tanácsadás */}
            <Card className="h-full border-l-4 border-l-[color:var(--secondary)] bg-[color:var(--card)] shadow-none transition-shadow hover:shadow-xl">
              <CardContent className="p-6">
                <div className="mb-4 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-[color:var(--secondary)]" />
                  <h3 className="text-lg font-bold text-[color:var(--foreground)] md:text-xl">
                    Jogi tanácsadás
                  </h3>
                </div>
                <ul className="space-y-3 text-sm text-[color:var(--muted-foreground)] md:text-base">
                  <li className="flex items-start gap-2">
                    <ArrowRight className="mt-0.5 h-5 w-5 shrink-0 text-[color:var(--secondary)]" />
                    <span>Jogi konzultáció székhelyszolgáltatással kapcsolatos kérdésekről.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="mt-0.5 h-5 w-5 shrink-0 text-[color:var(--secondary)]" />
                    <span>Cégmódosítások, tulajdonos- vagy székhelyváltozás jogi lebonyolítása.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="mt-0.5 h-5 w-5 shrink-0 text-[color:var(--secondary)]" />
                    <span>PMT és egyéb jogszabályi megfelelés biztosítása.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="mt-0.5 h-5 w-5 shrink-0 text-[color:var(--secondary)]" />
                    <span>Folyamatos jogi háttér igény szerint.</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* CTA doboz */}
          <div className="mt-8 rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-6 text-center shadow-md md:mt-10 md:p-8">
            <h3 className="mb-2 text-base font-bold text-[color:var(--foreground)] md:mb-3 md:text-lg lg:text-xl">
              Szeretne jogi támogatást a cégalapításhoz vagy módosításhoz?
            </h3>
            <p className="mb-4 text-sm text-[color:var(--muted-foreground)] md:mb-6 md:text-base">
              Vegye fel velünk a kapcsolatot, és összekötjük olyan tapasztalt ügyvédi irodával, akik a székhelyszolgáltatással összehangoltan dolgoznak.
            </p>
            <Link href="/kapcsolat#ugyved" className="inline-block">
              <Button className="rounded-full bg-[color:var(--secondary)] px-4 py-2 text-sm text-[color:var(--secondary-foreground)] hover:bg-[color:var(--secondary)]/90 md:px-6 md:py-4 md:text-base lg:px-8 lg:py-6 lg:text-lg">
                Kapcsolatfelvétel jogi partnerrel
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* KÖNYVELÉS SZEKCIÓ */}
      <section
        id="konyveles"
        className="scroll-mt-32 bg-[color:var(--background)] py-12 md:py-20"
      >
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Badge */}
          <div className="mb-4 flex w-full justify-center md:mb-6">
            <div className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[color:var(--primary)]/10 px-3 py-1 text-xs font-medium text-[color:var(--primary)] md:w-auto md:px-4 md:py-1.5 md:text-sm">
              <FileCheck className="h-3 w-3 md:h-4 md:w-4" />
              <span>Könyvelés és pénzügyi háttér</span>
            </div>
          </div>

          {/* Cím + leírás */}
          <h2 className="mb-6 text-center text-2xl font-bold text-[color:var(--foreground)] md:mb-8 md:text-3xl lg:text-4xl">
            Könyvelés
          </h2>
          <p className="mb-12 text-center text-lg text-[color:var(--muted-foreground)]">
            Megbízható könyvelőpartnerekkel dolgozunk, akik ismerik a székhelyszolgáltatás sajátosságait és a kapcsolódó adózási szabályokat.
          </p>

          {/* 3 kártya */}
          <div className="grid gap-4 md:grid-cols-3 md:gap-6">
            {[
              {
                title: "Teljes körű könyvelés",
                description:
                  "Havi könyvelés, bevallások, beszámolók elkészítése és határidők figyelése.",
                icon: FileCheck,
              },
              {
                title: "Adó- és jogszabálykövetés",
                description:
                  "Folyamatos tájékoztatás az adózási változásokról és kötelezettségekről.",
                icon: Shield,
              },
              {
                title: "Tanácsadás vállalkozóknak",
                description:
                  "Segítség az optimális adózási forma és pénzügyi struktúra kiválasztásában.",
                icon: Users,
              },
            ].map((service, index) => {
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

          {/* CTA doboz */}
          <div className="mt-8 rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-4 text-center shadow-md md:mt-10 md:p-6 lg:p-8">
            <h3 className="mb-2 text-base font-bold text-[color:var(--foreground)] md:mb-3 md:text-lg lg:text-xl">
              Szüksége van megbízható könyvelőre?
            </h3>
            <p className="mb-4 text-sm text-[color:var(--muted-foreground)] md:mb-6 md:text-base">
              Szívesen ajánlunk olyan könyvelőpartnert, aki ismeri a székhelyszolgáltatással kapcsolatos sajátosságokat és a külföldi ügyfelek igényeit is.
            </p>
            <Link href="/kapcsolat#konyveles" className="inline-block">
              <Button className="rounded-full bg-[color:var(--primary)] px-4 py-2 text-sm text-[color:var(--primary-foreground)] hover:bg-[color:var(--primary)]/90 md:px-6 md:py-4 md:text-base lg:px-8 lg:py-6 lg:text-lg">
                Könyvelő ajánlatot kérek
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* PROBLÉMÁK ÉS MEGOLDÁSOK SZEKCIÓ */}
      <section
        id="kuldfoldi"
        className="scroll-mt-32 bg-[color:var(--background)] py-12 md:py-20"
      >
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Badge */}
          <div className="mb-4 flex w-full justify-center md:mb-6">
            <div className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[color:var(--primary)]/10 px-3 py-1 text-xs font-medium text-[color:var(--primary)] md:w-auto md:px-4 md:py-1.5 md:text-sm">
              <AlertCircle className="h-3 w-3 md:h-4 md:w-4" />
              <span>Problémák és megoldások</span>
            </div>
          </div>

          {/* Cím + leírás */}
          <h2 className="mb-6 text-center text-2xl font-bold text-[color:var(--foreground)] md:mb-8 md:text-3xl lg:text-4xl">
            Milyen problémákat old meg?
          </h2>
          <p className="mb-12 text-center text-lg text-[color:var(--muted-foreground)]">
            Konkrét kihívások, amelyekre a székhelyszolgáltatás praktikus választ ad.
          </p>

          <div className="grid gap-8 md:grid-cols-2">
            {[ 
              {
                title: "Nincs saját ingatlanom",
                description:
                  "Budapesti presztízs címet biztosítunk, cégtáblával, cégbejegyzéshez elfogadva.",
              },
              {
                title: "Nem akarom az otthoni címem használni",
                description:
                  "Megőrizheti magánéletét, NAV ellenőrzések nem az otthonában történnek.",
              },
              {
                title: "Drága lenne egy teljes iroda",
                description:
                  "8.000 Ft/hó áron minden adminisztrációs szolgáltatást megkap, iroda bérlés nélkül.",
              },
              {
                title: "Külföldi vagyok, nincs magyar címem",
                description:
                  "Magyar cégalapításhoz szükséges hivatalos székhely + kézbesítési megbízott szolgáltatás.",
              },
              {
                title: "Sok időbe telik a postázás kezelése",
                description:
                  "Mi átvesszük, szkenneljük és továbbítjuk az összes hivatalos levelet emailben.",
              },
            ].map((item, index) => (
              <Card
                key={item.title}
                className={`h-full border-2 border-[color:var(--border)] bg-[color:var(--card)] transition-all hover:border-[color:var(--primary)] hover:shadow-lg ${
                  index === 4 ? "md:col-span-2 md:max-w-xl md:mx-auto" : ""
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

      <Footer />
    </main>
  );
}

type NavButtonProps = {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
};

function NavButton({ icon: Icon, label, href }: NavButtonProps) {
  return (
    <Link
      href={href}
      className="flex w-full items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--card)] px-3 py-2 text-left text-xs text-[color:var(--foreground)] transition-all hover:-translate-y-0.5 hover:border-[color:var(--primary)] hover:shadow-md md:px-4 md:py-3 md:text-sm"
    >
      <Icon className="h-3 w-3 text-[color:var(--primary)] md:h-4 md:w-4" />
      <span className="truncate">{label}</span>
    </Link>
  );
}
