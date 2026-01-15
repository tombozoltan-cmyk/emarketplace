import { PDFDocument, PDFFont, PDFPage, rgb, StandardFonts } from "pdf-lib";

const PAGE_WIDTH = 595.28; // A4
const PAGE_HEIGHT = 841.89; // A4
const MARGIN = 50;
const LINE_HEIGHT = 16;

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

type ContractPdfData = {
  // Cég adatok
  companyName: string;
  companyShortName?: string;
  companyLegalForm: string;
  companyRegistrationNumber?: string;
  companyTaxNumber?: string;
  companyMainActivity?: string;
  isNewCompany: boolean;
  
  // Tulajdonos(ok)
  owners: {
    fullName: string;
    birthName?: string;
    birthPlace: string;
    birthDate: string;
    motherName: string;
    address: string;
    idType: string;
    idNumber: string;
    nationality: string;
    ownershipPercent: number;
  }[];
  
  // Képviselő
  representative: {
    fullName: string;
    birthName?: string;
    birthPlace: string;
    birthDate: string;
    motherName: string;
    address: string;
    idType: string;
    idNumber: string;
    nationality: string;
    position: string;
    isForeign: boolean;
  };
  
  // Kapcsolattartó
  contact: {
    fullName: string;
    email: string;
    phone: string;
    address?: string;
  };
  
  // PEP
  pepDeclaration: {
    isPep: boolean;
    isPepRelative: boolean;
    isPepAssociate: boolean;
    pepDetails?: string;
  };
  
  // Szolgáltatás
  packageName: string;
  monthlyPrice: number;
  annualPrice: number;
  
  // Dátum
  date: string;
  contractId?: string;
};

