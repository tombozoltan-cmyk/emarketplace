"use client";

import React from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { Check } from "lucide-react";

import { firestoreDb } from "@/lib/firebase";
import {
  defaultPricingCards,
  type PricingCardDoc,
  type PricingGroup,
  type PricingLanguage,
} from "@/lib/pricing-data";
import { QuoteButton } from "@/components/QuoteButton";
import { Card, CardContent } from "@/components/ui/card";

const safeString = (value: unknown): string => (typeof value === "string" ? value : "");

const safeNumber = (value: unknown): number => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const safeStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.filter((v) => typeof v === "string") as string[];
  }

  return [];
};

const normalizeCard = (id: string, raw: Record<string, unknown>): PricingCardDoc => {
  const title = raw.title as Record<string, unknown> | undefined;
  const subtitle = raw.subtitle as Record<string, unknown> | undefined;
  const cornerBadge = raw.cornerBadge as Record<string, unknown> | undefined;
  const price = raw.price as Record<string, unknown> | undefined;
  const priceNote = raw.priceNote as Record<string, unknown> | undefined;
  const annualNote = raw.annualNote as Record<string, unknown> | undefined;
  const originalPrice = raw.originalPrice as Record<string, unknown> | undefined;

  const features = raw.features as Record<string, unknown> | undefined;

  const group =
    raw.group === "bundles" ||
    raw.group === "officeBundles" ||
    raw.group === "fullEntrepreneur"
      ? (raw.group as PricingGroup)
      : "basic";

  const style =
    raw.style === "border" ||
    raw.style === "primarySoft" ||
    raw.style === "premium" ||
    raw.style === "primaryShadow"
      ? (raw.style as PricingCardDoc["style"])
      : "primary";

  return {
    id,
    group,
    order: safeNumber(raw.order) || 0,
    style,
    title: {
      hu: safeString(title?.hu),
      en: safeString(title?.en),
    },
    subtitle:
      subtitle && (subtitle.hu || subtitle.en)
        ? {
            hu: safeString(subtitle.hu),
            en: safeString(subtitle.en),
          }
        : undefined,
    cornerBadge:
      cornerBadge && (cornerBadge.hu || cornerBadge.en)
        ? {
            hu: safeString(cornerBadge.hu),
            en: safeString(cornerBadge.en),
          }
        : undefined,
    originalPrice:
      originalPrice && (originalPrice.hu || originalPrice.en)
        ? {
            hu: safeString(originalPrice.hu),
            en: safeString(originalPrice.en),
          }
        : undefined,
    price: {
      hu: safeString(price?.hu),
      en: safeString(price?.en),
    },
    priceNote: {
      hu: safeString(priceNote?.hu),
      en: safeString(priceNote?.en),
    },
    annualNote: {
      hu: safeString(annualNote?.hu),
      en: safeString(annualNote?.en),
    },
    features: {
      hu: safeStringArray(features?.hu),
      en: safeStringArray(features?.en),
    },
    packageId: safeString(raw.packageId) || undefined,
  };
};

const gridClassByGroup: Record<PricingGroup, string> = {
  basic: "grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-8 lg:grid-cols-4",
  bundles: "grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8",
  officeBundles: "grid grid-cols-1 gap-8 md:grid-cols-2",
  fullEntrepreneur: "grid grid-cols-1 gap-8 md:grid-cols-2",
};

const cardClassByStyle: Record<PricingCardDoc["style"], string> = {
  primary:
    "flex h-full flex-col border-2 border-[color:var(--primary)] bg-[color:var(--card)] shadow-sm transition-shadow hover:shadow-md",
  border:
    "flex h-full flex-col border-2 border-[color:var(--border)] bg-[color:var(--card)] shadow-sm transition-shadow hover:shadow-md",
  primarySoft:
    "flex h-full flex-col border-2 border-[color:var(--primary)]/50 bg-[color:var(--card)] shadow-sm transition-shadow hover:shadow-md",
  premium:
    "relative flex h-full flex-col overflow-hidden border-2 border-[color:var(--primary)] bg-[color:var(--card)] shadow-lg transition-shadow hover:shadow-xl",
  primaryShadow:
    "flex h-full flex-col border-2 border-[color:var(--primary)] bg-[color:var(--card)] shadow-md transition-shadow hover:shadow-lg",
};

type PricingCardsGridProps = {
  group: PricingGroup;
  language: PricingLanguage;
};

