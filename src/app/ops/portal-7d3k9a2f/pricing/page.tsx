"use client";

import React from "react";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { ChevronDown, ChevronUp } from "lucide-react";

import { AdminGate } from "../../../../components/admin/AdminGate";
import { AdminShell } from "../../../../components/admin/AdminShell";
import { Button } from "../../../../components/ui/button";
import { Card } from "../../../../components/ui/card";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { NativeSelect } from "../../../../components/ui/select";
import { Textarea } from "../../../../components/ui/textarea";
import { firestoreDb } from "../../../../lib/firebase";
import {
  defaultPricingCards,
  pricingGroupLabel,
  type PricingCardDoc,
  type PricingGroup,
} from "../../../../lib/pricing-data";

type PricingStyleOption = PricingCardDoc["style"];

type Draft = {
  group: PricingGroup;
  order: number;
  style: PricingStyleOption;
  title: { hu: string; en: string };
  subtitle: { hu: string; en: string };
  cornerBadge: { hu: string; en: string };
  originalPrice: { hu: string; en: string };
  price: { hu: string; en: string };
  priceNote: { hu: string; en: string };
  annualNote: { hu: string; en: string };
  features: { hu: string[]; en: string[] };
  packageId: string;
};

const emptyDraft: Draft = {
  group: "basic",
  order: 0,
  style: "primary",
  title: { hu: "", en: "" },
  subtitle: { hu: "", en: "" },
  cornerBadge: { hu: "", en: "" },
  originalPrice: { hu: "", en: "" },
  price: { hu: "", en: "" },
  priceNote: { hu: "", en: "" },
  annualNote: { hu: "", en: "" },
  features: { hu: [], en: [] },
  packageId: "",
};

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

  const style: PricingStyleOption =
    raw.style === "border" ||
    raw.style === "primarySoft" ||
    raw.style === "premium" ||
    raw.style === "primaryShadow"
      ? (raw.style as PricingStyleOption)
      : "primary";

  return {
    id,
    group,
    order: safeNumber(raw.order) || 0,
    style,
    title: { hu: safeString(title?.hu), en: safeString(title?.en) },
    subtitle:
      subtitle && (subtitle.hu || subtitle.en)
        ? { hu: safeString(subtitle.hu), en: safeString(subtitle.en) }
        : undefined,
    cornerBadge:
      cornerBadge && (cornerBadge.hu || cornerBadge.en)
        ? { hu: safeString(cornerBadge.hu), en: safeString(cornerBadge.en) }
        : undefined,
    originalPrice:
      originalPrice && (originalPrice.hu || originalPrice.en)
        ? { hu: safeString(originalPrice.hu), en: safeString(originalPrice.en) }
        : undefined,
    price: { hu: safeString(price?.hu), en: safeString(price?.en) },
    priceNote: { hu: safeString(priceNote?.hu), en: safeString(priceNote?.en) },
    annualNote: { hu: safeString(annualNote?.hu), en: safeString(annualNote?.en) },
    features: {
      hu: safeStringArray(features?.hu),
      en: safeStringArray(features?.en),
    },
    packageId: safeString(raw.packageId) || undefined,
  };
};

const parseLines = (raw: string): string[] =>
  raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

const styleLabel: Record<PricingStyleOption, string> = {
  primary: "Primary",
  border: "Border",
  primarySoft: "Primary soft",
  premium: "Premium",
  primaryShadow: "Primary shadow",
};

