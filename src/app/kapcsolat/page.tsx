import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ContactPageContent } from "@/components/ContactPageContent";

export const metadata: Metadata = {
  title: "Kapcsolat | Kérjen Ajánlatot Székhelyszolgáltatásra | E-Marketplace",
  description:
    "Vegye fel velünk a kapcsolatot Budapest belvárosában működő prémium székhelyszolgáltatásunkkal. Ingyenes ajánlatkérés székhelyszolgáltatásra, kézbesítési megbízottra és irodacsomagokra.",
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

export default function KapcsolatPage() {
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
