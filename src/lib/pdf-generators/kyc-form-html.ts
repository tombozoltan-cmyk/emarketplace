/**
 * Átvilágítási adatlap (KYC Form) HTML generátor
 * Pmt. szerinti ügyfél-átvilágítási dokumentum
 */

import { SZEKHELY_CIM } from "./postal-authorization-html";

export type KycFormData = {
  // I/1. Ügyfél azonosítási adatai - Jogi személy / szervezet
  company: {
    name: string;
    shortName?: string;
    address: string;  // Mindig SZEKHELY_CIM lesz
    mainActivity?: string;
    representatives?: string;  // Képviseletre jogosultak neve, beosztása
    deliveryAgent?: string;    // Kézbesítési megbízott adatai
    registrationNumber?: string;
  };
  
  // I/1. Ügyfél képviseletében eljáró személy
  representative: {
    name: string;
    birthName?: string;
    motherName?: string;
    birthPlace?: string;
    birthDate?: string;
    nationality?: string;
    idType?: string;
    idNumber?: string;
    address?: string;
    mailAddress?: string;
  };
  
  // II. Tényleges tulajdonos - természetes személy
  beneficialOwnerPerson?: {
    isSelf?: boolean;  // Saját nevében jár el
    name?: string;
    birthName?: string;
    motherName?: string;
    birthPlace?: string;
    birthDate?: string;
    nationality?: string;
    idType?: string;
    idNumber?: string;
    address?: string;
    ownershipType?: string;
    ownershipPercent?: string;
  };
  
  // II. Tényleges tulajdonos - jogi személy
  beneficialOwnerCompany?: {
    name?: string;
    shortName?: string;
    address?: string;
    mainActivity?: string;
    representatives?: string;
    deliveryAgent?: string;
    registrationNumber?: string;
    ownershipType?: string;
    ownershipPercent?: string;
  };
  
  // III. Üzleti kapcsolatra vonatkozó adatok
  businessRelation: {
    contractType?: string;
    contractSubject?: string;
    contractDuration?: string;
    riskLevel?: string;
    fulfillmentDetails?: string;
    purpose?: string;
  };
  
  // Dátumok
  date?: string;
  endDate?: string;
};

function checkbox(checked?: boolean): string {
  return checked 
    ? '<span style="display:inline-block;width:12px;height:12px;border:1px solid #000;text-align:center;line-height:10px;font-weight:bold;font-size:10px;">X</span>'
    : '<span style="display:inline-block;width:12px;height:12px;border:1px solid #000;"></span>';
}

