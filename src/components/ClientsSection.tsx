"use client";

import React from "react";
import { usePathname } from "next/navigation";

const clients = [
  "AAS - Alex's Aviation Services Kft.",
  "Adventure Tax Kft.",
  "Agro Verba Europe Kft.",
  "AlliaPharma Europe Kft.",
  "ArcEuro Kft.",
  "ARTIE MEDIA Kft.",
  "ATS Industrial Solutions Kft.",
  "AUX Smart (Hungary) Kft.",
  "Berzee Kft.",
  "BM Services Europe Kft.",
  "CALESSINO Kft.",
  "CHISAGE NEW ENERGY Kft.",
  "Depence Communications Kft.",
  "Digital Health Navigator Kft.",
  "Doo Technology Hungary Kft.",
  "Dr. Nagyné Winkler Zsuzsanna", 
  "E-Plan Product and Service Kft.",
  "ELETFA PIONEER Kft.",
  "Energy Solver Centrum Kft.",
  "Europe Consult HU Kft.",
  "ExPatProz Kft.",
  "Fiji Holding Kft.",
  "Forti-E Hungary Kft.",
  "Gokdjev Kft.",
  "Hajnal-Kósa Lívia",
  "HEALTHNOVA PHARMA Kft.",
  "Hemitrade Kft.",
  "HKC Technology Kft.",
  "Hungaro Technology Solutions Kft.",
  "IAT (HUNGARY) TECHNOLOGY CO. Kft.",
  "Inktronics Hungary Kft.",
  "ISK Hungary Kft.",
  "Izabella House Kft.",
  "JNEC Engineering Construction Kft.",
  "K P IT SOLUTION Kft.",
  "KB Ideal Trading Kft.",
  "Kovács Dávid egyéni vállalkozó",
  "LANGHUS Group Kft.",
  "Lumin Project Kft.",
  "Mayer Gábor E.V.",
  "Meeram International Kft.",
  "MM INTEGRATION Kft.",
  "NB Capital Europe Kft.",
  "Nosa Construction Kft.",
  "Nutritech System Kft.",
  "OnA Értékelő Kft.",
  "Padel-Club Hungary Kft.",
  "Perseus Global Kft.",
  "Prisha Management Consultancy Co. Kft.",
  "Quick Response Quality Support Kft.",
  "Real Africa Kft.",
  "Salina Food Kft.",
  "Sandor Transport Kft.",
  "Schlösser Armaturen East-Central Europe Kft.",
  "Sentercore Enterprise Kft.",
  "Soft Media Kft.",
  "Sza-La Őr-ház Security Kft.",
  "Szanyi-Czeily Mária",
  "Tiancheng Coating Kft.",
  "TimeCut Group Kft.",
  "TruckMovers Kft.",
  "VAINeuro Kft.",
  "VENDOTABLO Kft.",
  "Williamson Fox Consulting Kft.",
  "Zöldföld Renewables Kft.",
  "Accolite Digital Hungary Kft.",
  "Aeroviser Kft.",
  "Aibell Kft.",
  "Almabérlés Kft.",
  "Ares Productions Kft.",
  "Asiara Enterprises Kft.",
  "Aurivio Hungary Kft.",
  "Axiom Technologies Hungary Kft.",
  "Best Solution System Kft.",
  "Bochner group Kft.",
  "Carmella Group Kft.",
  "Core Pulse Kft.",
  "DHC GROUP CO. Kft.",
  "Digital Trident Solutions Kft.",
  "DPIN ELECTRONIC TECHNOLOGY Kft.",
  "Dudás Dezső E.V.",
  "Electroshare Trading Kft.",
  "Elitro Europe Kft.",
  "EU SVC Consulting Kft.",
  "EUROTRADEX INTERNATIONAL TRADERS Kft.",
  "Fazekas Péter EV.",
  "Flexus Financial Solutions Kft.",
  "FOTO-CENTER NR 1 Kft.",
  "GOLAND Hungary Kft.",
  "Hamiti-House Kft.",
  "Heliostoik Services Kft.",
  "Herisco RMI Machines Tools Kft.",
  "Hobro Agency Kft.",
  "Hungary Zhongdi Fluid Control Technology Co. Kft.",
  "Iceberg Vapes Kft.",
  "INNOVA GLASS HUNGARY Kft.",
  "Istanbulauto kft.",
  "J.J. International Kft.",
  "JOY AND FOOD Kft.",
  "KamaWave Kft.",
  "KERLOG GLOBAL Kft.",
  "KTR (Hungary) Automation Equipment Kft.",
  "LC Ventures & Investments Kft.",
  "Lyffy Cosmetics Kft.",
  "MediLab Europe Kft.",
  "Milted trading Kft.",
  "Movantech Global IT Solutions Kft.",
  "NEW-X Information Technology Kft.",
  "Nour Trade International Kft.",
  "Nuvanatur Kft.",
  "Padel Club Bikás Kft.",
  "ParamountFortune Group Kft.",
  "Plementaim Kft.",
  "PRO PELAGO Kft.",
  "Rapid Ablak Kft.",
  "Revati Services Kft.",
  "Salty Team Kft.",
  "Sapbond Worldwide Kft.",
  "SCII (Hungary) Electronics Kft.",
  "Sky Athena Kft.",
  "Sweetyard Kft.",
  "Szakmaverzum Médiaszolgáltató és Kommunikációs Kft.",
  "SzigArt Kft.",
  "TIHM Management Project Kft.",
  "Tora Business Services Kft.",
  "Tusnádi Consulting Kft.",
  "Valens Europe Kft.",
  "Wantong Yitong Hungary Kft.",
  "Yinghe Technology Hungary Co. Kft.",
  "Advanced electronic Technologies Kft.",
  "AGNA Makina Kft.",
  "AlliaPharm Europe Kft.",
  "AMBREON Kft.",
  "Art Invoice Hungary Kft.",
  "Atecnova Kft.",
  "Autobio Diagnostics (Hungary) Kft.",
  "Berva Mont Kft.",
  "Bitcoin Solutions Kft.",
  "Butterfly Consulting Kft.",
  "CDE Services Hungary Kft.",
  "Denair Hungary Kft.",
  "DIGICOMM Digital Kft.",
  "DimIra Global Kft.",
  "Dr. Nagy István András",
  "E-marketplace kft.",
  "Elemental movement Kft.",
  "Elvira Désign Kft.",
  "EuroAsia Exports Kft.",
  "Exceedify Advisors Kft.",
  "FES Solutions Kft.",
  "Focus Company Kft.",
  "FP Innovations East Europe Kft.",
  "GreenWorld Bau Kft.",
  "HAPS-Real Kft.",
  "hello Solutions Kft.",
  "Hi Park General Zrt.",
  "HSN Steel Hungary Kft.",
  "I-68 Invest Kft.",
  "Ilanga Integrated Services Kft.",
  "Iris International Co. Kft.",
  "Istennők Kft.",
  "Jawaher Trade International Kft.",
  "JPK Consulting Kft.",
  "Kamondi Zsófia EV.",
  "Kormach Elektromos kft.",
  "LA Consulting & Trade Kft.",
  "Longlasting Academy of Management Studies Kft.",
  "Magnosource Kft.",
  "Medina Land Kft.",
  "MK Equity Kft.",
  "Mrbubbleup Kft.",
  "Nice Place Hungary Kft.",
  "NS-Partners HU kft.",
  "OMNI Healthcare Holdings Kft.",
  "PADEL CLUB ELEVEN Kft.",
  "Party Deck Event Management Kft.",
  "PMI Budapest",
  "Pub Consulting Kft.",
  "Raynovo Solutions Kft.",
  "ROCKHEAD Security Kft.",
  "Sámat Őr-Ház Kft.",
  "ScanX Technologies Kft.",
  "SD Projects Solutions Kft.",
  "Smart Sustainability Robotics Kft.",
  "Swift Tech Kft.",
  "Szanyi Roland",
  "TFS Investor Kft.",
  "TIM-Szerkezet Kft.",
  "Trinity Taste Kft.",
  "Unity Worldwide Trading Kft.",
  "Vegano Italia Kft.",
  "Weltronic Kft.",
  "Zenit Structura Kft.",
];

