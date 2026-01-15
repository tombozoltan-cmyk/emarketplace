"use client";

import React from "react";
import { doc, onSnapshot, setDoc, type DocumentData } from "firebase/firestore";
import { AdminLayout } from "@/components/admin";
import { Button } from "../../../../components/ui/button";
import { Card } from "../../../../components/ui/card";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { Textarea } from "../../../../components/ui/textarea";
import { firestoreDb } from "../../../../lib/firebase";

type MarketingSettings = {
  enabled: {
    ga4: boolean;
    gtm: boolean;
    googleAds: boolean;
    metaPixel: boolean;
    linkedIn: boolean;
    tiktok: boolean;
    hotjar: boolean;
    clarity: boolean;
    customHeadHtml: boolean;
  };
  ga4MeasurementId: string;
  gtmContainerId: string;
  googleAdsId: string;
  googleAdsConversionLabel: string;
  metaPixelId: string;
  linkedInPartnerId: string;
  tiktokPixelId: string;
  hotjarSiteId: string;
  clarityProjectId: string;
  customHeadHtml: string;
};

const emptyState: MarketingSettings = {
  enabled: {
    ga4: false,
    gtm: false,
    googleAds: false,
    metaPixel: false,
    linkedIn: false,
    tiktok: false,
    hotjar: false,
    clarity: false,
    customHeadHtml: false,
  },
  ga4MeasurementId: "",
  gtmContainerId: "",
  googleAdsId: "",
  googleAdsConversionLabel: "",
  metaPixelId: "",
  linkedInPartnerId: "",
  tiktokPixelId: "",
  hotjarSiteId: "",
  clarityProjectId: "",
  customHeadHtml: "",
};

const safeString = (v: unknown): string => (typeof v === "string" ? v.trim() : "");

const safeBool = (v: unknown): boolean => Boolean(v);

const normalizeSettings = (raw: DocumentData | undefined): MarketingSettings => {
  if (!raw) {
    return emptyState;
  }

  const enabledRaw = (raw.enabled ?? {}) as Record<string, unknown>;

  return {
    enabled: {
      ga4: safeBool(enabledRaw.ga4),
      gtm: safeBool(enabledRaw.gtm),
      googleAds: safeBool(enabledRaw.googleAds),
      metaPixel: safeBool(enabledRaw.metaPixel),
      linkedIn: safeBool(enabledRaw.linkedIn),
      tiktok: safeBool(enabledRaw.tiktok),
      hotjar: safeBool(enabledRaw.hotjar),
      clarity: safeBool(enabledRaw.clarity),
      customHeadHtml: safeBool(enabledRaw.customHeadHtml),
    },
    ga4MeasurementId: safeString(raw.ga4MeasurementId),
    gtmContainerId: safeString(raw.gtmContainerId),
    googleAdsId: safeString(raw.googleAdsId),
    googleAdsConversionLabel: safeString(raw.googleAdsConversionLabel),
    metaPixelId: safeString(raw.metaPixelId),
    linkedInPartnerId: safeString(raw.linkedInPartnerId),
    tiktokPixelId: safeString(raw.tiktokPixelId),
    hotjarSiteId: safeString(raw.hotjarSiteId),
    clarityProjectId: safeString(raw.clarityProjectId),
    customHeadHtml: safeString(raw.customHeadHtml),
  };
};

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: Readonly<{
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}>) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-border bg-background p-4">
      <div>
        <div className="text-sm font-semibold text-foreground">{label}</div>
        <div className="mt-1 text-xs text-muted-foreground">{description}</div>
      </div>
      <label className="flex cursor-pointer items-center gap-2">
        <span className="text-xs text-muted-foreground">{checked ? "ON" : "OFF"}</span>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="h-4 w-4"
        />
      </label>
    </div>
  );
}

