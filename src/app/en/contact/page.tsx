import type { Metadata } from "next";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ContactPageContent } from "@/components/ContactPageContent";

export const metadata: Metadata = {
  title: "Contact | Request a Quote | E-Marketplace",
  description:
    "Get in touch with our premium registered office service in downtown Budapest. Request a free quote for registered office services, service address and office packages.",
  alternates: {
    canonical: "https://e-marketplace.hu/en/contact",
    languages: {
      hu: "https://e-marketplace.hu/kapcsolat",
      en: "https://e-marketplace.hu/en/contact",
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  mainEntity: {
    "@type": "LocalBusiness",
    name: "E-Marketplace Kft.",
    telephone: "+36 50 104 6116",
    email: "emarketplacekft@gmail.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Izabella utca 68/B",
      addressLocality: "Budapest",
      postalCode: "1064",
      addressCountry: "HU",
    },
    url: "https://e-marketplace.hu",
  },
};

export default function ContactPageEn() {
  return (
    <main className="flex min-h-screen w-full flex-col bg-[color:var(--background)] text-[color:var(--foreground)]">
      <Header />

      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <ContactPageContent />

      <Footer />
    </main>
  );
}
