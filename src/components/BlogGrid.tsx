"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, onSnapshot } from "firebase/firestore";
import { firestoreDb } from "@/lib/firebase";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

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
};

type BlogGridProps = {
  language?: "hu" | "en";
};

export function BlogGrid({ language = "hu" }: BlogGridProps) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simple query without composite index requirement
    const unsubscribe = onSnapshot(
      collection(firestoreDb, "posts"),
      (snapshot) => {
        const allPosts = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as BlogPost[];
        
        // Filter and sort client-side
        const filteredPosts = allPosts
          .filter((post) => post.language === language && post.status === "published")
          .sort((a, b) => {
            const dateA = new Date(a.publishedAt || "").getTime();
            const dateB = new Date(b.publishedAt || "").getTime();
            return dateB - dateA;
          });
        
        setPosts(filteredPosts);
        setIsLoading(false);
      },
      (error) => {
        console.error("Error fetching posts:", error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [language]);

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

  const blogPath = language === "hu" ? "/blog" : "/en/blog";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[color:var(--primary)]" />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="py-20 text-center text-[color:var(--muted-foreground)]">
        {language === "hu" ? "Még nincsenek publikált cikkek." : "No published posts yet."}
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 sm:px-6 md:grid-cols-2 md:gap-8 lg:grid-cols-3 lg:px-8">
      {posts.map((post) => (
        <Card
          key={post.id}
          className="group flex h-full flex-col overflow-hidden border-2 border-[color:var(--border)] bg-[color:var(--card)] shadow-sm transition-all duration-300 hover:border-[color:var(--primary)] hover:shadow-2xl"
        >
          <div className="relative h-48 overflow-hidden bg-[color:var(--secondary)]/10 md:h-56 lg:h-64">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.imageUrl || "/placeholder.svg"}
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
            <Link href={`${blogPath}/${post.slug}`} className="mb-2 md:mb-3">
              <h3 className="text-lg font-bold text-foreground text-balance transition-colors group-hover:text-[color:var(--primary)] md:text-xl">
                {post.title}
              </h3>
            </Link>
            <p className="mb-4 text-sm text-[color:var(--muted-foreground)] text-pretty line-clamp-3 md:mb-6 md:text-base">
              {post.excerpt}
            </p>
            <div className="mt-auto border-t border-[color:var(--border)] pt-3 md:pt-4">
              <div className="mb-3 flex items-center justify-between text-xs text-[color:var(--muted-foreground)] md:text-sm">
                <span>{formatDate(post.publishedAt)}</span>
                <span>
                  {post.readingTime} {language === "hu" ? "perc olvasás" : "min read"}
                </span>
              </div>
              <Link
                href={`${blogPath}/${post.slug}`}
                className="inline-flex w-full items-center justify-center rounded-full bg-[color:var(--secondary)] px-4 py-2 text-base font-medium text-[color:var(--secondary-foreground)] transition-colors hover:bg-[color:var(--primary)] hover:text-[color:var(--primary-foreground)]"
              >
                {language === "hu" ? "Tovább olvasom" : "Read more"}
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
