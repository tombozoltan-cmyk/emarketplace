import type { MetadataRoute } from "next";

import { blogPosts } from "@/lib/blog-data";
import { blogPostsEn } from "@/lib/blog-data-en";

export const dynamic = "force-static";

/**
 * Minden nyilvános oldal, magyarul és angolul. Az admin (/ops/nova) és a
 * fejlesztői oldalak (/test-pdf) szándékosan kimaradnak.
 *
 * A magyar és az angol megfelelők párban állnak, hogy egy új oldal felvételekor
 * látsszon, ha a másik nyelv lemaradt.
 */
const PUBLIC_PAGES: { path: string; priority: number }[] = [
  { path: "", priority: 1 },
  { path: "/en", priority: 1 },
  // A szerződéskötő a konverziós oldal, ezért a főoldal után ez a legfontosabb.
  { path: "/szerzodes", priority: 0.9 },
  { path: "/en/contract", priority: 0.9 },
  { path: "/szekhelyszolgaltatas", priority: 0.8 },
  { path: "/en/registered-office-hungary", priority: 0.8 },
  { path: "/arak", priority: 0.8 },
  { path: "/en/pricing", priority: 0.8 },
  { path: "/kapcsolat", priority: 0.8 },
  { path: "/en/contact", priority: 0.8 },
  { path: "/blog", priority: 0.8 },
  { path: "/en/blog", priority: 0.8 },
];

const LEGAL_PAGES = ["/aszf", "/adatvedelem", "/en/terms", "/en/privacy"];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://e-marketplace.hu";
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = PUBLIC_PAGES.map(({ path, priority }) => ({
    url: `${baseUrl}${path}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority,
  }));

  // A jogi dokumentumok ritkán változnak, és a verziót a dokumentum fejléce hordozza.
  const legalPages: MetadataRoute.Sitemap = LEGAL_PAGES.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date("2026-01-01"),
    changeFrequency: "yearly",
    priority: 0.3,
  }));

  const blogPages: MetadataRoute.Sitemap = [
    ...blogPosts.map((post) => `/blog/${post.slug}`),
    ...blogPostsEn.map((post) => `/en/blog/${post.slug}`),
  ].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticPages, ...legalPages, ...blogPages];
}