export default function AdminPricingPage() {
  const [items, setItems] = React.useState<PricingCardDoc[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [groupFilter, setGroupFilter] = React.useState<"all" | PricingGroup>("all");
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  const [draft, setDraft] = React.useState<Draft>(emptyDraft);
  const [featuresHuText, setFeaturesHuText] = React.useState("");
  const [featuresEnText, setFeaturesEnText] = React.useState("");

  const [isSaving, setIsSaving] = React.useState(false);
  const [isImporting, setIsImporting] = React.useState(false);
  const [isReordering, setIsReordering] = React.useState(false);

  React.useEffect(() => {
    const q = query(collection(firestoreDb, "pricingCards"), orderBy("order", "asc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const next = snapshot.docs.map((d) =>
          normalizeCard(d.id, d.data() as Record<string, unknown>),
        );
        setItems(next);
        setIsLoading(false);
      },
      () => {
        setError("Nem sikerült betölteni az árkártyákat.");
        setIsLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  const filteredItems = React.useMemo(() => {
    if (groupFilter === "all") {
      return items;
    }

    return items.filter((i) => i.group === groupFilter);
  }, [groupFilter, items]);

  const selectedCard = React.useMemo(() => {
    if (!selectedId) {
      return null;
    }

    return items.find((i) => i.id === selectedId) ?? null;
  }, [items, selectedId]);

  React.useEffect(() => {
    if (filteredItems.length === 0) {
      if (selectedId) {
        setSelectedId(null);
      }
      return;
    }

    if (!selectedId) {
      setSelectedId(filteredItems[0]?.id ?? null);
      return;
    }

    const isSelectedVisible = filteredItems.some((card) => card.id === selectedId);
    if (!isSelectedVisible) {
      setSelectedId(filteredItems[0]?.id ?? null);
    }
  }, [filteredItems, selectedId]);

  React.useEffect(() => {
    if (!selectedCard) {
      return;
    }

    setDraft({
      group: selectedCard.group,
      order: selectedCard.order,
      style: selectedCard.style,
      title: {
        hu: selectedCard.title.hu,
        en: selectedCard.title.en,
      },
      subtitle: {
        hu: selectedCard.subtitle?.hu ?? "",
        en: selectedCard.subtitle?.en ?? "",
      },
      cornerBadge: {
        hu: selectedCard.cornerBadge?.hu ?? "",
        en: selectedCard.cornerBadge?.en ?? "",
      },
      originalPrice: {
        hu: selectedCard.originalPrice?.hu ?? "",
        en: selectedCard.originalPrice?.en ?? "",
      },
      price: {
        hu: selectedCard.price.hu,
        en: selectedCard.price.en,
      },
      priceNote: {
        hu: selectedCard.priceNote.hu,
        en: selectedCard.priceNote.en,
      },
      annualNote: {
        hu: selectedCard.annualNote.hu,
        en: selectedCard.annualNote.en,
      },
      features: {
        hu: selectedCard.features.hu,
        en: selectedCard.features.en,
      },
      packageId: selectedCard.packageId ?? "",
    });

    setFeaturesHuText((selectedCard.features.hu ?? []).join("\n"));
    setFeaturesEnText((selectedCard.features.en ?? []).join("\n"));
  }, [selectedCard]);

  const handleNew = React.useCallback(() => {
    const nextGroup: PricingGroup = groupFilter === "all" ? "basic" : groupFilter;
    const maxOrderInGroup = Math.max(
      -1,
      ...items.filter((card) => card.group === nextGroup).map((card) => card.order),
    );

    setSelectedId(null);
    setDraft({
      ...emptyDraft,
      group: nextGroup,
      order: maxOrderInGroup + 1,
    });
    setFeaturesHuText("");
    setFeaturesEnText("");
  }, [groupFilter, items]);

  const groupOrderMeta = React.useMemo(() => {
    const meta: Record<string, { index: number; total: number }> = {};

    const groups: PricingGroup[] = ["basic", "bundles", "officeBundles", "fullEntrepreneur"];
    groups.forEach((group) => {
      const sorted = items
        .filter((card) => card.group === group)
        .slice()
        .sort((a, b) => (a.order - b.order) || a.id.localeCompare(b.id));

      sorted.forEach((card, index) => {
        meta[card.id] = { index, total: sorted.length };
      });
    });

    return meta;
  }, [items]);

  const handleMove = React.useCallback(
    async (cardId: string, direction: -1 | 1) => {
      const card = items.find((entry) => entry.id === cardId);
      if (!card) {
        return;
      }

      const sorted = items
        .filter((entry) => entry.group === card.group)
        .slice()
        .sort((a, b) => (a.order - b.order) || a.id.localeCompare(b.id));

      const fromIndex = sorted.findIndex((entry) => entry.id === cardId);
      if (fromIndex === -1) {
        return;
      }

      const toIndex = fromIndex + direction;
      if (toIndex < 0 || toIndex >= sorted.length) {
        return;
      }

      const fromCard = sorted[fromIndex];
      const toCard = sorted[toIndex];

      setIsReordering(true);
      setError(null);

      try {
        await Promise.all([
          setDoc(
            doc(firestoreDb, "pricingCards", fromCard.id),
            { order: toCard.order, updatedAt: serverTimestamp() },
            { merge: true },
          ),
          setDoc(
            doc(firestoreDb, "pricingCards", toCard.id),
            { order: fromCard.order, updatedAt: serverTimestamp() },
            { merge: true },
          ),
        ]);
      } catch {
        setError("Sorrend módosítása sikertelen. Ellenőrizd a Firestore jogosultságokat (Rules). ");
      } finally {
        setIsReordering(false);
      }
    },
    [items],
  );

  const buildPayload = React.useCallback(() => {
    const payload: Record<string, unknown> = {
      group: draft.group,
      order: Number(draft.order) || 0,
      style: draft.style,
      title: {
        hu: draft.title.hu.trim(),
        en: draft.title.en.trim(),
      },
      price: {
        hu: draft.price.hu.trim(),
        en: draft.price.en.trim(),
      },
      priceNote: {
        hu: draft.priceNote.hu.trim(),
        en: draft.priceNote.en.trim(),
      },
      annualNote: {
        hu: draft.annualNote.hu.trim(),
        en: draft.annualNote.en.trim(),
      },
      features: {
        hu: parseLines(featuresHuText),
        en: parseLines(featuresEnText),
      },
      updatedAt: serverTimestamp(),
    };

    const subtitleHu = draft.subtitle.hu.trim();
    const subtitleEn = draft.subtitle.en.trim();
    if (subtitleHu || subtitleEn) {
      payload.subtitle = { hu: subtitleHu, en: subtitleEn };
    }

    const badgeHu = draft.cornerBadge.hu.trim();
    const badgeEn = draft.cornerBadge.en.trim();
    if (badgeHu || badgeEn) {
      payload.cornerBadge = { hu: badgeHu, en: badgeEn };
    }

    const originalHu = draft.originalPrice.hu.trim();
    const originalEn = draft.originalPrice.en.trim();
    if (originalHu || originalEn) {
      payload.originalPrice = { hu: originalHu, en: originalEn };
    }

    const packageId = draft.packageId.trim();
    if (packageId) {
      payload.packageId = packageId;
    }

    return payload;
  }, [draft, featuresEnText, featuresHuText]);

  const handleSave = React.useCallback(async () => {
    setIsSaving(true);
    setError(null);

    if (!draft.title.hu.trim() || !draft.title.en.trim()) {
      setError("A cím (HU és EN) kötelező.");
      setIsSaving(false);
      return;
    }

    if (!draft.price.hu.trim() || !draft.price.en.trim()) {
      setError("Az ár (HU és EN) kötelező.");
      setIsSaving(false);
      return;
    }

    const payload = buildPayload();

    try {
      if (selectedId) {
        await setDoc(doc(firestoreDb, "pricingCards", selectedId), payload, { merge: true });
      } else {
        const ref = doc(collection(firestoreDb, "pricingCards"));
        await setDoc(
          ref,
          {
            ...payload,
            createdAt: serverTimestamp(),
          },
          { merge: true },
        );
        setSelectedId(ref.id);
      }
    } catch {
      setError("Mentés sikertelen. Ellenőrizd a Firestore jogosultságokat (Rules). ");
    } finally {
      setIsSaving(false);
    }
  }, [buildPayload, draft.price.en, draft.price.hu, draft.title.en, draft.title.hu, selectedId]);

  const handleDelete = React.useCallback(async () => {
    if (!selectedId) {
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await deleteDoc(doc(firestoreDb, "pricingCards", selectedId));
      setSelectedId(null);
      setDraft(emptyDraft);
      setFeaturesHuText("");
      setFeaturesEnText("");
    } catch {
      setError("Törlés sikertelen. Ellenőrizd a Firestore jogosultságokat (Rules). ");
    } finally {
      setIsSaving(false);
    }
  }, [selectedId]);

  const handleImportDefaults = React.useCallback(async () => {
    setIsImporting(true);
    setError(null);

    try {
      await Promise.all(
        defaultPricingCards.map((card) =>
          setDoc(
            doc(firestoreDb, "pricingCards", card.id),
            {
              group: card.group,
              order: card.order,
              style: card.style,
              title: card.title,
              subtitle: card.subtitle ?? null,
              cornerBadge: card.cornerBadge ?? null,
              originalPrice: card.originalPrice ?? null,
              price: card.price,
              priceNote: card.priceNote,
              annualNote: card.annualNote,
              features: card.features,
              packageId: card.packageId ?? null,
              updatedAt: serverTimestamp(),
              createdAt: serverTimestamp(),
            },
            { merge: true },
          ),
        ),
      );
    } catch {
      setError(
        "Import sikertelen. Ellenőrizd a Firestore Rules-t (pricingCards kollekció írás) és próbáld újra.",
      );
    } finally {
      setIsImporting(false);
    }
  }, []);

  return (
    <AdminGate>
      <AdminShell basePath="/ops/portal-7d3k9a2f" title="Árak">
        <div className="flex flex-col gap-4 lg:flex-row">
          <Card className="w-full p-4 lg:w-[420px]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold">Árkártyák</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {isLoading ? "Betöltés..." : `${filteredItems.length} db`}
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <NativeSelect
                  value={groupFilter}
                  onChange={(e) => setGroupFilter(e.target.value as "all" | PricingGroup)}
                  className="h-9 w-[190px]"
                >
                  <option value="all">Összes szekció</option>
                  <option value="basic">{pricingGroupLabel.basic.hu}</option>
                  <option value="bundles">{pricingGroupLabel.bundles.hu}</option>
                  <option value="officeBundles">{pricingGroupLabel.officeBundles.hu}</option>
                  <option value="fullEntrepreneur">{pricingGroupLabel.fullEntrepreneur.hu}</option>
                </NativeSelect>
                <Button type="button" size="sm" onClick={handleNew}>
                  Új kártya
                </Button>
              </div>
            </div>

            <div className="mt-3 space-y-2">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleImportDefaults}
                disabled={isImporting}
              >
                {isImporting ? "Import..." : "Alap árkártyák importálása (HU+EN)"}
              </Button>
            </div>

            {error ? (
              <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-200">
                {error}
              </div>
            ) : null}

            <div className="mt-4 flex max-h-[65vh] flex-col gap-2 overflow-auto">
              {filteredItems.length === 0 && !isLoading ? (
                <div className="rounded-xl border border-border bg-background p-4 text-sm text-muted-foreground">
                  Nincs még kártya ebben a szekcióban.
                </div>
              ) : null}

              {filteredItems.map((card) => {
                const isSelected = card.id === selectedId;
                const title = card.title.hu || card.title.en || "(Név nélkül)";
                const meta = groupOrderMeta[card.id];

                return (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => setSelectedId(card.id)}
                    className={`w-full rounded-xl border px-3 py-3 text-left transition-colors ${
                      isSelected
                        ? "border-primary/40 bg-primary/10"
                        : "border-border bg-background hover:bg-muted"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-foreground">
                          {title}
                        </div>
                        <div className="mt-0.5 truncate text-xs text-muted-foreground">
                          {pricingGroupLabel[card.group].hu} • {card.price.hu || card.price.en}
                        </div>
                      </div>
                      <div className="flex flex-shrink-0 items-center gap-2">
                        {meta ? (
                          <div className="flex flex-col gap-1">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                void handleMove(card.id, -1);
                              }}
                              disabled={isReordering || meta.index === 0}
                              className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                              aria-label="Move up"
                            >
                              <ChevronUp className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                void handleMove(card.id, 1);
                              }}
                              disabled={isReordering || meta.index >= meta.total - 1}
                              className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                              aria-label="Move down"
                            >
                              <ChevronDown className="h-4 w-4" />
                            </button>
                          </div>
                        ) : null}
                        <div className="rounded-full bg-muted px-2 py-1 text-[11px] font-medium text-muted-foreground">
                          {card.style}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>

          <Card className="min-w-0 flex-1 p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="text-lg font-semibold">
                  {selectedId ? "Árkártya szerkesztése" : "Új árkártya"}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Firestore kollekció: <span className="font-mono">pricingCards</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {selectedId ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleDelete}
                    disabled={isSaving}
                  >
                    Törlés
                  </Button>
                ) : null}
                <Button type="button" onClick={handleSave} disabled={isSaving}>
                  {isSaving ? "Mentés..." : "Mentés"}
                </Button>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="group">Szekció</Label>
                <NativeSelect
                  id="group"
                  value={draft.group}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      group: e.target.value as PricingGroup,
                    }))
                  }
                >
                  <option value="basic">{pricingGroupLabel.basic.hu}</option>
                  <option value="bundles">{pricingGroupLabel.bundles.hu}</option>
                  <option value="officeBundles">{pricingGroupLabel.officeBundles.hu}</option>
                  <option value="fullEntrepreneur">{pricingGroupLabel.fullEntrepreneur.hu}</option>
                </NativeSelect>
              </div>

              <div className="space-y-2">
                <Label htmlFor="style">Stílus</Label>
                <NativeSelect
                  id="style"
                  value={draft.style}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      style: e.target.value as PricingStyleOption,
                    }))
                  }
                >
                  {(
                    [
                      "primary",
                      "border",
                      "primarySoft",
                      "premium",
                      "primaryShadow",
                    ] as PricingStyleOption[]
                  ).map((key) => (
                    <option key={key} value={key}>
                      {styleLabel[key]}
                    </option>
                  ))}
                </NativeSelect>
              </div>

              <div className="space-y-2">
                <Label htmlFor="order">Sorrend</Label>
                <Input
                  id="order"
                  type="number"
                  value={String(draft.order)}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      order: Number(e.target.value),
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="packageId">Quote packageId</Label>
                <Input
                  id="packageId"
                  value={draft.packageId}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      packageId: e.target.value,
                    }))
                  }
                  placeholder="pl. szekhely-hu"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="titleHu">Cím (HU)</Label>
                <Input
                  id="titleHu"
                  value={draft.title.hu}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      title: { ...prev.title, hu: e.target.value },
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="titleEn">Title (EN)</Label>
                <Input
                  id="titleEn"
                  value={draft.title.en}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      title: { ...prev.title, en: e.target.value },
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subtitleHu">Alcím (HU)</Label>
                <Input
                  id="subtitleHu"
                  value={draft.subtitle.hu}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      subtitle: { ...prev.subtitle, hu: e.target.value },
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subtitleEn">Subtitle (EN)</Label>
                <Input
                  id="subtitleEn"
                  value={draft.subtitle.en}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      subtitle: { ...prev.subtitle, en: e.target.value },
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="badgeHu">Badge (HU)</Label>
                <Input
                  id="badgeHu"
                  value={draft.cornerBadge.hu}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      cornerBadge: { ...prev.cornerBadge, hu: e.target.value },
                    }))
                  }
                  placeholder="pl. -15% vagy PRÉMIUM"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="badgeEn">Badge (EN)</Label>
                <Input
                  id="badgeEn"
                  value={draft.cornerBadge.en}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      cornerBadge: { ...prev.cornerBadge, en: e.target.value },
                    }))
                  }
                  placeholder="e.g. -15% or PREMIUM"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="originalHu">Eredeti ár (HU) (opcionális)</Label>
                <Input
                  id="originalHu"
                  value={draft.originalPrice.hu}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      originalPrice: { ...prev.originalPrice, hu: e.target.value },
                    }))
                  }
                  placeholder="pl. 13 000 Ft"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="originalEn">Original price (EN) (optional)</Label>
                <Input
                  id="originalEn"
                  value={draft.originalPrice.en}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      originalPrice: { ...prev.originalPrice, en: e.target.value },
                    }))
                  }
                  placeholder="e.g. 13 000 HUF"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priceHu">Ár (HU)</Label>
                <Input
                  id="priceHu"
                  value={draft.price.hu}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      price: { ...prev.price, hu: e.target.value },
                    }))
                  }
                  placeholder="pl. 8 000 Ft"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priceEn">Price (EN)</Label>
                <Input
                  id="priceEn"
                  value={draft.price.en}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      price: { ...prev.price, en: e.target.value },
                    }))
                  }
                  placeholder="e.g. 8 000 HUF"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priceNoteHu">Ár megjegyzés (HU)</Label>
                <Input
                  id="priceNoteHu"
                  value={draft.priceNote.hu}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      priceNote: { ...prev.priceNote, hu: e.target.value },
                    }))
                  }
                  placeholder="pl. + ÁFA / hó"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priceNoteEn">Price note (EN)</Label>
                <Input
                  id="priceNoteEn"
                  value={draft.priceNote.en}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      priceNote: { ...prev.priceNote, en: e.target.value },
                    }))
                  }
                  placeholder="e.g. + VAT / month"
                />
              </div>

              <div className="space-y-2 lg:col-span-2">
                <Label htmlFor="annualHu">Éves / megjegyzés doboz (HU)</Label>
                <Input
                  id="annualHu"
                  value={draft.annualNote.hu}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      annualNote: { ...prev.annualNote, hu: e.target.value },
                    }))
                  }
                />
              </div>

              <div className="space-y-2 lg:col-span-2">
                <Label htmlFor="annualEn">Annual note (EN)</Label>
                <Input
                  id="annualEn"
                  value={draft.annualNote.en}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      annualNote: { ...prev.annualNote, en: e.target.value },
                    }))
                  }
                />
              </div>

              <div className="space-y-2 lg:col-span-2">
                <Label htmlFor="featuresHu">Pontok (HU) (soronként 1)</Label>
                <Textarea
                  id="featuresHu"
                  rows={7}
                  value={featuresHuText}
                  onChange={(e) => setFeaturesHuText(e.target.value)}
                />
              </div>

              <div className="space-y-2 lg:col-span-2">
                <Label htmlFor="featuresEn">Features (EN) (one per line)</Label>
                <Textarea
                  id="featuresEn"
                  rows={7}
                  value={featuresEnText}
                  onChange={(e) => setFeaturesEnText(e.target.value)}
                />
              </div>
            </div>
          </Card>
        </div>
      </AdminShell>
    </AdminGate>
  );
}
