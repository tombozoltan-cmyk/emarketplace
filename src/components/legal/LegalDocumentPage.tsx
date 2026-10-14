import React from "react";
import Link from "next/link";
import { Download, FileText } from "lucide-react";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import {
  LEGAL_DOCUMENTS,
  currentLegalVersion,
  formatLegalDate,
  legalPdfUrl,
  type LegalDocumentKind,
} from "@/lib/legal/registry";
import type { LegalBlock, LegalDocumentContent } from "@/lib/legal/types";

const LETTERS = "abcdefghijklmnopqrstuvwxyz";

const UI = {
  hu: {
    effectiveFrom: "Hatályos",
    version: "Verzió",
    downloadPdf: "PDF letöltése",
    toc: "Tartalom",
    history: "Verziótörténet",
    historyIntro:
      "A korábbi verziók a hatályuk idején megkötött szerződésekre maradnak alkalmazandók. A PDF-ek változatlan tartalommal, állandó címen érhetők el.",
    historyVersion: "Verzió",
    historyEffective: "Hatályos ettől",
    historyUntil: "Hatályvesztés",
    historyPdf: "PDF",
    inForce: "hatályos",
    noPdf: "nincs közzétett PDF",
    related: "Kapcsolódó dokumentum",
    terms: "Általános Szerződési Feltételek",
    privacy: "Adatkezelési tájékoztató",
    print: "Nyomtatás",
  },
  en: {
    effectiveFrom: "Effective from",
    version: "Version",
    downloadPdf: "Download PDF",
    toc: "Contents",
    history: "Version history",
    historyIntro:
      "Earlier versions remain applicable to the contracts concluded while they were in force. The PDFs are available unchanged at permanent addresses.",
    historyVersion: "Version",
    historyEffective: "Effective from",
    historyUntil: "Superseded on",
    historyPdf: "PDF",
    inForce: "in force",
    noPdf: "no published PDF",
    related: "Related document",
    terms: "General Terms and Conditions",
    privacy: "Privacy Notice",
    print: "Print",
  },
} as const;

/** `**félkövér**` és `[szöveg](url)` feloldása. */
function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const pattern = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)]+)\)/g;
  let lastIndex = 0;
  let index = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    if (match[1] !== undefined) {
      nodes.push(
        <strong key={`${keyPrefix}-b${index}`} className="font-semibold text-[color:var(--foreground)]">
          {match[1]}
        </strong>,
      );
    } else {
      nodes.push(
        <a
          key={`${keyPrefix}-a${index}`}
          href={match[3]}
          className="font-medium text-[color:var(--primary)] underline-offset-2 hover:underline"
        >
          {match[2]}
        </a>,
      );
    }
    lastIndex = pattern.lastIndex;
    index += 1;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }
  return nodes;
}

