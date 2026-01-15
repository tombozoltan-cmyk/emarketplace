"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AdminLayout, AdminCard, AdminCardHeader, AdminCardTitle, AdminCardContent } from "@/components/admin";
import { FileDown, Loader2, CheckCircle } from "lucide-react";
import { fillOfficialPostalAuthPDF, downloadPDF } from "@/lib/pdf-generators/postal-authorization";

export default function TestPostalPdfPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleTestPdf = async () => {
    setIsGenerating(true);
    setSuccess(false);
    
    try {
      const pdfBytes = await fillOfficialPostalAuthPDF({
        // Meghatalmazó - Képviselő (magánszemély)
        authorizer: {
          name: "Kovács János",
          birthName: "Kovács János",
          motherName: "Kiss Mária",
          birthPlace: "Budapest",
          birthDate: "1985.01.15.",
        },
        // Meghatalmazó cég
        authorizerOrg: {
          name: "Minta Kft.",
          address: "1052 Budapest, Váci utca 8.",
          registrationNumber: "01-09-123456",
        },
        // Kézbesítési cím (ahova a küldemények érkeznek)
        deliveryAddress: "1064 Budapest, Izabella utca 68/b.",
        
        // Meghatalmazott (E-Marketplace munkatársa)
        authorized: {
          name: "E-Marketplace Kft. megbízottja",
        },
        authorizedOrg: {
          name: "E-Marketplace Kft.",
          address: "1064 Budapest, Izabella utca 68/b.",
          registrationNumber: "01-09-XXXXXX",
        },
        
        // Meghatalmazás típusa
        authType: {
          indefinite: true,       // Határozatlan ideig
          allPackages: true,      // Valamennyi küldemény
          letter: true,           // Levél
          package: true,          // Csomag
          official: true,         // Hivatalos irat
          express: true,          // Időgarantált
        },
      });

      downloadPDF(pdfBytes, "teszt-postai-meghatalmazas.pdf");
      setSuccess(true);
    } catch (error) {
      console.error("PDF generálási hiba:", error);
      alert("Hiba történt: " + (error as Error).message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <AdminLayout title="Postai Meghatalmazás Teszt">
      <AdminCard>
        <AdminCardHeader>
          <AdminCardTitle>PDF Teszt</AdminCardTitle>
        </AdminCardHeader>
        <AdminCardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Ez a teszt oldal az eredeti Magyar Posta meghatalmazás űrlapot tölti ki mintaadatokkal.
              A PDF letöltődik, és ellenőrizheted, hogy a pozíciók megfelelőek-e.
            </p>
            
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-medium mb-2">Teszt adatok:</h3>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li><strong>Meghatalmazó cég:</strong> Minta Kft.</li>
                <li><strong>Képviselő:</strong> Kovács János</li>
                <li><strong>Kézbesítési cím:</strong> 1064 Budapest, Izabella utca 68/b.</li>
                <li><strong>Meghatalmazott:</strong> E-Marketplace Kft.</li>
                <li><strong>Típus:</strong> Határozatlan ideig, valamennyi küldemény</li>
              </ul>
            </div>

            <Button 
              onClick={handleTestPdf} 
              disabled={isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generálás...
                </>
              ) : success ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Sikeres! Újra generálás
                </>
              ) : (
                <>
                  <FileDown className="mr-2 h-4 w-4" />
                  Teszt PDF generálása
                </>
              )}
            </Button>

            {success && (
              <p className="text-sm text-green-600 text-center">
                ✓ PDF sikeresen letöltve! Ellenőrizd a pozíciókat.
              </p>
            )}
          </div>
        </AdminCardContent>
      </AdminCard>
    </AdminLayout>
  );
}
