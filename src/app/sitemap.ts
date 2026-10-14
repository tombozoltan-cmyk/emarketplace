import type { MetadataRoute } from "next";

import { blogPosts } from "@/lib/blog-data";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://e-marketplace.hu";

  const staticPages: MetadataRoute.Sitemap = [
    "",
    "/szekhelyszolgaltatas",
    "/arak",
    "/blog",
    "/kapcsolat",
  ].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.8,
  }));

  // A jogi dokumentumok ritkán változnak, és a verziót a dokumentum fejléce hordozza.
  const legalPages: MetadataRoute.Sitemap = [
    "/aszf",
    "/adatvedelem",
    "/en/terms",
    "/en/privacy",
  ].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date("2026-01-01"),
    changeFrequency: "yearly",
    priority: 0.3,
  }));

  const blogPages: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticPages, ...legalPages, ...blogPages];
}
