"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { collection, onSnapshot } from "firebase/firestore";
import { firestoreDb } from "@/lib/firebase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

type BlogPost = {
  id: string;
  title: string;
  excerpt: string;
  imageUrl: string;
  publishedAt: string;
  slug: string;
  category?: string;
  language: "hu" | "en";
  status: "draft" | "published";
};

export function BlogSection() {
  const pathname = usePathname();
  const isEnglish = pathname?.startsWith("/en");
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const unsubscribe = onSnapshot(
      collection(firestoreDb, "posts"),
      (snapshot) => {
        const allPosts = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as BlogPost[];

        const language = isEnglish ? "en" : "hu";
        const filteredPosts = allPosts
          .filter((post) => post.language === language && post.status === "published")
          .sort((a, b) => {
            const dateA = new Date(a.publishedAt || "").getTime();
            const dateB = new Date(b.publishedAt || "").getTime();
            return dateB - dateA;
          })
          .slice(0, 3);

        setPosts(filteredPosts);
        setIsLoading(false);
      },
      (error) => {
        console.error("Error fetching posts:", error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [isEnglish, mounted]);

  const first = posts[0];
  const second = posts[1];
  const third = posts[2];

  const heading = isEnglish ? "Blog & Knowledge base" : "Blog & Tudásbázis";
  const subtitle = isEnglish
    ? "Useful information and fresh updates on registered office services, company formation and related legal and financial topics."
    : "Hasznos információk és friss hírek székhelyszolgáltatás, cégalapítás és kapcsolódó jogi, pénzügyi kérdések témájában.";

  const allPostsLabel = isEnglish ? "All articles" : "Összes cikk";
  const blogBasePath = isEnglish ? "/en/blog" : "/blog";

  // Prevent hydration mismatch by showing loading state on server
  if (!mounted) {
    return (
      <section className="w-full bg-[color:var(--background)] py-12 md:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center md:mb-16">
            <h2 className="mb-3 text-2xl font-bold text-[color:var(--foreground)] md:mb-4 md:text-3xl lg:text-4xl">
              Blog & Tudásbázis
            </h2>
          </div>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[color:var(--primary)]" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full bg-[color:var(--background)] py-12 md:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center md:mb-16">
          <h2 className="mb-3 text-2xl font-bold text-[color:var(--foreground)] md:mb-4 md:text-3xl lg:text-4xl">
            {heading}
          </h2>
          <p className="hidden max-w-2xl text-base text-[color:var(--muted-foreground)] md:mx-auto md:block md:text-xl lg:text-lg">
            {subtitle}
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[color:var(--primary)]" />
          </div>
        ) : posts.length === 0 ? (
          <div className="py-12 text-center text-[color:var(--muted-foreground)]">
            {isEnglish ? "No published posts yet." : "Még nincsenek publikált cikkek."}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
            {first && <BlogCard key={first.id} post={first} basePath={blogBasePath} isEnglish={isEnglish} />}
            {second && (
              <div className="hidden md:block">
                <BlogCard key={second.id} post={second} basePath={blogBasePath} isEnglish={isEnglish} />
              </div>
            )}
            {third && (
              <div className="hidden lg:block">
                <BlogCard key={third.id} post={third} basePath={blogBasePath} isEnglish={isEnglish} />
              </div>
            )}
          </div>
        )}

        <div className="mt-8 text-center md:mt-12">
          <Link href={blogBasePath}>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full border-2 border-[color:var(--primary)] bg-transparent px-8 py-3 text-sm text-[color:var(--primary)] transition-colors hover:bg-[color:var(--primary)] hover:text-[color:var(--primary-foreground)] md:text-base"
            >
              {allPostsLabel}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

type BlogCardProps = {
  post: BlogPost;
  basePath: string;
  isEnglish?: boolean;
};

function BlogCard({ post, basePath, isEnglish }: BlogCardProps) {
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(isEnglish ? "en-US" : "hu-HU", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <Card className="group flex h-full flex-col overflow-hidden rounded-2xl bg-[color:var(--card)] shadow-none transition-shadow duration-300 hover:shadow-xl">
      <div className="relative h-40 overflow-hidden md:h-48">
        <img
          src={post.imageUrl || "/placeholder.svg"}
          alt={`${post.title} - E-Marketplace blog`}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
      </div>
      <CardContent className="flex flex-1 flex-col p-4 md:p-6">
        <span className="mb-2 text-xs font-medium text-[color:var(--primary)] md:text-sm">
          {formatDate(post.publishedAt)}
        </span>
        <h3 className="mb-2 text-base font-semibold text-[color:var(--foreground)] text-balance line-clamp-2 md:mb-3 md:text-xl">
          {post.title}
        </h3>
        <p className="mb-3 text-sm text-[color:var(--muted-foreground)] text-pretty line-clamp-2 md:mb-4 md:text-base">
          {post.excerpt}
        </p>
        <Link
          href={`${basePath}/${post.slug}`}
          className="inline-flex items-center text-sm font-medium text-[color:var(--primary)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--background)] md:text-base"
        >
          {isEnglish ? "Read more →" : "Tovább →"}
        </Link>
      </CardContent>
    </Card>
  );
}

