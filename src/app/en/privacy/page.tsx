import type { Metadata } from "next";

import { LegalDocumentPage } from "@/components/legal/LegalDocumentPage";
import { privacyEn } from "@/lib/legal/privacy-en";

export const metadata: Metadata = {
  title: "Privacy Notice | E-Marketplace Kft.",
  description:
    "The GDPR privacy notice of E-Marketplace Szolgáltató Kft. for registered office services, service of process agent services and office use in Hungary. Effective from 1 January 2026, version 2.0.",
  alternates: {
    canonical: "https://e-marketplace.hu/en/privacy",
    languages: {
      hu: "https://e-marketplace.hu/adatvedelem",
      en: "https://e-marketplace.hu/en/privacy",
    },
  },
};

export default function PrivacyPage() {
  return <LegalDocumentPage kind="privacy" content={privacyEn} />;
}
