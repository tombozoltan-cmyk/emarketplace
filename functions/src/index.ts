import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { onRequest } from "firebase-functions/v2/https";
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

const adminEmailsParam = defineString("ADMIN_EMAILS", {
  default: "emarketplacekft@gmail.com",
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
      html: "<mjml>\n  <mj-body>\n    <mj-section>\n      <mj-column>\n        <mj-text font-size=\"16px\">Kedves {{name}}!</mj-text>\n        <mj-text font-size=\"16px\">Köszönjük megkeresését, hamarosan jelentkezünk.</mj-text>\n      </mj-column>\n    </mj-section>\n  </mj-body>\n</mjml>",
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
