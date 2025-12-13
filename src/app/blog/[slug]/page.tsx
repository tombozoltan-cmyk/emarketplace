import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock, ChevronLeft, Share2 } from "lucide-react";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { blogPosts } from "@/lib/blog-data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    return {
      title: "Blog cikk nem található | E-Marketplace Kft.",
    };
  }

  const description = post.excerpt || post.content.replace(/<[^>]+>/g, "").slice(0, 160);

  return {
    title: `${post.title} | E-Marketplace Blog`,
    description,
    alternates: {
      canonical: `https://e-marketplace.hu/blog/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description,
      type: "article",
      url: `https://e-marketplace.hu/blog/${post.slug}`,
      publishedTime: post.date,
      authors: ["E-Marketplace Kft."],
      images: post.image ? [{ url: post.image, alt: post.title }] : [],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    post = blogPosts[0];
  }

  const plainText = post.content.replace(/<[^>]+>/g, "");
  const hasContent = plainText.trim().length > 0;

  // egyszerű related: az első 3 másik cikk
  const related = blogPosts.filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <main className="flex min-h-screen w-full flex-col bg-[color:var(--background)] text-[color:var(--foreground)]">
      <Header />

      {/* Breadcrumb */}
      <nav className="border-b border-[color:var(--border)] bg-[color:var(--muted)]/30">
        <div className="mx-auto flex max-w-5xl items-center gap-2 px-4 py-4 text-sm text-[color:var(--muted-foreground)] sm:px-6 lg:px-8">
          <Link href="/" className="hover:text-[color:var(--foreground)]">
            Főoldal
          </Link>
          <span>›</span>
          <Link href="/blog" className="hover:text-[color:var(--foreground)]">
            Blog
          </Link>
          <span>›</span>
          <span className="text-[color:var(--foreground)] line-clamp-1">{post.title}</span>
        </div>
      </nav>

      <section className="py-8 md:py-12">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 px-4 sm:px-6 lg:grid-cols-12 lg:gap-12 lg:px-8">
          {/* Fő tartalom */}
          <article className="lg:col-span-8">
            <Link
              href="/blog"
              className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-[color:var(--primary)] hover:text-[color:var(--primary)]/80"
            >
              <span className="h-2 w-2 rounded-full bg-[color:var(--primary)]" />
              Blog
            </Link>

            <h1 className="mb-4 text-3xl font-bold leading-tight text-[color:var(--foreground)] md:text-4xl lg:text-5xl">
              {post.title}
            </h1>

            <p className="mb-6 text-lg text-[color:var(--muted-foreground)]">{post.excerpt}</p>

            <div className="mb-8 flex items-center gap-4 border-b border-[color:var(--border)] pb-6 text-sm text-[color:var(--muted-foreground)]">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{post.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{post.readingTime} perc olvasás</span>
              </div>
              <div className="ml-auto">
                <Button
                  type="button"
                  size="sm"
                  className="inline-flex items-center gap-2 text-xs md:text-sm"
                >
                  <Share2 className="h-4 w-4" />
                  Megosztás
                </Button>
              </div>
            </div>

            <div className="mb-8 h-[260px] overflow-hidden rounded-xl md:h-[360px] lg:h-[440px]">
              <Image
                src={post.image || "/placeholder.svg"}
                alt={post.title}
                width={1200}
                height={600}
                className="h-full w-full object-cover"
                priority
              />
            </div>

            <div
              className="prose prose-base lg:prose-lg max-w-none text-[color:var(--foreground)] prose-headings:mt-8 prose-headings:mb-4 prose-headings:font-bold prose-headings:text-[color:var(--foreground)] prose-h2:text-2xl prose-h2:md:text-3xl prose-h2:border-b prose-h2:border-[color:var(--border)] prose-h2:pb-2 prose-h3:text-xl prose-h3:md:text-2xl prose-p:mb-4 prose-p:leading-relaxed prose-a:text-[color:var(--primary)] prose-a:no-underline prose-a:font-semibold hover:prose-a:underline prose-strong:text-[color:var(--foreground)] prose-strong:font-semibold prose-ul:my-4 prose-ul:list-disc prose-ul:pl-6 prose-ol:my-4 prose-ol:list-decimal prose-ol:pl-6 prose-li:mb-2 prose-li:text-[color:var(--foreground)] prose-blockquote:my-8 prose-blockquote:border-l-4 prose-blockquote:border-[color:var(--primary)] prose-blockquote:bg-[color:var(--muted)]/50 prose-blockquote:px-4 prose-blockquote:py-4 prose-blockquote:pl-6 prose-blockquote:rounded-r-lg prose-blockquote:italic prose-blockquote:text-[color:var(--muted-foreground)] prose-code:rounded prose-code:bg-[color:var(--muted)] prose-code:px-2 prose-code:py-1 prose-code:text-sm prose-code:font-mono prose-code:text-[color:var(--primary)] prose-table:w-full prose-table:border prose-table:border-[color:var(--border)] prose-table:border-collapse prose-table:my-8 prose-thead:bg-[color:var(--muted)] prose-th:border prose-th:border-[color:var(--border)] prose-th:p-4 prose-th:text-left prose-th:font-bold prose-td:border prose-td:border-[color:var(--border)] prose-td:p-4 prose-tr:even:bg-[color:var(--muted)]/30 prose-img:my-8 prose-img:rounded-lg prose-img:shadow-md"
              dangerouslySetInnerHTML={{ __html: hasContent ? post.content : `<p>Ehhez a cikkhez a részletes tartalom hamarosan érkezik.</p>` }}
            />

            {/* CTA card a cikk alatt */}
            <div className="mt-12 rounded-2xl border border-[color:var(--secondary)]/20 bg-[color:var(--secondary)]/10 p-6 md:p-8">
              <h3 className="mb-3 text-xl font-bold text-[color:var(--foreground)] md:text-2xl">
                Kérdése van a székhelyszolgáltatással kapcsolatban?
              </h3>
              <p className="mb-4 text-sm text-[color:var(--muted-foreground)] md:text-base">
                Szakértő csapatunk készséggel segít a megfelelő csomag kiválasztásában, legyen szó magyar vagy külföldi vállalkozásról.
              </p>
              <Link href="/kapcsolat">
                <Button size="lg" className="rounded-full">
                  Kapcsolatfelvétel
                </Button>
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/blog">
                <Button variant="outline" size="sm" className="inline-flex items-center gap-2">
                  <ChevronLeft className="h-4 w-4" />
                  Vissza a blogra
                </Button>
              </Link>
            </div>
          </article>

          {/* Sidebar - kapcsolódó cikkek */}
          <aside className="lg:col-span-4">
            <Card className="sticky top-24 bg-[color:var(--card)]">
              <CardContent className="p-6">
                <h3 className="mb-4 text-lg font-bold text-[color:var(--foreground)]">
                  Kapcsolódó cikkek
                </h3>
                <div className="space-y-4">
                  {related.map((item) => (
                    <Link
                      key={item.slug}
                      href={`/blog/${item.slug}`}
                      className="group block"
                    >
                      <div className="flex gap-3">
                        <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg">
                          <Image
                            src={item.image || "/placeholder.svg"}
                            alt={item.title}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="mb-1 text-xs text-[color:var(--primary)]">
                            {item.category}
                          </div>
                          <h4 className="line-clamp-2 text-sm font-semibold text-[color:var(--foreground)] transition-colors group-hover:text-[color:var(--primary)]">
                            {item.title}
                          </h4>
                          <div className="mt-1 text-xs text-[color:var(--muted-foreground)]">
                            {item.date}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                <Link href="/blog" className="mt-6 block">
                  <Button variant="outline" className="w-full rounded-full text-sm font-semibold">
                    Összes cikk
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </aside>
        </div>
      </section>

      <Footer />
    </main>
  );
}
