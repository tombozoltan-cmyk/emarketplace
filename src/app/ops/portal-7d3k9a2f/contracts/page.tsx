"use client";

import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  doc,
  updateDoc,
  deleteDoc,
  Timestamp,
  getDocs,
} from "firebase/firestore";
import {
  Building2,
  Calendar,
  FileDown,
  Loader2,
  Mail,
  Phone,
  Search,
  User,
  Trash2,
  ExternalLink,
  Package,
  FileText,
  Printer,
  Download,
  Users,
  Shield,
  ClipboardList,
  Eye,
  X,
  Plus,
} from "lucide-react";
import { firestoreDb } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ContractData, ContractStatus } from "@/lib/contract-types";
import {
  generatePostalAuthorizationPDF,
  downloadPDF,
  type PostalAuthorizationData,
} from "@/lib/pdf-generators/postal-authorization";
import {
  generateContractPDF,
  generateKycFormPDF,
  generatePepDeclarationPDF,
} from "@/lib/pdf-generators/contract-documents";
import Link from "next/link";
import {
  AdminLayout,
  AdminCard,
  AdminCardHeader,
  AdminCardTitle,
  AdminCardContent,
  StatusBadge,
  AdminModal,
  AdminModalSection,
  AdminModalField,
  AdminModalGrid,
  useAdminAuth,
} from "@/components/admin";
import { buildConditionalContext, replaceShortcodes } from "@/lib/contract-shortcodes";

type ContractDoc = ContractData & {
  id: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};

const PACKAGE_NAMES: Record<string, string> = {
  "szekhely-hu": "Székhely - Magyar",
  "szekhely-kulfoldi": "Székhely - Külföldi",
  "kezbesitesi": "Kézbesítési megbízott",
  "szerzodeses-irodaberles": "Virtuális iroda",
  "szekhely-kezbesitesi-hu": "Teljes csomag - Magyar",
  "szekhely-kezbesitesi-kulfoldi": "Teljes csomag - Külföldi",
};

const STATUS_CONFIG: Record<ContractStatus, { label: string; variant: "default" | "success" | "warning" | "error" | "info" }> = {
  draft: { label: "Piszkozat", variant: "default" },
  pending_review: { label: "Ellenőrzésre vár", variant: "warning" },
  documents_needed: { label: "Dokumentumok szükségesek", variant: "warning" },
  approved: { label: "Jóváhagyva", variant: "success" },
  rejected: { label: "Elutasítva", variant: "error" },
  active: { label: "Aktív", variant: "info" },
  terminated: { label: "Megszűnt", variant: "default" },
};

const STATUS_OPTIONS: ContractStatus[] = [
  "pending_review",
  "documents_needed", 
  "approved",
  "active",
  "rejected",
  "terminated",
];

