"use client";

import React from "react";
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  type Timestamp,
} from "firebase/firestore";
import {
  getDownloadURL,
  ref,
  uploadBytes,
  type UploadResult,
} from "firebase/storage";
import { AdminGate } from "../../../../components/admin/AdminGate";
import { AdminShell } from "../../../../components/admin/AdminShell";
import { Button } from "../../../../components/ui/button";
import { Card } from "../../../../components/ui/card";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { Select } from "../../../../components/ui/select";
import { Textarea } from "../../../../components/ui/textarea";
import { firestoreDb, firebaseStorage } from "../../../../lib/firebase";

type BlogLanguage = "hu" | "en";

type BlogStatus = "draft" | "published";

type BlogPostDoc = {
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
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
};

const makeDocId = (language: BlogLanguage, slug: string): string =>
  `${language}_${slug}`;

const safeString = (v: unknown): string => (typeof v === "string" ? v : "");

const safeNumber = (v: unknown): number => {
  if (typeof v === "number" && Number.isFinite(v)) {
    return v;
  }
  const parsed = Number(v);
  return Number.isFinite(parsed) ? parsed : 0;
};

const normalizePost = (id: string, raw: Record<string, unknown>): BlogPostDoc => {
  const language = (raw.language === "en" ? "en" : "hu") as BlogLanguage;
  const status = (raw.status === "published" ? "published" : "draft") as BlogStatus;

  return {
    id,
    language,
    status,
    title: safeString(raw.title).trim(),
    slug: safeString(raw.slug).trim(),
    excerpt: safeString(raw.excerpt),
    contentHtml: safeString(raw.contentHtml),
    category: safeString(raw.category).trim(),
    imageUrl: safeString(raw.imageUrl).trim(),
    readingTime: safeNumber(raw.readingTime) || 0,
    publishedAt: safeString(raw.publishedAt).trim(),
    createdAt: (raw.createdAt as Timestamp) ?? null,
    updatedAt: (raw.updatedAt as Timestamp) ?? null,
  };
};

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 90);

const statusLabel: Record<BlogStatus, string> = {
  draft: "Vázlat",
  published: "Publikált",
};

