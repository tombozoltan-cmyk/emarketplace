"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  deleteDoc,
  type Timestamp,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import {
  Search,
  Loader2,
  Plus,
  Trash2,
  Save,
  Image as ImageIcon,
  Calendar,
  Globe,
  Eye,
  EyeOff,
} from "lucide-react";
import { firestoreDb, firebaseStorage } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AdminLayout,
  AdminCard,
  AdminCardHeader,
  AdminCardTitle,
  AdminCardContent,
  StatusBadge,
  AdminModal,
  AdminModalSection,
  RichTextEditor,
} from "@/components/admin";

type BlogLanguage = "hu" | "en";
type BlogStatus = "draft" | "published";

type BlogPost = {
  id: string;
  language: BlogLanguage;
  status: BlogStatus;
  title: string;
  slug: string;
  excerpt: string;
  contentHtml: string;
  category: string;
  imageUrl: string;
  readingTime: number;
  publishedAt: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};

const STATUS_CONFIG: Record<BlogStatus, { label: string; variant: "default" | "success" }> = {
  draft: { label: "Vázlat", variant: "default" },
  published: { label: "Publikált", variant: "success" },
};

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 90);

const formatDate = (ts?: Timestamp) => {
  if (!ts) return "-";
  return ts.toDate().toLocaleDateString("hu-HU", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export default function BlogAdminPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [languageFilter, setLanguageFilter] = useState<"all" | BlogLanguage>("all");
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Editor state
  const [editLanguage, setEditLanguage] = useState<BlogLanguage>("hu");
  const [editStatus, setEditStatus] = useState<BlogStatus>("draft");
  const [editTitle, setEditTitle] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editExcerpt, setEditExcerpt] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");
  const [editReadingTime, setEditReadingTime] = useState(5);
  const [editPublishedAt, setEditPublishedAt] = useState("");

  // Fetch posts
  useEffect(() => {
    const q = query(collection(firestoreDb, "posts"), orderBy("updatedAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as BlogPost[];
      setPosts(items);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Filter posts
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesSearch =
        !searchQuery ||
        post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.slug?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLanguage = languageFilter === "all" || post.language === languageFilter;
      return matchesSearch && matchesLanguage;
    });
  }, [posts, searchQuery, languageFilter]);

  // Open editor
  const openEditor = useCallback((post?: BlogPost) => {
    if (post) {
      setSelectedPost(post);
      setEditLanguage(post.language);
      setEditStatus(post.status);
      setEditTitle(post.title);
      setEditSlug(post.slug);
      setEditExcerpt(post.excerpt);
      setEditContent(post.contentHtml);
      setEditCategory(post.category);
      setEditImageUrl(post.imageUrl);
      setEditReadingTime(post.readingTime || 5);
      setEditPublishedAt(post.publishedAt || new Date().toISOString().slice(0, 10));
    } else {
      setSelectedPost(null);
      setEditLanguage("hu");
      setEditStatus("draft");
      setEditTitle("");
      setEditSlug("");
      setEditExcerpt("");
      setEditContent("");
      setEditCategory("");
      setEditImageUrl("");
      setEditReadingTime(5);
      setEditPublishedAt(new Date().toISOString().slice(0, 10));
    }
    setIsEditorOpen(true);
  }, []);

  // Auto-generate slug from title
  const handleTitleChange = useCallback((title: string) => {
    setEditTitle(title);
    if (!selectedPost) {
      setEditSlug(slugify(title));
    }
  }, [selectedPost]);

  // Save post
  const savePost = async () => {
    const normalizedSlug = slugify(editSlug || editTitle);
    if (!editTitle.trim() || !normalizedSlug) {
      alert("A cím és a slug kötelező!");
      return;
    }

    setIsSaving(true);
    try {
      const docId = `${editLanguage}_${normalizedSlug}`;
      await setDoc(
        doc(firestoreDb, "posts", docId),
        {
          language: editLanguage,
          status: editStatus,
          title: editTitle.trim(),
          slug: normalizedSlug,
          excerpt: editExcerpt,
          contentHtml: editContent,
          category: editCategory,
          imageUrl: editImageUrl,
          readingTime: Number(editReadingTime) || 5,
          publishedAt: editPublishedAt,
          updatedAt: serverTimestamp(),
          ...(selectedPost ? {} : { createdAt: serverTimestamp() }),
        },
        { merge: true }
      );
      setIsEditorOpen(false);
    } catch (error) {
      console.error("Save error:", error);
      alert("Mentés sikertelen!");
    } finally {
      setIsSaving(false);
    }
  };

  // Delete post
  const deletePost = async () => {
    if (!selectedPost || !confirm("Biztosan törlöd ezt a cikket?")) return;
    try {
      await deleteDoc(doc(firestoreDb, "posts", selectedPost.id));
      setIsEditorOpen(false);
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  // Upload image
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const slug = slugify(editSlug || editTitle || "blog");
      const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const storagePath = `image/${editLanguage}/${slug}/${Date.now()}-${safeFileName}`;
      const storageRef = ref(firebaseStorage, storagePath);
      await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(storageRef);
      setEditImageUrl(downloadUrl);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Kép feltöltés sikertelen!");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <AdminLayout title="Blog" description="Blog cikkek kezelése">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[color:var(--muted-foreground)]" />
          <Input
            placeholder="Keresés cím, slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={languageFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setLanguageFilter("all")}
          >
            Mind
          </Button>
          <Button
            variant={languageFilter === "hu" ? "default" : "outline"}
            size="sm"
            onClick={() => setLanguageFilter("hu")}
          >
            🇭🇺 Magyar
          </Button>
          <Button
            variant={languageFilter === "en" ? "default" : "outline"}
            size="sm"
            onClick={() => setLanguageFilter("en")}
          >
            🇬🇧 English
          </Button>
        </div>
        <Button onClick={() => openEditor()} className="gap-2">
          <Plus className="w-4 h-4" />
          Új cikk
        </Button>
      </div>

      {/* Loading */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[color:var(--primary)]" />
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="text-center py-20 text-[color:var(--muted-foreground)]">
          Nincs találat
        </div>
      ) : (
        /* Posts grid */
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredPosts.map((post) => (
            <AdminCard key={post.id} onClick={() => openEditor(post)} hoverable>
              {post.imageUrl && (
                <div className="h-32 -mx-4 -mt-4 mb-3 overflow-hidden rounded-t-xl">
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <AdminCardHeader>
                <div className="flex-1 min-w-0">
                  <AdminCardTitle>{post.title || "Névtelen"}</AdminCardTitle>
                  <p className="text-xs text-[color:var(--muted-foreground)] mt-0.5 flex items-center gap-1">
                    <Globe className="w-3 h-3" />
                    {post.language === "hu" ? "Magyar" : "English"}
                  </p>
                </div>
                <StatusBadge
                  status={STATUS_CONFIG[post.status].label}
                  variant={STATUS_CONFIG[post.status].variant}
                />
              </AdminCardHeader>
              <AdminCardContent>
                <div className="text-xs text-[color:var(--muted-foreground)] line-clamp-2">
                  {post.excerpt || "Nincs kivonat"}
                </div>
                <div className="flex items-center gap-2 text-xs text-[color:var(--muted-foreground)] mt-2">
                  <Calendar className="w-3 h-3" />
                  {formatDate(post.updatedAt)}
                </div>
              </AdminCardContent>
            </AdminCard>
          ))}
        </div>
      )}

      {/* Editor Modal */}
      <AdminModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        title={selectedPost ? "Cikk szerkesztése" : "Új cikk"}
        size="full"
        footer={
          <>
            {selectedPost && (
              <Button variant="destructive" size="sm" onClick={deletePost}>
                <Trash2 className="w-4 h-4 mr-1" />
                Törlés
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => setIsEditorOpen(false)}>
              Mégse
            </Button>
            <Button size="sm" onClick={savePost} disabled={isSaving}>
              {isSaving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
              Mentés
            </Button>
          </>
        }
      >
        <div className="space-y-6">
          {/* Meta fields row 1 */}
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="sm:col-span-2">
              <Label>Cím</Label>
              <Input
                value={editTitle}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Cikk címe"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Slug</Label>
              <Input
                value={editSlug}
                onChange={(e) => setEditSlug(e.target.value)}
                placeholder="cikk-url-slug"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Kategória</Label>
              <Input
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
                placeholder="pl. Hírek"
                className="mt-1"
              />
            </div>
          </div>

          {/* Meta fields row 2 */}
          <div className="grid gap-4 sm:grid-cols-4">
            <div>
              <Label>Nyelv</Label>
              <select
                value={editLanguage}
                onChange={(e) => setEditLanguage(e.target.value as BlogLanguage)}
                className="mt-1 w-full h-10 px-3 rounded-md border border-[color:var(--border)] bg-[color:var(--background)] text-sm"
              >
                <option value="hu">🇭🇺 Magyar</option>
                <option value="en">🇬🇧 English</option>
              </select>
            </div>
            <div>
              <Label>Státusz</Label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value as BlogStatus)}
                className="mt-1 w-full h-10 px-3 rounded-md border border-[color:var(--border)] bg-[color:var(--background)] text-sm"
              >
                <option value="draft">Vázlat</option>
                <option value="published">Publikált</option>
              </select>
            </div>
            <div>
              <Label>Publikálás dátuma</Label>
              <Input
                type="date"
                value={editPublishedAt}
                onChange={(e) => setEditPublishedAt(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Olvasási idő (perc)</Label>
              <Input
                type="number"
                value={editReadingTime}
                onChange={(e) => setEditReadingTime(Number(e.target.value))}
                min={1}
                className="mt-1"
              />
            </div>
          </div>

          {/* Excerpt */}
          <div>
            <Label>Kivonat</Label>
            <textarea
              value={editExcerpt}
              onChange={(e) => setEditExcerpt(e.target.value)}
              placeholder="Rövid leírás a cikkről..."
              rows={2}
              className="mt-1 w-full px-3 py-2 rounded-md border border-[color:var(--border)] bg-[color:var(--background)] text-sm resize-none"
            />
          </div>

          {/* Image */}
          <div>
            <Label>Kiemelt kép</Label>
            <div className="mt-1 flex gap-3 items-start">
              {editImageUrl && (
                <img
                  src={editImageUrl}
                  alt="Előnézet"
                  className="w-32 h-20 object-cover rounded-lg border border-[color:var(--border)]"
                />
              )}
              <div className="flex-1 space-y-2">
                <Input
                  value={editImageUrl}
                  onChange={(e) => setEditImageUrl(e.target.value)}
                  placeholder="Kép URL vagy töltsd fel..."
                />
                <label className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-[color:var(--border)] rounded-md cursor-pointer hover:bg-[color:var(--muted)] transition-colors">
                  {isUploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ImageIcon className="w-4 h-4" />
                  )}
                  {isUploading ? "Feltöltés..." : "Kép feltöltése"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={isUploading}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Content editor */}
          <div>
            <Label>Tartalom</Label>
            <div className="mt-1">
              <RichTextEditor
                content={editContent}
                onChange={setEditContent}
                placeholder="Kezdd el írni a cikk tartalmát..."
                minHeight="350px"
              />
            </div>
          </div>
        </div>
      </AdminModal>
    </AdminLayout>
  );
}