export default function ContractsPage() {
  const { user } = useAdminAuth();
  const [contracts, setContracts] = useState<ContractDoc[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ContractStatus | "all">("all");
  const [selectedContract, setSelectedContract] = useState<ContractDoc | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [previewPdf, setPreviewPdf] = useState<{ url: string; title: string } | null>(null);
  const [templatePreviewHtml, setTemplatePreviewHtml] = useState<string | null>(null);
  const [templatePreviewTitle, setTemplatePreviewTitle] = useState<string>("");

  // Fetch contracts - only when authenticated
  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    
    const q = query(collection(firestoreDb, "contracts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as ContractDoc));
        setContracts(docs);
        setIsLoading(false);
      },
      (error) => {
        console.error("Firestore error:", error);
        setIsLoading(false);
      }
    );
    return () => unsubscribe();
  }, [user]);

  // Filter contracts
  const filteredContracts = contracts.filter((c) => {
    const matchesSearch =
      !searchQuery ||
      c.company?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.contact?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.representative?.fullName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Open modal
  const openModal = (contract: ContractDoc) => {
    setSelectedContract(contract);
    setIsModalOpen(true);
  };

  // Update status
  const updateStatus = async (status: ContractStatus) => {
    if (!selectedContract) return;
    setIsUpdating(true);
    try {
      await updateDoc(doc(firestoreDb, "contracts", selectedContract.id), {
        status,
        updatedAt: Timestamp.now(),
      });
      setSelectedContract({ ...selectedContract, status });
    } catch (error) {
      console.error("Status update error:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Delete contract
  const deleteContract = async () => {
    if (!selectedContract || !confirm("Biztosan törlöd ezt a szerződést?")) return;
    setIsUpdating(true);
    try {
      await deleteDoc(doc(firestoreDb, "contracts", selectedContract.id));
      setIsModalOpen(false);
      setSelectedContract(null);
    } catch (error) {
      console.error("Delete error:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  // PDF generation helpers
  const prepareContractPdfData = (contract: ContractDoc) => {
    const date = new Date().toLocaleDateString("hu-HU", { year: "numeric", month: "long", day: "numeric" });
    return {
      companyName: contract.company?.name || "",
      companyShortName: contract.company?.shortName,
      companyLegalForm: contract.company?.legalForm || "kft",
      companyRegistrationNumber: contract.company?.registrationNumber,
      companyTaxNumber: contract.company?.taxNumber,
      companyMainActivity: contract.company?.mainActivity,
      isNewCompany: contract.company?.isNew ?? true,
      owners: (contract.owners || []).map((o) => ({
        fullName: o.natural?.fullName || "",
        birthName: o.natural?.birthName,
        birthPlace: o.natural?.birthPlace || "",
        birthDate: o.natural?.birthDate || "",
        motherName: o.natural?.motherName || "",
        address: o.natural?.address || "",
        idType: o.natural?.idType || "personal_id",
        idNumber: o.natural?.idNumber || "",
        nationality: o.natural?.nationality || "magyar",
        ownershipPercent: o.ownershipPercent || 100,
      })),
      representative: {
        fullName: contract.representative?.fullName || "",
        birthName: contract.representative?.birthName,
        birthPlace: contract.representative?.birthPlace || "",
        birthDate: contract.representative?.birthDate || "",
        motherName: contract.representative?.motherName || "",
        address: contract.representative?.address || "",
        idType: contract.representative?.idType || "personal_id",
        idNumber: contract.representative?.idNumber || "",
        nationality: contract.representative?.nationality || "magyar",
        position: contract.representative?.position || "ügyvezető",
        isForeign: contract.representative?.isForeign || false,
      },
      contact: {
        fullName: contract.contact?.isSameAsOwner ? contract.owners?.[0]?.natural?.fullName || "" : contract.contact?.fullName || "",
        email: contract.contact?.email || "",
        phone: contract.contact?.phone || "",
        address: contract.contact?.address,
      },
      pepDeclaration: {
        isPep: contract.pepDeclaration?.isPep || false,
        isPepRelative: contract.pepDeclaration?.isPepRelative || false,
        isPepAssociate: contract.pepDeclaration?.isPepAssociate || false,
        pepDetails: contract.pepDeclaration?.pepDetails,
      },
      packageName: PACKAGE_NAMES[contract.packageId || ""] || contract.packageId || "-",
      monthlyPrice: contract.monthlyPrice || 0,
      annualPrice: contract.annualPrice || 0,
      date,
      contractId: contract.id,
      // Build conditional context for template processing
      conditionalContext: buildConditionalContext({
        pepDeclaration: contract.pepDeclaration,
        company: contract.company,
        representative: contract.representative,
        owners: contract.owners,
      }),
    };
  };

  const buildShortcodeDataFromContract = (contract: ContractDoc): Record<string, string> => {
    const company = contract.company || {};
    const firstOwner = contract.owners?.[0]?.natural;
    const representative = contract.representative || ({} as ContractDoc["representative"]);
    const contact = contract.contact || {};
    const date = new Date();

    return {
      "{{CEG_NEV}}": company.name || "",
      "{{CEG_ROVID_NEV}}": company.shortName || "",
      "{{CEG_FORMA}}": company.legalForm || "",
      "{{CEGJEGYZEKSZAM}}": company.registrationNumber || "",
      "{{ADOSZAM}}": company.taxNumber || "",
      "{{FOTEV}}": company.mainActivity || "",
      "{{SZEKHELY}}": "1052 Budapest, Váci utca 8. 1. em.",
      "{{TULAJDONOS_NEV}}": firstOwner?.fullName || "",
      "{{TULAJDONOS_SZUL_NEV}}": firstOwner?.birthName || "",
      "{{TULAJDONOS_SZUL_HELY}}": firstOwner?.birthPlace || "",
      "{{TULAJDONOS_SZUL_DATUM}}": firstOwner?.birthDate || "",
      "{{TULAJDONOS_ANYJA_NEVE}}": firstOwner?.motherName || "",
      "{{TULAJDONOS_LAKCIM}}": firstOwner?.address || "",
      "{{TULAJDONOS_OKMANY_TIPUS}}": firstOwner?.idType || "",
      "{{TULAJDONOS_OKMANY_SZAM}}": firstOwner?.idNumber || "",
      "{{TULAJDONOS_ALLAMPOLGARSAG}}": firstOwner?.nationality || "",
      "{{TULAJDONOS_ARANY}}": (contract.owners?.[0]?.ownershipPercent ?? 100).toString(),
      "{{KEPVISELO_NEV}}": representative.fullName || "",
      "{{KEPVISELO_SZUL_NEV}}": representative.birthName || "",
      "{{KEPVISELO_SZUL_HELY}}": representative.birthPlace || "",
      "{{KEPVISELO_SZUL_DATUM}}": representative.birthDate || "",
      "{{KEPVISELO_ANYJA_NEVE}}": representative.motherName || "",
      "{{KEPVISELO_LAKCIM}}": representative.address || "",
      "{{KEPVISELO_OKMANY_SZAM}}": representative.idNumber || "",
      "{{KEPVISELO_BEOSZTAS}}": representative.position || "",
      "{{KEPVISELO_ALLAMPOLGARSAG}}": representative.nationality || "",
      "{{KAPCSOLAT_NEV}}": contact.fullName || "",
      "{{KAPCSOLAT_EMAIL}}": contact.email || "",
      "{{KAPCSOLAT_TELEFON}}": contact.phone || "",
      "{{KAPCSOLAT_CIM}}": contact.address || "",
      "{{CSOMAG_NEV}}": PACKAGE_NAMES[contract.packageId || ""] || contract.packageId || "",
      "{{HAVI_DIJ}}": (contract.monthlyPrice || 0).toLocaleString("hu-HU"),
      "{{EVES_DIJ}}": (contract.annualPrice || 0).toLocaleString("hu-HU"),
      "{{SZOLGALTATO_NEV}}": "E-Marketplace Kft.",
      "{{SZOLGALTATO_CIM}}": "1064 Budapest, Izabella utca 68/b.",
      "{{DATUM}}": date.toLocaleDateString("hu-HU"),
      "{{DATUM_SZO}}": date.toLocaleDateString("hu-HU", { year: "numeric", month: "long", day: "numeric" }),
      "{{EV}}": date.getFullYear().toString(),
      "{{SZERZODES_ID}}": contract.id,
      "{{KEZBESITESI_CIM}}": "1052 Budapest, Váci utca 8. 1. em.",
    };
  };

  // Individual PDF generators
  const generateContract = async () => {
    if (!selectedContract) return;
    setIsGeneratingPdf(true);
    try {
      const pdfData = prepareContractPdfData(selectedContract);
      const slug = selectedContract.company?.name?.replace(/\s+/g, "_") || "ceg";
      downloadPDF(await generateContractPDF(pdfData), `szerzodes_${slug}_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (error) {
      console.error("PDF error:", error);
      alert("Hiba a PDF generálás során!");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const generateKyc = async () => {
    if (!selectedContract) return;
    setIsGeneratingPdf(true);
    try {
      const pdfData = prepareContractPdfData(selectedContract);
      const slug = selectedContract.company?.name?.replace(/\s+/g, "_") || "ceg";
      downloadPDF(await generateKycFormPDF(pdfData), `atvilagitas_${slug}_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (error) {
      console.error("PDF error:", error);
      alert("Hiba a PDF generálás során!");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const generatePep = async () => {
    if (!selectedContract) return;
    setIsGeneratingPdf(true);
    try {
      const pdfData = prepareContractPdfData(selectedContract);
      const slug = selectedContract.company?.name?.replace(/\s+/g, "_") || "ceg";
      downloadPDF(await generatePepDeclarationPDF(pdfData), `pep_${slug}_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (error) {
      console.error("PDF error:", error);
      alert("Hiba a PDF generálás során!");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const generatePostalAuth = async () => {
    if (!selectedContract) return;
    setIsGeneratingPdf(true);
    try {
      const pdfData = prepareContractPdfData(selectedContract);
      const slug = selectedContract.company?.name?.replace(/\s+/g, "_") || "ceg";
      for (const owner of selectedContract.owners || []) {
        const postalData: PostalAuthorizationData = {
          companyName: selectedContract.company?.name || "",
          companyAddress: `${selectedContract.company?.name} székhelye`,
          companyRegistrationNumber: selectedContract.company?.registrationNumber || "",
          authorizedPersonName: owner?.natural?.fullName || "",
          authorizedPersonIdNumber: owner?.natural?.idNumber || "",
          authorizedPersonAddress: owner?.natural?.address || "",
          representativeName: selectedContract.representative?.fullName || "",
          representativePosition: selectedContract.representative?.position || "ügyvezető",
          deliveryAddress: "1052 Budapest, Váci utca 8. 1. em.",
          date: pdfData.date,
          city: "Budapest",
        };
        const ownerSlug = owner?.natural?.fullName?.replace(/\s+/g, "_") || "tulajdonos";
        downloadPDF(await generatePostalAuthorizationPDF(postalData), `meghatalmazas_${slug}_${ownerSlug}_${new Date().toISOString().slice(0, 10)}.pdf`);
        await new Promise((r) => setTimeout(r, 300));
      }
    } catch (error) {
      console.error("PDF error:", error);
      alert("Hiba a PDF generálás során!");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleGenerateAll = async () => {
    if (!selectedContract) return;
    setIsGeneratingPdf(true);
    try {
      const pdfData = prepareContractPdfData(selectedContract);
      const slug = selectedContract.company?.name?.replace(/\s+/g, "_") || "ceg";
      const dateStr = new Date().toISOString().slice(0, 10);

      downloadPDF(await generateContractPDF(pdfData), `szerzodes_${slug}_${dateStr}.pdf`);
      await new Promise((r) => setTimeout(r, 400));
      downloadPDF(await generateKycFormPDF(pdfData), `atvilagitas_${slug}_${dateStr}.pdf`);
      await new Promise((r) => setTimeout(r, 400));
      downloadPDF(await generatePepDeclarationPDF(pdfData), `pep_${slug}_${dateStr}.pdf`);
      await new Promise((r) => setTimeout(r, 400));

      for (const owner of selectedContract.owners || []) {
        const postalData: PostalAuthorizationData = {
          companyName: selectedContract.company?.name || "",
          companyAddress: `${selectedContract.company?.name} székhelye`,
          companyRegistrationNumber: selectedContract.company?.registrationNumber || "",
          authorizedPersonName: owner?.natural?.fullName || "",
          authorizedPersonIdNumber: owner?.natural?.idNumber || "",
          authorizedPersonAddress: owner?.natural?.address || "",
          representativeName: selectedContract.representative?.fullName || "",
          representativePosition: selectedContract.representative?.position || "ügyvezető",
          deliveryAddress: "1052 Budapest, Váci utca 8. 1. em.",
          date: pdfData.date,
          city: "Budapest",
        };
        const ownerSlug = owner?.natural?.fullName?.replace(/\s+/g, "_") || "tulajdonos";
        downloadPDF(await generatePostalAuthorizationPDF(postalData), `meghatalmazas_${slug}_${ownerSlug}_${dateStr}.pdf`);
        await new Promise((r) => setTimeout(r, 400));
      }
    } catch (error) {
      console.error("PDF generation error:", error);
      alert("Hiba a PDF generálás során!");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Preview PDF functions
  const createPdfBlobUrl = (pdfBytes: Uint8Array): string => {
    const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
    return URL.createObjectURL(blob);
  };

  const previewTemplateByType = async (templateType: string, fallbackTitle: string) => {
    if (!selectedContract) return;
    setIsGeneratingPdf(true);
    try {
      // Egyszerű lekérdezés - csak típusra szűrünk, az active-ot kódban ellenőrizzük
      const templatesRef = collection(firestoreDb, "documentTemplates");
      const snapshot = await getDocs(templatesRef);
      
      // Keresünk aktív sablont a megadott típussal
      const matchingTemplate = snapshot.docs.find((d) => {
        const data = d.data();
        return data.type === templateType && data.active === true;
      });

      if (!matchingTemplate) {
        alert(`Nincs aktív '${templateType}' típusú sablon beállítva.\n\nKérlek ellenőrizd a Sablon szerkesztőben, hogy a megfelelő típust állítottad-e be!`);
        return;
      }

      const templateData = matchingTemplate.data() as { name?: string; content?: string };
      const templateContent = templateData.content || "";

      if (!templateContent) {
        alert(`A '${templateData.name || templateType}' sablon tartalma üres!`);
        return;
      }

      const shortcodeData = buildShortcodeDataFromContract(selectedContract);
      const conditionalContext = buildConditionalContext({
        pepDeclaration: selectedContract.pepDeclaration,
        company: selectedContract.company,
        representative: selectedContract.representative,
        owners: selectedContract.owners,
      });

      const filled = replaceShortcodes(templateContent, shortcodeData, conditionalContext);
      setTemplatePreviewHtml(filled);
      setTemplatePreviewTitle(templateData.name || fallbackTitle);
    } catch (error) {
      console.error("Template preview error:", error);
      alert(`Hiba a sablon alapú előnézet készítésekor: ${error instanceof Error ? error.message : 'Ismeretlen hiba'}`);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const previewContract = async () => {
    await previewTemplateByType("contract", "Szerződés");
  };

  const previewKyc = async () => {
    await previewTemplateByType("kyc", "Átvilágítási adatlap");
  };

  const previewPep = async () => {
    await previewTemplateByType("pep", "PEP nyilatkozat");
  };

  const previewPostalAuth = async () => {
    await previewTemplateByType("postal_auth", "Postai meghatalmazás");
  };

  const closePreview = () => {
    if (previewPdf?.url) {
      URL.revokeObjectURL(previewPdf.url);
    }
    setPreviewPdf(null);
  };

  const closeTemplatePreview = () => {
    setTemplatePreviewHtml(null);
    setTemplatePreviewTitle("");
  };

  const printTemplatePreview = () => {
    if (!templatePreviewHtml) return;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.open();
    win.document.write(`<!doctype html><html><head><title>${templatePreviewTitle}</title></head><body>${templatePreviewHtml}</body></html>`);
    win.document.close();
    win.focus();
    win.print();
  };

  const saveTemplateContract = async () => {
    if (!selectedContract || !templatePreviewHtml) return;
    try {
      await updateDoc(doc(firestoreDb, "contracts", selectedContract.id), {
        generatedDocuments: {
          ...(selectedContract.generatedDocuments || {}),
          contract: templatePreviewHtml,
        },
        updatedAt: Timestamp.now(),
      });
      alert("Szerződés HTML sikeresen mentve a szerződés dokumentumba.");
    } catch (error) {
      console.error("Save contract HTML error:", error);
      alert("Hiba történt a szerződés HTML mentésekor.");
    }
  };

  const formatDate = (timestamp?: Timestamp) => {
    if (!timestamp) return "-";
    return timestamp.toDate().toLocaleDateString("hu-HU", { year: "numeric", month: "short", day: "numeric" });
  };

  return (
    <AdminLayout title="Szerződések" description="Beérkezett szerződéskérelmek kezelése">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[color:var(--muted-foreground)]" />
          <Input
            placeholder="Keresés cégnév, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={statusFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("all")}
          >
            Mind ({contracts.length})
          </Button>
          {STATUS_OPTIONS.slice(0, 4).map((status) => {
            const count = contracts.filter((c) => c.status === status).length;
            if (count === 0) return null;
            return (
              <Button
                key={status}
                variant={statusFilter === status ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(status)}
              >
                {STATUS_CONFIG[status].label} ({count})
              </Button>
            );
          })}
        </div>
        <Link href="/szerzodes" target="_blank">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Új szerződés
          </Button>
        </Link>
      </div>

      {/* Loading */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[color:var(--primary)]" />
        </div>
      ) : filteredContracts.length === 0 ? (
        <div className="text-center py-20 text-[color:var(--muted-foreground)]">
          Nincs találat
        </div>
      ) : (
        /* Cards grid */
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredContracts.map((contract) => (
            <AdminCard key={contract.id} onClick={() => openModal(contract)} hoverable>
              <AdminCardHeader>
                <div className="flex-1 min-w-0">
                  <AdminCardTitle>{contract.company?.name || "Névtelen cég"}</AdminCardTitle>
                  <p className="text-xs text-[color:var(--muted-foreground)] mt-0.5">
                    {PACKAGE_NAMES[contract.packageId || ""] || "Ismeretlen csomag"}
                  </p>
                </div>
                <StatusBadge
                  status={STATUS_CONFIG[contract.status || "draft"].label}
                  variant={STATUS_CONFIG[contract.status || "draft"].variant}
                />
              </AdminCardHeader>
              <AdminCardContent>
                <div className="flex items-center gap-2 text-sm text-[color:var(--muted-foreground)]">
                  <User className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{contract.representative?.fullName || "-"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[color:var(--muted-foreground)]">
                  <Mail className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{contract.contact?.email || "-"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[color:var(--muted-foreground)]">
                  <Calendar className="w-3.5 h-3.5 shrink-0" />
                  <span>{formatDate(contract.createdAt)}</span>
                </div>
              </AdminCardContent>
            </AdminCard>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedContract?.company?.name || "Szerződés részletei"}
        size="xl"
        footer={
          <>
            <Button variant="destructive" size="sm" onClick={deleteContract} disabled={isUpdating}>
              <Trash2 className="w-4 h-4 mr-1" />
              Törlés
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Bezárás
            </Button>
          </>
        }
      >
        {selectedContract && (
          <div className="space-y-6">
            {/* Status & Actions */}
            <div className="flex flex-wrap items-center gap-3 p-4 bg-[color:var(--muted)]/30 rounded-lg">
              <span className="text-sm font-medium">Státusz:</span>
              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map((status) => (
                  <button
                    key={status}
                    onClick={() => updateStatus(status)}
                    disabled={isUpdating}
                    className={`px-3 py-1 text-xs font-medium rounded-full transition-all ${
                      selectedContract.status === status
                        ? "ring-2 ring-[color:var(--primary)] ring-offset-1"
                        : "opacity-70 hover:opacity-100"
                    } ${
                      STATUS_CONFIG[status].variant === "success" ? "bg-green-100 text-green-800" :
                      STATUS_CONFIG[status].variant === "warning" ? "bg-yellow-100 text-yellow-800" :
                      STATUS_CONFIG[status].variant === "error" ? "bg-red-100 text-red-800" :
                      STATUS_CONFIG[status].variant === "info" ? "bg-blue-100 text-blue-800" :
                      "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {STATUS_CONFIG[status].label}
                  </button>
                ))}
              </div>
            </div>

            {/* Document Cards */}
            <AdminModalSection title="Dokumentumok">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Szerződés */}
                <div className="p-4 bg-[color:var(--muted)]/20 rounded-xl border border-[color:var(--border)] hover:border-[color:var(--primary)]/50 transition-colors">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">Szerződés</div>
                      <div className="text-xs text-[color:var(--muted-foreground)]">Székhelyszolgáltatás</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" className="flex-1" onClick={previewContract} disabled={isGeneratingPdf}>
                      <Eye className="w-3.5 h-3.5" />
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1" onClick={generateContract} disabled={isGeneratingPdf}>
                      <Download className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                {/* KYC */}
                <div className="p-4 bg-[color:var(--muted)]/20 rounded-xl border border-[color:var(--border)] hover:border-[color:var(--primary)]/50 transition-colors">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                      <ClipboardList className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">Ügyfél-átvilágítás</div>
                      <div className="text-xs text-[color:var(--muted-foreground)]">KYC adatlap</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" className="flex-1" onClick={previewKyc} disabled={isGeneratingPdf}>
                      <Eye className="w-3.5 h-3.5" />
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1" onClick={generateKyc} disabled={isGeneratingPdf}>
                      <Download className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                {/* PEP */}
                <div className="p-4 bg-[color:var(--muted)]/20 rounded-xl border border-[color:var(--border)] hover:border-[color:var(--primary)]/50 transition-colors">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">PEP nyilatkozat</div>
                      <div className="text-xs text-[color:var(--muted-foreground)]">Politikai kitettség</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" className="flex-1" onClick={previewPep} disabled={isGeneratingPdf}>
                      <Eye className="w-3.5 h-3.5" />
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1" onClick={generatePep} disabled={isGeneratingPdf}>
                      <Download className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Postai meghatalmazás */}
                <div className="p-4 bg-[color:var(--muted)]/20 rounded-xl border border-[color:var(--border)] hover:border-[color:var(--primary)]/50 transition-colors">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                      <Mail className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">Meghatalmazás</div>
                      <div className="text-xs text-[color:var(--muted-foreground)]">{selectedContract.owners?.length || 1} tulajdonos</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" className="flex-1" onClick={previewPostalAuth} disabled={isGeneratingPdf}>
                      <Eye className="w-3.5 h-3.5" />
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1" onClick={generatePostalAuth} disabled={isGeneratingPdf}>
                      <Download className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-[color:var(--border)]">
                <Button onClick={handleGenerateAll} disabled={isGeneratingPdf} className="bg-green-600 hover:bg-green-700">
                  {isGeneratingPdf ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <FileDown className="w-4 h-4 mr-1" />}
                  Összes letöltése
                </Button>
                <Button variant="outline" onClick={handlePrint}>
                  <Printer className="w-4 h-4 mr-1" />
                  Nyomtatás
                </Button>
              </div>
            </AdminModalSection>

            {/* Company Info */}
            <AdminModalSection title="Cég adatok">
              <AdminModalGrid>
                <AdminModalField label="Cégnév" value={selectedContract.company?.name} />
                <AdminModalField label="Rövidített név" value={selectedContract.company?.shortName} />
                <AdminModalField label="Cégforma" value={selectedContract.company?.legalForm} />
                <AdminModalField label="Cégjegyzékszám" value={selectedContract.company?.registrationNumber} />
                <AdminModalField label="Adószám" value={selectedContract.company?.taxNumber} />
                <AdminModalField label="Főtevékenység" value={selectedContract.company?.mainActivity} />
                <AdminModalField label="Új cég" value={selectedContract.company?.isNew ? "Igen" : "Nem"} />
              </AdminModalGrid>
            </AdminModalSection>

            {/* Owners */}
            <AdminModalSection title={`Tulajdonosok (${selectedContract.owners?.length || 0})`}>
              {selectedContract.owners?.map((owner, idx) => (
                <div key={idx} className="p-3 bg-[color:var(--muted)]/20 rounded-lg mb-3 last:mb-0">
                  <div className="font-medium text-sm mb-2">{owner.natural?.fullName || `Tulajdonos ${idx + 1}`}</div>
                  <AdminModalGrid columns={3}>
                    <AdminModalField label="Születési hely" value={owner.natural?.birthPlace} />
                    <AdminModalField label="Születési idő" value={owner.natural?.birthDate} />
                    <AdminModalField label="Anyja neve" value={owner.natural?.motherName} />
                    <AdminModalField label="Lakcím" value={owner.natural?.address} />
                    <AdminModalField label="Okmány" value={`${owner.natural?.idType}: ${owner.natural?.idNumber}`} />
                    <AdminModalField label="Tulajdoni hányad" value={`${owner.ownershipPercent}%`} />
                  </AdminModalGrid>
                </div>
              ))}
            </AdminModalSection>

            {/* Representative */}
            <AdminModalSection title="Képviselő">
              <AdminModalGrid>
                <AdminModalField label="Név" value={selectedContract.representative?.fullName} />
                <AdminModalField label="Beosztás" value={selectedContract.representative?.position} />
                <AdminModalField label="Születési hely" value={selectedContract.representative?.birthPlace} />
                <AdminModalField label="Születési idő" value={selectedContract.representative?.birthDate} />
                <AdminModalField label="Anyja neve" value={selectedContract.representative?.motherName} />
                <AdminModalField label="Lakcím" value={selectedContract.representative?.address} />
                <AdminModalField label="Okmányszám" value={selectedContract.representative?.idNumber} />
                <AdminModalField label="Állampolgárság" value={selectedContract.representative?.nationality} />
              </AdminModalGrid>
            </AdminModalSection>

            {/* Contact */}
            <AdminModalSection title="Kapcsolattartó">
              <AdminModalGrid>
                <AdminModalField label="Név" value={selectedContract.contact?.fullName} />
                <AdminModalField label="Email" value={selectedContract.contact?.email} />
                <AdminModalField label="Telefon" value={selectedContract.contact?.phone} />
                <AdminModalField label="Cím" value={selectedContract.contact?.address} />
              </AdminModalGrid>
            </AdminModalSection>

            {/* Package */}
            <AdminModalSection title="Szolgáltatás">
              <AdminModalGrid>
                <AdminModalField label="Csomag" value={PACKAGE_NAMES[selectedContract.packageId || ""] || selectedContract.packageId} />
                <AdminModalField label="Havi díj" value={selectedContract.monthlyPrice ? `${selectedContract.monthlyPrice.toLocaleString()} Ft` : "-"} />
                <AdminModalField label="Éves díj" value={selectedContract.annualPrice ? `${selectedContract.annualPrice.toLocaleString()} Ft` : "-"} />
              </AdminModalGrid>
            </AdminModalSection>

            {/* Uploaded Documents */}
            {selectedContract.uploadedDocuments && Object.keys(selectedContract.uploadedDocuments).length > 0 && (
              <AdminModalSection title="Feltöltött dokumentumok">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Object.entries(selectedContract.uploadedDocuments).map(([key, url]) => {
                    if (!url || key === "otherDocuments") return null;
                    const labels: Record<string, string> = {
                      idFront: "Személyi elő",
                      idBack: "Személyi hát",
                      addressCard: "Lakcímkártya",
                      passport: "Útlevél",
                      companyExtract: "Cégkivonat",
                    };
                    return (
                      <a
                        key={key}
                        href={url as string}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-2 text-sm bg-[color:var(--muted)]/30 rounded-lg hover:bg-[color:var(--muted)] transition-colors"
                      >
                        <ExternalLink className="w-4 h-4 text-[color:var(--primary)]" />
                        {labels[key] || key}
                      </a>
                    );
                  })}
                </div>
              </AdminModalSection>
            )}

            {/* Dates */}
            <AdminModalSection title="Időbélyegek">
              <AdminModalGrid>
                <AdminModalField label="Létrehozva" value={formatDate(selectedContract.createdAt)} />
                <AdminModalField label="Módosítva" value={formatDate(selectedContract.updatedAt)} />
              </AdminModalGrid>
            </AdminModalSection>
          </div>
        )}
      </AdminModal>

      {/* PDF Preview Modal */}
      {previewPdf && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="fixed inset-0 bg-black/70" onClick={closePreview} />
          <div className="relative w-[95vw] h-[90vh] max-w-5xl bg-white rounded-xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b bg-gray-50">
              <h3 className="font-semibold text-gray-900">{previewPdf.title}</h3>
              <button
                onClick={closePreview}
                className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <iframe
              src={previewPdf.url}
              className="w-full h-[calc(100%-60px)]"
              title="PDF Előnézet"
            />
          </div>
        </div>
      )}

      {/* Template HTML Preview Modal */}
      {templatePreviewHtml && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="fixed inset-0 bg-black/70" onClick={closeTemplatePreview} />
          <div className="relative w-[95vw] h-[90vh] max-w-5xl bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b bg-gray-50">
              <h3 className="font-semibold text-gray-900">{templatePreviewTitle || "Szerződés előnézet"}</h3>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={printTemplatePreview}>
                  <Printer className="w-4 h-4 mr-1" />
                  Nyomtatás
                </Button>
                <Button size="sm" onClick={saveTemplateContract}>
                  <Download className="w-4 h-4 mr-1" />
                  Mentés
                </Button>
                <button
                  onClick={closeTemplatePreview}
                  className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-8 bg-white">
              <div
                className="max-w-4xl mx-auto prose prose-sm"
                dangerouslySetInnerHTML={{ __html: templatePreviewHtml }}
              />
            </div>
          </div>
        </div>
      )}

    </AdminLayout>
  );
}