function drawText(
  page: PDFPage,
  text: string,
  x: number,
  y: number,
  font: PDFFont,
  size: number = 10,
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

function drawLabelValue(
  page: PDFPage,
  label: string,
  value: string,
  x: number,
  y: number,
  font: PDFFont,
  boldFont: PDFFont
) {
  drawText(page, label, x, y, font, 9);
  drawText(page, value || "-", x + 140, y, boldFont, 10);
}

// =============================================
// SZÉKHELYSZOLGÁLTATÁSI SZERZŐDÉS
// =============================================
export async function generateContractPDF(data: ContractPdfData): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN;

  // Fejléc
  drawText(page, "SZÉKHELYSZOLGÁLTATÁSI SZERZŐDÉS", PAGE_WIDTH / 2 - 100, y, boldFont, 14);
  y -= LINE_HEIGHT * 2;
  
  if (data.contractId) {
    drawText(page, `Szerződésszám: ${data.contractId}`, MARGIN, y, font, 9);
    y -= LINE_HEIGHT;
  }
  
  drawText(page, `Kelt: ${data.date}`, MARGIN, y, font, 9);
  y -= LINE_HEIGHT * 2;

  // Szolgáltató
  drawText(page, "1. SZOLGÁLTATÓ ADATAI", MARGIN, y, boldFont, 11);
  y -= LINE_HEIGHT * 1.2;
  
  drawText(page, "Cégnév: E-Marketplace Szolgáltató Korlátolt Felelősségű Társaság", MARGIN, y, font, 9);
  y -= LINE_HEIGHT;
  drawText(page, "Székhely: 1052 Budapest, Váci utca 8. 1. em.", MARGIN, y, font, 9);
  y -= LINE_HEIGHT;
  drawText(page, "Cégjegyzékszám: 01-09-XXXXXX", MARGIN, y, font, 9);
  y -= LINE_HEIGHT;
  drawText(page, "Adószám: XXXXXXXX-X-XX", MARGIN, y, font, 9);
  y -= LINE_HEIGHT * 2;

  // Megrendelő
  drawText(page, "2. MEGRENDELŐ ADATAI", MARGIN, y, boldFont, 11);
  y -= LINE_HEIGHT * 1.2;
  
  drawLabelValue(page, "Cégnév:", data.companyName, MARGIN, y, font, boldFont);
  y -= LINE_HEIGHT;
  
  if (data.companyShortName) {
    drawLabelValue(page, "Rövidített név:", data.companyShortName, MARGIN, y, font, boldFont);
    y -= LINE_HEIGHT;
  }
  
  drawLabelValue(page, "Cégforma:", data.companyLegalForm.toUpperCase(), MARGIN, y, font, boldFont);
  y -= LINE_HEIGHT;
  
  if (data.companyRegistrationNumber) {
    drawLabelValue(page, "Cégjegyzékszám:", data.companyRegistrationNumber, MARGIN, y, font, boldFont);
    y -= LINE_HEIGHT;
  }
  
  if (data.companyTaxNumber) {
    drawLabelValue(page, "Adószám:", data.companyTaxNumber, MARGIN, y, font, boldFont);
    y -= LINE_HEIGHT;
  }
  
  drawLabelValue(page, "Típus:", data.isNewCompany ? "Alakuló cég" : "Működő cég", MARGIN, y, font, boldFont);
  y -= LINE_HEIGHT * 2;

  // Szolgáltatás
  drawText(page, "3. SZOLGÁLTATÁS", MARGIN, y, boldFont, 11);
  y -= LINE_HEIGHT * 1.2;
  
  drawLabelValue(page, "Csomag:", data.packageName, MARGIN, y, font, boldFont);
  y -= LINE_HEIGHT;
  drawLabelValue(page, "Havi díj:", `${data.monthlyPrice.toLocaleString()} Ft + ÁFA`, MARGIN, y, font, boldFont);
  y -= LINE_HEIGHT;
  drawLabelValue(page, "Éves díj:", `${data.annualPrice.toLocaleString()} Ft + ÁFA`, MARGIN, y, font, boldFont);
  y -= LINE_HEIGHT * 2;

  // Képviselő
  drawText(page, "4. KÉPVISELŐ / ÜGYVEZETŐ", MARGIN, y, boldFont, 11);
  y -= LINE_HEIGHT * 1.2;
  
  drawLabelValue(page, "Név:", data.representative.fullName, MARGIN, y, font, boldFont);
  y -= LINE_HEIGHT;
  drawLabelValue(page, "Beosztás:", data.representative.position, MARGIN, y, font, boldFont);
  y -= LINE_HEIGHT;
  drawLabelValue(page, "Születési hely, idő:", `${data.representative.birthPlace}, ${data.representative.birthDate}`, MARGIN, y, font, boldFont);
  y -= LINE_HEIGHT;
  drawLabelValue(page, "Anyja neve:", data.representative.motherName, MARGIN, y, font, boldFont);
  y -= LINE_HEIGHT;
  drawLabelValue(page, "Lakcím:", data.representative.address, MARGIN, y, font, boldFont);
  y -= LINE_HEIGHT;
  drawLabelValue(page, "Okmány típusa:", data.representative.idType === "passport" ? "Útlevél" : "Személyi igazolvány", MARGIN, y, font, boldFont);
  y -= LINE_HEIGHT;
  drawLabelValue(page, "Okmány száma:", data.representative.idNumber, MARGIN, y, font, boldFont);
  y -= LINE_HEIGHT * 2;

  // Kapcsolattartó
  drawText(page, "5. KAPCSOLATTARTÓ", MARGIN, y, boldFont, 11);
  y -= LINE_HEIGHT * 1.2;
  
  drawLabelValue(page, "Név:", data.contact.fullName, MARGIN, y, font, boldFont);
  y -= LINE_HEIGHT;
  drawLabelValue(page, "Email:", data.contact.email, MARGIN, y, font, boldFont);
  y -= LINE_HEIGHT;
  drawLabelValue(page, "Telefon:", data.contact.phone, MARGIN, y, font, boldFont);
  y -= LINE_HEIGHT * 2;

  // Új oldal a feltételekhez
  page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  y = PAGE_HEIGHT - MARGIN;

  drawText(page, "6. SZERZŐDÉSI FELTÉTELEK", MARGIN, y, boldFont, 11);
  y -= LINE_HEIGHT * 1.5;

  const terms = [
    "6.1. A Szolgáltató vállalja, hogy a Megrendelő számára székhelyszolgáltatást nyújt a mindenkori",
    "      hatályos jogszabályoknak megfelelően.",
    "",
    "6.2. A Megrendelő tudomásul veszi, hogy a székhelycím kizárólag hivatalos levelezési célra",
    "      használható, a tényleges üzleti tevékenység végzése a székhelyen nem megengedett.",
    "",
    "6.3. A Szolgáltató vállalja a Megrendelő postai küldeményeinek átvételét és értesítés küldését",
    "      a beérkezett küldeményekről.",
    "",
    "6.4. A szerződés határozatlan időre jön létre, bármely fél 30 napos felmondási idővel mondhatja fel.",
    "",
    "6.5. A szolgáltatási díj előre fizetendő, a választott fizetési gyakoriság szerint.",
    "",
    "6.6. A Megrendelő köteles a Szolgáltatót haladéktalanul értesíteni minden, a cégadatokban",
    "      bekövetkezett változásról.",
    "",
    "6.7. A Szolgáltató a Pmt. (2017. évi LIII. törvény) előírásai szerint ügyfél-átvilágítást végez,",
    "      melyhez a Megrendelő köteles együttműködni.",
  ];

  for (const line of terms) {
    drawText(page, line, MARGIN, y, font, 9);
    y -= LINE_HEIGHT;
  }

  y -= LINE_HEIGHT * 2;

  // Aláírások
  drawText(page, "7. ALÁÍRÁSOK", MARGIN, y, boldFont, 11);
  y -= LINE_HEIGHT * 3;

  const signY = y;
  
  // Szolgáltató
  page.drawLine({
    start: { x: MARGIN, y: signY },
    end: { x: MARGIN + 180, y: signY },
    thickness: 0.5,
    color: rgb(0, 0, 0),
  });
  drawText(page, "Szolgáltató", MARGIN + 60, signY - 15, font, 9);
  drawText(page, "E-Marketplace Kft.", MARGIN + 45, signY - 27, font, 8);

  // Megrendelő
  page.drawLine({
    start: { x: PAGE_WIDTH - MARGIN - 180, y: signY },
    end: { x: PAGE_WIDTH - MARGIN, y: signY },
    thickness: 0.5,
    color: rgb(0, 0, 0),
  });
  drawText(page, "Megrendelő", PAGE_WIDTH - MARGIN - 120, signY - 15, font, 9);
  drawText(page, data.companyName, PAGE_WIDTH - MARGIN - 150, signY - 27, font, 8, { maxWidth: 160 });

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}

