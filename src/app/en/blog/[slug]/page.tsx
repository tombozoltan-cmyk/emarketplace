import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BlogPostContent } from "@/components/BlogPostContent";
import { blogPostsEn } from "@/lib/blog-data-en";

export const dynamicParams = false;

export function generateStaticParams() {
  return blogPostsEn.map((post) => ({
    slug: post.slug,
  }));
}

export const metadata: Metadata = {
  title: "Blog | E-Marketplace",
  description: "Articles about registered office services, company formation and compliance updates.",
};

export default async function BlogPostPageEn({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <main className="flex min-h-screen w-full flex-col bg-[color:var(--background)] text-[color:var(--foreground)]">
      <Header />
      <BlogPostContent slug={slug} language="en" />
      <Footer />
    </main>
  );
}
