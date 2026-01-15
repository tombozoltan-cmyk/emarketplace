"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { Check, Star } from "lucide-react";
import { firestoreDb } from "@/lib/firebase";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ContractLanguage, ServiceType } from "@/lib/contract-types";

type PricingCard = {
  id: string;
  packageId: string;
  group: string;
  order: number;
  style: string;
  title: { hu: string; en: string };
  subtitle?: { hu: string; en: string };
  cornerBadge?: { hu: string; en: string };
  price: { hu: string; en: string };
  priceNote: { hu: string; en: string };
  annualNote: { hu: string; en: string };
  features: { hu: string[]; en: string[] };
};

// Szolgáltatás típus mapping packageId alapján (Firestore doc ID-k)
const PACKAGE_TO_SERVICE: Record<string, ServiceType> = {
  // Alap csomagok
  "basic-hu": "szekhely-hu",
  "basic-foreign": "szekhely-kulfoldi",
  "basic-delivery-agent": "kezbesitesi",
  "basic-virtual-office": "szekhely-hu",
  // Kombinált csomagok
  "bundle-hu": "szekhely-kezbesitesi-hu",
  "bundle-foreign": "szekhely-kezbesitesi-kulfoldi",
  // Teljes csomagok
  "full-hu": "iroda-kezbesitesi-hu",
  "full-foreign": "iroda-kezbesitesi-kulfoldi",
  // Iroda csomagok
  "office-hu": "iroda-hu",
  "office-foreign": "iroda-kulfoldi",
};

// Ár kinyerése stringből (pl. "8 000 Ft" -> 8000)
const parsePrice = (priceStr: string): number => {
  const cleaned = priceStr.replace(/[^\d]/g, "");
  return parseInt(cleaned, 10) || 0;
};

type Step2ServiceSelectProps = {
  selectedPackageId: string;
  onSelect: (
    serviceType: ServiceType,
    packageId: string,
    monthlyPrice: number,
    annualPrice: number
  ) => void;
  language: ContractLanguage;
  isNewCompany: boolean;
};

export function Step2ServiceSelect({
  selectedPackageId,
  onSelect,
  language,
  isNewCompany,
}: Step2ServiceSelectProps) {
  const [cards, setCards] = useState<PricingCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const t = language === "hu";

  useEffect(() => {
    // Query without orderBy to avoid index requirement issues
    const colRef = collection(firestoreDb, "pricingCards");

    const unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        const items = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            packageId: data.packageId || doc.id,
            group: data.group || "basic",
            order: data.order || 0,
            ...data,
          } as PricingCard;
        });
        items.sort((a, b) => (a.order || 0) - (b.order || 0));
        setCards(items);
        setIsLoading(false);
      },
      (err) => {
        console.error("pricingCards fetch error:", err);
        setError(err.message || "Unknown error");
        setCards([]);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Egyszerűsített: minden kártya megjelenik, nincs csoportosítás
  // TODO: később visszaállítható a csoportosítás ha a Firestore adatok rendben vannak

  const handleSelect = (card: PricingCard) => {
    const serviceType = PACKAGE_TO_SERVICE[card.packageId] || "szekhely-hu";
    const monthlyPrice = parsePrice(card.price.hu);
    // Éves ár = havi * 12 (egyszerűsítve)
    const annualPrice = monthlyPrice * 12;
    onSelect(serviceType, card.packageId, monthlyPrice, annualPrice);
  };

  const renderCard = (card: PricingCard) => {
    const isSelected = card.packageId === selectedPackageId;
    const title = card.title[language] || card.title.hu;
    const subtitle = card.subtitle?.[language] || card.subtitle?.hu || "";
    const price = card.price[language] || card.price.hu;
    const priceNote = card.priceNote[language] || card.priceNote.hu;
    const features = card.features[language] || card.features.hu || [];
    const isPremium = card.style === "premium";
    const badge = card.cornerBadge?.[language] || card.cornerBadge?.hu;

    return (
      <button
        key={card.id}
        type="button"
        onClick={() => handleSelect(card)}
        className="text-left"
      >
        <Card
          className={cn(
            "relative h-full cursor-pointer border-2 transition-all hover:shadow-lg",
            isSelected
              ? "border-[color:var(--primary)] bg-[color:var(--primary)]/5 shadow-md"
              : "border-[color:var(--border)] hover:border-[color:var(--primary)]/50",
            isPremium && "ring-2 ring-[color:var(--primary)]/20"
          )}
        >
          {/* Badge */}
          {badge && (
            <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-[color:var(--primary)] px-2 py-1 text-xs font-bold text-[color:var(--primary-foreground)]">
              {isPremium && <Star className="h-3 w-3" />}
              {badge}
            </div>
          )}

          {/* Kiválasztva jelző */}
          {isSelected && (
            <div className="absolute left-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-white">
              <Check className="h-4 w-4" />
            </div>
          )}

          <CardContent className="px-4 pt-5 pb-4">
            <div className="mb-3">
              <h3 className="text-base font-semibold text-[color:var(--foreground)]">
                {title}
              </h3>
              {subtitle && (
                <p className="text-xs text-[color:var(--muted-foreground)]">
                  {subtitle}
                </p>
              )}
            </div>

            <div className="mb-3">
              <div className="text-2xl font-bold text-[color:var(--primary)]">
                {price}
              </div>
              <p className="text-xs text-[color:var(--muted-foreground)]">
                {priceNote}
              </p>
            </div>

            <ul className="space-y-1">
              {features.slice(0, 3).map((feature, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 text-xs text-[color:var(--muted-foreground)]"
                >
                  <Check className="mt-0.5 h-3 w-3 flex-shrink-0 text-[color:var(--primary)]" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </button>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="mb-2 text-2xl font-bold text-[color:var(--foreground)]">
            {t ? "Szolgáltatás választás" : "Select a Service"}
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="h-48 animate-pulse bg-[color:var(--muted)]" />
          ))}
        </div>
      </div>
    );
  }

  // Debug: ha nincs kártya vagy hiba van
  if (error || cards.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="mb-2 text-2xl font-bold text-[color:var(--foreground)]">
            {t ? "Válasszon szolgáltatást" : "Select a Service"}
          </h2>
          <p className="text-red-500">
            {t ? "Hiba: Nem sikerült betölteni a csomagokat." : "Error: Could not load packages."}
          </p>
          {error && (
            <p className="mt-2 text-xs text-red-400">
              Részletek: {error}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="mb-2 text-2xl font-bold text-[color:var(--foreground)]">
          {t ? "Válasszon szolgáltatást" : "Select a Service"}
        </h2>
        <p className="text-[color:var(--muted-foreground)]">
          {t
            ? "Válassza ki az Ön igényeinek megfelelő csomagot. Az árak havonta értendők, 1 évre előre fizetendők."
            : "Choose the package that fits your needs. Prices are monthly, payable annually in advance."}
        </p>
      </div>

      {/* Minden kártya megjelenik */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(renderCard)}
      </div>

      {/* Információs doboz új cégeknek */}
      {isNewCompany && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <span className="font-semibold">
              {t ? "Tipp új cégeknek: " : "Tip for new companies: "}
            </span>
            {t
              ? "Ha külföldi tulajdonossal vagy ügyvezetővel alapít céget, a kézbesítési megbízott szolgáltatás kötelező. Javasoljuk a kombinált csomagot."
              : "If founding a company with a foreign owner or director, the delivery agent service is mandatory. We recommend a bundle package."}
          </p>
        </div>
      )}
    </div>
  );
}