// =============================================
// ÜGYFÉL-ÁTVILÁGÍTÁSI ADATLAP
// =============================================
export async function generateKycFormPDF(data: ContractPdfData): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN;

  // Fejléc
  drawText(page, "ÜGYFÉL-ÁTVILÁGÍTÁSI ADATLAP", PAGE_WIDTH / 2 - 90, y, boldFont, 14);
  y -= LINE_HEIGHT;
  drawText(page, "(2017. évi LIII. törvény alapján)", PAGE_WIDTH / 2 - 70, y, font, 10);
  y -= LINE_HEIGHT * 2;
  
  drawText(page, `Kitöltés dátuma: ${data.date}`, MARGIN, y, font, 9);
  y -= LINE_HEIGHT * 2;

  // Cég adatok
  drawText(page, "I. ÜGYFÉL (CÉG) ADATAI", MARGIN, y, boldFont, 11);
  y -= LINE_HEIGHT * 1.2;
  
  drawLabelValue(page, "Cégnév:", data.companyName, MARGIN, y, font, boldFont);
  y -= LINE_HEIGHT;
  drawLabelValue(page, "Cégforma:", data.companyLegalForm.toUpperCase(), MARGIN, y, font, boldFont);
  y -= LINE_HEIGHT;
  
  if (data.companyRegistrationNumber) {
    drawLabelValue(page, "Cégjegyzékszám:", data.companyRegistrationNumber, MARGIN, y, font, boldFont);
    y -= LINE_HEIGHT;
  }
  
  if (data.companyMainActivity) {
    drawLabelValue(page, "Főtevékenység:", data.companyMainActivity, MARGIN, y, font, boldFont);
    y -= LINE_HEIGHT;
  }
  
  y -= LINE_HEIGHT;

  // Tulajdonosok
  drawText(page, "II. TÉNYLEGES TULAJDONOS(OK) ADATAI", MARGIN, y, boldFont, 11);
  y -= LINE_HEIGHT * 1.2;

  for (let i = 0; i < data.owners.length; i++) {
    const owner = data.owners[i];
    
    if (data.owners.length > 1) {
      drawText(page, `${i + 1}. tulajdonos (${owner.ownershipPercent}%)`, MARGIN, y, boldFont, 10);
      y -= LINE_HEIGHT;
    }
    
    drawLabelValue(page, "Teljes név:", owner.fullName, MARGIN, y, font, boldFont);
    y -= LINE_HEIGHT;
    
    if (owner.birthName) {
      drawLabelValue(page, "Születési név:", owner.birthName, MARGIN, y, font, boldFont);
      y -= LINE_HEIGHT;
    }
    
    drawLabelValue(page, "Születési hely, idő:", `${owner.birthPlace}, ${owner.birthDate}`, MARGIN, y, font, boldFont);
    y -= LINE_HEIGHT;
    drawLabelValue(page, "Anyja neve:", owner.motherName, MARGIN, y, font, boldFont);
    y -= LINE_HEIGHT;
    drawLabelValue(page, "Állampolgárság:", owner.nationality, MARGIN, y, font, boldFont);
    y -= LINE_HEIGHT;
    drawLabelValue(page, "Lakcím:", owner.address, MARGIN, y, font, boldFont);
    y -= LINE_HEIGHT;
    drawLabelValue(page, "Okmány típusa:", owner.idType === "passport" ? "Útlevél" : "Személyi igazolvány", MARGIN, y, font, boldFont);
    y -= LINE_HEIGHT;
    drawLabelValue(page, "Okmány száma:", owner.idNumber, MARGIN, y, font, boldFont);
    y -= LINE_HEIGHT;
    drawLabelValue(page, "Tulajdoni hányad:", `${owner.ownershipPercent}%`, MARGIN, y, font, boldFont);
    y -= LINE_HEIGHT * 1.5;

    // Új oldal ha kell
    if (y < 150) {
      page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      y = PAGE_HEIGHT - MARGIN;
    }
  }

  y -= LINE_HEIGHT;

  // Képviselő
  drawText(page, "III. KÉPVISELETRE JOGOSULT SZEMÉLY ADATAI", MARGIN, y, boldFont, 11);
  y -= LINE_HEIGHT * 1.2;
  
  drawLabelValue(page, "Teljes név:", data.representative.fullName, MARGIN, y, font, boldFont);
  y -= LINE_HEIGHT;
  drawLabelValue(page, "Beosztás:", data.representative.position, MARGIN, y, font, boldFont);
  y -= LINE_HEIGHT;
  drawLabelValue(page, "Születési hely, idő:", `${data.representative.birthPlace}, ${data.representative.birthDate}`, MARGIN, y, font, boldFont);
  y -= LINE_HEIGHT;
  drawLabelValue(page, "Anyja neve:", data.representative.motherName, MARGIN, y, font, boldFont);
  y -= LINE_HEIGHT;
  drawLabelValue(page, "Állampolgárság:", data.representative.nationality, MARGIN, y, font, boldFont);
  y -= LINE_HEIGHT;
  drawLabelValue(page, "Lakcím:", data.representative.address, MARGIN, y, font, boldFont);
  y -= LINE_HEIGHT;
  drawLabelValue(page, "Okmány száma:", data.representative.idNumber, MARGIN, y, font, boldFont);
  y -= LINE_HEIGHT * 2;

  // Új oldal ha kell
  if (y < 200) {
    page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    y = PAGE_HEIGHT - MARGIN;
  }

  // Nyilatkozat
  drawText(page, "IV. NYILATKOZAT", MARGIN, y, boldFont, 11);
  y -= LINE_HEIGHT * 1.2;

  const declaration = [
    "Alulírott kijelentem, hogy a fenti adatok a valóságnak megfelelnek.",
    "Tudomásul veszem, hogy a 2017. évi LIII. törvény értelmében a szolgáltató",
    "köteles az ügyfél-átvilágítást elvégezni és az adatokat 8 évig megőrizni.",
  ];

  for (const line of declaration) {
    drawText(page, line, MARGIN, y, font, 9);
    y -= LINE_HEIGHT;
  }

  y -= LINE_HEIGHT * 3;

  // Aláírás
  page.drawLine({
    start: { x: MARGIN, y: y },
    end: { x: MARGIN + 200, y: y },
    thickness: 0.5,
    color: rgb(0, 0, 0),
  });
  drawText(page, "Ügyfél aláírása", MARGIN + 60, y - 15, font, 9);
  drawText(page, `${data.date}`, MARGIN + 70, y - 27, font, 8);

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}

