import type { Metadata } from "next";

import { LegalDocumentPage } from "@/components/legal/LegalDocumentPage";
import { aszfHu } from "@/lib/legal/aszf-hu";

export const metadata: Metadata = {
  title: "Általános Szerződési Feltételek | E-Marketplace Kft.",
  description:
    "Az E-Marketplace Szolgáltató Kft. székhelyszolgáltatásra és kézbesítési megbízotti szolgáltatásra vonatkozó Általános Szerződési Feltételei. Hatályos 2026. január 1-től, 3.0 verzió.",
  alternates: {
    canonical: "https://e-marketplace.hu/aszf",
    languages: {
      hu: "https://e-marketplace.hu/aszf",
      en: "https://e-marketplace.hu/en/terms",
    },
  },
};

export default function AszfPage() {
  return <LegalDocumentPage kind="terms" content={aszfHu} />;
}