export default function AdminMarketingPage() {
  const [state, setState] = React.useState<MarketingSettings>(emptyState);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [savedAt, setSavedAt] = React.useState<number | null>(null);

  React.useEffect(() => {
    const ref = doc(firestoreDb, "marketingSettings", "global");
    const unsub = onSnapshot(
      ref,
      (snap) => {
        setState(normalizeSettings(snap.data()));
        setIsLoading(false);
      },
      () => {
        setError("Nem sikerült betölteni a marketing beállításokat.");
        setIsLoading(false);
      },
    );

    return () => unsub();
  }, []);

  const handleSave = React.useCallback(async () => {
    setIsSaving(true);
    setError(null);
    try {
      await setDoc(doc(firestoreDb, "marketingSettings", "global"), state, {
        merge: true,
      });
      setSavedAt(Date.now());
    } catch {
      setError("Mentés sikertelen. Ellenőrizd a jogosultságokat (Firestore Rules). ");
    } finally {
      setIsSaving(false);
    }
  }, [state]);

  return (
    <AdminLayout title="Marketing beállítások" description="Tracking és hirdetési azonosítók kezelése">
        <div className="flex flex-col gap-4">
          <Card className="p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="text-lg font-semibold">Tracking / azonosítók</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Itt tudod bekötni a marketing eszközöket azonosítók alapján. Az admin felületen nem futnak a trackerek.
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  {isLoading ? "Betöltés..." : "Betöltve"}
                  {savedAt ? ` • Mentve: ${new Date(savedAt).toLocaleString("hu-HU")}` : ""}
                </div>
              </div>

              <Button type="button" onClick={handleSave} disabled={isSaving || isLoading}>
                {isSaving ? "Mentés..." : "Mentés"}
              </Button>
            </div>

            {error ? (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-200">
                {error}
              </div>
            ) : null}
          </Card>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card className="p-5">
              <div className="text-sm font-semibold">Google</div>
              <div className="mt-1 text-xs text-muted-foreground">
                GA4 / GTM / Google Ads.
              </div>

              <div className="mt-4 space-y-3">
                <ToggleRow
                  label="GA4 (Google Analytics)"
                  description="Measurement ID pl. G-XXXXXXXXXX"
                  checked={state.enabled.ga4}
                  onChange={(checked) =>
                    setState((prev) => ({
                      ...prev,
                      enabled: { ...prev.enabled, ga4: checked },
                    }))
                  }
                />
                <div className="space-y-2">
                  <Label htmlFor="ga4MeasurementId">GA4 Measurement ID</Label>
                  <Input
                    id="ga4MeasurementId"
                    value={state.ga4MeasurementId}
                    onChange={(e) =>
                      setState((prev) => ({
                        ...prev,
                        ga4MeasurementId: e.target.value,
                      }))
                    }
                    placeholder="G-XXXXXXXXXX"
                  />
                </div>

                <ToggleRow
                  label="GTM (Google Tag Manager)"
                  description="Container ID pl. GTM-XXXXXXX"
                  checked={state.enabled.gtm}
                  onChange={(checked) =>
                    setState((prev) => ({
                      ...prev,
                      enabled: { ...prev.enabled, gtm: checked },
                    }))
                  }
                />
                <div className="space-y-2">
                  <Label htmlFor="gtmContainerId">GTM Container ID</Label>
                  <Input
                    id="gtmContainerId"
                    value={state.gtmContainerId}
                    onChange={(e) =>
                      setState((prev) => ({
                        ...prev,
                        gtmContainerId: e.target.value,
                      }))
                    }
                    placeholder="GTM-XXXXXXX"
                  />
                </div>

                <ToggleRow
                  label="Google Ads"
                  description="Ads ID pl. AW-XXXXXXXXXX (konverzió label opcionális)"
                  checked={state.enabled.googleAds}
                  onChange={(checked) =>
                    setState((prev) => ({
                      ...prev,
                      enabled: { ...prev.enabled, googleAds: checked },
                    }))
                  }
                />
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="googleAdsId">Google Ads ID</Label>
                    <Input
                      id="googleAdsId"
                      value={state.googleAdsId}
                      onChange={(e) =>
                        setState((prev) => ({
                          ...prev,
                          googleAdsId: e.target.value,
                        }))
                      }
                      placeholder="AW-XXXXXXXXXX"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="googleAdsConversionLabel">Conversion Label</Label>
                    <Input
                      id="googleAdsConversionLabel"
                      value={state.googleAdsConversionLabel}
                      onChange={(e) =>
                        setState((prev) => ({
                          ...prev,
                          googleAdsConversionLabel: e.target.value,
                        }))
                      }
                      placeholder="abcdefgHIJKlmnop"
                    />
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-5">
              <div className="text-sm font-semibold">Social / Heatmap / Session replay</div>
              <div className="mt-1 text-xs text-muted-foreground">
                Meta, LinkedIn, TikTok, Hotjar, Clarity.
              </div>

              <div className="mt-4 space-y-3">
                <ToggleRow
                  label="Meta Pixel (Facebook)"
                  description="Pixel ID"
                  checked={state.enabled.metaPixel}
                  onChange={(checked) =>
                    setState((prev) => ({
                      ...prev,
                      enabled: { ...prev.enabled, metaPixel: checked },
                    }))
                  }
                />
                <div className="space-y-2">
                  <Label htmlFor="metaPixelId">Meta Pixel ID</Label>
                  <Input
                    id="metaPixelId"
                    value={state.metaPixelId}
                    onChange={(e) =>
                      setState((prev) => ({
                        ...prev,
                        metaPixelId: e.target.value,
                      }))
                    }
                    placeholder="1234567890"
                  />
                </div>

                <ToggleRow
                  label="LinkedIn Insight Tag"
                  description="Partner ID"
                  checked={state.enabled.linkedIn}
                  onChange={(checked) =>
                    setState((prev) => ({
                      ...prev,
                      enabled: { ...prev.enabled, linkedIn: checked },
                    }))
                  }
                />
                <div className="space-y-2">
                  <Label htmlFor="linkedInPartnerId">LinkedIn Partner ID</Label>
                  <Input
                    id="linkedInPartnerId"
                    value={state.linkedInPartnerId}
                    onChange={(e) =>
                      setState((prev) => ({
                        ...prev,
                        linkedInPartnerId: e.target.value,
                      }))
                    }
                    placeholder="123456"
                  />
                </div>

                <ToggleRow
                  label="TikTok Pixel"
                  description="Pixel ID"
                  checked={state.enabled.tiktok}
                  onChange={(checked) =>
                    setState((prev) => ({
                      ...prev,
                      enabled: { ...prev.enabled, tiktok: checked },
                    }))
                  }
                />
                <div className="space-y-2">
                  <Label htmlFor="tiktokPixelId">TikTok Pixel ID</Label>
                  <Input
                    id="tiktokPixelId"
                    value={state.tiktokPixelId}
                    onChange={(e) =>
                      setState((prev) => ({
                        ...prev,
                        tiktokPixelId: e.target.value,
                      }))
                    }
                    placeholder="C123ABC456DEF"
                  />
                </div>

                <ToggleRow
                  label="Hotjar"
                  description="Site ID (szám)"
                  checked={state.enabled.hotjar}
                  onChange={(checked) =>
                    setState((prev) => ({
                      ...prev,
                      enabled: { ...prev.enabled, hotjar: checked },
                    }))
                  }
                />
                <div className="space-y-2">
                  <Label htmlFor="hotjarSiteId">Hotjar Site ID</Label>
                  <Input
                    id="hotjarSiteId"
                    value={state.hotjarSiteId}
                    onChange={(e) =>
                      setState((prev) => ({
                        ...prev,
                        hotjarSiteId: e.target.value,
                      }))
                    }
                    placeholder="1234567"
                  />
                </div>

                <ToggleRow
                  label="Microsoft Clarity"
                  description="Project ID"
                  checked={state.enabled.clarity}
                  onChange={(checked) =>
                    setState((prev) => ({
                      ...prev,
                      enabled: { ...prev.enabled, clarity: checked },
                    }))
                  }
                />
                <div className="space-y-2">
                  <Label htmlFor="clarityProjectId">Clarity Project ID</Label>
                  <Input
                    id="clarityProjectId"
                    value={state.clarityProjectId}
                    onChange={(e) =>
                      setState((prev) => ({
                        ...prev,
                        clarityProjectId: e.target.value,
                      }))
                    }
                    placeholder="abcd1234ef"
                  />
                </div>
              </div>
            </Card>
          </div>

          <Card className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm font-semibold">Egyedi head script (haladó)</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Opcionális. Ha ide bármit beírsz, az bekerül a head-be afterInteractive stratégiával.
                </div>
              </div>
              <label className="flex cursor-pointer items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {state.enabled.customHeadHtml ? "ON" : "OFF"}
                </span>
                <input
                  type="checkbox"
                  checked={state.enabled.customHeadHtml}
                  onChange={(e) =>
                    setState((prev) => ({
                      ...prev,
                      enabled: { ...prev.enabled, customHeadHtml: e.target.checked },
                    }))
                  }
                  className="h-4 w-4"
                />
              </label>
            </div>

            <div className="mt-4 space-y-2">
              <Label htmlFor="customHeadHtml">HTML / script</Label>
              <Textarea
                id="customHeadHtml"
                rows={8}
                value={state.customHeadHtml}
                onChange={(e) =>
                  setState((prev) => ({
                    ...prev,
                    customHeadHtml: e.target.value,
                  }))
                }
                placeholder="<script>/* ... */</script>"
              />
            </div>
          </Card>
        </div>
    </AdminLayout>
  );
}
