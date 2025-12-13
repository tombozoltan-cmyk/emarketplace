import type { Metadata } from "next";
import Link from "next/link";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { blogPostsEn, type BlogPostEn } from "@/lib/blog-data-en";

export const metadata: Metadata = {
  title: "Blog & Knowledge Base | E-Marketplace",
  description:
    "Articles and practical guides about registered office services in Budapest, company formation, service address requirements and compliance updates.",
  alternates: {
    canonical: "https://e-marketplace.hu/en/blog",
    languages: {
      hu: "https://e-marketplace.hu/blog",
      en: "https://e-marketplace.hu/en/blog",
    },
  },
};

export default function BlogPageEn() {
  return (
    <main className="flex min-h-screen w-full flex-col bg-[color:var(--background)] text-[color:var(--foreground)]">
      <Header />

      <section className="relative overflow-hidden bg-[color:var(--secondary)] py-12 md:py-20 lg:py-32">
        <div className="pointer-events-none absolute right-10 top-10 h-32 w-32 rounded-full bg-[color:var(--primary)]/10 blur-2xl" />
        <div className="pointer-events-none absolute bottom-20 left-20 h-40 w-40 rounded-full bg-[color:var(--primary)]/5 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="mb-3 flex items-center gap-2 text-[color:var(--primary)] md:mb-4">
            <div className="h-px w-8 bg-[color:var(--primary)] md:w-12" />
            <span className="text-xs font-medium uppercase tracking-wider md:text-sm">Blog</span>
          </div>
          <h1 className="mb-4 text-balance text-3xl font-bold text-white md:mb-6 md:text-4xl lg:text-6xl">
            Blog
          </h1>
          <p className="text-pretty text-base text-white/80 md:text-lg">
            Useful information and expert tips for entrepreneurs.
          </p>
        </div>
      </section>

      <section className="bg-[color:var(--secondary)]/5 py-12 md:py-16 lg:py-20">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 sm:px-6 md:grid-cols-2 md:gap-8 lg:grid-cols-3 lg:px-8">
          {blogPostsEn.map((post: BlogPostEn) => (
            <Card
              key={post.slug}
              className="group flex h-full flex-col overflow-hidden border-2 border-[color:var(--border)] bg-[color:var(--card)] shadow-sm transition-all duration-300 hover:border-[color:var(--primary)] hover:shadow-2xl"
            >
              <div className="relative h-48 overflow-hidden bg-[color:var(--secondary)]/10 md:h-56 lg:h-64">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={post.image || "/placeholder.svg"}
                  alt={post.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                {post.category && (
                  <div className="absolute left-3 top-3 rounded-sm bg-[color:var(--secondary)] px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-[color:var(--background)] md:left-4 md:top-4 md:px-4 md:py-2">
                    {post.category}
                  </div>
                )}
              </div>
              <CardContent className="flex flex-1 flex-col p-4 md:p-6">
                <Link href={`/en/blog/${post.slug}`} className="mb-2 md:mb-3">
                  <h3 className="text-lg font-bold text-[color:var(--secondary)] text-balance transition-colors group-hover:text-[color:var(--primary)] md:text-xl">
                    {post.title}
                  </h3>
                </Link>
                <p className="mb-4 text-sm text-[color:var(--muted-foreground)] text-pretty line-clamp-3 md:mb-6 md:text-base">
                  {post.excerpt}
                </p>
                <div className="mt-auto border-t border-[color:var(--border)] pt-3 md:pt-4">
                  <div className="mb-3 flex items-center justify-between text-xs text-[color:var(--muted-foreground)] md:text-sm">
                    <span>{post.date}</span>
                    <span>{post.readingTime} min read</span>
                  </div>
                  <Button className="w-full rounded-full bg-[color:var(--secondary)] text-[color:var(--background)] transition-colors hover:bg-[color:var(--primary)] md:text-base">
                    <Link href={`/en/blog/${post.slug}`}>Read more</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
