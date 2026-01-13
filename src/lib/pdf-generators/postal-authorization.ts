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
  
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const pages = pdfDoc.getPages();
  const page = pages[0];
  
  const { height, width } = page.getSize();
  
  // Segédfüggvény - y koordináta a lap ALJÁTÓL számítva (pdf-lib standard)
  const write = (text: string, x: number, y: number, size: number = 10) => {
    if (!text) return;
    page.drawText(normalizeHungarian(text), {
      x,
      y,
      size,
      font,
      color: rgb(0, 0, 0),
    });
  };
  
  // X jelölés checkbox-hoz
  const markX = (x: number, y: number) => {
    page.drawText("X", {
      x,
      y,
      size: 12,
      font,
      color: rgb(0, 0, 0),
    });
  };

  // ========== 1. MEGHATALMAZÓ BLOKK (felső) ==========
  // Bal oldal - magánszemély adatai
  // Név mező - kb. y=755 (a lap teteje kb. 842)
  write(data.authorizer.name, 42, 755, 10);
  if (data.authorizer.birthName) write(data.authorizer.birthName, 95, 725, 9);
  if (data.authorizer.motherName) write(data.authorizer.motherName, 120, 695, 9);
  if (data.authorizer.birthPlace) write(data.authorizer.birthPlace, 95, 665, 9);
  if (data.authorizer.birthDate) write(data.authorizer.birthDate, 170, 665, 9);
  
  // Jobb oldal - szervezet adatai (x kezdődik kb. 298)
  if (data.authorizerOrg) {
    write(data.authorizerOrg.name, 298, 755, 9);
    write(data.authorizerOrg.address, 298, 725, 8);
    if (data.authorizerOrg.registrationNumber) {
      write(data.authorizerOrg.registrationNumber, 298, 665, 9);
    }
    if (data.authorizerOrg.noRegistration) {
      markX(545, 635);
    }
  }
  
  // Kézbesítési cím (1. blokk alján)
  write(data.deliveryAddress, 42, 620, 10);

  // ========== 2. MEGHATALMAZOTT BLOKK ==========
  // Bal oldal - magánszemély
  write(data.authorized.name, 42, 575, 10);
  if (data.authorized.birthName) write(data.authorized.birthName, 95, 545, 9);
  if (data.authorized.motherName) write(data.authorized.motherName, 120, 515, 9);
  if (data.authorized.birthPlace) write(data.authorized.birthPlace, 95, 485, 9);
  if (data.authorized.birthDate) write(data.authorized.birthDate, 170, 485, 9);
  
  // Jobb oldal - szervezet
  if (data.authorizedOrg) {
    write(data.authorizedOrg.name, 298, 575, 9);
    write(data.authorizedOrg.address, 298, 545, 8);
    if (data.authorizedOrg.registrationNumber) {
      write(data.authorizedOrg.registrationNumber, 298, 485, 9);
    }
    if (data.authorizedOrg.noRegistration) {
      markX(545, 455);
    }
  }
  
  // Meghatalmazott kézbesítési címe (2. blokk alján)
  if (data.authorizedDeliveryAddress) {
    write(data.authorizedDeliveryAddress, 42, 440, 10);
  }

  // ========== MEGHATALMAZÁS TÍPUSA (alsó rész) ==========
  // "Kérjük X-szel jelölje" szekció kb. y=280-tól
  
  // Egy konkrét küldemény azonosító
  if (data.authType.singlePackage) {
    markX(32, 255);
    write(data.authType.singlePackage, 320, 255, 9);
  }
  
  // Meghatározott ideig / határozatlan ideig
  if (data.authType.validUntil) {
    markX(32, 235);
    write(data.authType.validUntil, 255, 235, 9);
  }
  if (data.authType.indefinite) {
    markX(470, 235);
  }
  
  // Valamennyi küldemény
  if (data.authType.allPackages) {
    markX(32, 215);
  }
  
  // Saját kezébe szóló kivételével
  if (data.authType.exceptPersonal) {
    markX(32, 198);
  }
  
  // Küldemény típusok - "A meghatalmazás a következő küldemények átvételére terjed ki"
  // Első sor: Levél, Utalvány, Nyugdíj utalvány
  if (data.authType.letter) markX(235, 180);
  if (data.authType.money) markX(335, 180);
  if (data.authType.pension) markX(470, 180);
  
  // Második sor: Csomag, Időgarantált, Értékküldemény
  if (data.authType.package) markX(70, 163);
  if (data.authType.express) markX(235, 163);
  if (data.authType.valuables) markX(470, 163);
  
  // Harmadik sor: Hivatalos irat, Távirat, Vakok írása
  if (data.authType.official) markX(95, 146);
  if (data.authType.telegram) markX(285, 146);
  if (data.authType.braille) markX(470, 146);

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