function Block({ block, keyPrefix }: { block: LegalBlock; keyPrefix: string }) {
  switch (block.kind) {
    case "h3":
      return (
        <h3 className="mt-5 mb-2 text-base font-semibold text-[color:var(--foreground)] md:text-lg">
          {renderInline(block.text, keyPrefix)}
        </h3>
      );

    case "p":
      return <p className="mb-3 last:mb-0">{renderInline(block.text, keyPrefix)}</p>;

    case "ul":
      return (
        <ul className="mb-3 ml-5 list-disc space-y-1.5 last:mb-0">
          {block.items.map((item, i) => (
            <li key={`${keyPrefix}-li${i}`}>{renderInline(item, `${keyPrefix}-li${i}`)}</li>
          ))}
        </ul>
      );

    case "lettered":
      return (
        <ol className="mb-3 ml-1 space-y-1.5 last:mb-0">
          {block.items.map((item, i) => (
            <li key={`${keyPrefix}-lt${i}`} className="flex gap-2">
              <span className="shrink-0 font-medium text-[color:var(--foreground)]">
                {LETTERS[i] ?? String(i + 1)})
              </span>
              <span>{renderInline(item, `${keyPrefix}-lt${i}`)}</span>
            </li>
          ))}
        </ol>
      );

    case "note":
      return (
        <div className="mb-3 rounded-xl border border-[color:var(--primary)]/30 bg-[color:var(--primary)]/5 p-4 last:mb-0">
          <p className="text-[color:var(--foreground)]">{renderInline(block.text, keyPrefix)}</p>
        </div>
      );

    case "table":
      return (
        <div className="mb-4 overflow-x-auto last:mb-0">
          <table className="w-full min-w-[32rem] border-collapse text-left text-xs md:text-sm">
            <thead>
              <tr className="border-b border-[color:var(--border)]">
                {block.head.map((cell, i) => (
                  <th
                    key={`${keyPrefix}-th${i}`}
                    scope="col"
                    className="px-3 py-2 font-semibold text-[color:var(--foreground)]"
                  >
                    {renderInline(cell, `${keyPrefix}-th${i}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, r) => (
                <tr key={`${keyPrefix}-tr${r}`} className="border-b border-[color:var(--border)]/60 align-top">
                  {row.map((cell, c) => (
                    <td key={`${keyPrefix}-td${r}-${c}`} className="px-3 py-2">
                      {renderInline(cell, `${keyPrefix}-td${r}-${c}`)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
  }
}

export function LegalDocumentPage({
  kind,
  content,
}: {
  kind: LegalDocumentKind;
  content: LegalDocumentContent;
}) {
  const { language } = content;
  const t = UI[language];
  const meta = LEGAL_DOCUMENTS[kind];
  const current = currentLegalVersion(kind);
  const pdfUrl = legalPdfUrl(current, language);

  const relatedKind: LegalDocumentKind = kind === "terms" ? "privacy" : "terms";
  const relatedLabel = relatedKind === "terms" ? t.terms : t.privacy;
  const relatedHref = LEGAL_DOCUMENTS[relatedKind].path[language];

  return (
    <main className="flex min-h-screen w-full flex-col bg-[color:var(--background)] text-[color:var(--foreground)]">
      <Header />

      <section className="w-full border-b border-[color:var(--border)] bg-[color:var(--muted)]/60 pt-24 pb-10 md:pt-32 md:pb-14">
        <div className="mx-auto flex max-w-5xl flex-col gap-5 px-4 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">{content.title}</h1>
            <p className="mt-2 text-sm font-medium text-[color:var(--primary)] md:text-base">
              {content.subtitle}
            </p>
            <p className="mt-4 max-w-3xl text-sm text-[color:var(--muted-foreground)] md:text-base">
              {content.lead}
            </p>
          </div>

          <div className="flex flex-col gap-4 rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-4 sm:flex-row sm:items-center sm:justify-between md:p-5">
            <dl className="flex flex-wrap gap-x-8 gap-y-2 text-xs md:text-sm">
              <div>
                <dt className="text-[color:var(--muted-foreground)]">{t.effectiveFrom}</dt>
                <dd className="font-semibold">{formatLegalDate(current.effectiveFrom, language)}</dd>
              </div>
              <div>
                <dt className="text-[color:var(--muted-foreground)]">{t.version}</dt>
                <dd className="font-semibold">{current.version}</dd>
              </div>
            </dl>

            {pdfUrl ? (
              <a
                href={pdfUrl}
                download
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[color:var(--primary)] px-4 py-2.5 text-sm font-semibold text-[color:var(--primary-foreground)] transition hover:opacity-90 print:hidden"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                {t.downloadPdf}
              </a>
            ) : null}
          </div>

          {content.translationNotice ? (
            <p className="text-xs text-[color:var(--muted-foreground)] md:text-sm">
              {content.translationNotice}
            </p>
          ) : null}
        </div>
      </section>

      <section className="py-10 md:py-16">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-10 px-4 sm:px-6 lg:grid-cols-[minmax(0,1.8fr)_minmax(0,1fr)] lg:gap-12 lg:px-8">
          <article className="space-y-9 text-sm leading-relaxed text-[color:var(--muted-foreground)] md:text-base">
            {content.sections.map((section) => (
              <section key={section.id} id={section.id} className="scroll-mt-28">
                <h2 className="mb-3 text-xl font-bold text-[color:var(--foreground)] md:text-2xl">
                  {section.number ? `${section.number} ` : ""}
                  {section.title}
                </h2>
                {section.blocks.map((block, i) => (
                  <Block key={`${section.id}-${i}`} block={block} keyPrefix={`${section.id}-${i}`} />
                ))}
              </section>
            ))}

            {content.closing.length > 0 ? (
              <div className="border-t border-[color:var(--border)] pt-6 text-[color:var(--foreground)]">
                {content.closing.map((line, i) => (
                  <p key={`closing-${i}`} className="font-medium">
                    {line}
                  </p>
                ))}
              </div>
            ) : null}

            {/* Verziótörténet – ez igazolja, hogy egy adott szerződéskötés idején
                melyik szövegváltozat volt hatályban. */}
            <section id="verziotortenet" className="scroll-mt-28 border-t border-[color:var(--border)] pt-8">
              <h2 className="mb-2 text-xl font-bold text-[color:var(--foreground)] md:text-2xl">
                {t.history}
              </h2>
              <p className="mb-4 text-xs md:text-sm">{t.historyIntro}</p>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[30rem] border-collapse text-left text-xs md:text-sm">
                  <thead>
                    <tr className="border-b border-[color:var(--border)]">
                      <th scope="col" className="px-3 py-2 font-semibold text-[color:var(--foreground)]">
                        {t.historyVersion}
                      </th>
                      <th scope="col" className="px-3 py-2 font-semibold text-[color:var(--foreground)]">
                        {t.historyEffective}
                      </th>
                      <th scope="col" className="px-3 py-2 font-semibold text-[color:var(--foreground)]">
                        {t.historyUntil}
                      </th>
                      <th scope="col" className="px-3 py-2 font-semibold text-[color:var(--foreground)]">
                        {t.historyPdf}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {meta.versions.map((version) => {
                      const url = legalPdfUrl(version, language);
                      return (
                        <tr
                          key={version.version}
                          className="border-b border-[color:var(--border)]/60 align-top"
                        >
                          <td className="px-3 py-2 font-medium text-[color:var(--foreground)]">
                            {version.version}
                          </td>
                          <td className="px-3 py-2">{formatLegalDate(version.effectiveFrom, language)}</td>
                          <td className="px-3 py-2">
                            {version.supersededOn
                              ? formatLegalDate(version.supersededOn, language)
                              : t.inForce}
                          </td>
                          <td className="px-3 py-2">
                            {url ? (
                              <a
                                href={url}
                                download
                                className="inline-flex items-center gap-1.5 font-medium text-[color:var(--primary)] hover:underline"
                              >
                                <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                                PDF
                              </a>
                            ) : (
                              <span className="text-[color:var(--muted-foreground)]">{t.noPdf}</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          </article>

          {/* Tartalomjegyzék */}
          <aside className="order-first lg:order-last lg:sticky lg:top-28 lg:self-start print:hidden">
            <nav
              aria-label={t.toc}
              className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-4 md:p-5"
            >
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[color:var(--muted-foreground)]">
                {t.toc}
              </p>
              <ol className="space-y-1.5 text-xs md:text-sm">
                {content.sections.map((section) => (
                  <li key={`toc-${section.id}`}>
                    <a
                      href={`#${section.id}`}
                      className="block rounded-lg px-2 py-1 text-[color:var(--muted-foreground)] transition hover:bg-[color:var(--muted)] hover:text-[color:var(--foreground)]"
                    >
                      {section.number ? `${section.number} ` : ""}
                      {section.title}
                    </a>
                  </li>
                ))}
                <li>
                  <a
                    href="#verziotortenet"
                    className="block rounded-lg px-2 py-1 text-[color:var(--muted-foreground)] transition hover:bg-[color:var(--muted)] hover:text-[color:var(--foreground)]"
                  >
                    {t.history}
                  </a>
                </li>
              </ol>

              <div className="mt-4 border-t border-[color:var(--border)] pt-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[color:var(--muted-foreground)]">
                  {t.related}
                </p>
                <Link
                  href={relatedHref}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-[color:var(--primary)] hover:underline md:text-sm"
                >
                  <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                  {relatedLabel}
                </Link>
              </div>
            </nav>
          </aside>
        </div>
      </section>

      <Footer />
    </main>
  );
}
