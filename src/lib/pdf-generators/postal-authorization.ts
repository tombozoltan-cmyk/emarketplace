import { PDFDocument, PDFFont, PDFPage, rgb, StandardFonts } from "pdf-lib";

// Hungarian character normalization for WinAnsi encoding
function normalizeHungarian(text: string): string {
  if (!text) return "";
  const charMap: Record<string, string> = {
    "Ő": "O", "ő": "o",
    "Ű": "U", "ű": "u",
    "Í": "I", "í": "i",
    "Ú": "U", "ú": "u",
    "Ó": "O", "ó": "o",
    "É": "E", "é": "e",
    "Á": "A", "á": "a",
    "Ü": "U", "ü": "u",
    "Ö": "O", "ö": "o",
  };
  return text.replace(/[ŐőŰűÍíÚúÓóÉéÁáÜüÖö]/g, (char) => charMap[char] || char);
}

// ============================================
// EREDETI MAGYAR POSTA ŰRLAP KITÖLTÉSE
// ============================================

export type OfficialPostalAuthData = {
  // Meghatalmazó (1. blokk - bal oldal: magánszemély)
  authorizer: {
    name: string;              // Név
    birthName?: string;        // Születéskori név
    motherName?: string;       // Anyja születéskori neve  
    birthPlace?: string;       // Születési hely
    birthDate?: string;        // Születési idő
  };
  // Meghatalmazó szervezet (1. blokk - jobb oldal)
  authorizerOrg?: {
    name: string;              // Szervezet neve
    address: string;           // Székhely
    registrationNumber?: string; // Cégjegyzékszám
    noRegistration?: boolean;  // Nem rendelkezik cégjegyzékszámmal
  };
  // Cím, amelyre érkező küldemények átvételére szól
  deliveryAddress: string;
  
  // Meghatalmazott (2. blokk - ugyanaz a struktúra)
  authorized: {
    name: string;
    birthName?: string;
    motherName?: string;
    birthPlace?: string;
    birthDate?: string;
  };
  authorizedOrg?: {
    name: string;
    address: string;
    registrationNumber?: string;
    noRegistration?: boolean;
  };
  authorizedDeliveryAddress?: string;
  
  // Meghatalmazás típusa
  authType: {
    singlePackage?: string;     // Azonosító szám (ha egy konkrét küldemény)
    validUntil?: string;        // Meddig érvényes (dátum)
    indefinite?: boolean;       // Határozatlan ideig
    allPackages?: boolean;      // Valamennyi küldemény
    exceptPersonal?: boolean;   // Saját kezébe szóló kivételével
    // Küldemény típusok
    letter?: boolean;
    money?: boolean;
    pension?: boolean;
    package?: boolean;
    express?: boolean;
    valuables?: boolean;
    official?: boolean;
    telegram?: boolean;
    braille?: boolean;
  };
};

/**
 * Eredeti Magyar Posta meghatalmazás űrlap kitöltése
 * Az űrlap a public/pdf-templates/postai-meghatalmazas-urlap.pdf fájlból töltődik
 */
