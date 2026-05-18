import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { onRequest } from "firebase-functions/v2/https";
import { defineSecret, defineString } from "firebase-functions/params";
import admin from "firebase-admin";
import Busboy from "busboy";
import { v4 as uuidv4 } from "uuid";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const PizZip = require("pizzip");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Docxtemplater = require("docxtemplater");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const archiver = require("archiver");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { PDFDocument } = require("pdf-lib");

type MjmlCompileError = {
  formattedMessage?: string;
  message?: string;
};

type MjmlCompileResult = {
  html: string;
  errors?: MjmlCompileError[];
};

type Mjml2Html = (
  input: string,
  options?: {
    validationLevel?: "soft" | "strict" | "skip";
    keepComments?: boolean;
  },
) => MjmlCompileResult;

// mjml package doesn't ship with TS types; use a typed require wrapper.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const mjml2html = require("mjml") as Mjml2Html;

admin.initializeApp();

const brevoApiKey = defineSecret("BREVO_API_KEY");
const brevoToEmail = defineString("BREVO_TO_EMAIL", {
  default: "emarketplacekft@gmail.com",
});
const brevoSenderEmail = defineString("BREVO_SENDER_EMAIL", {
  default: "no-reply@e-marketplace.hu",
});
const brevoSenderName = defineString("BREVO_SENDER_NAME", {
  default: "E-Marketplace",
});
const brevoSubjectPrefix = defineString("BREVO_SUBJECT_PREFIX", {
  default: "[E-Marketplace]",
});
const brevoReplyToEmail = defineString("BREVO_REPLY_TO_EMAIL", {
  default: "emarketplacekft@gmail.com",
});
const brevoReplyToName = defineString("BREVO_REPLY_TO_NAME", {
  default: "E-Marketplace",
});

const adminEmailsParam = defineString("ADMIN_EMAILS", {
  default: "emarketplacekft@gmail.com",
});

// Company logo URL for email templates
const LOGO_URL = "https://firebasestorage.googleapis.com/v0/b/emarketplace-8aab1.firebasestorage.app/o/image%2FPlexi-tabla-86x53-E-marketplace_logo-2.png?alt=media&token=b1684b4b-932d-4f6d-ba90-d860aa24a98e";

type EmailTemplate = {
  subject: string;
  html: string;
};

type AdminEmailTemplate = {
  subject: string;
  mjml: string;
};

type EmailSettingsDoc = {
  adminToEmail?: string;
  adminSubjectPrefix?: string;
  senderName?: string;
  replyToEmail?: string;
  replyToName?: string;
  adminTemplate?: AdminEmailTemplate;
  customerAutoReplyEnabled?: boolean;
  customerTemplateHu?: EmailTemplate;
  contractAutoReplyEnabled?: boolean;
  contractTemplateHu?: EmailTemplate;
};

type EffectiveEmailSettings = {
  adminToEmail: string;
  adminSubjectPrefix: string;
  senderName: string;
  replyToEmail: string;
  replyToName: string;
  adminTemplate: AdminEmailTemplate | null;
  customerAutoReplyEnabled: boolean;
  customerTemplateHu: EmailTemplate;
  contractAutoReplyEnabled: boolean;
  contractTemplateHu: EmailTemplate;
};

const parseAdminEmails = (raw: string): string[] => {
  const parsed = raw
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
  return Array.from(new Set(parsed));
};

type InquiryData = {
  createdAt?: unknown;
  language?: string;
  sourcePath?: string | null;
  status?: string;
  type?: string;
  selectedPackage?: string;
  companyType?: string;
  companyName?: string;
  taxNumber?: string;
  name?: string;
  email?: string;
  phone?: string;
  country?: string;
  address?: string;
  message?: string;
  service?: string;
  site?: string;
};

type ContractOwnerData = {
  type?: string;
  ownershipPercent?: number;
  natural?: {
    fullName?: string;
    birthName?: string;
    nationality?: string;
    birthPlace?: string;
    birthDate?: string;
    motherName?: string;
    address?: string;
    idType?: string;
    idNumber?: string;
  };
  legal?: {
    companyName?: string;
    registrationNumber?: string;
    address?: string;
    representativeName?: string;
  };
};

type ContractData = {
  status?: string;
  language?: string;
  serviceType?: string;
  packageId?: string;
  monthlyPrice?: number;
  annualPrice?: number;
  company?: {
    isNew?: boolean;
    name?: string;
    shortName?: string;
    legalForm?: string;
    registrationNumber?: string;
    taxNumber?: string;
    currentAddress?: string;
    mainActivity?: string;
    mainActivityCode?: string;
  };
  owners?: ContractOwnerData[];
  representative?: {
    fullName?: string;
    birthName?: string;
    nationality?: string;
    birthPlace?: string;
    birthDate?: string;
    motherName?: string;
    address?: string;
    idType?: string;
    idNumber?: string;
    position?: string;
    isForeign?: boolean;
  };
  contact?: {
    isSameAsOwner?: boolean;
    fullName?: string;
    email?: string;
    emailConfirm?: string;
    phone?: string;
    address?: string;
  };
  pepDeclaration?: {
    isPep?: boolean;
    isPepRelative?: boolean;
    isPepAssociate?: boolean;
    pepDetails?: string;
  };
  uploadedDocuments?: Record<string, string>;
  generatedDocuments?: Record<string, string>;
  createdAt?: unknown;
  updatedAt?: unknown;
};

const safeString = (value: unknown): string =>
  typeof value === "string" ? value.trim() : "";

const safeBool = (value: unknown): boolean => Boolean(value);

const escapeHtml = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
};

