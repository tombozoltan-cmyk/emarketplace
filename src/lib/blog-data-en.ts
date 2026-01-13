export interface BlogPostEn {
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  date: string;
  category: string;
  readingTime: number;
  content: string;
}

export const blogPostsEn: BlogPostEn[] = [
  {
    slug: "pmt-changes-2025",
    title:
      "AML (PMT) changes in 2025 – what do they mean for registered office providers?",
    excerpt:
      "A practical overview of the most important 2025 anti‑money laundering changes and how they affect registered office services in Hungary.",
    image: "/placeholder.svg",
    date: "Jan 15, 2025",
    category: "Law & Compliance",
    readingTime: 8,
    content: `
<h2>What is the AML (PMT) Act?</h2>
<p>The <strong>anti‑money laundering (AML) act</strong> sets rules to prevent financial crime. The 2025 updates introduce stricter client due diligence requirements and clearer rules for digital onboarding.</p>

<h2>Key changes in 2025</h2>
<ul>
  <li><strong>Enhanced client due diligence</strong> with more detailed identification and risk classification.</li>
  <li><strong>Digital identification</strong> and electronic signatures become more widely accepted.</li>
  <li><strong>Longer retention</strong> obligations for documentation in line with regulatory expectations.</li>
</ul>

<h2>What this means for entrepreneurs</h2>
<p>Expect more documentation requests during onboarding, but also smoother online contracting and faster administration.</p>

<p>If you want a PMT‑compliant registered office service in Budapest, contact us for a quote.</p>
`,
  },
  {
    slug: "registered-office-for-foreign-companies",
    title: "Registered office in Hungary for foreign companies – key rules",
    excerpt:
      "A step‑by‑step guide for foreign founders who need a Hungarian business address, service address and English documentation.",
    image: "/placeholder.svg",
    date: "Jan 10, 2025",
    category: "International",
    readingTime: 7,
    content: `
<h2>Why Hungary?</h2>
<p>Hungary offers an EU location with competitive operating costs. To register a company you need an official registered office address and, in many cases, a service address / delivery agent.</p>

<h2>What you need</h2>
<ul>
  <li>Registered office address in Hungary</li>
  <li>Mail handling and scanning</li>
  <li>English documentation (if required by partners/banks)</li>
</ul>

<p>We help foreign clients with registered office service in downtown Budapest.</p>
`,
  },
  {
    slug: "registered-office-vs-home-address",
    title: "Registered office vs. home address – why use a professional service?",
    excerpt:
      "Privacy, credibility and compliance: the practical reasons founders choose a professional registered office instead of their home address.",
    image: "/placeholder.svg",
    date: "Jan 5, 2025",
    category: "Tips",
    readingTime: 6,
    content: `
<h2>Privacy and administration</h2>
<p>Using your home address can create privacy risks and administrative burden. A registered office provider receives official mail, scans documents and helps you stay organized.</p>

<h2>Credibility</h2>
<p>A central Budapest address can improve trust with partners, banks and clients.</p>
`,
  },
];
