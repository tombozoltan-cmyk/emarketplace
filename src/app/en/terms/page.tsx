import type { Metadata } from "next";

import { LegalDocumentPage } from "@/components/legal/LegalDocumentPage";
import { gtcEn } from "@/lib/legal/gtc-en";

export const metadata: Metadata = {
  title: "General Terms and Conditions | E-Marketplace Kft.",
  description:
    "The General Terms and Conditions of E-Marketplace Szolgáltató Kft. for registered office services and service of process agent services in Hungary. Effective from 1 January 2026, version 3.0.",
  alternates: {
    canonical: "https://e-marketplace.hu/en/terms",
    languages: {
      hu: "https://e-marketplace.hu/aszf",
      en: "https://e-marketplace.hu/en/terms",
    },
  },
};

export default function TermsPage() {
  return <LegalDocumentPage kind="terms" content={gtcEn} />;
}
