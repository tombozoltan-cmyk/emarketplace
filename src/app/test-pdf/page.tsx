"use client";

import { useState } from "react";
import { openPostalAuthForPrint, downloadPostalAuthHTML, type PostalAuthHTMLData } from "@/lib/pdf-generators/postal-authorization-html";
import { openKycFormForPrint, downloadKycFormHTML, type KycFormData } from "@/lib/pdf-generators/kyc-form-html";

export default function TestPdfPage() {
  const [success, setSuccess] = useState(false);

  // Teszt adatok - a meghatalmazó (ügyfél) cég adatai
  const testData: PostalAuthHTMLData = {
    // Meghatalmazó - az ügyfél cég képviselője
    authorizer: {
      name: "Kovács János",
      birthName: "Kovács János",
      motherName: "Kiss Mária",
      birthPlace: "Budapest",
      birthDate: "1985.01.15.",
    },
    // Meghatalmazó szervezet - az ügyfél cég (cím fix!)
    authorizerOrg: {
      name: "Minta Kft.",
      registrationNumber: "01-09-123456",
    },
    // A székhely cím - fix, nem kell megadni
    deliveryAddress: "",
    
    // Meghatalmazott magánszemély - ÜRESEN MARAD
    authorized: {},
    
    // Meghatalmazás típusa
    authType: {
      indefinite: true,      // Határozatlan ideig
      allPackages: true,     // Valamennyi küldemény
      letter: true,
      package: true,
      official: true,
      express: true,
    },
    city: "Budapest",
  };

  const handlePrint = () => {
    openPostalAuthForPrint(testData);
    setSuccess(true);
  };

  const handleDownloadHTML = () => {
    downloadPostalAuthHTML(testData);
    setSuccess(true);
  };

  // KYC Form teszt adatok
  const kycData: KycFormData = {
    company: {
      name: "Minta Kft.",
      shortName: "Minta",
      address: "",  // Fix cím
      mainActivity: "Szoftverfejlesztés",
      representatives: "Kovács János, ügyvezető",
      registrationNumber: "01-09-123456",
    },
    representative: {
      name: "Kovács János",
      birthName: "Kovács János",
      motherName: "Kiss Mária",
      birthPlace: "Budapest",
      birthDate: "1985.01.15.",
      nationality: "magyar",
      idType: "Személyi igazolvány",
      idNumber: "123456AB",
      address: "1111 Budapest, Példa utca 1.",
    },
    beneficialOwnerPerson: {
      isSelf: true,
      name: "Kovács János",
      ownershipPercent: "100",
    },
    businessRelation: {
      contractType: "Határozatlan idejű székhelyszolgáltatás",
      contractSubject: "Székhelyszolgáltatás",
      contractDuration: "Határozatlan idejű",
      riskLevel: "Átlagos",
    },
  };

  const handleKycPrint = () => {
    openKycFormForPrint(kycData);
    setSuccess(true);
  };

  return (
    <div style={{ 
      maxWidth: 700, 
      margin: "30px auto", 
      padding: 20, 
      fontFamily: "system-ui" 
    }}>
      <h1 style={{ marginBottom: 20, textAlign: "center" }}>Dokumentum Teszt</h1>
      
      {/* Postai Meghatalmazás */}
      <div style={{ 
        padding: 16, 
        background: "#e3f2fd", 
        borderRadius: 8,
        marginBottom: 20,
        border: "1px solid #1976d2"
      }}>
        <h2 style={{ margin: "0 0 10px 0", fontSize: 18 }}>1. Postai Meghatalmazás</h2>
        <ul style={{ margin: "0 0 15px 0", paddingLeft: 20, fontSize: 14 }}>
          <li><strong>Meghatalmazó cég:</strong> Minta Kft.</li>
          <li><strong>Képviselő:</strong> Kovács János</li>
          <li><strong>Meghatalmazott:</strong> E-Marketplace Kft.</li>
        </ul>
        <button
          onClick={handlePrint}
          style={{
            width: "100%",
            padding: "10px 20px",
            fontSize: 14,
            background: "#1976d2",
            color: "white",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          Postai Meghatalmazás Nyomtatása
        </button>
      </div>

      {/* Átvilágítási Adatlap */}
      <div style={{ 
        padding: 16, 
        background: "#e8f5e9", 
        borderRadius: 8,
        marginBottom: 20,
        border: "1px solid #388e3c"
      }}>
        <h2 style={{ margin: "0 0 10px 0", fontSize: 18 }}>2. Átvilágítási Adatlap (KYC)</h2>
        <ul style={{ margin: "0 0 15px 0", paddingLeft: 20, fontSize: 14 }}>
          <li><strong>Cég:</strong> Minta Kft.</li>
          <li><strong>Képviselő:</strong> Kovács János</li>
          <li><strong>Tényleges tulajdonos:</strong> Kovács János (100%)</li>
        </ul>
        <button
          onClick={handleKycPrint}
          style={{
            width: "100%",
            padding: "10px 20px",
            fontSize: 14,
            background: "#388e3c",
            color: "white",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          Átvilágítási Adatlap Nyomtatása
        </button>
      </div>

      {success && (
        <p style={{ color: "green", marginTop: 16, textAlign: "center" }}>
          ✓ Megnyitva! A böngészőben válaszd a "Mentés PDF-ként" opciót.
        </p>
      )}
    </div>
  );
}
