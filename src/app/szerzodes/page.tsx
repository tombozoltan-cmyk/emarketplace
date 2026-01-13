import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ContractWizard } from "@/components/contract-wizard";

export const metadata: Metadata = {
  title: "Szerződéskötés | Székhelyszolgáltatás - E-Marketplace",
  description:
    "Indítsa el a székhelyszolgáltatás szerződéskötési folyamatát online. Töltse ki az adatokat és kollégánk felveszi Önnel a kapcsolatot.",
  alternates: {
    canonical: "https://e-marketplace.hu/szerzodes",
    languages: {
      hu: "https://e-marketplace.hu/szerzodes",
      en: "https://e-marketplace.hu/en/contract",
    },
  },
};

export default function ContractPage() {
  return (
    <main className="flex min-h-screen w-full flex-col bg-[color:var(--background)] text-[color:var(--foreground)]">
      <Header />

      <section className="flex-1 pt-24 pb-8 md:pt-28 md:pb-12">
        <ContractWizard language="hu" />
      </section>

      <Footer />
    </main>
  );
}
