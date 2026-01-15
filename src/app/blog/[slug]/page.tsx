import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BlogPostContent } from "@/components/BlogPostContent";
import { blogPosts } from "@/lib/blog-data";

export const dynamicParams = false;

export function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }));
}

export const metadata: Metadata = {
  title: "Blog | E-Marketplace Kft.",
  description: "Szakmai cikkek székhelyszolgáltatásról, cégalapításról és jogszabályi változásokról.",
};

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <main className="flex min-h-screen w-full flex-col bg-[color:var(--background)] text-[color:var(--foreground)]">
      <Header />
      <BlogPostContent slug={slug} language="hu" />
      <Footer />
    </main>
  );
}