export async function fillOfficialPostalAuthPDF(
  data: OfficialPostalAuthData
): Promise<Uint8Array> {
  // Betöltjük az eredeti PDF űrlapot
  const templateUrl = "/pdf-templates/postai-meghatalmazas-urlap.pdf";
  const templateBytes = await fetch(templateUrl).then(res => res.arrayBuffer());
  const pdfDoc = await PDFDocument.load(templateBytes);
  
  // PDF form mezők használata koordináták helyett
  const form = pdfDoc.getForm();
  
  // Segédfüggvény szövegmező kitöltéshez
  const fillField = (fieldName: string, value: string | undefined) => {
    if (!value) return;
    try {
      const field = form.getTextField(fieldName);
      field.setText(normalizeHungarian(value));
    } catch (e) {
      console.warn(`Field not found: ${fieldName}`);
    }
  };
  
  // Segédfüggvény checkbox bejelöléséhez
  const checkBox = (fieldName: string, checked: boolean) => {
    if (!checked) return;
    try {
      const field = form.getCheckBox(fieldName);
      field.check();
    } catch (e) {
      console.warn(`Checkbox not found: ${fieldName}`);
    }
  };

  // ========== 1. MEGHATALMAZÓ (aki ad meghatalmazást) ==========
  // Magánszemély adatai
  fillField("Név1", data.authorizer.name);
  fillField("Sz.kori név1", data.authorizer.birthName);
  fillField("Anyja sz.kori neve1", data.authorizer.motherName);
  fillField("Sz. helye1", data.authorizer.birthPlace);
  fillField("Sz. ideje1", data.authorizer.birthDate);
  
  // Szervezet adatai (ha van)
  if (data.authorizerOrg) {
    fillField("Szervezet neve1", data.authorizerOrg.name);
    fillField("Szervezet neve1a", data.authorizerOrg.address);
    fillField("Szervezet cégj. száma1", data.authorizerOrg.registrationNumber);
    if (data.authorizerOrg.noRegistration) {
      checkBox("Check Box1", true);
    }
  }
  
  // Kézbesítési cím (amelyre érkező küldemények átvételére szól)
  fillField("Cím1", data.deliveryAddress);

  // ========== 2. MEGHATALMAZOTT (aki átveheti a küldeményeket) ==========
  // Magánszemély adatai
  fillField("Név2", data.authorized.name);
  fillField("Sz.kori név2", data.authorized.birthName);
  fillField("Anyja sz.kori neve2", data.authorized.motherName);
  fillField("Sz. helye2", data.authorized.birthPlace);
  fillField("Sz. ideje2", data.authorized.birthDate);
  
  // Szervezet adatai (E-Marketplace Kft.)
  if (data.authorizedOrg) {
    fillField("Szervezet neve2", data.authorizedOrg.name);
    fillField("Szervezet neve2a", data.authorizedOrg.address);
    fillField("Szervezet cégj. száma2", data.authorizedOrg.registrationNumber);
    if (data.authorizedOrg.noRegistration) {
      checkBox("Check Box2", true);
    }
  }
  
  // Meghatalmazott kézbesítési címe
  if (data.authorizedDeliveryAddress) {
    fillField("Cím2", data.authorizedDeliveryAddress);
  }

  // ========== MEGHATALMAZÁS TÍPUSA ==========
  // Egy konkrét küldemény
  if (data.authType.singlePackage) {
    checkBox("Check Box4", true);
    fillField("Azonosító szám", data.authType.singlePackage);
  }
  
  // Meghatározott ideig / határozatlan ideig
  if (data.authType.validUntil) {
    checkBox("Check Box5", true);
    fillField("Dátum, max 5 évig", data.authType.validUntil);
  }
  if (data.authType.indefinite) {
    checkBox("Check Box6", true);
  }
  
  // Valamennyi küldemény
  if (data.authType.allPackages) {
    checkBox("CB7", true);
  }
  
  // Saját kezébe szóló kivételével
  if (data.authType.exceptPersonal) {
    checkBox("CB7.0", true);
  }
  
  // Küldemény típusok
  if (data.authType.letter) checkBox("CB7.1", true);      // Levél
  if (data.authType.money) checkBox("CB7.2", true);       // Utalvány
  if (data.authType.pension) checkBox("CB7.3", true);     // Nyugdíj utalvány
  if (data.authType.package) checkBox("CB7.4", true);     // Csomag
  if (data.authType.express) checkBox("CB7.5", true);     // Időgarantált
  if (data.authType.valuables) checkBox("CB7.6", true);   // Értékküldemény
  if (data.authType.official) checkBox("CB7.7", true);    // Hivatalos irat
  if (data.authType.telegram) checkBox("CB7.8", true);    // Távirat

  // Flatten form so fields are not editable
  form.flatten();
  
  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}

// ============================================
// EREDETI GENERÁLT PDF (megtartva)
// ============================================

export type PostalAuthorizationData = {
  // Meghatalmazó (cég) adatai
  companyName: string;
  companyAddress: string;
  companyRegistrationNumber?: string;
  
  // Meghatalmazott (aki átveheti a küldeményeket)
  authorizedPersonName: string;
  authorizedPersonIdNumber: string;
  authorizedPersonAddress: string;
  
  // Képviselő (aki aláírja a meghatalmazást)
  representativeName: string;
  representativePosition: string;
  
  // Kézbesítési cím
  deliveryAddress: string;
  
  // Dátum
  date: string;
  city: string;
};

const PAGE_WIDTH = 595.28; // A4
const PAGE_HEIGHT = 841.89; // A4
const MARGIN = 50;
const LINE_HEIGHT = 18;

function drawText(
  page: PDFPage,
  text: string,
  x: number,
  y: number,
  font: PDFFont,
  size: number = 11,
  options?: { maxWidth?: number; color?: { r: number; g: number; b: number } }
) {
  page.drawText(normalizeHungarian(text), {
    x,
    y,
    size,
    font,
    color: options?.color ? rgb(options.color.r, options.color.g, options.color.b) : rgb(0, 0, 0),
    maxWidth: options?.maxWidth,
  });
}