const buildHtml = (data: InquiryData): string => {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.5">
      <h2>Új érdeklődés</h2>
      <p><strong>Típus:</strong> ${escapeHtml(data.type)}</p>
      <p><strong>Név:</strong> ${escapeHtml(data.name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(data.email)}</p>
      <p><strong>Telefon:</strong> ${escapeHtml(data.phone)}</p>
      <p><strong>Szolgáltatás:</strong> ${escapeHtml(data.service)}</p>
      <p><strong>Csomag:</strong> ${escapeHtml(data.selectedPackage)}</p>
      <p><strong>Üzenet:</strong><br />${escapeHtml(data.message).replaceAll("\n", "<br />")}</p>
      <hr />
      <p><strong>Site:</strong> ${escapeHtml(data.site)}</p>
      <p><strong>Forrás útvonal:</strong> ${escapeHtml(data.sourcePath)}</p>
      <p><strong>Nyelv:</strong> ${escapeHtml(data.language)}</p>
    </div>
  `;
};

const buildContractHtml = (data: ContractData): string => {
  const company = data.company ?? {};
  const contact = data.contact ?? {};
  const representative = data.representative ?? {};
  const owners = data.owners ?? [];
  const pep = data.pepDeclaration ?? {};

  // Build owners section
  let ownersHtml = "";
  if (owners.length > 0) {
    ownersHtml = owners.map((owner, idx) => {
      const isNatural = owner.type === "natural";
      const ownerTypeLabel = isNatural ? "Természetes személy" : "Jogi személy";

      let ownerName = "";
      let details = "";

      if (isNatural && owner.natural) {
        const natural = owner.natural;
        ownerName = natural.fullName ?? "";
        details = `<p style="margin: 4px 0; padding-left: 16px;">• Születési hely/idő: ${escapeHtml(natural.birthPlace)} / ${escapeHtml(natural.birthDate)}</p>
           <p style="margin: 4px 0; padding-left: 16px;">• Anyja neve: ${escapeHtml(natural.motherName)}</p>
           <p style="margin: 4px 0; padding-left: 16px;">• Lakcím: ${escapeHtml(natural.address)}</p>
           <p style="margin: 4px 0; padding-left: 16px;">• Okmány: ${escapeHtml(natural.idType)} ${escapeHtml(natural.idNumber)}</p>`;
      } else if (!isNatural && owner.legal) {
        const legal = owner.legal;
        ownerName = legal.companyName ?? "";
        details = `<p style="margin: 4px 0; padding-left: 16px;">• Cégjegyzékszám: ${escapeHtml(legal.registrationNumber)}</p>
           <p style="margin: 4px 0; padding-left: 16px;">• Székhely: ${escapeHtml(legal.address)}</p>
           <p style="margin: 4px 0; padding-left: 16px;">• Képviselő: ${escapeHtml(legal.representativeName)}</p>`;
      }

      return `
        <div style="margin: 8px 0; padding: 12px; background: #f4f4f5; border-radius: 8px;">
          <p style="margin: 0 0 8px 0;"><strong>Tulajdonos #${idx + 1}:</strong> ${escapeHtml(ownerName)} (${ownerTypeLabel})</p>
          <p style="margin: 4px 0; padding-left: 16px;">• Tulajdoni hányad: ${owner.ownershipPercent}%</p>
          ${details}
        </div>
      `;
    }).join("");
  }

  // PEP status
  let pepHtml = "<p><strong>PEP státusz:</strong> Nem</p>";
  if (pep.isPep || pep.isPepRelative || pep.isPepAssociate) {
    const pepTypes = [];
    if (pep.isPep) pepTypes.push("Közszereplő");
    if (pep.isPepRelative) pepTypes.push("Közszereplő hozzátartozója");
    if (pep.isPepAssociate) pepTypes.push("Közszereplő kapcsolt személye");
    pepHtml = `<p><strong>PEP státusz:</strong> ${pepTypes.join(", ")}</p>
               <p><strong>PEP részletek:</strong><br/>${escapeHtml(pep.pepDetails).replaceAll("\n", "<br/>")}</p>`;
  }

  const companyTypeLabel = company.isNew ? "Új cég alapítása" : "Meglévő cég székhelyének áthelyezése";
  const serviceTypeMap: Record<string, string> = {
    "szekhely-hu": "Magyarországi székhelyszolgáltatás",
    "szekhely-de": "Németországi székhelyszolgáltatás",
    "virtual-de": "Virtuális iroda Németországban"
  };

  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.5">
      <h2 style="color: #18181b; border-bottom: 2px solid #e4e4e7; padding-bottom: 12px;">Új szerződés beadvány</h2>

      <h3 style="color: #3f3f46; margin-top: 24px;">Cég adatai</h3>
      <p><strong>Cég neve:</strong> ${escapeHtml(company.name)}</p>
      <p><strong>Rövidített név:</strong> ${escapeHtml(company.shortName)}</p>
      <p><strong>Jogi forma:</strong> ${escapeHtml(company.legalForm)}</p>
      <p><strong>Cég típusa:</strong> ${companyTypeLabel}</p>
      ${!company.isNew ? `<p><strong>Cégjegyzékszám:</strong> ${escapeHtml(company.registrationNumber)}</p>
                         <p><strong>Adószám:</strong> ${escapeHtml(company.taxNumber)}</p>
                         <p><strong>Jelenlegi cím:</strong> ${escapeHtml(company.currentAddress)}</p>` : ""}
      <p><strong>Főtevékenység:</strong> ${escapeHtml(company.mainActivityCode)} ${escapeHtml(company.mainActivity)}</p>

      <h3 style="color: #3f3f46; margin-top: 24px;">Szolgáltatás</h3>
      <p><strong>Típus:</strong> ${serviceTypeMap[data.serviceType ?? ""] || escapeHtml(data.serviceType)}</p>
      <p><strong>Csomag:</strong> ${escapeHtml(data.packageId)}</p>
      <p><strong>Havi díj:</strong> ${data.monthlyPrice?.toLocaleString("hu-HU")} Ft</p>
      <p><strong>Éves díj:</strong> ${data.annualPrice?.toLocaleString("hu-HU")} Ft</p>

      <h3 style="color: #3f3f46; margin-top: 24px;">Kapcsolattartó</h3>
      <p><strong>Név:</strong> ${escapeHtml(contact.fullName)}</p>
      <p><strong>Email:</strong> ${escapeHtml(contact.email)}</p>
      <p><strong>Telefon:</strong> ${escapeHtml(contact.phone)}</p>
      ${!contact.isSameAsOwner ? `<p><strong>Cím:</strong> ${escapeHtml(contact.address)}</p>` : "<p><strong>Cím:</strong> Megegyezik a tulajdonos címével</p>"}

      <h3 style="color: #3f3f46; margin-top: 24px;">Képviselő</h3>
      <p><strong>Név:</strong> ${escapeHtml(representative.fullName)}</p>
      <p><strong>Születési hely/idő:</strong> ${escapeHtml(representative.birthPlace)} / ${escapeHtml(representative.birthDate)}</p>
      <p><strong>Anyja neve:</strong> ${escapeHtml(representative.motherName)}</p>
      <p><strong>Lakcím:</strong> ${escapeHtml(representative.address)}</p>
      <p><strong>Beosztás:</strong> ${escapeHtml(representative.position)}</p>
      <p><strong>Okmány:</strong> ${escapeHtml(representative.idType)} ${escapeHtml(representative.idNumber)}</p>

      <h3 style="color: #3f3f46; margin-top: 24px;">Tulajdonosok (${owners.length} fő)</h3>
      ${ownersHtml || "<p>Nincs megadva tulajdonos</p>"}

      <h3 style="color: #3f3f46; margin-top: 24px;">Egyéb</h3>
      ${pepHtml}

      <hr style="margin-top: 24px; border-color: #e4e4e7;" />
      <p style="color: #71717a; font-size: 14px;">
        <strong>Nyelv:</strong> ${data.language === "hu" ? "Magyar" : "Anglish"}<br/>
        <strong>Státusz:</strong> ${data.status}<br/>
        <strong>Beadvány azonosító:</strong> ${data.createdAt ? new Date().toISOString() : "N/A"}
      </p>
    </div>
  `;
};

const normalizeAdminTemplate = (raw: unknown): AdminEmailTemplate | null => {
  const obj = (raw ?? {}) as Record<string, unknown>;
  const subject = safeString(obj.subject);
  const mjml = safeString(obj.mjml);
  if (!subject && !mjml) return null;
  return {
    subject,
    mjml,
  };
};

const normalizeTemplate = (raw: unknown, fallback: EmailTemplate): EmailTemplate => {
  const obj = (raw ?? {}) as Record<string, unknown>;
  return {
    subject: safeString(obj.subject) || fallback.subject,
    html: safeString(obj.html) || fallback.html,
  };
};

const normalizeMjmlTemplate = (raw: unknown, fallback: EmailTemplate): EmailTemplate => {
  const obj = (raw ?? {}) as Record<string, unknown>;
  const subject = safeString(obj.subject) || fallback.subject;
  const mjml = safeString(obj.mjml);
  const html = mjml || safeString(obj.html) || fallback.html;
  return { subject, html };
};

const getEffectiveEmailSettings = async (
  db: FirebaseFirestore.Firestore,
): Promise<EffectiveEmailSettings> => {
  const fallback: EffectiveEmailSettings = {
    adminToEmail: brevoToEmail.value(),
    adminSubjectPrefix: brevoSubjectPrefix.value(),
    senderName: brevoSenderName.value(),
    replyToEmail: brevoReplyToEmail.value(),
    replyToName: brevoReplyToName.value(),
    adminTemplate: null,
    customerAutoReplyEnabled: false,
    customerTemplateHu: {
      subject: "Köszönjük megkeresését!",
      html: `<mjml>
  <mj-body background-color="#f4f4f5">
    <mj-section padding="40px 20px">
      <mj-column background-color="#ffffff" border-radius="12px" padding="32px">
        <mj-image src="${LOGO_URL}" alt="E-Marketplace" width="120px" align="center" padding-bottom="24px" />
        <mj-text font-size="24px" font-weight="700" color="#18181b" align="center" padding-bottom="16px">
          Köszönjük megkeresését!
        </mj-text>
        <mj-divider border-color="#e4e4e7" border-width="1px" padding="0 0 24px 0" />
        <mj-text font-size="16px" color="#3f3f46" line-height="1.6">
          Kedves {{name}}!
        </mj-text>
        <mj-text font-size="16px" color="#3f3f46" line-height="1.6">
          Köszönjük megkeresését! Munkatársunk hamarosan felveszi Önnel a kapcsolatot.
        </mj-text>
        <mj-divider border-color="#e4e4e7" border-width="1px" padding="24px 0 16px 0" />
        <mj-text font-size="14px" color="#a1a1aa" align="center">
          E-Marketplace • Székhelyszolgáltatás
        </mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>`,
    },
    contractAutoReplyEnabled: false,
    contractTemplateHu: {
      subject: "Szerződés beadvány visszaigazolás",
      html: `<mjml>
  <mj-body background-color="#f4f4f5">
    <mj-section padding="40px 20px">
      <mj-column background-color="#ffffff" border-radius="12px" padding="32px">
        <mj-image src="${LOGO_URL}" alt="E-Marketplace" width="120px" align="center" padding-bottom="24px" />
        <mj-text font-size="24px" font-weight="700" color="#18181b" align="center" padding-bottom="16px">
          Köszönjük beadványát!
        </mj-text>
        <mj-divider border-color="#e4e4e7" border-width="1px" padding="0 0 24px 0" />
        <mj-text font-size="16px" color="#3f3f46" line-height="1.6">
          Kedves {{name}}!
        </mj-text>
        <mj-text font-size="16px" color="#3f3f46" line-height="1.6">
          Köszönjük, hogy kitöltötte szerződés beadványát. Cége: <strong>{{companyName}}</strong>
        </mj-text>
        <mj-text font-size="16px" color="#3f3f46" line-height="1.6">
          Szolgáltatás: {{serviceType}} ({{packageId}})
        </mj-text>
        <mj-text font-size="16px" color="#3f3f46" line-height="1.6">
          Munkatársunk hamarosan felveszi Önnel a kapcsolatot a részletekkel kapcsolatban.
        </mj-text>
        <mj-divider border-color="#e4e4e7" border-width="1px" padding="24px 0 16px 0" />
        <mj-text font-size="14px" color="#a1a1aa" align="center">
          E-Marketplace • Székhelyszolgáltatás
        </mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>`,
    },
  };

  try {
    const ref = db.collection("emailSettings").doc("global");
    const snap = await ref.get();
    const raw = (snap.exists ? (snap.data() as EmailSettingsDoc) : null) ?? {};

    return {
      adminToEmail: safeString(raw.adminToEmail) || fallback.adminToEmail,
      adminSubjectPrefix: safeString(raw.adminSubjectPrefix) || fallback.adminSubjectPrefix,
      senderName: safeString(raw.senderName) || fallback.senderName,
      replyToEmail: safeString(raw.replyToEmail) || fallback.replyToEmail,
      replyToName: safeString(raw.replyToName) || fallback.replyToName,
      adminTemplate: normalizeAdminTemplate(raw.adminTemplate),
      customerAutoReplyEnabled: safeBool(raw.customerAutoReplyEnabled),
      customerTemplateHu: normalizeMjmlTemplate(raw.customerTemplateHu, fallback.customerTemplateHu),
      contractAutoReplyEnabled: safeBool(raw.contractAutoReplyEnabled),
      contractTemplateHu: normalizeMjmlTemplate(raw.contractTemplateHu, fallback.contractTemplateHu),
    };
  } catch {
    return fallback;
  }
};

const applyTemplate = (templateHtml: string, inquiry: InquiryData): string => {
  const variables: Record<string, string> = {
    name: escapeHtml(inquiry.name),
    email: escapeHtml(inquiry.email),
    phone: escapeHtml(inquiry.phone),
    type: escapeHtml(inquiry.type),
    message: escapeHtml(inquiry.message).replaceAll("\n", "<br />"),
    companyName: escapeHtml(inquiry.companyName),
    sourcePath: escapeHtml(inquiry.sourcePath),
    service: escapeHtml(inquiry.service),
    selectedPackage: escapeHtml(inquiry.selectedPackage),
    site: escapeHtml(inquiry.site),
  };

  return templateHtml.replace(/{{\s*(\w+)\s*}}/g, (_match, key: string) => {
    return variables[key] ?? "";
  });
};

const compileAdminMjmlTemplate = (
  template: AdminEmailTemplate,
  inquiry: InquiryData,
): { subject: string; html: string } | null => {
  const rawMjml = safeString(template.mjml);
  if (!rawMjml) return null;

  const subject = applyTemplate(template.subject, inquiry);
  const mjmlWithVars = applyTemplate(rawMjml, inquiry);

  try {
    const result = mjml2html(mjmlWithVars, {
      validationLevel: "skip",
      keepComments: false,
    });

    if (!result.html) {
      console.warn("MJML admin compile returned empty HTML, using fallback");
      return null;
    }

    return { subject, html: result.html };
  } catch (err) {
    console.error("MJML admin compile error, using fallback:", err);
    return null;
  }
};

const compileCustomerMjmlTemplate = (
  template: EmailTemplate,
  inquiry: InquiryData,
): { subject: string; html: string } | null => {
  const rawMjml = safeString(template.html);
  if (!rawMjml || !rawMjml.includes("<mjml")) return null;

  const subject = applyTemplate(template.subject, inquiry);
  const mjmlWithVars = applyTemplate(rawMjml, inquiry);

  try {
    const result = mjml2html(mjmlWithVars, {
      validationLevel: "skip",
      keepComments: false,
    });

    if (!result.html) {
      console.warn("MJML customer compile returned empty HTML, using fallback");
      return null;
    }

    return { subject, html: result.html };
  } catch (err) {
    console.error("MJML customer compile error, using fallback:", err);
    return null;
  }
};

export const compileMjmlPreview = onRequest(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const authHeader = String(req.headers.authorization ?? "");
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    if (!token) {
      res.status(401).json({ error: "Missing Authorization Bearer token" });
      return;
    }

    const decoded = await admin.auth().verifyIdToken(token);
    const email = safeString((decoded as { email?: unknown }).email).toLowerCase();
    const adminEmails = parseAdminEmails(adminEmailsParam.value());

    if (!email || !adminEmails.includes(email)) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const body = (req.body ?? {}) as Record<string, unknown>;
    const mjml = safeString(body.mjml);
    const subject = safeString(body.subject);
    const variables = (body.variables ?? {}) as Record<string, unknown>;

    const templateApply = (input: string) =>
      input.replace(/{{\s*(\w+)\s*}}/g, (_match, key: string) => {
        const val = variables[key];
        return val === undefined || val === null ? "" : escapeHtml(val);
      });

    const mjmlWithVars = templateApply(mjml);
    const subjectWithVars = templateApply(subject);

    const result = mjml2html(mjmlWithVars, {
      validationLevel: "soft",
      keepComments: false,
    });

    const errors = (result.errors ?? []).map((e: MjmlCompileError) => e.formattedMessage ?? e.message);

    res.status(200).json({ html: result.html, subject: subjectWithVars, errors });
  } catch (error: unknown) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export const sendAdminInviteEmail = onRequest(
  { secrets: [brevoApiKey] },
  async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");

    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }

    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    try {
      const authHeader = String(req.headers.authorization ?? "");
      const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
      if (!token) {
        res.status(401).json({ error: "Missing Authorization Bearer token" });
        return;
      }

      const decoded = await admin.auth().verifyIdToken(token);
      const callerEmail = safeString((decoded as { email?: unknown }).email).toLowerCase();
      const adminEmails = parseAdminEmails(adminEmailsParam.value());

      if (!callerEmail || !adminEmails.includes(callerEmail)) {
        res.status(403).json({ error: "Forbidden" });
        return;
      }

      const body = (req.body ?? {}) as Record<string, unknown>;
      const inviteeEmail = safeString(body.email).toLowerCase();
      const inviteeName = safeString(body.name) || inviteeEmail.split("@")[0];
      const role = safeString(body.role) || "editor";
      const adminUrl = safeString(body.adminUrl) || "https://e-marketplace.hu/ops/nova";

      if (!inviteeEmail) {
        res.status(400).json({ error: "Missing email" });
        return;
      }

      const roleLabel = role === "admin" ? "Admin" : "Szerkesztő";
      const senderEmail = brevoSenderEmail.value();

      const mjmlTemplate = `
<mjml>
  <mj-body background-color="#f4f4f5">
    <mj-section padding="40px 20px">
      <mj-column background-color="#ffffff" border-radius="12px" padding="32px">
        <mj-image src="${LOGO_URL}" alt="E-Marketplace" width="120px" align="center" padding-bottom="24px" />
        <mj-text font-size="24px" font-weight="700" color="#18181b" align="center" padding-bottom="16px">
          Meghívó az Admin Felületre
        </mj-text>
        <mj-divider border-color="#e4e4e7" border-width="1px" padding="0 0 24px 0" />
        <mj-text font-size="16px" color="#3f3f46" line-height="1.6">
          Kedves ${escapeHtml(inviteeName)}!
        </mj-text>
        <mj-text font-size="16px" color="#3f3f46" line-height="1.6">
          Örömmel értesítünk, hogy hozzáférést kaptál az E-Marketplace admin felületéhez <strong>${roleLabel}</strong> jogosultsággal.
        </mj-text>
        <mj-text font-size="16px" color="#3f3f46" line-height="1.6">
          Az alábbi gombra kattintva tudsz bejelentkezni a Google fiókoddal (${escapeHtml(inviteeEmail)}):
        </mj-text>
        <mj-button background-color="#2563eb" color="#ffffff" font-size="16px" font-weight="600" border-radius="8px" padding="24px 0" href="${escapeHtml(adminUrl)}">
          Belépés az Admin Felületre
        </mj-button>
        <mj-text font-size="14px" color="#71717a" line-height="1.5" padding-top="16px">
          Ha a gomb nem működik, másold be ezt a linket a böngésződbe:<br/>
          <a href="${escapeHtml(adminUrl)}" style="color: #2563eb;">${escapeHtml(adminUrl)}</a>
        </mj-text>
        <mj-divider border-color="#e4e4e7" border-width="1px" padding="24px 0 16px 0" />
        <mj-text font-size="14px" color="#a1a1aa" align="center">
          E-Marketplace • Székhelyszolgáltatás
        </mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>`;

      const result = mjml2html(mjmlTemplate, {
        validationLevel: "skip",
        keepComments: false,
      });

      if (!result.html) {
        res.status(500).json({ error: "Failed to compile email template" });
        return;
      }

      const payload = {
        sender: {
          name: brevoSenderName.value(),
          email: senderEmail,
        },
        to: [{ email: inviteeEmail }],
        replyTo: {
          email: brevoReplyToEmail.value(),
          name: brevoReplyToName.value(),
        },
        subject: "Meghívó az E-Marketplace Admin Felületre",
        htmlContent: result.html,
        tags: ["admin_invite"],
      };

      const response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          "api-key": brevoApiKey.value(),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const responseText = await response.text().catch(() => "");
        throw new Error(`Brevo send failed: ${response.status} ${responseText}`);
      }

      res.status(200).json({ success: true });
    } catch (error: unknown) {
      console.error("sendAdminInviteEmail error:", error);
      res.status(500).json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
);

