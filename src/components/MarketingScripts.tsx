"use client";

import React from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { doc, onSnapshot, type DocumentData } from "firebase/firestore";
import { firestoreDb } from "@/lib/firebase";

type MarketingSettings = {
  ga4MeasurementId?: string;
  gtmContainerId?: string;
  googleAdsId?: string;
  googleAdsConversionLabel?: string;
  metaPixelId?: string;
  linkedInPartnerId?: string;
  tiktokPixelId?: string;
  hotjarSiteId?: string;
  clarityProjectId?: string;
  customHeadHtml?: string;
  enabled?: {
    ga4?: boolean;
    gtm?: boolean;
    googleAds?: boolean;
    metaPixel?: boolean;
    linkedIn?: boolean;
    tiktok?: boolean;
    hotjar?: boolean;
    clarity?: boolean;
    customHeadHtml?: boolean;
  };
};

const emptySettings: MarketingSettings = {
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
};

const safeString = (v: unknown): string => (typeof v === "string" ? v.trim() : "");

const safeBool = (v: unknown): boolean => Boolean(v);

const normalizeSettings = (raw: DocumentData | undefined): MarketingSettings => {
  if (!raw) {
    return emptySettings;
  }

  const enabledRaw = (raw.enabled ?? {}) as Record<string, unknown>;

  return {
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
  };
};

export function MarketingScripts() {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/ops/");

  const [settings, setSettings] = React.useState<MarketingSettings>(emptySettings);

  React.useEffect(() => {
    const ref = doc(firestoreDb, "marketingSettings", "global");

    const unsub = onSnapshot(ref, (snap) => {
      setSettings(normalizeSettings(snap.data()));
    });

    return () => unsub();
  }, []);

  if (isAdminRoute) {
    return null;
  }

  const enabled = settings.enabled ?? {};

  const ga4Id = settings.ga4MeasurementId ?? "";
  const gtmId = settings.gtmContainerId ?? "";
  const googleAdsId = settings.googleAdsId ?? "";
  const googleAdsLabel = settings.googleAdsConversionLabel ?? "";
  const pixelId = settings.metaPixelId ?? "";
  const linkedInId = settings.linkedInPartnerId ?? "";
  const tiktokId = settings.tiktokPixelId ?? "";
  const hotjarId = settings.hotjarSiteId ?? "";
  const clarityId = settings.clarityProjectId ?? "";
  const customHeadHtml = settings.customHeadHtml ?? "";

  return (
    <>
      {enabled.gtm && gtmId ? (
        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`}
        </Script>
      ) : null}

      {enabled.ga4 && ga4Id ? (
        <>
          <Script
            id="ga4-src"
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`}
          />
          <Script id="ga4" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ga4Id}');`}
          </Script>
        </>
      ) : null}

      {enabled.googleAds && googleAdsId ? (
        <>
          <Script
            id="google-ads-src"
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${googleAdsId}`}
          />
          <Script id="google-ads" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${googleAdsId}');`}
          </Script>
          {googleAdsLabel ? (
            <Script id="google-ads-conversion" strategy="afterInteractive">
              {`window.gtag && gtag('event','conversion',{'send_to':'${googleAdsId}/${googleAdsLabel}'});`}
            </Script>
          ) : null}
        </>
      ) : null}

      {enabled.metaPixel && pixelId ? (
        <>
          <Script id="meta-pixel" strategy="afterInteractive">
            {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod? n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window, document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pixelId}');fbq('track','PageView');`}
          </Script>
          <noscript>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
              alt=""
            />
          </noscript>
        </>
      ) : null}

      {enabled.linkedIn && linkedInId ? (
        <>
          <Script id="linkedin-insight" strategy="afterInteractive">
            {`_linkedin_partner_id = "${linkedInId}";window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];window._linkedin_data_partner_ids.push(_linkedin_partner_id);`}
          </Script>
          <Script
            id="linkedin-insight-src"
            strategy="afterInteractive"
            src="https://snap.licdn.com/li.lms-analytics/insight.min.js"
          />
        </>
      ) : null}

      {enabled.tiktok && tiktokId ? (
        <Script id="tiktok-pixel" strategy="afterInteractive">
          {`!function (w, d, t) {w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i=ttq._i||{},n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e[t]=e[t]||[],ttq.methods[n]);return e[t]};ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=i;ttq._t=ttq._t||{};ttq._t[e]=+new Date;ttq._o=ttq._o||{};ttq._o[e]=n||{};var o=d.createElement("script");o.type="text/javascript";o.async=!0;o.src=i+"?sdkid="+e+"&lib="+t;var a=d.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};ttq.load('${tiktokId}');ttq.page();}(window, document, 'ttq');`}
        </Script>
      ) : null}

      {enabled.hotjar && hotjarId ? (
        <Script id="hotjar" strategy="afterInteractive">
          {`(function(h,o,t,j,a,r){h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};h._hjSettings={hjid:${Number(hotjarId)},hjsv:6};a=o.getElementsByTagName('head')[0];r=o.createElement('script');r.async=1;r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;a.appendChild(r);})(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');`}
        </Script>
      ) : null}

      {enabled.clarity && clarityId ? (
        <Script id="clarity" strategy="afterInteractive">
          {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window, document, "clarity", "script", "${clarityId}");`}
        </Script>
      ) : null}

      {enabled.customHeadHtml && customHeadHtml ? (
        <Script
          id="custom-head-html"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: customHeadHtml }}
        />
      ) : null}
    </>
  );
}