export function PricingCardsGrid({ group, language }: PricingCardsGridProps) {
  const [items, setItems] = React.useState<PricingCardDoc[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const q = query(collection(firestoreDb, "pricingCards"), orderBy("order", "asc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const nextItems = snapshot.docs.map((docSnap) =>
          normalizeCard(docSnap.id, docSnap.data() as Record<string, unknown>),
        );
        setItems(nextItems);
        setIsLoading(false);
      },
      () => {
        setItems([]);
        setIsLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  const fallback = React.useMemo(
    () => defaultPricingCards.filter((c) => c.group === group).sort((a, b) => a.order - b.order),
    [group],
  );

  const cards = React.useMemo(() => {
    const fromDb = items
      .filter((c) => c.group === group)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    return fromDb.length > 0 ? fromDb : fallback;
  }, [fallback, group, items]);

  const gridClassName = gridClassByGroup[group];

  if (isLoading && cards.length === 0) {
    return (
      <div className={gridClassName}>
        {Array.from({ length: group === "basic" ? 4 : 2 }).map((_, index) => (
          <Card key={index} className="h-[280px] animate-pulse bg-[color:var(--card)]" />
        ))}
      </div>
    );
  }

  return (
    <div className={gridClassName}>
      {cards.map((card) => {
        const title = card.title[language] || card.title.hu || card.title.en;
        const subtitle = card.subtitle?.[language] || "";
        const cornerBadge = card.cornerBadge?.[language] || "";
        const originalPrice = card.originalPrice?.[language] || "";
        const price = card.price[language] || card.price.hu || card.price.en;
        const priceNote = card.priceNote[language] || card.priceNote.hu || card.priceNote.en;
        const annualNote = card.annualNote[language] || card.annualNote.hu || card.annualNote.en;
        const features =
          card.features[language]?.length > 0 ? card.features[language] : card.features.hu;

        const isPremium = card.style === "premium";
        const hasCornerBadge = Boolean(cornerBadge);

        return (
          <Card key={card.id} className={cardClassByStyle[card.style]}>
            {isPremium && hasCornerBadge ? (
              <span className="absolute right-4 top-4 rounded-full bg-[color:var(--primary)] px-3 py-1 text-xs font-bold text-[color:var(--background)]">
                {cornerBadge}
              </span>
            ) : null}

            <CardContent className="flex flex-1 flex-col p-6">
              <div className="mb-4">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="min-w-0 text-lg font-semibold text-[color:var(--foreground)]">
                    {title}
                  </h3>
                  {!isPremium && hasCornerBadge ? (
                    <span className="flex-shrink-0 rounded bg-[color:var(--primary)]/10 px-2 py-1 text-xs font-bold text-[color:var(--primary)]">
                      {cornerBadge}
                    </span>
                  ) : null}
                </div>
                {subtitle ? (
                  <p className="text-sm text-[color:var(--muted-foreground)]">{subtitle}</p>
                ) : null}
              </div>

              <div className="mb-6">
                {originalPrice ? (
                  <div className="text-sm text-[color:var(--muted-foreground)] line-through">
                    {originalPrice}
                  </div>
                ) : null}
                <div className="mb-2 text-4xl font-bold text-[color:var(--primary)]">{price}</div>
                <p className="text-sm text-[color:var(--muted-foreground)]">{priceNote}</p>
              </div>

              <ul className="mb-6 space-y-3 text-sm text-[color:var(--foreground)]">
                {features.map((item) => (
                  <li key={item} className="flex items-start space-x-3">
                    <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-[color:var(--primary)]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div
                className={`mb-6 rounded-md p-3 text-center text-xs ${
                  isPremium
                    ? "bg-[color:var(--primary)]/10 font-medium text-[color:var(--foreground)]"
                    : "bg-[color:var(--muted)]/50 text-[color:var(--muted-foreground)]"
                }`}
              >
                {annualNote}
              </div>

              {card.packageId ? (
                <QuoteButton
                  packageId={card.packageId}
                  className={
                    isPremium
                      ? "mt-auto w-full rounded-full bg-[color:var(--primary)] text-[color:var(--background)] hover:bg-[color:var(--primary)]/90"
                      : "mt-auto w-full rounded-full font-semibold"
                  }
                >
                  {language === "en" ? "Quote" : "Árajánlat"}
                </QuoteButton>
              ) : null}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