export const sendInquiryEmail = onDocumentCreated(
  {
    document: "inquiries/{inquiryId}",
    secrets: [brevoApiKey],
  },
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) return;

    const data = snapshot.data() as InquiryData;

    const db = admin.firestore();
    const logRef = db.collection("inquiryEmailNotifications").doc(snapshot.id);

    await db.runTransaction(async (tx) => {
      const logSnap = await tx.get(logRef);
      if (!logSnap.exists) {
        tx.create(logRef, {
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          site: data.site ?? null,
          type: data.type ?? null,
          admin: { status: "pending" },
          customer: { status: "pending" },
        });
      }
    });

    const settings = await getEffectiveEmailSettings(db);

    const logSnap = await logRef.get();
    const logData = (logSnap.data() ?? {}) as {
      admin?: { status?: string };
      customer?: { status?: string };
    };

    const senderEmail = brevoSenderEmail.value();
    const tags = ["emarketplace", data.site ?? ""].filter(Boolean);

    const adminStatus = safeString(logData.admin?.status) || "pending";
    if (adminStatus !== "sent") {
      const subjectBase = safeString(data.type) || "Új érdeklődés";
      const defaultSubject = `${settings.adminSubjectPrefix} ${subjectBase}`.trim();

      const mjmlCompiled = settings.adminTemplate
        ? compileAdminMjmlTemplate(settings.adminTemplate, data)
        : null;

      const subject = mjmlCompiled?.subject ? mjmlCompiled.subject : defaultSubject;
      const htmlContent = mjmlCompiled?.html ? mjmlCompiled.html : buildHtml(data);

      const payload = {
        sender: {
          name: settings.senderName,
          email: senderEmail,
        },
        to: [{ email: settings.adminToEmail }],
        replyTo: {
          email: settings.replyToEmail,
          name: settings.replyToName,
        },
        subject,
        htmlContent,
        tags,
      };

      try {
        const response = await fetch("https://api.brevo.com/v3/smtp/email", {
          method: "POST",
          headers: {
            accept: "application/json",
            "content-type": "application/json",
            "api-key": brevoApiKey.value(),
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const responseText = await response.text().catch(() => "");
          throw new Error(
            `Brevo admin send failed: ${response.status} ${response.statusText} ${responseText}`,
          );
        }

        await logRef.set(
          {
            admin: {
              sentAt: admin.firestore.FieldValue.serverTimestamp(),
              status: "sent",
            },
          },
          { merge: true },
        );
      } catch (error: unknown) {
        await logRef.set(
          {
            admin: {
              failedAt: admin.firestore.FieldValue.serverTimestamp(),
              status: "error",
              errorMessage: error instanceof Error ? error.message : "Unknown error",
            },
          },
          { merge: true },
        );
        throw error;
      }
    }

    const customerStatus = safeString(logData.customer?.status) || "pending";
    const customerEnabled = settings.customerAutoReplyEnabled;
    const customerEmail = safeString(data.email);

    if (customerEnabled && customerEmail && customerStatus !== "sent") {
      const tpl = settings.customerTemplateHu;
      const mjmlCompiled = compileCustomerMjmlTemplate(tpl, data);
      const html = mjmlCompiled?.html ? mjmlCompiled.html : applyTemplate(tpl.html, data);
      const subject = mjmlCompiled?.subject ? mjmlCompiled.subject : applyTemplate(tpl.subject, data);

      const payload = {
        sender: {
          name: settings.senderName,
          email: senderEmail,
        },
        to: [{ email: customerEmail }],
        replyTo: {
          email: settings.replyToEmail,
          name: settings.replyToName,
        },
        subject,
        htmlContent: html,
        tags: [...tags, "customer_autoreply"],
      };

      try {
        const response = await fetch("https://api.brevo.com/v3/smtp/email", {
          method: "POST",
          headers: {
            accept: "application/json",
            "content-type": "application/json",
            "api-key": brevoApiKey.value(),
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const responseText = await response.text().catch(() => "");
          throw new Error(
            `Brevo customer send failed: ${response.status} ${response.statusText} ${responseText}`,
          );
        }

        await logRef.set(
          {
            customer: {
              sentAt: admin.firestore.FieldValue.serverTimestamp(),
              status: "sent",
            },
          },
          { merge: true },
        );
      } catch (error: unknown) {
        await logRef.set(
          {
            customer: {
              failedAt: admin.firestore.FieldValue.serverTimestamp(),
              status: "error",
              errorMessage: error instanceof Error ? error.message : "Unknown error",
            },
          },
          { merge: true },
        );
        throw error;
      }
    }
  },
);

export const sendContractEmail = onDocumentCreated(
  {
    document: "contracts/{contractId}",
    secrets: [brevoApiKey],
  },
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) return;

    const data = snapshot.data() as ContractData;

    const db = admin.firestore();
    const logRef = db.collection("contractEmailNotifications").doc(snapshot.id);

    await db.runTransaction(async (tx) => {
      const logSnap = await tx.get(logRef);
      if (!logSnap.exists) {
        tx.create(logRef, {
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          serviceType: data.serviceType ?? null,
          companyName: data.company?.name ?? null,
          admin: { status: "pending" },
          customer: { status: "pending" },
        });
      }
    });

    const settings = await getEffectiveEmailSettings(db);

    const logSnap = await logRef.get();
    const logData = (logSnap.data() ?? {}) as {
      admin?: { status?: string };
      customer?: { status?: string };
    };

    const senderEmail = brevoSenderEmail.value();
    const tags = ["emarketplace", "contract"];

    // Admin email
    const adminStatus = safeString(logData.admin?.status) || "pending";
    if (adminStatus !== "sent") {
      const companyName = safeString(data.company?.name);
      const defaultSubject = `${settings.adminSubjectPrefix} Új szerződés beadvány - ${companyName}`.trim();

      const htmlContent = buildContractHtml(data);

      const payload = {
        sender: {
          name: settings.senderName,
          email: senderEmail,
        },
        to: [{ email: settings.adminToEmail }],
        replyTo: {
          email: settings.replyToEmail,
          name: settings.replyToName,
        },
        subject: defaultSubject,
        htmlContent,
        tags,
      };

      try {
        const response = await fetch("https://api.brevo.com/v3/smtp/email", {
          method: "POST",
          headers: {
            accept: "application/json",
            "content-type": "application/json",
            "api-key": brevoApiKey.value(),
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const responseText = await response.text().catch(() => "");
          throw new Error(
            `Brevo admin send failed: ${response.status} ${response.statusText} ${responseText}`,
          );
        }

        await logRef.set(
          {
            admin: {
              sentAt: admin.firestore.FieldValue.serverTimestamp(),
              status: "sent",
            },
          },
          { merge: true },
        );
      } catch (error: unknown) {
        await logRef.set(
          {
            admin: {
              failedAt: admin.firestore.FieldValue.serverTimestamp(),
              status: "error",
              errorMessage: error instanceof Error ? error.message : "Unknown error",
            },
          },
          { merge: true },
        );
        throw error;
      }
    }

    // Contract customer auto-reply email
    const customerStatus = safeString(logData.customer?.status) || "pending";
    const customerEnabled = settings.contractAutoReplyEnabled;
    const customerEmail = safeString(data.contact?.email);

    if (customerEnabled && customerEmail && customerStatus !== "sent") {
      const tpl = settings.contractTemplateHu;

      // Create contract-specific template variables with all available fields
      const serviceTypeMap: Record<string, string> = {
        "szekhely-hu": "Magyarországi székhelyszolgáltatás",
        "szekhely-de": "Németországi székhelyszolgáltatás",
        "virtual-de": "Virtuális iroda Németországban"
      };

      const isNewCompany = data.company?.isNew
        ? "Új cég alapítása"
        : "Meglévő cég székhelyének áthelyezése";

      const contractTemplateVars: Record<string, string> = {
        name: escapeHtml(data.contact?.fullName),
        email: escapeHtml(data.contact?.email),
        phone: escapeHtml(data.contact?.phone),
        companyName: escapeHtml(data.company?.name),
        shortName: escapeHtml(data.company?.shortName),
        legalForm: escapeHtml(data.company?.legalForm),
        serviceType: escapeHtml(serviceTypeMap[data.serviceType ?? ""] || data.serviceType),
        packageId: escapeHtml(data.packageId),
        monthlyPrice: data.monthlyPrice?.toLocaleString("hu-HU") ?? "",
        annualPrice: data.annualPrice?.toLocaleString("hu-HU") ?? "",
        mainActivity: escapeHtml(data.company?.mainActivity),
        isNewCompany: escapeHtml(isNewCompany),
      };

      // For contract emails, use a simple approach: if the template contains {{variable}}, replace it
      let html = tpl.html;
      let subject = tpl.subject;

      for (const [key, value] of Object.entries(contractTemplateVars)) {
        const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
        html = html.replace(regex, value);
        subject = subject.replace(regex, value);
      }

      // Check if template has MJML
      if (html.includes("<mjml")) {
        try {
          const result = mjml2html(html, {
            validationLevel: "skip",
            keepComments: false,
          });
          if (result.html) {
            html = result.html;
          }
        } catch (err) {
          console.error("MJML contract compile error:", err);
        }
      }

      const payload = {
        sender: {
          name: settings.senderName,
          email: senderEmail,
        },
        to: [{ email: customerEmail }],
        replyTo: {
          email: settings.replyToEmail,
          name: settings.replyToName,
        },
        subject: subject || "Szerződés beadvány visszaigazolás - E-Marketplace",
        htmlContent: html,
        tags: [...tags, "contract_autoreply"],
      };

      try {
        const response = await fetch("https://api.brevo.com/v3/smtp/email", {
          method: "POST",
          headers: {
            accept: "application/json",
            "content-type": "application/json",
            "api-key": brevoApiKey.value(),
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const responseText = await response.text().catch(() => "");
          throw new Error(
            `Brevo customer send failed: ${response.status} ${response.statusText} ${responseText}`,
          );
        }

        await logRef.set(
          {
            customer: {
              sentAt: admin.firestore.FieldValue.serverTimestamp(),
              status: "sent",
            },
          },
          { merge: true },
        );
      } catch (error: unknown) {
        await logRef.set(
          {
            customer: {
              failedAt: admin.firestore.FieldValue.serverTimestamp(),
              status: "error",
              errorMessage: error instanceof Error ? error.message : "Unknown error",
            },
          },
          { merge: true },
        );
        throw error;
      }
    }
  },
);

// ========================================
// DOCX Document Generation Functions
// ========================================

type DocxTemplateData = {
  id: string;
  name: string;
  description?: string;
  category: string;
  filename: string;
  storagePath: string;
  detectedShortcodes: string[];
  fileSize: number;
  createdAt: FirebaseFirestore.FieldValue;
  updatedAt: FirebaseFirestore.FieldValue;
};

type ShortcodeCategory = {
  name: string;
  shortcodes: {
    code: string;
    label: string;
    type: string;
  }[];
};

const SHORTCODE_CATEGORIES: ShortcodeCategory[] = [
  {
    name: "Cég adatok",
    shortcodes: [
      { code: "CEG_NEV", label: "Cégnév (teljes)", type: "text" },
      { code: "CEG_ROVID_NEV", label: "Rövidített név", type: "text" },
      { code: "CEG_FORMA", label: "Cégforma", type: "text" },
      { code: "CEGJEGYZEKSZAM", label: "Cégjegyzékszám", type: "text" },
      { code: "ADOSZAM", label: "Adószám", type: "text" },
      { code: "FOTEV", label: "Főtevékenység", type: "text" },
      { code: "SZEKHELY", label: "Székhely címe", type: "text" },
    ],
  },
  {
    name: "1. Tulajdonos (természetes)",
    shortcodes: [
      { code: "TULAJDONOS_1_NEV", label: "Teljes név", type: "text" },
      { code: "TULAJDONOS_1_SZUL_NEV", label: "Születési név", type: "text" },
      { code: "TULAJDONOS_1_SZUL_HELY", label: "Születési hely", type: "text" },
      { code: "TULAJDONOS_1_SZUL_DATUM", label: "Születési dátum", type: "date" },
      { code: "TULAJDONOS_1_SZUL_HELY_IDO", label: "Születési hely, idő (kombinált)", type: "text" },
      { code: "TULAJDONOS_1_ANYJA_NEVE", label: "Anyja neve", type: "text" },
      { code: "TULAJDONOS_1_LAKCIM", label: "Lakcím", type: "text" },
      { code: "TULAJDONOS_1_OKMANY_TIPUS", label: "Okmány típusa", type: "text" },
      { code: "TULAJDONOS_1_OKMANY_SZAM", label: "Okmány száma", type: "text" },
      { code: "TULAJDONOS_1_ALLAMPOLGARSAG", label: "Állampolgárság", type: "text" },
      { code: "TULAJDONOS_1_ARANY", label: "Tulajdoni arány (%)", type: "text" },
      { code: "TULAJDONOS_1_TIPUS", label: "Típus (természetes/jogi)", type: "text" },
    ],
  },
  {
    name: "1. Tulajdonos (jogi személy)",
    shortcodes: [
      { code: "TULAJDONOS_1_CEG_NEV", label: "Cég neve", type: "text" },
      { code: "TULAJDONOS_1_CEG_ROVID", label: "Rövidített név", type: "text" },
      { code: "TULAJDONOS_1_CEG_SZEKHELY", label: "Cég székhelye", type: "text" },
      { code: "TULAJDONOS_1_CEG_CEGJSZ", label: "Cégjegyzékszám", type: "text" },
      { code: "TULAJDONOS_1_CEG_FOTEV", label: "Főtevékenység", type: "text" },
      { code: "TULAJDONOS_1_CEG_KEPVISELO", label: "Képviselő neve", type: "text" },
      { code: "TULAJDONOS_1_CEG_KEPV_BEOSZTAS", label: "Képviselő beosztása", type: "text" },
    ],
  },
  {
    name: "2. Tulajdonos (természetes)",
    shortcodes: [
      { code: "TULAJDONOS_2_NEV", label: "Teljes név", type: "text" },
      { code: "TULAJDONOS_2_SZUL_NEV", label: "Születési név", type: "text" },
      { code: "TULAJDONOS_2_SZUL_HELY", label: "Születési hely", type: "text" },
      { code: "TULAJDONOS_2_SZUL_DATUM", label: "Születési dátum", type: "date" },
      { code: "TULAJDONOS_2_SZUL_HELY_IDO", label: "Születési hely, idő (kombinált)", type: "text" },
      { code: "TULAJDONOS_2_ANYJA_NEVE", label: "Anyja neve", type: "text" },
      { code: "TULAJDONOS_2_LAKCIM", label: "Lakcím", type: "text" },
      { code: "TULAJDONOS_2_OKMANY_TIPUS", label: "Okmány típusa", type: "text" },
      { code: "TULAJDONOS_2_OKMANY_SZAM", label: "Okmány száma", type: "text" },
      { code: "TULAJDONOS_2_ALLAMPOLGARSAG", label: "Állampolgárság", type: "text" },
      { code: "TULAJDONOS_2_ARANY", label: "Tulajdoni arány (%)", type: "text" },
      { code: "TULAJDONOS_2_TIPUS", label: "Típus (természetes/jogi)", type: "text" },
    ],
  },
  {
    name: "2. Tulajdonos (jogi személy)",
    shortcodes: [
      { code: "TULAJDONOS_2_CEG_NEV", label: "Cég neve", type: "text" },
      { code: "TULAJDONOS_2_CEG_ROVID", label: "Rövidített név", type: "text" },
      { code: "TULAJDONOS_2_CEG_SZEKHELY", label: "Cég székhelye", type: "text" },
      { code: "TULAJDONOS_2_CEG_CEGJSZ", label: "Cégjegyzékszám", type: "text" },
      { code: "TULAJDONOS_2_CEG_FOTEV", label: "Főtevékenység", type: "text" },
      { code: "TULAJDONOS_2_CEG_KEPVISELO", label: "Képviselő neve", type: "text" },
      { code: "TULAJDONOS_2_CEG_KEPV_BEOSZTAS", label: "Képviselő beosztása", type: "text" },
    ],
  },
  {
    name: "3. Tulajdonos (természetes)",
    shortcodes: [
      { code: "TULAJDONOS_3_NEV", label: "Teljes név", type: "text" },
      { code: "TULAJDONOS_3_SZUL_NEV", label: "Születési név", type: "text" },
      { code: "TULAJDONOS_3_SZUL_HELY", label: "Születési hely", type: "text" },
      { code: "TULAJDONOS_3_SZUL_DATUM", label: "Születési dátum", type: "date" },
      { code: "TULAJDONOS_3_ANYJA_NEVE", label: "Anyja neve", type: "text" },
      { code: "TULAJDONOS_3_LAKCIM", label: "Lakcím", type: "text" },
      { code: "TULAJDONOS_3_OKMANY_TIPUS", label: "Okmány típusa", type: "text" },
      { code: "TULAJDONOS_3_OKMANY_SZAM", label: "Okmány száma", type: "text" },
      { code: "TULAJDONOS_3_ALLAMPOLGARSAG", label: "Állampolgárság", type: "text" },
      { code: "TULAJDONOS_3_ARANY", label: "Tulajdoni arány (%)", type: "text" },
      { code: "TULAJDONOS_3_TIPUS", label: "Típus (természetes/jogi)", type: "text" },
    ],
  },
  {
    name: "Képviselő / Ügyvezető",
    shortcodes: [
      { code: "KEPVISELO_NEV", label: "Név", type: "text" },
      { code: "KEPVISELO_SZUL_NEV", label: "Születési név", type: "text" },
      { code: "KEPVISELO_SZUL_HELY", label: "Születési hely", type: "text" },
      { code: "KEPVISELO_SZUL_DATUM", label: "Születési dátum", type: "date" },
      { code: "KEPVISELO_ANYJA_NEVE", label: "Anyja neve", type: "text" },
      { code: "KEPVISELO_LAKCIM", label: "Lakcím", type: "text" },
      { code: "KEPVISELO_OKMANY_TIPUS", label: "Okmány típusa", type: "text" },
      { code: "KEPVISELO_OKMANY_SZAM", label: "Okmány száma", type: "text" },
      { code: "KEPVISELO_BEOSZTAS", label: "Beosztás", type: "text" },
      { code: "KEPVISELO_ALLAMPOLGARSAG", label: "Állampolgárság", type: "text" },
    ],
  },
  {
    name: "Kapcsolattartó",
    shortcodes: [
      { code: "KAPCSOLAT_NEV", label: "Név", type: "text" },
      { code: "KAPCSOLAT_EMAIL", label: "Email", type: "email" },
      { code: "KAPCSOLAT_TELEFON", label: "Telefon", type: "phone" },
      { code: "KAPCSOLAT_CIM", label: "Cím", type: "text" },
    ],
  },
  {
    name: "Kiemelt közszereplő (PEP)",
    shortcodes: [
      { code: "PEP_STATUS", label: "PEP státusz (igen/nem)", type: "text" },
      { code: "PEP_RESZLETEK", label: "PEP részletek", type: "text" },
      { code: "PEP_NYILATKOZAT", label: "minősül / nem minősül", type: "text" },
    ],
  },
  {
    name: "Szolgáltatás",
    shortcodes: [
      { code: "SZOLGALTATAS_TIPUS", label: "Szolgáltatás típusa", type: "text" },
      { code: "CSOMAG_NEV", label: "Csomag neve", type: "text" },
      { code: "HAVI_DIJ", label: "Havi díj (Ft)", type: "number" },
      { code: "EVES_DIJ", label: "Éves díj (Ft)", type: "number" },
    ],
  },
  {
    name: "Üzleti kapcsolat",
    shortcodes: [
      { code: "KOCKAZAT_SZINT", label: "Kockázati szint", type: "text" },
      { code: "TELJESITES_HELY", label: "Teljesítés helye", type: "text" },
      { code: "UZLETI_CEL", label: "Üzleti kapcsolat célja", type: "text" },
    ],
  },
  {
    name: "Dátumok",
    shortcodes: [
      { code: "DATUM", label: "Mai dátum", type: "date" },
      { code: "DATUM_SZO", label: "Mai dátum szöveggel", type: "text" },
      { code: "EV", label: "Aktuális év", type: "number" },
      { code: "HONAP", label: "Aktuális hónap", type: "text" },
      { code: "NAP", label: "Aktuális nap", type: "number" },
    ],
  },
  {
    name: "Meta adatok",
    shortcodes: [
      { code: "TULAJDONOS_SZAM", label: "Tulajdonosok száma", type: "number" },
      { code: "SZERZODES_ID", label: "Szerződés azonosító", type: "text" },
      { code: "KEZBESITESI_CIM", label: "Kézbesítési cím", type: "text" },
    ],
  },
];

const SAMPLE_DATA: Record<string, string> = {
  // Cég adatok
  CEG_NEV: "Minta Kft.",
  CEG_ROVID_NEV: "Minta",
  CEG_FORMA: "Kft.",
  CEGJEGYZEKSZAM: "01-09-123456",
  ADOSZAM: "12345678-1-41",
  FOTEV: "Szoftverfejlesztés",
  SZEKHELY: "Budapest, 1064 Izabella u. 68/b",
  // 1. Tulajdonos (természetes)
  TULAJDONOS_1_NEV: "Kovács János",
  TULAJDONOS_1_SZUL_NEV: "Kovács János",
  TULAJDONOS_1_SZUL_HELY: "Budapest",
  TULAJDONOS_1_SZUL_DATUM: "1985.01.15.",
  TULAJDONOS_1_ANYJA_NEVE: "Kiss Mária",
  TULAJDONOS_1_LAKCIM: "1111 Budapest, Példa utca 1.",
  TULAJDONOS_1_OKMANY_TIPUS: "Személyi igazolvány",
  TULAJDONOS_1_OKMANY_SZAM: "123456AB",
  TULAJDONOS_1_ALLAMPOLGARSAG: "magyar",
  TULAJDONOS_1_ARANY: "100",
  TULAJDONOS_1_TIPUS: "természetes személy",
  TULAJDONOS_1_CEG_NEV: "",
  TULAJDONOS_1_CEG_ROVID: "",
  TULAJDONOS_1_CEG_SZEKHELY: "",
  TULAJDONOS_1_CEG_CEGJSZ: "",
  TULAJDONOS_1_CEG_FOTEV: "",
  TULAJDONOS_1_CEG_KEPVISELO: "",
  TULAJDONOS_1_CEG_KEPV_BEOSZTAS: "",
  // 2. Tulajdonos (üres minta)
  TULAJDONOS_2_NEV: "",
  TULAJDONOS_2_SZUL_NEV: "",
  TULAJDONOS_2_SZUL_HELY: "",
  TULAJDONOS_2_SZUL_DATUM: "",
  TULAJDONOS_2_ANYJA_NEVE: "",
  TULAJDONOS_2_LAKCIM: "",
  TULAJDONOS_2_OKMANY_TIPUS: "",
  TULAJDONOS_2_OKMANY_SZAM: "",
  TULAJDONOS_2_ALLAMPOLGARSAG: "",
  TULAJDONOS_2_ARANY: "",
  TULAJDONOS_2_TIPUS: "",
  TULAJDONOS_2_CEG_NEV: "",
  TULAJDONOS_2_CEG_ROVID: "",
  TULAJDONOS_2_CEG_SZEKHELY: "",
  TULAJDONOS_2_CEG_CEGJSZ: "",
  TULAJDONOS_2_CEG_FOTEV: "",
  TULAJDONOS_2_CEG_KEPVISELO: "",
  TULAJDONOS_2_CEG_KEPV_BEOSZTAS: "",
  // 3. Tulajdonos (üres minta)
  TULAJDONOS_3_NEV: "",
  TULAJDONOS_3_SZUL_NEV: "",
  TULAJDONOS_3_SZUL_HELY: "",
  TULAJDONOS_3_SZUL_DATUM: "",
  TULAJDONOS_3_ANYJA_NEVE: "",
  TULAJDONOS_3_LAKCIM: "",
  TULAJDONOS_3_OKMANY_TIPUS: "",
  TULAJDONOS_3_OKMANY_SZAM: "",
  TULAJDONOS_3_ALLAMPOLGARSAG: "",
  TULAJDONOS_3_ARANY: "",
  TULAJDONOS_3_TIPUS: "",
  TULAJDONOS_3_CEG_NEV: "",
  TULAJDONOS_3_CEG_ROVID: "",
  TULAJDONOS_3_CEG_SZEKHELY: "",
  TULAJDONOS_3_CEG_CEGJSZ: "",
  TULAJDONOS_3_CEG_FOTEV: "",
  TULAJDONOS_3_CEG_KEPVISELO: "",
  TULAJDONOS_3_CEG_KEPV_BEOSZTAS: "",
  // Képviselő
  KEPVISELO_NEV: "Kovács János",
  KEPVISELO_SZUL_NEV: "Kovács János",
  KEPVISELO_SZUL_HELY: "Budapest",
  KEPVISELO_SZUL_DATUM: "1985.01.15.",
  KEPVISELO_ANYJA_NEVE: "Kiss Mária",
  KEPVISELO_LAKCIM: "1111 Budapest, Példa utca 1.",
  KEPVISELO_OKMANY_TIPUS: "Személyi igazolvány",
  KEPVISELO_OKMANY_SZAM: "123456AB",
  KEPVISELO_BEOSZTAS: "ügyvezető",
  KEPVISELO_ALLAMPOLGARSAG: "magyar",
  // Kapcsolattartó
  KAPCSOLAT_NEV: "Kovács János",
  KAPCSOLAT_EMAIL: "kovacs@minta.hu",
  KAPCSOLAT_TELEFON: "+36 30 123 4567",
  KAPCSOLAT_CIM: "1111 Budapest, Példa utca 1.",
  // PEP
  PEP_STATUS: "Nem",
  PEP_RESZLETEK: "",
  PEP_NYILATKOZAT: "nem minősül",
  // Szolgáltatás
  SZOLGALTATAS_TIPUS: "Székhelyszolgáltatás (magyar)",
  CSOMAG_NEV: "Székhelyszolgáltatás - Magyar",
  HAVI_DIJ: "4 990 Ft",
  EVES_DIJ: "59 880 Ft",
  // Üzleti kapcsolat
  KOCKAZAT_SZINT: "Átlagos",
  TELJESITES_HELY: "Budapest, 1064 Izabella u. 68/b",
  UZLETI_CEL: "Székhely biztosítása határozatlan időtartamra, küldemények átvétele és az ügyfél értesítése",
  // Meta
  TULAJDONOS_SZAM: "1",
  SZERZODES_ID: "SZ-2024-00001",
  KEZBESITESI_CIM: "Budapest, 1064 Izabella u. 68/b",
};

function detectShortcodesFromDocx(docxBuffer: Buffer): string[] {
  try {
    const zip = new PizZip(docxBuffer);
    const documentXml = zip.files["word/document.xml"]?.asText() || "";
    const headerXmls = Object.keys(zip.files)
      .filter((f) => f.startsWith("word/header") && f.endsWith(".xml"))
      .map((f) => zip.files[f].asText())
      .join("");
    const footerXmls = Object.keys(zip.files)
      .filter((f) => f.startsWith("word/footer") && f.endsWith(".xml"))
      .map((f) => zip.files[f].asText())
      .join("");

    const allContent = documentXml + headerXmls + footerXmls;
    
    // Strip all XML tags to get plain text content
    // This handles cases where shortcodes are split across multiple XML tags
    const plainText = allContent.replace(/<[^>]+>/g, "");
    
    // Also try to find shortcodes in the raw XML (for simple cases)
    const regex = /\{([A-Z0-9_]+)\}/g;
    const matches = [...plainText.matchAll(regex)];
    const shortcodes = [...new Set(matches.map((m) => m[1]))];
    
    // Filter out docxtemplater control codes
    return shortcodes.filter((code) => 
      !code.startsWith("#") && 
      !code.startsWith("/") &&
      code.length > 1 &&
      /^[A-Z]/.test(code)
    );
  } catch {
    return [];
  }
}

function cleanDocxXml(xmlContent: string): string {
  // Fix Word's tendency to split placeholders across multiple XML tags
  // Strategy: Find and merge split placeholders by processing w:r (run) elements
  
  let result = xmlContent;
  
  // Step 1: Find all w:r elements and merge adjacent ones that form a placeholder
  // Word often splits {PLACEHOLDER} into multiple runs like:
  // <w:r><w:t>{</w:t></w:r><w:r><w:t>PLACEHOLDER</w:t></w:r><w:r><w:t>}</w:t></w:r>
  
  // More aggressive approach: temporarily remove all XML tags between { and }
  // Then reconstruct with the full placeholder in a single text node
  
  // Find potential placeholder boundaries in the XML
  const openBracePattern = /<w:t[^>]*>\{<\/w:t>/g;
  const closeBracePattern = /<w:t[^>]*>\}<\/w:t>/g;
  
  // Get plain text to find all valid placeholders
  const plainText = result.replace(/<[^>]+>/g, "");
  const placeholderMatches = plainText.match(/\{[A-Z][A-Z0-9_]*\}/g) || [];
  
  console.log("Plain text placeholders found:", placeholderMatches);
  
  // For each placeholder, find it in the XML (even if split) and replace with unified version
  for (const placeholder of placeholderMatches) {
    const code = placeholder.slice(1, -1);
    
    // Build pattern that matches the placeholder split across any XML tags
    // This matches { followed by optional tags, then each char of the code with optional tags between
    let patternParts = ["\\{"];
    for (const char of code) {
      // Allow any XML tags (including </w:t>, </w:r>, <w:r>, <w:t>, etc.) between characters
      patternParts.push(`(?:</w:t>)?(?:</w:r>)?(?:<w:r[^>]*>)?(?:<w:rPr>.*?</w:rPr>)?(?:<w:t[^>]*>)?`);
      patternParts.push(char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    }
    patternParts.push(`(?:</w:t>)?(?:</w:r>)?(?:<w:r[^>]*>)?(?:<w:rPr>.*?</w:rPr>)?(?:<w:t[^>]*>)?`);
    patternParts.push("\\}");
    
    const fullPattern = patternParts.join("");
    
    try {
      const regex = new RegExp(fullPattern, "gs");
      const beforeReplace = result;
      result = result.replace(regex, `{${code}}`);
      if (beforeReplace !== result) {
        console.log(`Fixed split placeholder: {${code}}`);
      }
    } catch (e) {
      console.log(`Regex error for ${code}:`, e);
    }
  }
  
  return result;
}

function generateDocxFromTemplate(docxBuffer: Buffer, data: Record<string, string>): Buffer {
  const zip = new PizZip(docxBuffer);
  
  // Pre-process XML files to fix split placeholders
  const xmlFiles = ["word/document.xml", "word/header1.xml", "word/header2.xml", "word/header3.xml", 
                    "word/footer1.xml", "word/footer2.xml", "word/footer3.xml"];
  
  for (const fileName of xmlFiles) {
    if (zip.files[fileName]) {
      const content = zip.files[fileName].asText();
      const cleanedContent = cleanDocxXml(content);
      zip.file(fileName, cleanedContent);
      
      // Debug: Log found placeholders before and after cleanup
      if (fileName === "word/document.xml") {
        const plainTextBefore = content.replace(/<[^>]+>/g, "");
        
        // Log sample of plain text to see content
        console.log("Plain text sample (first 500 chars):", plainTextBefore.substring(0, 500));
        
        // Try both regex patterns
        const placeholdersBefore1 = plainTextBefore.match(/\{[A-Z][A-Z0-9_]*\}/g) || [];
        const placeholdersBefore2 = plainTextBefore.match(/\{([A-Z0-9_]+)\}/g) || [];
        console.log("Placeholders BEFORE (pattern 1):", placeholdersBefore1);
        console.log("Placeholders BEFORE (pattern 2):", placeholdersBefore2);
        
        // Check for any curly brace patterns
        const anyBraces = plainTextBefore.match(/\{[^{}]+\}/g) || [];
        console.log("Any brace patterns found:", anyBraces.slice(0, 10));
      }
    }
  }
  
  const now = new Date();
  const fullData: Record<string, string> = {
    ...data,
    DATUM: data.DATUM || now.toLocaleDateString("hu-HU"),
    DATUM_SZO: data.DATUM_SZO || now.toLocaleDateString("hu-HU", { year: "numeric", month: "long", day: "numeric" }),
    EV: data.EV || now.getFullYear().toString(),
    HONAP: data.HONAP || now.toLocaleDateString("hu-HU", { month: "long" }),
    NAP: data.NAP || now.getDate().toString(),
  };

  console.log("Full data being applied:", JSON.stringify(Object.keys(fullData).slice(0, 15)));

  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    delimiters: { start: "{", end: "}" },
  });

  try {
    doc.render(fullData);
  } catch (error) {
    console.error("Docxtemplater render error:", error);
    throw error;
  }

  return doc.getZip().generate({ type: "nodebuffer" });
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[áàäâ]/g, "a")
    .replace(/[éèëê]/g, "e")
    .replace(/[íìïî]/g, "i")
    .replace(/[óòöôő]/g, "o")
    .replace(/[úùüûű]/g, "u")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export const uploadDocxTemplate = onRequest(
  { cors: true, maxInstances: 10 },
  async (req, res) => {
    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }

    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    try {
      const authHeader = String(req.headers.authorization ?? "");
      const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
      if (!token) {
        res.status(401).json({ error: "Missing Authorization Bearer token" });
        return;
      }

      const decoded = await admin.auth().verifyIdToken(token);
      const email = safeString((decoded as { email?: unknown }).email).toLowerCase();
      const adminEmails = parseAdminEmails(adminEmailsParam.value());

      if (!email || !adminEmails.includes(email)) {
        res.status(403).json({ error: "Forbidden" });
        return;
      }

      const busboy = Busboy({ headers: req.headers });
      const fields: Record<string, string> = {};
      let fileBuffer: Buffer | null = null;
      let fileName = "";

      await new Promise<void>((resolve, reject) => {
        busboy.on("field", (fieldname: string, val: string) => {
          fields[fieldname] = val;
        });

        busboy.on("file", (fieldname: string, file: NodeJS.ReadableStream, info: { filename: string }) => {
          if (fieldname !== "file") {
            (file as NodeJS.ReadableStream & { resume: () => void }).resume();
            return;
          }

          const ext = info.filename.split(".").pop()?.toLowerCase();
          if (ext !== "docx") {
            (file as NodeJS.ReadableStream & { resume: () => void }).resume();
            reject(new Error("Csak .docx fájl engedélyezett"));
            return;
          }

          fileName = info.filename;
          const chunks: Buffer[] = [];
          file.on("data", (chunk: Buffer) => chunks.push(chunk));
          file.on("end", () => {
            fileBuffer = Buffer.concat(chunks);
          });
        });

        busboy.on("finish", resolve);
        busboy.on("error", reject);

        if (req.rawBody) {
          busboy.end(req.rawBody);
        } else {
          req.pipe(busboy);
        }
      });

      if (!fileBuffer) {
        res.status(400).json({ error: "Nincs fájl feltöltve" });
        return;
      }

      const uploadedBuffer: Buffer = fileBuffer;
      const name = fields.name || fileName.replace(".docx", "");
      const description = fields.description || "";
      const category = fields.category || "Egyéb";

      const detectedShortcodes = detectShortcodesFromDocx(uploadedBuffer);
      const templateId = uuidv4();
      const slugName = slugify(name);
      const storagePath = `docx-templates/${templateId}/${slugName}.docx`;

      const bucket = admin.storage().bucket();
      const file = bucket.file(storagePath);
      await file.save(uploadedBuffer, {
        metadata: { contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" },
      });

      const templateData: DocxTemplateData = {
        id: templateId,
        name,
        description,
        category,
        filename: `${slugName}.docx`,
        storagePath,
        detectedShortcodes,
        fileSize: uploadedBuffer.length,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      await admin.firestore().collection("docxTemplates").doc(templateId).set(templateData);

      res.status(200).json({
        success: true,
        template: {
          id: templateId,
          name,
          filename: `${slugName}.docx`,
          detectedShortcodes,
          fileSize: uploadedBuffer.length,
          fileSizeFormatted: formatFileSize(uploadedBuffer.length),
        },
      });
    } catch (error: unknown) {
      console.error("uploadDocxTemplate error:", error);
      res.status(500).json({
        error: error instanceof Error ? error.message : "Ismeretlen hiba",
      });
    }
  }
);

export const generateDocument = onRequest(
  { cors: true, maxInstances: 10, timeoutSeconds: 120 },
  async (req, res) => {
    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }

    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    try {
      const authHeader = String(req.headers.authorization ?? "");
      const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
      if (!token) {
        res.status(401).json({ error: "Missing Authorization Bearer token" });
        return;
      }

      const decoded = await admin.auth().verifyIdToken(token);
      const email = safeString((decoded as { email?: unknown }).email).toLowerCase();
      const adminEmails = parseAdminEmails(adminEmailsParam.value());

      if (!email || !adminEmails.includes(email)) {
        res.status(403).json({ error: "Forbidden" });
        return;
      }

      const body = (req.body ?? {}) as Record<string, unknown>;
      const templateId = safeString(body.templateId);
      const format = safeString(body.format) || "docx";
      const data = (body.data ?? {}) as Record<string, string>;
      const useSampleData = Boolean(body.useSampleData);

      if (!templateId) {
        res.status(400).json({ error: "Hiányzó templateId" });
        return;
      }

      const templateDoc = await admin.firestore().collection("docxTemplates").doc(templateId).get();
      if (!templateDoc.exists) {
        res.status(404).json({ error: "Sablon nem található" });
        return;
      }

      const templateData = templateDoc.data() as DocxTemplateData;
      const bucket = admin.storage().bucket();
      const [docxBuffer] = await bucket.file(templateData.storagePath).download();

      const finalData = useSampleData ? { ...SAMPLE_DATA, ...data } : data;
      
      // Debug logging
      console.log("=== GENERATE DOCUMENT DEBUG ===");
      console.log("Template:", templateData.name, "ID:", templateId);
      console.log("Data keys:", Object.keys(finalData).slice(0, 20));
      console.log("Sample data values:", {
        TULAJDONOS_1_NEV: finalData.TULAJDONOS_1_NEV,
        EV: finalData.EV,
        NAP: finalData.NAP,
        HONAP: finalData.HONAP,
      });
      
      const generatedDocx = generateDocxFromTemplate(docxBuffer, finalData);

      const timestamp = new Date().toISOString().slice(0, 10);
      const baseName = `${slugify(templateData.name)}-${timestamp}`;

      if (format === "docx") {
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
        res.setHeader("Content-Disposition", `attachment; filename="${baseName}.docx"`);
        res.send(generatedDocx);
        return;
      }

      if (format === "both") {
        const archive = archiver("zip", { zlib: { level: 9 } });
        res.setHeader("Content-Type", "application/zip");
        res.setHeader("Content-Disposition", `attachment; filename="${baseName}.zip"`);
        archive.pipe(res);
        archive.append(generatedDocx, { name: `${baseName}.docx` });
        await archive.finalize();
        return;
      }

      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
      res.setHeader("Content-Disposition", `attachment; filename="${baseName}.docx"`);
      res.send(generatedDocx);
    } catch (error: unknown) {
      console.error("generateDocument error:", error);
      res.status(500).json({
        error: error instanceof Error ? error.message : "Ismeretlen hiba",
      });
    }
  }
);

export const listShortcodes = onRequest(
  { cors: true },
  async (req, res) => {
    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }

    if (req.method !== "GET") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    res.status(200).json({
      categories: SHORTCODE_CATEGORIES,
      sampleData: SAMPLE_DATA,
    });
  }
);

export const deleteDocxTemplate = onRequest(
  { cors: true },
  async (req, res) => {
    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }

    if (req.method !== "DELETE" && req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    try {
      const authHeader = String(req.headers.authorization ?? "");
      const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
      if (!token) {
        res.status(401).json({ error: "Missing Authorization Bearer token" });
        return;
      }

      const decoded = await admin.auth().verifyIdToken(token);
      const email = safeString((decoded as { email?: unknown }).email).toLowerCase();
      const adminEmails = parseAdminEmails(adminEmailsParam.value());

      if (!email || !adminEmails.includes(email)) {
        res.status(403).json({ error: "Forbidden" });
        return;
      }

      const body = (req.body ?? {}) as Record<string, unknown>;
      const templateId = safeString(body.templateId);

      if (!templateId) {
        res.status(400).json({ error: "Hiányzó templateId" });
        return;
      }

      const templateDoc = await admin.firestore().collection("docxTemplates").doc(templateId).get();
      if (!templateDoc.exists) {
        res.status(404).json({ error: "Sablon nem található" });
        return;
      }

      const templateData = templateDoc.data() as DocxTemplateData;

      const bucket = admin.storage().bucket();
      try {
        await bucket.file(templateData.storagePath).delete();
      } catch {
        console.warn("Storage file not found:", templateData.storagePath);
      }

      await admin.firestore().collection("docxTemplates").doc(templateId).delete();

      res.status(200).json({ success: true });
    } catch (error: unknown) {
      console.error("deleteDocxTemplate error:", error);
      res.status(500).json({
        error: error instanceof Error ? error.message : "Ismeretlen hiba",
      });
    }
  }
);

// ========================================
// PDF Form Filling Functions
// ========================================

type PdfFormTemplateData = {
  id: string;
  name: string;
  description?: string;
  filename: string;
  storagePath: string;
  formFields: string[];
  fieldMappings: Record<string, string>;
  staticValues: Record<string, string>;
  fileSize: number;
  createdAt: FirebaseFirestore.FieldValue;
  updatedAt: FirebaseFirestore.FieldValue;
};

/**
 * Upload a PDF form template and detect form fields
 */
export const uploadPdfFormTemplate = onRequest(
  { cors: true, maxInstances: 10 },
  async (req, res) => {
    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }

    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    try {
      const authHeader = String(req.headers.authorization ?? "");
      const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
      if (!token) {
        res.status(401).json({ error: "Missing Authorization Bearer token" });
        return;
      }

      const decoded = await admin.auth().verifyIdToken(token);
      const email = safeString((decoded as { email?: unknown }).email).toLowerCase();
      const adminEmails = parseAdminEmails(adminEmailsParam.value());

      if (!email || !adminEmails.includes(email)) {
        res.status(403).json({ error: "Forbidden" });
        return;
      }

      const busboy = Busboy({ headers: req.headers });
      let fileBuffer: Buffer | null = null;
      let filename = "";
      let name = "";
      let description = "";
      const fieldMappings: Record<string, string> = {};

      busboy.on("file", (fieldname: string, file: NodeJS.ReadableStream, info: { filename: string }) => {
        if (fieldname === "file") {
          filename = info.filename;
          const chunks: Buffer[] = [];
          file.on("data", (chunk: Buffer) => chunks.push(chunk));
          file.on("end", () => {
            fileBuffer = Buffer.concat(chunks);
          });
        }
      });

      busboy.on("field", (fieldname: string, val: string) => {
        if (fieldname === "name") name = val;
        if (fieldname === "description") description = val;
        if (fieldname === "fieldMappings") {
          try {
            Object.assign(fieldMappings, JSON.parse(val));
          } catch {
            // ignore
          }
        }
      });

      await new Promise<void>((resolve, reject) => {
        busboy.on("finish", resolve);
        busboy.on("error", reject);
        busboy.end(req.rawBody);
      });

      if (!fileBuffer || !filename.toLowerCase().endsWith(".pdf")) {
        res.status(400).json({ error: "PDF fájl szükséges" });
        return;
      }

      if (!name) {
        res.status(400).json({ error: "Név megadása kötelező" });
        return;
      }

      // Load PDF and detect form fields
      const pdfDoc = await PDFDocument.load(fileBuffer);
      const form = pdfDoc.getForm();
      const fields = form.getFields();
      const formFields = fields.map((field: { getName: () => string }) => field.getName());

      // Upload to Storage
      const bucket = admin.storage().bucket();
      const templateId = uuidv4();
      const storagePath = `pdf-form-templates/${templateId}/${filename}`;
      const file = bucket.file(storagePath);

      await file.save(fileBuffer, {
        metadata: {
          contentType: "application/pdf",
          metadata: { firebaseStorageDownloadTokens: templateId },
        },
      });

      // Save to Firestore
      const templateData: PdfFormTemplateData = {
        id: templateId,
        name,
        description,
        filename,
        storagePath,
        formFields,
        fieldMappings,
        staticValues: {},
        fileSize: (fileBuffer as Buffer).length,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      await admin.firestore().collection("pdfFormTemplates").doc(templateId).set(templateData);

      res.status(200).json({
        success: true,
        template: {
          id: templateId,
          name,
          formFields,
          fieldCount: formFields.length,
        },
      });
    } catch (error: unknown) {
      console.error("uploadPdfFormTemplate error:", error);
      res.status(500).json({
        error: error instanceof Error ? error.message : "Ismeretlen hiba",
      });
    }
  }
);

/**
 * Fill a PDF form with data and return the filled PDF
 */
export const fillPdfForm = onRequest(
  { cors: true, maxInstances: 10 },
  async (req, res) => {
    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }

    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    try {
      const authHeader = String(req.headers.authorization ?? "");
      const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
      if (!token) {
        res.status(401).json({ error: "Missing Authorization Bearer token" });
        return;
      }

      const decoded = await admin.auth().verifyIdToken(token);
      const email = safeString((decoded as { email?: unknown }).email).toLowerCase();
      const adminEmails = parseAdminEmails(adminEmailsParam.value());

      if (!email || !adminEmails.includes(email)) {
        res.status(403).json({ error: "Forbidden" });
        return;
      }

      const body = (req.body ?? {}) as Record<string, unknown>;
      const templateId = safeString(body.templateId);
      const data = (body.data ?? {}) as Record<string, string>;

      if (!templateId) {
        res.status(400).json({ error: "Hiányzó templateId" });
        return;
      }

      // Get template from Firestore
      const templateDoc = await admin.firestore().collection("pdfFormTemplates").doc(templateId).get();
      if (!templateDoc.exists) {
        res.status(404).json({ error: "PDF sablon nem található" });
        return;
      }

      const templateData = templateDoc.data() as PdfFormTemplateData;

      // Download PDF from Storage
      const bucket = admin.storage().bucket();
      const [pdfBuffer] = await bucket.file(templateData.storagePath).download();

      // Load and fill PDF
      const pdfDoc = await PDFDocument.load(pdfBuffer);
      const form = pdfDoc.getForm();

      // Helper to fill a field
      const fillField = (fieldName: string, value: string) => {
        try {
          const field = form.getTextField(fieldName);
          if (field) {
            field.setText(value);
          }
        } catch {
          try {
            const checkbox = form.getCheckBox(fieldName);
            if (checkbox && (value === "true" || value === "1" || value === "igen" || value === "X")) {
              checkbox.check();
            }
          } catch {
            console.warn(`Could not fill field: ${fieldName}`);
          }
        }
      };

      // Fill form fields using dynamic mappings (from contract data)
      for (const [fieldName, shortcode] of Object.entries(templateData.fieldMappings || {})) {
        if (shortcode) {
          const value = data[shortcode] || "";
          fillField(fieldName, value);
        }
      }

      // Fill form fields using static values (constant text)
      for (const [fieldName, staticValue] of Object.entries(templateData.staticValues || {})) {
        if (staticValue) {
          fillField(fieldName, staticValue);
        }
      }

      // Flatten form (make fields non-editable)
      form.flatten();

      // Save filled PDF
      const filledPdfBytes = await pdfDoc.save();

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${templateData.name.replace(/\s+/g, "_")}_filled.pdf"`
      );
      res.status(200).send(Buffer.from(filledPdfBytes));
    } catch (error: unknown) {
      console.error("fillPdfForm error:", error);
      res.status(500).json({
        error: error instanceof Error ? error.message : "Ismeretlen hiba",
      });
    }
  }
);

