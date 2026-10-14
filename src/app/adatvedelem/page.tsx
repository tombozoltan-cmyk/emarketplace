import type { Metadata } from "next";

import { LegalDocumentPage } from "@/components/legal/LegalDocumentPage";
import { adatvedelemHu } from "@/lib/legal/adatvedelem-hu";

export const metadata: Metadata = {
  title: "Adatkezelési tájékoztató | E-Marketplace Kft.",
  description:
    "Az E-Marketplace Szolgáltató Kft. GDPR szerinti adatkezelési tájékoztatója a székhelyszolgáltatás, a kézbesítési megbízotti szolgáltatás és az irodahasználat igénybevételéhez. Hatályos 2026. január 1-től, 2.0 verzió.",
  alternates: {
    canonical: "https://e-marketplace.hu/adatvedelem",
    languages: {
      hu: "https://e-marketplace.hu/adatvedelem",
      en: "https://e-marketplace.hu/en/privacy",
    },
  },
};

export default function AdatvedelemPage() {
  return <LegalDocumentPage kind="privacy" content={adatvedelemHu} />;
}
