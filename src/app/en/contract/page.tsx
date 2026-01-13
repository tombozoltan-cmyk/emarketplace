import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ContractWizard } from "@/components/contract-wizard";

export const metadata: Metadata = {
  title: "Start Contract | Registered Office Service - E-Marketplace",
  description:
    "Start the registered office service contract process online. Fill in your details and our colleague will contact you.",
  alternates: {
    canonical: "https://e-marketplace.hu/en/contract",
    languages: {
      hu: "https://e-marketplace.hu/szerzodes",
      en: "https://e-marketplace.hu/en/contract",
    },
  },
};

export default function ContractPageEn() {
  return (
    <main className="flex min-h-screen w-full flex-col bg-[color:var(--background)] text-[color:var(--foreground)]">
      <Header />

      <section className="flex-1 pt-24 pb-8 md:pt-28 md:pb-12">
        <ContractWizard language="en" />
      </section>

      <Footer />
    </main>
  );
}
