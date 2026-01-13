import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { defineSecret, defineString } from "firebase-functions/params";
import admin from "firebase-admin";

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
  customerTemplateEn?: EmailTemplate;
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
  customerTemplateEn: EmailTemplate;
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
      html: "<p>Kedves {{name}}!</p><p>Köszönjük megkeresését, hamarosan jelentkezünk.</p>",
    },
    customerTemplateEn: {
      subject: "Thank you for your message!",
      html: "<p>Dear {{name}}!</p><p>Thank you for reaching out. We will get back to you shortly.</p>",
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
      customerTemplateHu: normalizeTemplate(raw.customerTemplateHu, fallback.customerTemplateHu),
      customerTemplateEn: normalizeTemplate(raw.customerTemplateEn, fallback.customerTemplateEn),
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

  const result = mjml2html(mjmlWithVars, {
    validationLevel: "soft",
    keepComments: false,
  });

  if (result.errors?.length) {
    const err = result.errors
      .map((e: MjmlCompileError) => e.formattedMessage ?? e.message)
      .join(" | ");
    throw new Error(`MJML compile failed: ${err}`);
  }

  return { subject, html: result.html };
};

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
      const tpl = data.language === "en" ? settings.customerTemplateEn : settings.customerTemplateHu;
      const html = applyTemplate(tpl.html, data);
      const subject = applyTemplate(tpl.subject, data);

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