// Csak 50 cég használata a marquee-hez
const trustedClients = clients.slice(0, 50);

function splitIntoThreeRows(list: string[]) {
  const row1 = list.filter((_, i) => i % 3 === 0);
  const row2 = list.filter((_, i) => i % 3 === 1);
  const row3 = list.filter((_, i) => i % 3 === 2);
  return [row1, row2, row3] as const;
}

export function ClientsSection() {
  const pathname = usePathname();
  const isEnglish = pathname?.startsWith("/en");

  const heading = isEnglish ? "Companies who trust us" : "Akik már megbíztak bennünk";
  const subtitle = isEnglish
    ? "180+ satisfied clients in Hungary and abroad."
    : "180+ elégedett ügyfelünk Magyarországon és külföldön";
  const [row1, row2, row3] = splitIntoThreeRows(trustedClients);

  const rows = [row1, row2, row3];

  const getFontStyle = (rowIndex: number, index: number) => {
    // Specifikáció szerinti dinamikus font család és súly
    if (rowIndex === 0) {
      // Row 1
      const family =
        index % 3 === 0
          ? "var(--font-sans)"
          : index % 3 === 1
            ? "var(--font-mono)"
            : "var(--font-sans)";
      const weight =
        index % 4 === 0
          ? 600
          : index % 4 === 1
            ? 400
            : index % 4 === 2
              ? 500
              : 700;
      return { fontFamily: family, fontWeight: weight as 400 | 500 | 600 | 700 };
    }

    if (rowIndex === 1) {
      // Row 2
      const family =
        index % 3 === 0
          ? "var(--font-mono)"
          : index % 3 === 1
            ? "var(--font-sans)"
            : "var(--font-sans)";
      const weight =
        index % 4 === 0
          ? 500
          : index % 4 === 1
            ? 700
            : index % 4 === 2
              ? 400
              : 600;
      return { fontFamily: family, fontWeight: weight as 400 | 500 | 600 | 700 };
    }

    // Row 3
    const family =
      index % 3 === 0
        ? "var(--font-sans)"
        : index % 3 === 1
          ? "var(--font-sans)"
          : "var(--font-mono)";
    const weight =
      index % 4 === 0
        ? 400
        : index % 4 === 1
          ? 600
          : index % 4 === 2
            ? 700
            : 500;
    return { fontFamily: family, fontWeight: weight as 400 | 500 | 600 | 700 };
  };

  return (
    <section className="w-full overflow-hidden bg-[color:var(--background)] py-12 text-[color:var(--foreground)] md:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center md:mb-12">
          <h2 className="mb-3 text-2xl font-bold text-[color:var(--foreground)] md:mb-4 md:text-3xl lg:text-4xl">
            {heading}
          </h2>
          <p className="mx-auto max-w-2xl text-base text-muted-foreground md:text-xl">
            {subtitle}
          </p>
        </div>

        <div className="space-y-4 text-sm text-muted-foreground md:space-y-6">
          {rows.map((row, rowIndex) => {
            const animateClass =
              rowIndex === 1 ? "animate-scroll-left" : "animate-scroll-right";

            return (
              <div key={rowIndex} className="relative w-full overflow-hidden">
                <div className={`flex whitespace-nowrap ${animateClass}`}>
                  {[...row, ...row].map((client, i) => {
                    const style = getFontStyle(rowIndex, i);
                    return (
                      <span
                        key={`${client}-${rowIndex}-${i}`}
                        className="inline-block px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-[color:var(--primary)] md:px-6 md:text-base lg:text-lg"
                        style={style}
                      >
                        {client}
                        <span className="mx-3 text-[color:var(--primary)] md:mx-4">•</span>
                      </span>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
