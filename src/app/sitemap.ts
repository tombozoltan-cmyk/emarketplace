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
    "/adatvedelem",
  ].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.8,
  }));

  const blogPages: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticPages, ...blogPages];
}