// =============================================
// PEP NYILATKOZAT
// =============================================
export async function generatePepDeclarationPDF(data: ContractPdfData): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN;

  // Fejléc
  drawText(page, "KIEMELT KÖZSZEREPLŐI (PEP) NYILATKOZAT", PAGE_WIDTH / 2 - 120, y, boldFont, 14);
  y -= LINE_HEIGHT;
  drawText(page, "(2017. évi LIII. törvény 4. § (2) bekezdés alapján)", PAGE_WIDTH / 2 - 100, y, font, 10);
  y -= LINE_HEIGHT * 3;

  // Ügyfél adatai
  drawText(page, "NYILATKOZÓ ADATAI", MARGIN, y, boldFont, 11);
  y -= LINE_HEIGHT * 1.2;
  
  drawLabelValue(page, "Név:", data.representative.fullName, MARGIN, y, font, boldFont);
  y -= LINE_HEIGHT;
  drawLabelValue(page, "Születési hely, idő:", `${data.representative.birthPlace}, ${data.representative.birthDate}`, MARGIN, y, font, boldFont);
  y -= LINE_HEIGHT;
  drawLabelValue(page, "Anyja neve:", data.representative.motherName, MARGIN, y, font, boldFont);
  y -= LINE_HEIGHT;
  drawLabelValue(page, "Lakcím:", data.representative.address, MARGIN, y, font, boldFont);
  y -= LINE_HEIGHT * 2;

  // Cég adatai
  drawLabelValue(page, "Cég neve:", data.companyName, MARGIN, y, font, boldFont);
  y -= LINE_HEIGHT * 2;

  // Nyilatkozat
  drawText(page, "NYILATKOZAT", MARGIN, y, boldFont, 11);
  y -= LINE_HEIGHT * 1.5;

  drawText(page, "Alulírott büntetőjogi felelősségem tudatában kijelentem, hogy:", MARGIN, y, font, 10);
  y -= LINE_HEIGHT * 2;

  // Checkboxok
  const checkYes = data.pepDeclaration.isPep ? "[X]" : "[ ]";
  const checkNo = data.pepDeclaration.isPep ? "[ ]" : "[X]";
  
  drawText(page, `${checkNo} NEM vagyok kiemelt közszereplő (PEP)`, MARGIN + 20, y, font, 10);
  y -= LINE_HEIGHT;
  drawText(page, `${checkYes} Kiemelt közszereplő (PEP) VAGYOK`, MARGIN + 20, y, font, 10);
  y -= LINE_HEIGHT * 2;

  const checkRelYes = data.pepDeclaration.isPepRelative ? "[X]" : "[ ]";
  const checkRelNo = data.pepDeclaration.isPepRelative ? "[ ]" : "[X]";
  
  drawText(page, `${checkRelNo} NEM vagyok kiemelt közszereplő közeli hozzátartozója`, MARGIN + 20, y, font, 10);
  y -= LINE_HEIGHT;
  drawText(page, `${checkRelYes} Kiemelt közszereplő közeli hozzátartozója VAGYOK`, MARGIN + 20, y, font, 10);
  y -= LINE_HEIGHT * 2;

  const checkAssocYes = data.pepDeclaration.isPepAssociate ? "[X]" : "[ ]";
  const checkAssocNo = data.pepDeclaration.isPepAssociate ? "[ ]" : "[X]";
  
  drawText(page, `${checkAssocNo} NEM állok kiemelt közszereplővel közeli kapcsolatban`, MARGIN + 20, y, font, 10);
  y -= LINE_HEIGHT;
  drawText(page, `${checkAssocYes} Kiemelt közszereplővel közeli kapcsolatban ÁLLOK`, MARGIN + 20, y, font, 10);
  y -= LINE_HEIGHT * 2;

  if (data.pepDeclaration.pepDetails) {
    drawText(page, "Részletek:", MARGIN, y, boldFont, 10);
    y -= LINE_HEIGHT;
    drawText(page, data.pepDeclaration.pepDetails, MARGIN, y, font, 9, { maxWidth: PAGE_WIDTH - MARGIN * 2 });
    y -= LINE_HEIGHT * 3;
  }

  y -= LINE_HEIGHT;

  // Definíció
  drawText(page, "TÁJÉKOZTATÓ", MARGIN, y, boldFont, 10);
  y -= LINE_HEIGHT * 1.2;

  const info = [
    "Kiemelt közszereplő: olyan természetes személy, aki fontos közfeladatot lát el, vagy",
    "a nyilatkozattételt megelőző egy éven belül fontos közfeladatot látott el.",
    "",
    "Fontos közfeladat: államfő, kormányfő, miniszter, államtitkár, országgyűlési képviselő,",
    "alkotmánybíró, legfelsőbb bíróság tagja, számvevőszék tagja, központi bank vezető testületének",
    "tagja, nagykövet, magas rangú katonatiszt, állami vállalat vezető testületének tagja.",
  ];

  for (const line of info) {
    drawText(page, line, MARGIN, y, font, 8, { color: { r: 0.4, g: 0.4, b: 0.4 } });
    y -= LINE_HEIGHT * 0.9;
  }

  y -= LINE_HEIGHT * 2;

  // Aláírás
  drawText(page, `Kelt: Budapest, ${data.date}`, MARGIN, y, font, 10);
  y -= LINE_HEIGHT * 3;

  page.drawLine({
    start: { x: MARGIN, y: y },
    end: { x: MARGIN + 200, y: y },
    thickness: 0.5,
    color: rgb(0, 0, 0),
  });
  drawText(page, "Nyilatkozó aláírása", MARGIN + 50, y - 15, font, 9);

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}

export { downloadPDF } from "./postal-authorization";