export default function AdminBlogPage() {
  const [items, setItems] = React.useState<BlogPostDoc[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [languageFilter, setLanguageFilter] = React.useState<"all" | BlogLanguage>("all");
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  const [isSaving, setIsSaving] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [imageUploadError, setImageUploadError] = React.useState<string | null>(null);

  const [draft, setDraft] = React.useState<Omit<BlogPostDoc, "id" | "createdAt" | "updatedAt">>({
    language: "hu",
    status: "draft",
    title: "",
    slug: "",
    excerpt: "",
    contentHtml: "",
    category: "",
    imageUrl: "",
    readingTime: 5,
    publishedAt: new Date().toISOString().slice(0, 10),
  });

  React.useEffect(() => {
    const q = query(collection(firestoreDb, "posts"), orderBy("updatedAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const nextItems = snapshot.docs.map((d) =>
          normalizePost(d.id, d.data() as Record<string, unknown>),
        );
        setItems(nextItems);
        setIsLoading(false);
      },
      () => {
        setError("Nem sikerült betölteni a blog cikkeket.");
        setIsLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  const filteredItems = React.useMemo(() => {
    if (languageFilter === "all") {
      return items;
    }
    return items.filter((p) => p.language === languageFilter);
  }, [items, languageFilter]);

  const selectedPost = React.useMemo(() => {
    if (!selectedId) {
      return null;
    }

    return items.find((p) => p.id === selectedId) ?? null;
  }, [items, selectedId]);

  React.useEffect(() => {
    if (selectedPost) {
      setDraft({
        language: selectedPost.language,
        status: selectedPost.status,
        title: selectedPost.title,
        slug: selectedPost.slug,
        excerpt: selectedPost.excerpt,
        contentHtml: selectedPost.contentHtml,
        category: selectedPost.category,
        imageUrl: selectedPost.imageUrl,
        readingTime: selectedPost.readingTime,
        publishedAt: selectedPost.publishedAt || new Date().toISOString().slice(0, 10),
      });
    }
  }, [selectedPost]);

  const handleNew = React.useCallback(() => {
    setSelectedId(null);
    setDraft({
      language: "hu",
      status: "draft",
      title: "",
      slug: "",
      excerpt: "",
      contentHtml: "",
      category: "",
      imageUrl: "",
      readingTime: 5,
      publishedAt: new Date().toISOString().slice(0, 10),
    });
  }, []);

  const handleSave = React.useCallback(async () => {
    setIsSaving(true);
    setError(null);

    const normalizedSlug = slugify(draft.slug || draft.title);
    if (!draft.title.trim() || !normalizedSlug) {
      setError("A cím és a slug kötelező.");
      setIsSaving(false);
      return;
    }

    const docId = makeDocId(draft.language, normalizedSlug);

    try {
      await setDoc(
        doc(firestoreDb, "posts", docId),
        {
          language: draft.language,
          status: draft.status,
          title: draft.title.trim(),
          slug: normalizedSlug,
          excerpt: draft.excerpt,
          contentHtml: draft.contentHtml,
          category: draft.category,
          imageUrl: draft.imageUrl,
          readingTime: Number(draft.readingTime) || 0,
          publishedAt: draft.publishedAt,
          updatedAt: serverTimestamp(),
          ...(selectedPost ? {} : { createdAt: serverTimestamp() }),
        },
        { merge: true },
      );

      setSelectedId(docId);
    } catch {
      setError("Mentés sikertelen. Ellenőrizd a Firestore jogosultságokat (Rules). ");
    } finally {
      setIsSaving(false);
    }
  }, [draft, selectedPost]);

  const handleUploadImage = React.useCallback(
    async (file: File) => {
      setIsUploading(true);
      setImageUploadError(null);

      const normalizedSlug = slugify(draft.slug || draft.title || "blog-image");
      const safeFileName = file.name.replace(/\s+/g, "-");
      const path = `image/${draft.language}/${normalizedSlug}/${Date.now()}-${safeFileName}`;
      const storageRef = ref(firebaseStorage, path);

      try {
        const result: UploadResult = await uploadBytes(storageRef, file, {
          contentType: file.type || undefined,
        });

        const url = await getDownloadURL(result.ref);
        setDraft((prev) => ({ ...prev, imageUrl: url }));
      } catch {
        setImageUploadError("Képfeltöltés sikertelen.");
      } finally {
        setIsUploading(false);
      }
    },
    [draft.language, draft.slug, draft.title],
  );

  return (
    <AdminGate>
      <AdminShell basePath="/_ops/portal-7d3k9a2f" title="Blog szerkesztő">
        <div className="flex flex-col gap-4 lg:flex-row">
          <Card className="w-full p-4 lg:w-[420px]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold">Cikkek</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {isLoading ? "Betöltés..." : `${filteredItems.length} db`}
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <Select
                  value={languageFilter}
                  onChange={(e) => setLanguageFilter(e.target.value as "all" | BlogLanguage)}
                  className="h-9 w-[170px]"
                >
                  <option value="all">Összes nyelv</option>
                  <option value="hu">HU</option>
                  <option value="en">EN</option>
                </Select>
                <Button type="button" size="sm" onClick={handleNew}>
                  Új cikk
                </Button>
              </div>
            </div>

            {error ? (
              <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-200">
                {error}
              </div>
            ) : null}

            <div className="mt-4 flex max-h-[65vh] flex-col gap-2 overflow-auto">
              {filteredItems.length === 0 && !isLoading ? (
                <div className="rounded-xl border border-border bg-background p-4 text-sm text-muted-foreground">
                  Nincs még cikk.
                </div>
              ) : null}

              {filteredItems.map((post) => {
                const isSelected = post.id === selectedId;
                return (
                  <button
                    key={post.id}
                    type="button"
                    onClick={() => setSelectedId(post.id)}
                    className={`w-full rounded-xl border px-3 py-3 text-left transition-colors ${
                      isSelected
                        ? "border-primary/40 bg-primary/10"
                        : "border-border bg-background hover:bg-muted"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-foreground">
                          {post.title || "(Cím nélkül)"}
                        </div>
                        <div className="mt-0.5 truncate text-xs text-muted-foreground">
                          {post.language.toUpperCase()} • /{post.language === "en" ? "en/blog" : "blog"}/{post.slug}
                        </div>
                      </div>
                      <div className="flex-shrink-0 rounded-full bg-muted px-2 py-1 text-[11px] font-medium text-muted-foreground">
                        {statusLabel[post.status]}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>

          <Card className="min-w-0 flex-1 p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="text-lg font-semibold">
                  {selectedPost ? "Cikk szerkesztése" : "Új cikk"}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Firestore kollekció: <span className="font-mono">posts</span> • Storage: <span className="font-mono">gs://emarketplace-8aab1.firebasestorage.app/image</span>
                </div>
              </div>
              <Button type="button" onClick={handleSave} disabled={isSaving || isUploading}>
                {isSaving ? "Mentés..." : "Mentés"}
              </Button>
            </div>

            {error ? (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-200">
                {error}
              </div>
            ) : null}

            <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="language">Nyelv</Label>
                <Select
                  id="language"
                  value={draft.language}
                  onChange={(e) =>
                    setDraft((prev) => ({ ...prev, language: e.target.value as BlogLanguage }))
                  }
                >
                  <option value="hu">HU</option>
                  <option value="en">EN</option>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Státusz</Label>
                <Select
                  id="status"
                  value={draft.status}
                  onChange={(e) =>
                    setDraft((prev) => ({ ...prev, status: e.target.value as BlogStatus }))
                  }
                >
                  <option value="draft">Vázlat</option>
                  <option value="published">Publikált</option>
                </Select>
              </div>

              <div className="space-y-2 lg:col-span-2">
                <Label htmlFor="title">Cím</Label>
                <Input
                  id="title"
                  value={draft.title}
                  onChange={(e) =>
                    setDraft((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="Cikk címe"
                />
              </div>

              <div className="space-y-2 lg:col-span-2">
                <Label htmlFor="slug">Slug</Label>
                <div className="flex gap-2">
                  <Input
                    id="slug"
                    value={draft.slug}
                    onChange={(e) =>
                      setDraft((prev) => ({ ...prev, slug: e.target.value }))
                    }
                    placeholder="pl. szekhelyszolgaltatas-elonyei"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      setDraft((prev) => ({
                        ...prev,
                        slug: slugify(prev.slug || prev.title),
                      }))
                    }
                  >
                    Generálás
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Kategória</Label>
                <Input
                  id="category"
                  value={draft.category}
                  onChange={(e) =>
                    setDraft((prev) => ({ ...prev, category: e.target.value }))
                  }
                  placeholder="pl. Cégalapítás"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="publishedAt">Dátum</Label>
                <Input
                  id="publishedAt"
                  type="date"
                  value={draft.publishedAt}
                  onChange={(e) =>
                    setDraft((prev) => ({ ...prev, publishedAt: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="readingTime">Olvasási idő (perc)</Label>
                <Input
                  id="readingTime"
                  type="number"
                  value={String(draft.readingTime)}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      readingTime: Number(e.target.value),
                    }))
                  }
                  min={1}
                />
              </div>

              <div className="space-y-2 lg:col-span-2">
                <Label htmlFor="excerpt">Kivonat</Label>
                <Textarea
                  id="excerpt"
                  rows={3}
                  value={draft.excerpt}
                  onChange={(e) =>
                    setDraft((prev) => ({ ...prev, excerpt: e.target.value }))
                  }
                  placeholder="Rövid összefoglaló..."
                />
              </div>

              <div className="space-y-2 lg:col-span-2">
                <Label>Kiemelt kép</Label>
                <div className="flex flex-col gap-2 md:flex-row md:items-center">
                  <Input
                    value={draft.imageUrl}
                    onChange={(e) =>
                      setDraft((prev) => ({ ...prev, imageUrl: e.target.value }))
                    }
                    placeholder="https://..."
                  />
                  <label className="inline-flex cursor-pointer items-center justify-center rounded-md border border-border bg-transparent px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
                    {isUploading ? "Feltöltés..." : "Feltöltés"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={isUploading}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          void handleUploadImage(file);
                        }
                      }}
                    />
                  </label>
                </div>
                {imageUploadError ? (
                  <div className="text-xs text-red-600 dark:text-red-300">
                    {imageUploadError}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="mt-6 space-y-2">
              <Label htmlFor="contentHtml">Tartalom (HTML)</Label>
              <Textarea
                id="contentHtml"
                rows={14}
                value={draft.contentHtml}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, contentHtml: e.target.value }))
                }
                placeholder="<h2>...</h2><p>...</p>"
              />
              <div className="text-xs text-muted-foreground">
                Tipp: a publikus blog oldal jelenleg statikus adatokból épül. Ha azt szeretnéd, hogy az itt létrehozott cikkek azonnal megjelenjenek, a publikus /blog oldalakat át kell kötnünk Firestore-ra is.
              </div>
            </div>
          </Card>
        </div>
      </AdminShell>
    </AdminGate>
  );
}