function drawUnderlinedField(
  page: PDFPage,
  label: string,
  value: string,
  x: number,
  y: number,
  font: PDFFont,
  boldFont: PDFFont,
  fieldWidth: number = 200
) {
  // Label
  drawText(page, label, x, y, font, 10);
  
  // Value (bold, underlined area)
  const labelWidth = font.widthOfTextAtSize(label, 10);
  const valueX = x + labelWidth + 5;
  
  drawText(page, value || "", valueX, y, boldFont, 11);
  
  // Underline
  page.drawLine({
    start: { x: valueX, y: y - 2 },
    end: { x: valueX + fieldWidth - labelWidth - 10, y: y - 2 },
    thickness: 0.5,
    color: rgb(0.5, 0.5, 0.5),
  });
}

export async function generatePostalAuthorizationPDF(
  data: PostalAuthorizationData
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  
  // Embed fonts
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN;

  // === FEJLÉC ===
  drawText(page, "MEGHATALMAZÁS", PAGE_WIDTH / 2 - 60, y, boldFont, 18);
  y -= LINE_HEIGHT * 2;
  
  drawText(page, "postai küldemények átvételére", PAGE_WIDTH / 2 - 70, y, font, 12);
  y -= LINE_HEIGHT * 3;

  // === MEGHATALMAZÓ ADATAI ===
  drawText(page, "I. MEGHATALMAZÓ (Cég) ADATAI", MARGIN, y, boldFont, 12);
  y -= LINE_HEIGHT * 1.5;
  
  drawText(page, "Cégnév:", MARGIN, y, font, 10);
  drawText(page, data.companyName || "", MARGIN + 80, y, boldFont, 11);
  page.drawLine({
    start: { x: MARGIN + 80, y: y - 2 },
    end: { x: PAGE_WIDTH - MARGIN, y: y - 2 },
    thickness: 0.5,
    color: rgb(0.7, 0.7, 0.7),
  });
  y -= LINE_HEIGHT * 1.5;
  
  drawText(page, "Székhely:", MARGIN, y, font, 10);
  drawText(page, data.companyAddress || "", MARGIN + 80, y, boldFont, 11);
  page.drawLine({
    start: { x: MARGIN + 80, y: y - 2 },
    end: { x: PAGE_WIDTH - MARGIN, y: y - 2 },
    thickness: 0.5,
    color: rgb(0.7, 0.7, 0.7),
  });
  y -= LINE_HEIGHT * 1.5;
  
  if (data.companyRegistrationNumber) {
    drawText(page, "Cégjegyzékszám:", MARGIN, y, font, 10);
    drawText(page, data.companyRegistrationNumber, MARGIN + 100, y, boldFont, 11);
    page.drawLine({
      start: { x: MARGIN + 100, y: y - 2 },
      end: { x: PAGE_WIDTH - MARGIN, y: y - 2 },
      thickness: 0.5,
      color: rgb(0.7, 0.7, 0.7),
    });
    y -= LINE_HEIGHT * 1.5;
  }
  
  y -= LINE_HEIGHT;

  // === MEGHATALMAZOTT ADATAI ===
  drawText(page, "II. MEGHATALMAZOTT ADATAI", MARGIN, y, boldFont, 12);
  y -= LINE_HEIGHT * 1.5;
  
  drawText(page, "Név:", MARGIN, y, font, 10);
  drawText(page, data.authorizedPersonName || "", MARGIN + 80, y, boldFont, 11);
  page.drawLine({
    start: { x: MARGIN + 80, y: y - 2 },
    end: { x: PAGE_WIDTH - MARGIN, y: y - 2 },
    thickness: 0.5,
    color: rgb(0.7, 0.7, 0.7),
  });
  y -= LINE_HEIGHT * 1.5;
  
  drawText(page, "Személyi ig. szám:", MARGIN, y, font, 10);
  drawText(page, data.authorizedPersonIdNumber || "", MARGIN + 100, y, boldFont, 11);
  page.drawLine({
    start: { x: MARGIN + 100, y: y - 2 },
    end: { x: PAGE_WIDTH - MARGIN, y: y - 2 },
    thickness: 0.5,
    color: rgb(0.7, 0.7, 0.7),
  });
  y -= LINE_HEIGHT * 1.5;
  
  drawText(page, "Lakcím:", MARGIN, y, font, 10);
  drawText(page, data.authorizedPersonAddress || "", MARGIN + 80, y, boldFont, 11);
  page.drawLine({
    start: { x: MARGIN + 80, y: y - 2 },
    end: { x: PAGE_WIDTH - MARGIN, y: y - 2 },
    thickness: 0.5,
    color: rgb(0.7, 0.7, 0.7),
  });
  y -= LINE_HEIGHT * 2;

  // === MEGHATALMAZÁS SZÖVEGE ===
  drawText(page, "III. A MEGHATALMAZÁS TARTALMA", MARGIN, y, boldFont, 12);
  y -= LINE_HEIGHT * 1.5;
  
  const authText1 = `Alulírott ${data.representativeName || "___________________"}, mint a(z)`;
  drawText(page, authText1, MARGIN, y, font, 10);
  y -= LINE_HEIGHT;
  
  const authText2 = `${data.companyName || "___________________"} képviseletére jogosult ${data.representativePosition || "ügyvezető"},`;
  drawText(page, authText2, MARGIN, y, font, 10);
  y -= LINE_HEIGHT * 1.5;
  
  drawText(page, "ezennel meghatalmazom", MARGIN, y, font, 10);
  y -= LINE_HEIGHT * 1.5;
  
  drawText(page, `${data.authorizedPersonName || "___________________"} (személyi ig. szám: ${data.authorizedPersonIdNumber || "_______________"})`, MARGIN, y, boldFont, 10);
  y -= LINE_HEIGHT * 1.5;
  
  drawText(page, "személyt, hogy a(z)", MARGIN, y, font, 10);
  y -= LINE_HEIGHT * 1.5;
  
  // Kézbesítési cím
  drawText(page, "Kézbesítési cím:", MARGIN, y, font, 10);
  drawText(page, data.deliveryAddress || "", MARGIN + 90, y, boldFont, 11);
  page.drawLine({
    start: { x: MARGIN + 90, y: y - 2 },
    end: { x: PAGE_WIDTH - MARGIN, y: y - 2 },
    thickness: 0.5,
    color: rgb(0.7, 0.7, 0.7),
  });
  y -= LINE_HEIGHT * 1.5;
  
  drawText(page, "címre érkező valamennyi postai küldeményt a nevemben és helyettem átvegye,", MARGIN, y, font, 10);
  y -= LINE_HEIGHT;
  drawText(page, "az átvételt aláírásával igazolja.", MARGIN, y, font, 10);
  y -= LINE_HEIGHT * 2;

  // === ÉRVÉNYESSÉG ===
  drawText(page, "IV. ÉRVÉNYESSÉG", MARGIN, y, boldFont, 12);
  y -= LINE_HEIGHT * 1.5;
  
  drawText(page, "Jelen meghatalmazás visszavonásig érvényes.", MARGIN, y, font, 10);
  y -= LINE_HEIGHT * 3;

  // === KELT ===
  drawText(page, `Kelt: ${data.city || "_______________"}, ${data.date || "______ év ______ hó ____ nap"}`, MARGIN, y, font, 11);
  y -= LINE_HEIGHT * 4;

  // === ALÁÍRÁSOK ===
  const signatureY = y;
  const col1X = MARGIN;
  const col2X = PAGE_WIDTH / 2 + 20;
  
  // Meghatalmazó aláírás
  page.drawLine({
    start: { x: col1X, y: signatureY },
    end: { x: col1X + 180, y: signatureY },
    thickness: 0.5,
    color: rgb(0, 0, 0),
  });
  drawText(page, "Meghatalmazó aláírása", col1X + 30, signatureY - 15, font, 9);
  drawText(page, "(cégszerű)", col1X + 55, signatureY - 25, font, 8);
  
  // Meghatalmazott aláírás
  page.drawLine({
    start: { x: col2X, y: signatureY },
    end: { x: col2X + 180, y: signatureY },
    thickness: 0.5,
    color: rgb(0, 0, 0),
  });
  drawText(page, "Meghatalmazott aláírása", col2X + 25, signatureY - 15, font, 9);
  
  y = signatureY - LINE_HEIGHT * 5;

  // === LÁBJEGYZET ===
  drawText(page, "Megjegyzés: A meghatalmazást a Magyar Posta Zrt. kézbesítői elfogadják.", MARGIN, y, font, 8, { color: { r: 0.5, g: 0.5, b: 0.5 } });
  y -= LINE_HEIGHT;
  drawText(page, "A meghatalmazás eredeti példányát a meghatalmazottnak magánál kell tartania az átvételkor.", MARGIN, y, font, 8, { color: { r: 0.5, g: 0.5, b: 0.5 } });

  // Generate PDF bytes
  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}

export function downloadPDF(pdfBytes: Uint8Array, filename: string) {
  const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
