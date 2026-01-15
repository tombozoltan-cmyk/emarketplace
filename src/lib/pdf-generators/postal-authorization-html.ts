/**
 * HTML alapú Meghatalmazás generátor
 * Az eredeti Magyar Posta űrlap mintájára készült - TELJES VERZIÓ
 */

export type PostalAuthHTMLData = {
  // Meghatalmazó (magánszemély vagy képviselő)
  authorizer: {
    name?: string;
    birthName?: string;
    motherName?: string;
    birthPlace?: string;
    birthDate?: string;
  };
  // Meghatalmazó szervezet (opcionális)
  authorizerOrg?: {
    name?: string;
    address?: string;
    registrationNumber?: string;
    noRegistration?: boolean;
  };
  // Kézbesítési cím
  deliveryAddress: string;
  
  // Meghatalmazott magánszemély
  authorized?: {
    name?: string;
    birthName?: string;
    motherName?: string;
    birthPlace?: string;
    birthDate?: string;
  };
  // Meghatalmazott szervezet
  authorizedOrg?: {
    name?: string;
    address?: string;
    registrationNumber?: string;
    noRegistration?: boolean;
  };
  authorizedDeliveryAddress?: string;
  
  // Meghatalmazás típusa
  authType: {
    singlePackage?: string;
    validUntil?: string;
    indefinite?: boolean;
    allPackages?: boolean;
    exceptPersonal?: boolean;
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
  
  // Aláírás infók
  date?: string;
  city?: string;
};

function checkbox(checked?: boolean): string {
  return checked 
    ? '<span style="display:inline-block;width:11px;height:11px;border:1px solid #000;text-align:center;line-height:9px;font-weight:bold;font-size:9px;">X</span>'
    : '<span style="display:inline-block;width:11px;height:11px;border:1px solid #000;"></span>';
}

function field(value?: string, minWidth: string = "150px"): string {
  return `<span style="display:inline-block;min-width:${minWidth};border-bottom:1px solid #000;padding:1px 3px;font-weight:bold;font-size:9px;">${value || "&nbsp;"}</span>`;
}

// Fix székhely cím - minden ügyfél cégnek ez lesz az új székhelye
export const SZEKHELY_CIM = "1064 Budapest, Izabella utca 68/B. A lh. Fsz/5.";

// E-Marketplace Kft. fix adatok
const EMARKETPLACE = {
  name: "E-Marketplace Kft.",
  address: SZEKHELY_CIM,
  registrationNumber: "01-09-296567",
};

export function generatePostalAuthHTML(data: PostalAuthHTMLData): string {
  const today = new Date().toLocaleDateString("hu-HU", { year: "numeric", month: "long", day: "numeric" });
  
  return `
<!DOCTYPE html>
<html lang="hu">
<head>
  <meta charset="UTF-8">
  <title>Meghatalmazás - küldemények átvételére</title>
  <style>
    @page {
      size: A4;
      margin: 10mm;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { 
      font-family: 'Times New Roman', Times, serif; 
      font-size: 10px; 
      line-height: 1.3;
      padding: 15px;
      width: 210mm;
      min-height: 297mm;
      margin: 0 auto;
      background: white;
    }
    @media print {
      body { 
        padding: 0; 
        width: 100%;
        min-height: auto;
      }
      .no-print { display: none; }
    }
    .header {
      text-align: center;
      margin-bottom: 15px;
      border-bottom: 2px solid #000;
      padding-bottom: 10px;
    }
    .header h1 {
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 5px;
    }
    .header .subtitle {
      font-size: 12px;
    }
    .section {
      margin-bottom: 15px;
      border: 1px solid #000;
      padding: 10px;
    }
    .section-title {
      font-weight: bold;
      font-size: 11px;
      margin-bottom: 8px;
      background: #f0f0f0;
      padding: 3px 5px;
      margin: -10px -10px 10px -10px;
    }
    .two-columns {
      display: flex;
      gap: 15px;
    }
    .column {
      flex: 1;
      border: 1px solid #666;
      padding: 8px;
    }
    .column-title {
      font-weight: bold;
      font-size: 10px;
      text-align: center;
      margin-bottom: 8px;
      border-bottom: 1px solid #666;
      padding-bottom: 5px;
    }
    .field-row {
      margin-bottom: 6px;
      display: flex;
      align-items: baseline;
    }
    .field-label {
      font-size: 10px;
      min-width: 120px;
    }
    .field-value {
      flex: 1;
      border-bottom: 1px solid #000;
      min-height: 16px;
      padding: 2px 5px;
      font-weight: bold;
    }
    .checkbox-section {
      margin-top: 10px;
    }
    .checkbox-row {
      display: flex;
      align-items: center;
      margin-bottom: 5px;
      gap: 8px;
    }
    .checkbox-row label {
      font-size: 10px;
    }
    .checkbox-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 5px;
      margin-top: 8px;
    }
    .checkbox-item {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 10px;
    }
    .signatures {
      margin-top: 30px;
      display: flex;
      justify-content: space-between;
    }
    .signature-box {
      width: 45%;
      text-align: center;
    }
    .signature-line {
      border-top: 1px solid #000;
      margin-top: 50px;
      padding-top: 5px;
      font-size: 10px;
    }
    .footer {
      margin-top: 20px;
      font-size: 9px;
      color: #666;
      border-top: 1px solid #ccc;
      padding-top: 10px;
    }
    .info-text {
      font-size: 9px;
      color: #333;
      margin-bottom: 10px;
      font-style: italic;
    }
  </style>
</head>
<body>

<div class="header">
  <h1>POSTAI MEGHATALMAZÁS</h1>
  <div class="subtitle">jelen okiratban felsorolt küldemények átvételére</div>
</div>

<p class="info-text">Szíveskedjék a hátoldalon lévő tájékoztatást a meghatalmazás kitöltése, illetve aláírása előtt átolvasni.</p>

<!-- 1. MEGHATALMAZÓ ADATAI -->
<div class="section">
  <div class="section-title">1. MEGHATALMAZÓ ADATAI</div>
  
  <div class="two-columns">
    <!-- Bal oldal: Magánszemély -->
    <div class="column">
      <div class="column-title">Magánszemély esetén</div>
      
      <div class="field-row">
        <span class="field-label">Név<sup>1)</sup>:</span>
        <span class="field-value">${data.authorizer.name || ""}</span>
      </div>
      
      <div class="field-row">
        <span class="field-label">Születéskori név:</span>
        <span class="field-value">${data.authorizer.birthName || ""}</span>
      </div>
      
      <div class="field-row">
        <span class="field-label">Anyja születéskori neve:</span>
        <span class="field-value">${data.authorizer.motherName || ""}</span>
      </div>
      
      <div class="field-row">
        <span class="field-label">Születési hely, idő:</span>
        <span class="field-value">${data.authorizer.birthPlace || ""}, ${data.authorizer.birthDate || ""}</span>
      </div>
    </div>
    
    <!-- Jobb oldal: Szervezet -->
    <div class="column">
      <div class="column-title">Szervezet esetén</div>
      
      <div class="field-row">
        <span class="field-label">Szervezet neve, székhelye<sup>2)</sup>:</span>
        <span class="field-value">${data.authorizerOrg?.name || ""}</span>
      </div>
      
      <div class="field-row">
        <span class="field-label"></span>
        <span class="field-value">${SZEKHELY_CIM}</span>
      </div>
      
      <div class="field-row">
        <span class="field-label">A szervezet cégjegyzékszáma:</span>
        <span class="field-value">${data.authorizerOrg?.registrationNumber || ""}</span>
      </div>
      
      <div class="checkbox-row">
        ${checkbox(data.authorizerOrg?.noRegistration)}
        <label>nem rendelkezik cégjegyzékszámmal</label>
      </div>
    </div>
  </div>
  
  <div class="field-row" style="margin-top: 10px;">
    <span class="field-label">Cím, amelyre érkező küldemények átvételére a meghatalmazás szól:</span>
    <span class="field-value" style="min-width: 250px;">${SZEKHELY_CIM}</span>
  </div>
</div>

<!-- 2. MEGHATALMAZOTT ADATAI -->
<div class="section">
  <div class="section-title">2. MEGHATALMAZOTT ADATAI</div>
  
  <div class="two-columns">
    <!-- Bal oldal: Magánszemély (üresen marad) -->
    <div class="column">
      <div class="column-title">Magánszemély esetén</div>
      
      <div class="field-row">
        <span class="field-label">Név<sup>1)</sup>:</span>
        <span class="field-value">${data.authorized?.name || ""}</span>
      </div>
      
      <div class="field-row">
        <span class="field-label">Születéskori név:</span>
        <span class="field-value">${data.authorized?.birthName || ""}</span>
      </div>
      
      <div class="field-row">
        <span class="field-label">Anyja születéskori neve:</span>
        <span class="field-value">${data.authorized?.motherName || ""}</span>
      </div>
      
      <div class="field-row">
        <span class="field-label">Születési hely, idő:</span>
        <span class="field-value">${data.authorized?.birthPlace || ""}${data.authorized?.birthDate ? ", " + data.authorized.birthDate : ""}</span>
      </div>
    </div>
    
    <!-- Jobb oldal: Szervezet - E-Marketplace Kft. -->
    <div class="column">
      <div class="column-title">Szervezet esetén</div>
      
      <div class="field-row">
        <span class="field-label">Szervezet neve, székhelye<sup>2)</sup>:</span>
        <span class="field-value">${EMARKETPLACE.name}</span>
      </div>
      
      <div class="field-row">
        <span class="field-label"></span>
        <span class="field-value">${EMARKETPLACE.address}</span>
      </div>
      
      <div class="field-row">
        <span class="field-label">A szervezet cégjegyzékszáma,<br>vagy a nyilvántartásba vételt<br>elrendelő intézmény neve és a<br>szervezet nyilvántartási száma:</span>
        <span class="field-value">${EMARKETPLACE.registrationNumber}</span>
      </div>
      
      <div class="checkbox-row">
        ${checkbox(false)}
        <label>nem rendelkezik cégjegyzékszámmal</label>
      </div>
    </div>
  </div>
  
  <div class="field-row" style="margin-top: 10px;">
    <span class="field-label">Cím, amelyre érkező küldemények átvételére a meghatalmazás szól:</span>
    <span class="field-value" style="min-width: 250px;">${EMARKETPLACE.address}</span>
  </div>
</div>

<!-- 3. MEGHATALMAZÁS TÍPUSA -->
<div class="section">
  <div class="section-title">Kérjük „X"-szel jelölje az alábbi lehetőségek közül a kiválasztottat.</div>
  
  <div class="checkbox-section">
    <div class="checkbox-row">
      ${checkbox(!!data.authType.singlePackage)}
      <label>A meghatalmazás a ${field(data.authType.singlePackage, "200px")} azonosító számú küldemény átvételére szól<sup>3)</sup>.</label>
    </div>
    
    <div class="checkbox-row">
      ${checkbox(!!data.authType.validUntil)}
      <label>A meghatalmazás meghatározott ideig szól<sup>3)</sup> ${field(data.authType.validUntil, "100px")}-ig (max. 5 évig),</label>
      ${checkbox(data.authType.indefinite)}
      <label>határozatlan ideig hatályos<sup>3)</sup></label>
    </div>
    
    <div class="checkbox-row">
      ${checkbox(data.authType.allPackages)}
      <label>A meghatalmazás valamennyi (postai és nem postai) küldemény átvételére kiterjed<sup>3)</sup>:</label>
    </div>
    
    <div class="checkbox-row">
      ${checkbox(data.authType.exceptPersonal)}
      <label>Saját kezébe szóló küldeményeinek kivételével minden más küldeményre:</label>
    </div>
  </div>
  
  <div style="margin-top: 10px; font-size: 10px;">
    <strong>A meghatalmazás a következő küldemények átvételére terjed ki<sup>4)</sup>:</strong>
  </div>
  
  <div class="checkbox-grid">
    <div class="checkbox-item">${checkbox(data.authType.letter)} Levél:</div>
    <div class="checkbox-item">${checkbox(data.authType.money)} Utalvány:</div>
    <div class="checkbox-item">${checkbox(data.authType.pension)} Nyugdíj utalvány:</div>
    
    <div class="checkbox-item">${checkbox(data.authType.package)} Csomag:</div>
    <div class="checkbox-item">${checkbox(data.authType.express)} Időgarantált küldemény:</div>
    <div class="checkbox-item">${checkbox(data.authType.valuables)} Értékküldemény:</div>
    
    <div class="checkbox-item">${checkbox(data.authType.official)} Hivatalos irat:</div>
    <div class="checkbox-item">${checkbox(data.authType.telegram)} Távirat:</div>
    <div class="checkbox-item">${checkbox(data.authType.braille)} Vakok írása:</div>
  </div>
</div>

<!-- ALÁÍRÁSOK -->
<div style="margin-top: 25px; display: flex; justify-content: space-between;">
  <!-- Bal oldal: Meghatalmazó -->
  <div style="width: 48%;">
    <div style="font-size: 10px; margin-bottom: 5px;">Meghatalmazó/k aláírása/i, szervezet esetén cégszerű aláírás:</div>
    <div style="height: 60px; border-bottom: 1px solid #000;"></div>
    <div style="text-align: center; font-size: 9px; margin-top: 3px;">
      <strong>MEGHATALMAZÓ</strong><br>
      (cégszerű aláírás, P.H.)
    </div>
    
    <div style="margin-top: 20px; font-size: 9px;">
      A meghatalmazó/k aláírásának valódiságát igazolta,<br>
      hitelesítette (postai dolgozó aláírása)<sup>5)</sup>:
    </div>
    <div style="height: 40px; border-bottom: 1px solid #000; margin-top: 5px;"></div>
  </div>
  
  <!-- Jobb oldal: Tanúk -->
  <div style="width: 48%;">
    <div style="font-size: 10px; margin-bottom: 5px;">Tanú<sup>6)</sup>:</div>
    
    <!-- 1. tanú -->
    <div style="border: 1px solid #666; padding: 8px; margin-bottom: 8px;">
      <div style="font-size: 9px; margin-bottom: 3px;">1. tanú</div>
      <div style="display: flex; gap: 10px; font-size: 9px;">
        <span>név:</span>
        <span style="flex: 1; border-bottom: 1px solid #000;">&nbsp;</span>
      </div>
      <div style="display: flex; gap: 10px; font-size: 9px; margin-top: 5px;">
        <span>lakcím:</span>
        <span style="flex: 1; border-bottom: 1px solid #000;">&nbsp;</span>
      </div>
    </div>
    
    <!-- 2. tanú -->
    <div style="border: 1px solid #666; padding: 8px;">
      <div style="font-size: 9px; margin-bottom: 3px;">2. tanú</div>
      <div style="display: flex; gap: 10px; font-size: 9px;">
        <span>név:</span>
        <span style="flex: 1; border-bottom: 1px solid #000;">&nbsp;</span>
      </div>
      <div style="display: flex; gap: 10px; font-size: 9px; margin-top: 5px;">
        <span>lakcím:</span>
        <span style="flex: 1; border-bottom: 1px solid #000;">&nbsp;</span>
      </div>
    </div>
  </div>
</div>

<div style="margin-top: 15px; text-align: center; font-size: 10px;">
  A meghatalmazás kelte (hely, dátum): <strong>${data.city || "_______________"}, ${data.date || today}</strong>
</div>

<div class="footer">
  <p><sup>1)</sup> A felsorolt adatok kitöltése kötelező, amennyiben a meghatalmazó és/vagy a meghatalmazott természetes személy.</p>
  <p><sup>2)</sup> A felsorolt adatok kitöltése kötelező, amennyiben a meghatalmazó és/vagy a meghatalmazott jogi személy, a jogi személyiség nélküli jogalany vagy egyéb szervezet.</p>
  <p><sup>3)</sup> Meg kell jelölni, hogy egy esetre vagy határozott, illetve határozatlan időre szóljon a meghatalmazás.</p>
  <p><sup>4)</sup> A meghatalmazás kiterjedhet a nyugdíj utalványra, időgarantált küldeményre, hivatalos iratra, a távíratra, a levélküldeményekre, csomagküldeményekre, utalványokra körére.</p>
  <p style="margin-top: 10px;"><strong>A meghatalmazással kézbesített postai küldeménnyel kapcsolatos postai szolgáltatási szerződésére a 2012. évi CLIX. törvény és a 335/2012. (XII.4.) Korm. rendelet rendelkezései az irányadók.</strong></p>
</div>

</body>
</html>
`;
}

/**
 * HTML megnyitása új ablakban nyomtatáshoz
 */
export function openPostalAuthForPrint(data: PostalAuthHTMLData): void {
  const html = generatePostalAuthHTML(data);
  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    // Auto print after a short delay
    setTimeout(() => {
      printWindow.print();
    }, 500);
  }
}

/**
 * HTML letöltése fájlként
 */
export function downloadPostalAuthHTML(data: PostalAuthHTMLData, filename: string = "postai-meghatalmazas.html"): void {
  const html = generatePostalAuthHTML(data);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