/**
 * Update PDF form template field mappings
 */
export const updatePdfFormMappings = onRequest(
  { cors: true, maxInstances: 10 },
  async (req, res) => {
    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }

    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    try {
      const authHeader = String(req.headers.authorization ?? "");
      const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
      if (!token) {
        res.status(401).json({ error: "Missing Authorization Bearer token" });
        return;
      }

      const decoded = await admin.auth().verifyIdToken(token);
      const email = safeString((decoded as { email?: unknown }).email).toLowerCase();
      const adminEmails = parseAdminEmails(adminEmailsParam.value());

      if (!email || !adminEmails.includes(email)) {
        res.status(403).json({ error: "Forbidden" });
        return;
      }

      const body = (req.body ?? {}) as Record<string, unknown>;
      const templateId = safeString(body.templateId);
      const fieldMappings = (body.fieldMappings ?? {}) as Record<string, string>;
      const staticValues = (body.staticValues ?? {}) as Record<string, string>;

      console.log("updatePdfFormMappings called with:", {
        templateId,
        fieldMappings,
        staticValues,
      });

      if (!templateId) {
        res.status(400).json({ error: "Hiányzó templateId" });
        return;
      }

      await admin.firestore().collection("pdfFormTemplates").doc(templateId).update({
        fieldMappings,
        staticValues,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log("updatePdfFormMappings success for templateId:", templateId);
      res.status(200).json({ success: true, saved: { fieldMappings, staticValues } });
    } catch (error: unknown) {
      console.error("updatePdfFormMappings error:", error);
      res.status(500).json({
        error: error instanceof Error ? error.message : "Ismeretlen hiba",
      });
    }
  }
);

/**
 * Delete PDF form template
 */
export const deletePdfFormTemplate = onRequest(
  { cors: true, maxInstances: 10 },
  async (req, res) => {
    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }

    if (req.method !== "POST" && req.method !== "DELETE") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    try {
      const authHeader = String(req.headers.authorization ?? "");
      const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
      if (!token) {
        res.status(401).json({ error: "Missing Authorization Bearer token" });
        return;
      }

      const decoded = await admin.auth().verifyIdToken(token);
      const email = safeString((decoded as { email?: unknown }).email).toLowerCase();
      const adminEmails = parseAdminEmails(adminEmailsParam.value());

      if (!email || !adminEmails.includes(email)) {
        res.status(403).json({ error: "Forbidden" });
        return;
      }

      const body = (req.body ?? {}) as Record<string, unknown>;
      const templateId = safeString(body.templateId);

      if (!templateId) {
        res.status(400).json({ error: "Hiányzó templateId" });
        return;
      }

      const templateDoc = await admin.firestore().collection("pdfFormTemplates").doc(templateId).get();
      if (!templateDoc.exists) {
        res.status(404).json({ error: "Sablon nem található" });
        return;
      }

      const templateData = templateDoc.data() as PdfFormTemplateData;

      const bucket = admin.storage().bucket();
      try {
        await bucket.file(templateData.storagePath).delete();
      } catch {
        console.warn("Storage file not found:", templateData.storagePath);
      }

      await admin.firestore().collection("pdfFormTemplates").doc(templateId).delete();

      res.status(200).json({ success: true });
    } catch (error: unknown) {
      console.error("deletePdfFormTemplate error:", error);
      res.status(500).json({
        error: error instanceof Error ? error.message : "Ismeretlen hiba",
      });
    }
  }
);