export function generateKycFormHTML(data: KycFormData): string {
  const today = new Date().toLocaleDateString("hu-HU", { year: "numeric", month: "2-digit", day: "2-digit" });
  
  return `
<!DOCTYPE html>
<html lang="hu">
<head>
  <meta charset="UTF-8">
  <title>Átvilágítási adatlap - Pmt.</title>
  <style>
    @page {
      size: A4;
      margin: 8mm;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { 
      font-family: 'Times New Roman', Times, serif; 
      font-size: 9px; 
      line-height: 1.25;
      padding: 10px;
      width: 210mm;
      min-height: 297mm;
      margin: 0 auto;
      background: white;
    }
    @media print {
      body { padding: 0; width: 100%; min-height: auto; }
      .no-print { display: none; }
    }
    .header {
      text-align: center;
      margin-bottom: 10px;
      border-bottom: 2px solid #000;
      padding-bottom: 8px;
    }
    .header h1 {
      font-size: 14px;
      font-weight: bold;
      margin-bottom: 3px;
    }
    .header .subtitle {
      font-size: 9px;
    }
    .section {
      margin-bottom: 8px;
      border: 1px solid #000;
      padding: 6px;
    }
    .section-title {
      font-weight: bold;
      font-size: 10px;
      margin-bottom: 5px;
      background: #e0e0e0;
      padding: 2px 4px;
      margin: -6px -6px 6px -6px;
    }
    .subsection-title {
      font-weight: bold;
      font-size: 9px;
      margin: 6px 0 4px 0;
      text-decoration: underline;
    }
    .field-row {
      margin-bottom: 3px;
      display: flex;
      align-items: baseline;
      flex-wrap: wrap;
    }
    .field-label {
      font-size: 9px;
      min-width: 180px;
    }
    .field-value {
      flex: 1;
      border-bottom: 1px solid #000;
      min-height: 14px;
      padding: 1px 4px;
      font-weight: bold;
      min-width: 150px;
    }
    .field-inline {
      display: inline-block;
      border-bottom: 1px solid #000;
      min-width: 100px;
      padding: 1px 4px;
      font-weight: bold;
    }
    ol {
      margin-left: 15px;
      margin-bottom: 5px;
    }
    ol li {
      margin-bottom: 2px;
    }
    .two-columns {
      display: flex;
      gap: 10px;
    }
    .column {
      flex: 1;
    }
    .checkbox-row {
      display: flex;
      align-items: center;
      gap: 5px;
      margin-bottom: 3px;
    }
    .signature-section {
      margin-top: 15px;
      display: flex;
      justify-content: space-between;
    }
    .signature-box {
      width: 45%;
      text-align: center;
    }
    .signature-line {
      border-top: 1px solid #000;
      margin-top: 40px;
      padding-top: 3px;
      font-size: 8px;
    }
    .footer {
      margin-top: 10px;
      font-size: 8px;
      color: #666;
      border-top: 1px solid #ccc;
      padding-top: 5px;
    }
    .note {
      font-size: 8px;
      font-style: italic;
      color: #333;
      margin: 3px 0;
    }
  </style>
</head>
<body>

<div class="header">
  <h1>ÁTVILÁGÍTÁSI ADATLAP</h1>
  <div class="subtitle">A pénzmosás és a terrorizmus finanszírozása megelőzéséről és megakadályozásáról szóló<br>
  2017. évi LIII. törvény (Pmt.) szerinti ügyfél-átvilágítás</div>
</div>

<!-- I/1. ÜGYFÉL AZONOSÍTÁSI ADATAI -->
<div class="section">
  <div class="section-title">I/1. Ügyfél azonosítási adatai</div>
  
  <div class="subsection-title">Jogi személy, jogi személyiséggel nem rendelkező szervezet esetén</div>
  
  <ol>
    <li>
      <div class="field-row">
        <span class="field-label">név, rövidített név:</span>
        <span class="field-value">${data.company.name}${data.company.shortName ? ` (${data.company.shortName})` : ""}</span>
      </div>
    </li>
    <li>
      <div class="field-row">
        <span class="field-label">székhely, külföldi székhelyű vállalkozás esetén – amennyiben ilyennel rendelkezik - magyarországi fióktelepének címe:</span>
        <span class="field-value">${SZEKHELY_CIM}</span>
      </div>
    </li>
    <li>
      <div class="field-row">
        <span class="field-label">főtevékenysége:</span>
        <span class="field-value">${data.company.mainActivity || ""}</span>
      </div>
    </li>
    <li>
      <div class="field-row">
        <span class="field-label">képviseletre jogosultak neve és beosztása:</span>
        <span class="field-value">${data.company.representatives || ""}</span>
      </div>
    </li>
    <li>
      <div class="field-row">
        <span class="field-label">– ha ilyennel rendelkezik – kézbesítési megbízottjának az azonosítására alkalmas adatai:</span>
        <span class="field-value">${data.company.deliveryAgent || "E-Marketplace Kft."}</span>
      </div>
    </li>
    <li>
      <div class="field-row">
        <span class="field-label">cégjegyzékszám, vagy nyilvántartásba vételről, bejegyzésről szóló határozat szám, vagy nyilvántartási szám:</span>
        <span class="field-value">${data.company.registrationNumber || ""}</span>
      </div>
    </li>
  </ol>
  
  <div class="subsection-title">Ügyfél képviseletében eljáró személy adatai</div>
  
  <ol>
    <li>
      <div class="field-row">
        <span class="field-label">családi és utónév:</span>
        <span class="field-value">${data.representative.name || ""}</span>
      </div>
    </li>
    <li>
      <div class="field-row">
        <span class="field-label">születési családi és utónév:</span>
        <span class="field-value">${data.representative.birthName || ""}</span>
      </div>
    </li>
    <li>
      <div class="field-row">
        <span class="field-label">anyja születési neve:</span>
        <span class="field-value">${data.representative.motherName || ""}</span>
      </div>
    </li>
    <li>
      <div class="field-row">
        <span class="field-label">születési hely:</span>
        <span class="field-value">${data.representative.birthPlace || ""}</span>
      </div>
    </li>
    <li>
      <div class="field-row">
        <span class="field-label">születési idő:</span>
        <span class="field-value">${data.representative.birthDate || ""}</span>
      </div>
    </li>
    <li>
      <div class="field-row">
        <span class="field-label">állampolgárság:</span>
        <span class="field-value">${data.representative.nationality || "magyar"}</span>
      </div>
    </li>
    <li>
      <div class="field-row">
        <span class="field-label">azonosító okmány típusa és száma:</span>
        <span class="field-value">${data.representative.idType || ""} ${data.representative.idNumber || ""}</span>
      </div>
    </li>
    <li>
      <div class="field-row">
        <span class="field-label">lakcím:</span>
        <span class="field-value">${data.representative.address || ""}</span>
      </div>
    </li>
    <li>
      <div class="field-row">
        <span class="field-label">levelezési cím:</span>
        <span class="field-value">${data.representative.mailAddress || ""}</span>
      </div>
    </li>
  </ol>
  
  <div style="margin-top: 8px; border-top: 1px dashed #999; padding-top: 5px;">
    <div style="text-align: center; font-size: 8px; margin-bottom: 5px;">Az ügyfél képviseletében eljáró személy aláírása, vagy<br>Az adatok rögzítése az ügyfél Pmt. 9. § (1) bekezdésében meghatározott írásbeli nyilatkoztatása mellőzésével történt</div>
    <div style="width: 200px; margin: 0 auto; border-top: 1px solid #000; margin-top: 30px;"></div>
  </div>
</div>

<!-- II. TÉNYLEGES TULAJDONOS -->
<div class="section">
  <div class="section-title">II. Tényleges tulajdonos</div>
  
  <div class="subsection-title">Természetes személy ügyfél esetében</div>
  
  <p class="note">Alulírott <span class="field-inline">${data.beneficialOwnerPerson?.name || data.representative.name || ""}</span> nyilatkozom, hogy az üzleti kapcsolat létesítésekor a saját nevemben és érdekemben járok el. (ha I/1. rovatban azonosított személy 100 %-ban a tényleges tulajdonos)</p>
  
  <div style="width: 200px; border-top: 1px solid #000; margin: 20px 0 10px auto; text-align: center; padding-top: 3px; font-size: 8px;">aláírás</div>
  
  <p class="note">Alulírott <span class="field-inline">${data.representative.name || ""}</span> nyilatkozom, hogy az üzleti kapcsolat létesítésekor az alábbi tényleges tulajdonos(ok) nevében és / vagy érdekében járok el:</p>
  
  ${data.beneficialOwnerPerson && !data.beneficialOwnerPerson.isSelf ? `
  <ol>
    <li>családi és utónév: <span class="field-inline">${data.beneficialOwnerPerson.name || ""}</span></li>
    <li>születési családi és utónév: <span class="field-inline">${data.beneficialOwnerPerson.birthName || ""}</span></li>
    <li>anyja születési neve: <span class="field-inline">${data.beneficialOwnerPerson.motherName || ""}</span></li>
    <li>születési hely: <span class="field-inline">${data.beneficialOwnerPerson.birthPlace || ""}</span></li>
    <li>születési idő: <span class="field-inline">${data.beneficialOwnerPerson.birthDate || ""}</span></li>
    <li>állampolgárság: <span class="field-inline">${data.beneficialOwnerPerson.nationality || ""}</span></li>
    <li>azonosító okmány típusa és száma: <span class="field-inline">${data.beneficialOwnerPerson.idType || ""} ${data.beneficialOwnerPerson.idNumber || ""}</span></li>
    <li>lakcím: <span class="field-inline">${data.beneficialOwnerPerson.address || ""}</span></li>
    <li>tulajdonosi érdekeltség jellege, mértéke: <span class="field-inline">${data.beneficialOwnerPerson.ownershipType || "Önálló"} ${data.beneficialOwnerPerson.ownershipPercent || "100"}%</span></li>
  </ol>
  ` : ""}
  
  <div class="subsection-title">Jogi személy ügyfél esetében (tényleges tulajdonos)</div>
  
  ${data.beneficialOwnerCompany ? `
  <ol>
    <li>név, rövidített név: <span class="field-inline">${data.beneficialOwnerCompany.name || ""}</span></li>
    <li>székhely: <span class="field-inline">${data.beneficialOwnerCompany.address || ""}</span></li>
    <li>főtevékenysége: <span class="field-inline">${data.beneficialOwnerCompany.mainActivity || ""}</span></li>
    <li>képviseletre jogosultak neve és beosztása: <span class="field-inline">${data.beneficialOwnerCompany.representatives || ""}</span></li>
    <li>– ha ilyennel rendelkezik – kézbesítési megbízottjának adatai: <span class="field-inline">${data.beneficialOwnerCompany.deliveryAgent || ""}</span></li>
    <li>cégjegyzékszám: <span class="field-inline">${data.beneficialOwnerCompany.registrationNumber || ""}</span></li>
    <li>tulajdonosi érdekeltség jellege, mértéke: <span class="field-inline">${data.beneficialOwnerCompany.ownershipType || "Önálló"} ${data.beneficialOwnerCompany.ownershipPercent || "100"}%</span></li>
  </ol>
  ` : `
  <p class="note" style="text-align: center; padding: 10px;">– nem releváns / nincs –</p>
  `}
</div>

<!-- III. ÜZLETI KAPCSOLATRA VONATKOZÓ ADATOK -->
<div class="section">
  <div class="section-title">III. Üzleti kapcsolatra vonatkozó adatok</div>
  
  <ol>
    <li>
      <div class="field-row">
        <span class="field-label">szerződés típusa:</span>
        <span class="field-value">${data.businessRelation.contractType || "Határozatlan idejű székhelyszolgáltatás"}</span>
      </div>
    </li>
    <li>
      <div class="field-row">
        <span class="field-label">szerződés tárgya:</span>
        <span class="field-value">${data.businessRelation.contractSubject || "Székhelyszolgáltatás"}</span>
      </div>
    </li>
    <li>
      <div class="field-row">
        <span class="field-label">szerződés időtartama:</span>
        <span class="field-value">${data.businessRelation.contractDuration || "Határozatlan idejű"}</span>
      </div>
    </li>
    <li>
      <div class="field-row">
        <span class="field-label">ügyfél kockázati szintje:</span>
        <span class="field-value">${data.businessRelation.riskLevel || "Átlagos"}</span>
      </div>
      <p class="note">(átlagos/magas/alacsony – magas/alacsony kockázat indokolással)</p>
    </li>
    <li>
      <div class="field-row">
        <span class="field-label">teljesítés körülményei (hely, idő, mód):</span>
        <span class="field-value">${data.businessRelation.fulfillmentDetails || `${SZEKHELY_CIM}, ${data.date || today}, Személyes találkozó keretében`}</span>
      </div>
    </li>
    <li>
      <div class="field-row">
        <span class="field-label">információ az üzleti kapcsolat céljáról és tervezett jellegéről:</span>
        <span class="field-value">${data.businessRelation.purpose || "Székhely biztosítása határozatlan időtartamra, küldemények átvétele és az ügyfél értesítése"}</span>
      </div>
    </li>
  </ol>
</div>

<!-- ZÁRÓ RÉSZ -->
<div class="section">
  <div class="field-row">
    <span class="field-label">Adatlap elkészítésének (adatok módosításának) ideje:</span>
    <span class="field-value">${data.date || today}</span>
  </div>
  <div class="field-row">
    <span class="field-label">Üzleti kapcsolat megszűnésének időpontja:</span>
    <span class="field-value">${data.endDate || "–"}</span>
  </div>
</div>

<div class="signature-section">
  <div class="signature-box">
    <div class="signature-line">
      Ügyfél / Képviselő aláírása
    </div>
  </div>
  <div class="signature-box">
    <div class="signature-line">
      E-Marketplace Kft. aláírása
    </div>
  </div>
</div>

<div class="footer">
  <p>A 2017. évi LIII. törvény (Pmt.) alapján készült ügyfél-átvilágítási dokumentum.</p>
  <p>Az adatkezelésre a GDPR és a magyar adatvédelmi jogszabályok irányadók.</p>
</div>

</body>
</html>
`;
}

/**
 * HTML megnyitása új ablakban nyomtatáshoz
 */
export function openKycFormForPrint(data: KycFormData): void {
  const html = generateKycFormHTML(data);
  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  }
}

/**
 * HTML letöltése fájlként
 */
export function downloadKycFormHTML(data: KycFormData, filename: string = "atvilagitasi-adatlap.html"): void {
  const html = generateKycFormHTML(data);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
