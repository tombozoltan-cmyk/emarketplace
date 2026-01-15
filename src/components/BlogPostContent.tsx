"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock, ChevronLeft, Share2, Loader2 } from "lucide-react";
import { collection, onSnapshot } from "firebase/firestore";
import { firestoreDb } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type BlogPost = {
  id: string;
  language: "hu" | "en";
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  imageUrl: string;
  readingTime: number;
  publishedAt: string;
  status: "draft" | "published";
  contentHtml: string;
};

type BlogPostContentProps = {
  slug: string;
  language?: "hu" | "en";
};

export function BlogPostContent({ slug, language = "hu" }: BlogPostContentProps) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const t = language === "hu";
  const blogPath = language === "hu" ? "/blog" : "/en/blog";

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(firestoreDb, "posts"),
      (snapshot) => {
        const allPosts = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as BlogPost[];

        // Find current post
        const currentPost = allPosts.find(
          (p) => p.slug === slug && p.language === language
        );

        if (currentPost) {
          setPost(currentPost);
          // Get related posts (same language, different slug, published)
          const related = allPosts
            .filter(
              (p) =>
                p.slug !== slug &&
                p.language === language &&
                p.status === "published"
            )
            .slice(0, 3);
          setRelatedPosts(related);
          setNotFound(false);
        } else {
          setNotFound(true);
        }
        setIsLoading(false);
      },
      (error) => {
        console.error("Error fetching post:", error);
        setIsLoading(false);
        setNotFound(true);
      }
    );

    return () => unsubscribe();
  }, [slug, language]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(language === "hu" ? "hu-HU" : "en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-[color:var(--primary)]" />
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="py-32 text-center">
        <h1 className="mb-4 text-2xl font-bold">
          {t ? "Cikk nem található" : "Post not found"}
        </h1>
        <Link href={blogPath}>
          <Button>{t ? "Vissza a blogra" : "Back to blog"}</Button>
        </Link>
      </div>
    );
  }

  const hasContent = post.contentHtml && post.contentHtml.trim().length > 0;

  return (
    <>
      {/* Breadcrumb */}
      <nav className="border-b border-[color:var(--border)] bg-[color:var(--muted)]/30">
        <div className="mx-auto flex max-w-5xl items-center gap-2 px-4 py-4 text-sm text-[color:var(--muted-foreground)] sm:px-6 lg:px-8">
          <Link href="/" className="hover:text-[color:var(--foreground)]">
            {t ? "Főoldal" : "Home"}
          </Link>
          <span>›</span>
          <Link href={blogPath} className="hover:text-[color:var(--foreground)]">
            Blog
          </Link>
          <span>›</span>
          <span className="text-[color:var(--foreground)] line-clamp-1">
            {post.title}
          </span>
        </div>
      </nav>

      <section className="py-8 md:py-12">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 px-4 sm:px-6 lg:grid-cols-12 lg:gap-12 lg:px-8">
          {/* Fő tartalom */}
          <article className="lg:col-span-8">
            <Link
              href={blogPath}
              className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-[color:var(--primary)] hover:text-[color:var(--primary)]/80"
            >
              <span className="h-2 w-2 rounded-full bg-[color:var(--primary)]" />
              Blog
            </Link>

            <h1 className="mb-4 text-3xl font-bold leading-tight text-[color:var(--foreground)] md:text-4xl lg:text-5xl">
              {post.title}
            </h1>

            <p className="mb-6 text-lg text-[color:var(--muted-foreground)]">
              {post.excerpt}
            </p>

            <div className="mb-8 flex items-center gap-4 border-b border-[color:var(--border)] pb-6 text-sm text-[color:var(--muted-foreground)]">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(post.publishedAt)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>
                  {post.readingTime} {t ? "perc olvasás" : "min read"}
                </span>
              </div>
              <div className="ml-auto">
                <Button
                  type="button"
                  size="sm"
                  className="inline-flex items-center gap-2 text-xs md:text-sm"
                >
                  <Share2 className="h-4 w-4" />
                  {t ? "Megosztás" : "Share"}
                </Button>
              </div>
            </div>

            {post.imageUrl && (
              <div className="mb-8 h-[260px] overflow-hidden rounded-xl md:h-[360px] lg:h-[440px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            <div
              className="prose prose-base lg:prose-lg max-w-none text-[color:var(--foreground)] prose-headings:mt-8 prose-headings:mb-4 prose-headings:font-bold prose-headings:text-[color:var(--foreground)] prose-h2:text-2xl prose-h2:md:text-3xl prose-h2:border-b prose-h2:border-[color:var(--border)] prose-h2:pb-2 prose-h3:text-xl prose-h3:md:text-2xl prose-p:mb-4 prose-p:leading-relaxed prose-a:text-[color:var(--primary)] prose-a:no-underline prose-a:font-semibold hover:prose-a:underline prose-strong:text-[color:var(--foreground)] prose-strong:font-semibold prose-ul:my-4 prose-ul:list-disc prose-ul:pl-6 prose-ol:my-4 prose-ol:list-decimal prose-ol:pl-6 prose-li:mb-2 prose-li:text-[color:var(--foreground)]"
              dangerouslySetInnerHTML={{
                __html: hasContent
                  ? post.contentHtml
                  : t
                  ? "<p>Ehhez a cikkhez a részletes tartalom hamarosan érkezik.</p>"
                  : "<p>Detailed content for this article is coming soon.</p>",
              }}
            />

            {/* CTA card */}
            <div className="mt-12 rounded-2xl border border-[color:var(--secondary)]/20 bg-[color:var(--secondary)]/10 p-6 md:p-8">
              <h3 className="mb-3 text-xl font-bold text-[color:var(--foreground)] md:text-2xl">
                {t
                  ? "Kérdése van a székhelyszolgáltatással kapcsolatban?"
                  : "Questions about registered office services?"}
              </h3>
              <p className="mb-4 text-sm text-[color:var(--muted-foreground)] md:text-base">
                {t
                  ? "Szakértő csapatunk készséggel segít a megfelelő csomag kiválasztásában."
                  : "Our expert team is happy to help you choose the right package."}
              </p>
              <Link href={t ? "/kapcsolat" : "/en/contact"}>
                <Button size="lg" className="rounded-full">
                  {t ? "Kapcsolatfelvétel" : "Contact us"}
                </Button>
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href={blogPath}>
                <Button
                  variant="outline"
                  size="sm"
                  className="inline-flex items-center gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  {t ? "Vissza a blogra" : "Back to blog"}
                </Button>
              </Link>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="lg:col-span-4">
            <Card className="sticky top-24 bg-[color:var(--card)]">
              <CardContent className="p-6">
                <h3 className="mb-4 text-lg font-bold text-[color:var(--foreground)]">
                  {t ? "Kapcsolódó cikkek" : "Related posts"}
                </h3>
                {relatedPosts.length === 0 ? (
                  <p className="text-sm text-[color:var(--muted-foreground)]">
                    {t ? "Nincs kapcsolódó cikk." : "No related posts."}
                  </p>
                ) : (
                  <div className="space-y-4">
                    {relatedPosts.map((item) => (
                      <Link
                        key={item.id}
                        href={`${blogPath}/${item.slug}`}
                        className="group block"
                      >
                        <div className="flex gap-3">
                          <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-[color:var(--muted)]">
                            {item.imageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={item.imageUrl}
                                alt={item.title}
                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-xs text-[color:var(--muted-foreground)]">
                                No img
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="mb-1 text-xs text-[color:var(--primary)]">
                              {item.category}
                            </div>
                            <h4 className="line-clamp-2 text-sm font-semibold text-[color:var(--foreground)] transition-colors group-hover:text-[color:var(--primary)]">
                              {item.title}
                            </h4>
                            <div className="mt-1 text-xs text-[color:var(--muted-foreground)]">
                              {formatDate(item.publishedAt)}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                <Link href={blogPath} className="mt-6 block">
                  <Button
                    variant="outline"
                    className="w-full rounded-full text-sm font-semibold"
                  >
                    {t ? "Összes cikk" : "All posts"}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </aside>
        </div>
      </section>
    </>
  );
}
