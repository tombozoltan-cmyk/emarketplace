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
  Pencil,
  Check,
} from "lucide-react";
import { firestoreDb } from "@/lib/firebase";
import { firebaseAuth } from "@/lib/firebase-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ContractData, ContractStatus } from "@/lib/contract-types";
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
import { fillOfficialPostalAuthPDF, type OfficialPostalAuthData } from "@/lib/pdf-generators/postal-authorization";

const FUNCTIONS_BASE_URL = process.env.NEXT_PUBLIC_FUNCTIONS_URL || "https://us-central1-emarketplace-8aab1.cloudfunctions.net";

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
  const [docxTemplates, setDocxTemplates] = useState<{ id: string; name: string; category: string }[]>([]);
  
  // Inline editing state
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editedCompany, setEditedCompany] = useState<ContractDoc["company"]>({} as ContractDoc["company"]);
  const [editedRepresentative, setEditedRepresentative] = useState<ContractDoc["representative"]>({} as ContractDoc["representative"]);
  const [editedContact, setEditedContact] = useState<ContractDoc["contact"]>({} as ContractDoc["contact"]);
  const [isSavingSection, setIsSavingSection] = useState(false);

  // Get auth token for Cloud Functions
  const getAuthToken = async () => {
    const currentUser = firebaseAuth.currentUser;
    if (!currentUser) throw new Error("Nincs bejelentkezve");
    return currentUser.getIdToken();
  };

  // Fetch DOCX templates
  useEffect(() => {
    if (!user) return;
    const unsubscribe = onSnapshot(
      collection(firestoreDb, "docxTemplates"),
      (snapshot) => {
        const docs = snapshot.docs.map((d) => ({
          id: d.id,
          name: d.data().name as string,
          category: d.data().category as string,
        }));
        setDocxTemplates(docs);
      }
    );
    return () => unsubscribe();
  }, [user]);

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

  // Start editing a section
  const startEditing = (section: string) => {
    if (!selectedContract) return;
    setEditingSection(section);
    if (section === "company") {
      setEditedCompany({ ...selectedContract.company });
    } else if (section === "representative") {
      setEditedRepresentative({ ...selectedContract.representative });
    } else if (section === "contact") {
      setEditedContact({ ...selectedContract.contact });
    }
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingSection(null);
  };

  // Save section
  const saveSection = async (section: string) => {
    if (!selectedContract) return;
    setIsSavingSection(true);
    try {
      let updateData: Record<string, unknown> = { updatedAt: Timestamp.now() };
      if (section === "company") {
        updateData.company = editedCompany;
      } else if (section === "representative") {
        updateData.representative = editedRepresentative;
      } else if (section === "contact") {
        updateData.contact = editedContact;
      }
      
      await updateDoc(doc(firestoreDb, "contracts", selectedContract.id), updateData);
      
      // Update local state
      setSelectedContract({
        ...selectedContract,
        ...(section === "company" ? { company: editedCompany } : {}),
        ...(section === "representative" ? { representative: editedRepresentative } : {}),
        ...(section === "contact" ? { contact: editedContact } : {}),
      });
      setEditingSection(null);
    } catch (error) {
      console.error("Save section error:", error);
      alert("Hiba a mentés során!");
    } finally {
      setIsSavingSection(false);
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
    const owners = contract.owners || [];
    const firstNaturalOwner = owners.find((o) => o.type !== "legal")?.natural;
    const firstLegalOwner = owners.find((o) => o.type === "legal")?.legal;
    const representative = contract.representative || ({} as ContractDoc["representative"]);
    const contact = contract.contact || {};
    const date = new Date();
    const pep = contract.pepDeclaration || {};

    const monthlyFee = contract.monthlyPrice || 0;
    const annualFee = contract.annualPrice || 0;

    const contactName = contact.isSameAsOwner
      ? firstNaturalOwner?.fullName || ""
      : contact.fullName || "";

    const idTypeLabels: Record<string, string> = {
      personal_id: "Személyi igazolvány",
      passport: "Útlevél",
      drivers_license: "Vezetői engedély",
    };

    const data: Record<string, string> = {
      // Cég adatok
      "{{CEG_NEV}}": company.name || "",
      "{{CEG_ROVID_NEV}}": company.shortName || "",
      "{{CEG_FORMA}}": company.legalForm || "",
      "{{CEGJEGYZEKSZAM}}": company.registrationNumber || "",
      "{{ADOSZAM}}": company.taxNumber || "",
      "{{FOTEV}}": company.mainActivity || "",
      "{{SZEKHELY}}": "1052 Budapest, Váci utca 8. 1. em.",
      // Legacy tulajdonos mezők (első természetes személy)
      "{{TULAJDONOS_NEV}}": firstNaturalOwner?.fullName || "",
      "{{TULAJDONOS_SZUL_NEV}}": firstNaturalOwner?.birthName || "",
      "{{TULAJDONOS_SZUL_HELY}}": firstNaturalOwner?.birthPlace || "",
      "{{TULAJDONOS_SZUL_DATUM}}": firstNaturalOwner?.birthDate || "",
      "{{TULAJDONOS_ANYJA_NEVE}}": firstNaturalOwner?.motherName || "",
      "{{TULAJDONOS_LAKCIM}}": firstNaturalOwner?.address || "",
      "{{TULAJDONOS_OKMANY_TIPUS}}": idTypeLabels[firstNaturalOwner?.idType || ""] || firstNaturalOwner?.idType || "",
      "{{TULAJDONOS_OKMANY_SZAM}}": firstNaturalOwner?.idNumber || "",
      "{{TULAJDONOS_ALLAMPOLGARSAG}}": firstNaturalOwner?.nationality || "",
      "{{TULAJDONOS_ARANY}}": (owners?.[0]?.ownershipPercent ?? 100).toString(),
      // Legacy jogi személy tulajdonos
      "{{TULAJ_CEG_NEV}}": firstLegalOwner?.companyName || "",
      "{{TULAJ_CEG_SZEKHELY}}": firstLegalOwner?.address || "",
      "{{TULAJ_CEG_CEGJSZ}}": firstLegalOwner?.registrationNumber || "",
      "{{TULAJ_CEG_KEPVISELO}}": firstLegalOwner?.representativeName || "",
      "{{TULAJ_CEG_KEPV_BEOSZTAS}}": firstLegalOwner?.representativePosition || "",
      // Képviselő
      "{{KEPVISELO_NEV}}": representative.fullName || "",
      "{{KEPVISELO_SZUL_NEV}}": representative.birthName || "",
      "{{KEPVISELO_SZUL_HELY}}": representative.birthPlace || "",
      "{{KEPVISELO_SZUL_DATUM}}": representative.birthDate || "",
      "{{KEPVISELO_ANYJA_NEVE}}": representative.motherName || "",
      "{{KEPVISELO_LAKCIM}}": representative.address || "",
      "{{KEPVISELO_OKMANY_TIPUS}}": idTypeLabels[representative.idType || ""] || representative.idType || "",
      "{{KEPVISELO_OKMANY_SZAM}}": representative.idNumber || "",
      "{{KEPVISELO_BEOSZTAS}}": representative.position || "",
      "{{KEPVISELO_ALLAMPOLGARSAG}}": representative.nationality || "",
      // Kapcsolattartó
      "{{KAPCSOLAT_NEV}}": contactName,
      "{{KAPCSOLAT_EMAIL}}": contact.email || "",
      "{{KAPCSOLAT_TELEFON}}": contact.phone || "",
      "{{KAPCSOLAT_CIM}}": contact.address || "",
      // Szolgáltatás
      "{{CSOMAG_NEV}}": PACKAGE_NAMES[contract.packageId || ""] || contract.packageId || "",
      "{{HAVI_DIJ}}": monthlyFee.toLocaleString("hu-HU"),
      "{{HAVI_DIJ_SZOVEG}}": monthlyFee.toLocaleString("hu-HU"),
      "{{EVES_DIJ}}": annualFee.toLocaleString("hu-HU"),
      "{{EVES_DIJ_SZOVEG}}": annualFee.toLocaleString("hu-HU"),
      "{{SZOLGALTATAS_TIPUS}}": PACKAGE_NAMES[contract.packageId || ""] || contract.packageId || "",
      // Szolgáltató
      "{{SZOLGALTATO_NEV}}": "E-Marketplace Kft.",
      "{{SZOLGALTATO_CIM}}": "1064 Budapest, Izabella utca 68/b.",
      // Dátumok
      "{{DATUM}}": date.toLocaleDateString("hu-HU"),
      "{{DATUM_SZO}}": date.toLocaleDateString("hu-HU", { year: "numeric", month: "long", day: "numeric" }),
      "{{EV}}": date.getFullYear().toString(),
      "{{HONAP}}": (date.getMonth() + 1).toString(),
      "{{NAP}}": date.getDate().toString(),
      // Meta
      "{{SZERZODES_ID}}": contract.id,
      "{{KEZBESITESI_CIM}}": "1052 Budapest, Váci utca 8. 1. em.",
      "{{TULAJDONOS_SZAM}}": owners.length.toString(),
      // PEP
      "{{PEP_STATUS}}": (pep.isPep || pep.isPepRelative || pep.isPepAssociate) ? "Igen" : "Nem",
      "{{PEP_NYILATKOZAT}}": (pep.isPep || pep.isPepRelative || pep.isPepAssociate) ? "minősül" : "nem minősül",
      "{{PEP_RESZLETEK}}": pep.pepDetails || "",
      // Üzleti kapcsolat
      "{{KOCKAZAT_SZINT}}": "Átlagos",
      "{{TELJESITES_HELY}}": "1052 Budapest, Váci utca 8. 1. em.",
      "{{UZLETI_CEL}}": "Székhely biztosítása határozatlan időtartamra, küldemények átvétele és az ügyfél értesítése",
    };

    // Számozott tulajdonosok (max 3)
    for (let i = 0; i < 3; i++) {
      const num = i + 1;
      const owner = owners[i];
      
      if (owner && owner.type !== "legal" && owner.natural) {
        const n = owner.natural;
        data[`{{TULAJDONOS_${num}_NEV}}`] = n.fullName || "";
        data[`{{TULAJDONOS_${num}_SZUL_NEV}}`] = n.birthName || "";
        data[`{{TULAJDONOS_${num}_SZUL_HELY}}`] = n.birthPlace || "";
        data[`{{TULAJDONOS_${num}_SZUL_DATUM}}`] = n.birthDate || "";
        data[`{{TULAJDONOS_${num}_SZUL_HELY_IDO}}`] = `${n.birthPlace || ""}, ${n.birthDate || ""}`;
        data[`{{TULAJDONOS_${num}_ANYJA_NEVE}}`] = n.motherName || "";
        data[`{{TULAJDONOS_${num}_LAKCIM}}`] = n.address || "";
        data[`{{TULAJDONOS_${num}_OKMANY_TIPUS}}`] = idTypeLabels[n.idType || ""] || n.idType || "";
        data[`{{TULAJDONOS_${num}_OKMANY_SZAM}}`] = n.idNumber || "";
        data[`{{TULAJDONOS_${num}_ALLAMPOLGARSAG}}`] = n.nationality || "";
        data[`{{TULAJDONOS_${num}_ARANY}}`] = (owner.ownershipPercent || 0).toString();
        data[`{{TULAJDONOS_${num}_TIPUS}}`] = "természetes személy";
        // Jogi személy mezők üresen
        data[`{{TULAJDONOS_${num}_CEG_NEV}}`] = "";
        data[`{{TULAJDONOS_${num}_CEG_ROVID}}`] = "";
        data[`{{TULAJDONOS_${num}_CEG_SZEKHELY}}`] = "";
        data[`{{TULAJDONOS_${num}_CEG_CEGJSZ}}`] = "";
        data[`{{TULAJDONOS_${num}_CEG_FOTEV}}`] = "";
        data[`{{TULAJDONOS_${num}_CEG_KEPVISELO}}`] = "";
        data[`{{TULAJDONOS_${num}_CEG_KEPV_BEOSZTAS}}`] = "";
      } else if (owner && owner.type === "legal" && owner.legal) {
        const l = owner.legal;
        // Természetes személy mezők üresen
        data[`{{TULAJDONOS_${num}_NEV}}`] = "";
        data[`{{TULAJDONOS_${num}_SZUL_NEV}}`] = "";
        data[`{{TULAJDONOS_${num}_SZUL_HELY}}`] = "";
        data[`{{TULAJDONOS_${num}_SZUL_DATUM}}`] = "";
        data[`{{TULAJDONOS_${num}_SZUL_HELY_IDO}}`] = "";
        data[`{{TULAJDONOS_${num}_ANYJA_NEVE}}`] = "";
        data[`{{TULAJDONOS_${num}_LAKCIM}}`] = "";
        data[`{{TULAJDONOS_${num}_OKMANY_TIPUS}}`] = "";
        data[`{{TULAJDONOS_${num}_OKMANY_SZAM}}`] = "";
        data[`{{TULAJDONOS_${num}_ALLAMPOLGARSAG}}`] = "";
        data[`{{TULAJDONOS_${num}_ARANY}}`] = (owner.ownershipPercent || 0).toString();
        data[`{{TULAJDONOS_${num}_TIPUS}}`] = "jogi személy";
        // Jogi személy mezők
        data[`{{TULAJDONOS_${num}_CEG_NEV}}`] = l.companyName || "";
        data[`{{TULAJDONOS_${num}_CEG_ROVID}}`] = l.shortName || "";
        data[`{{TULAJDONOS_${num}_CEG_SZEKHELY}}`] = l.address || "";
        data[`{{TULAJDONOS_${num}_CEG_CEGJSZ}}`] = l.registrationNumber || "";
        data[`{{TULAJDONOS_${num}_CEG_FOTEV}}`] = l.mainActivity || "";
        data[`{{TULAJDONOS_${num}_CEG_KEPVISELO}}`] = l.representativeName || "";
        data[`{{TULAJDONOS_${num}_CEG_KEPV_BEOSZTAS}}`] = l.representativePosition || "";
      } else {
        // Üres tulajdonos - minden mező üres
        data[`{{TULAJDONOS_${num}_NEV}}`] = "";
        data[`{{TULAJDONOS_${num}_SZUL_NEV}}`] = "";
        data[`{{TULAJDONOS_${num}_SZUL_HELY}}`] = "";
        data[`{{TULAJDONOS_${num}_SZUL_DATUM}}`] = "";
        data[`{{TULAJDONOS_${num}_SZUL_HELY_IDO}}`] = "";
        data[`{{TULAJDONOS_${num}_ANYJA_NEVE}}`] = "";
        data[`{{TULAJDONOS_${num}_LAKCIM}}`] = "";
        data[`{{TULAJDONOS_${num}_OKMANY_TIPUS}}`] = "";
        data[`{{TULAJDONOS_${num}_OKMANY_SZAM}}`] = "";
        data[`{{TULAJDONOS_${num}_ALLAMPOLGARSAG}}`] = "";
        data[`{{TULAJDONOS_${num}_ARANY}}`] = "";
        data[`{{TULAJDONOS_${num}_TIPUS}}`] = "";
        data[`{{TULAJDONOS_${num}_CEG_NEV}}`] = "";
        data[`{{TULAJDONOS_${num}_CEG_ROVID}}`] = "";
        data[`{{TULAJDONOS_${num}_CEG_SZEKHELY}}`] = "";
        data[`{{TULAJDONOS_${num}_CEG_CEGJSZ}}`] = "";
        data[`{{TULAJDONOS_${num}_CEG_FOTEV}}`] = "";
        data[`{{TULAJDONOS_${num}_CEG_KEPVISELO}}`] = "";
        data[`{{TULAJDONOS_${num}_CEG_KEPV_BEOSZTAS}}`] = "";
      }
    }

    return data;
  };


  const handleGenerateAll = async () => {
    if (!selectedContract) return;
    setIsGeneratingPdf(true);
    try {
      // Generate all documents using DOCX templates
      await generateDocxByCategory("Szerződés", "Szerzodes");
      await new Promise((r) => setTimeout(r, 500));
      await generateDocxByCategory("Adatlap", "Atvilagitas");
      await new Promise((r) => setTimeout(r, 500));
      await generateDocxByCategory("Nyilatkozat", "PEP_nyilatkozat");
      await new Promise((r) => setTimeout(r, 500));
      await generateDocxByCategory("Egyéb", "Meghatalmazas");
    } catch (error) {
      console.error("DOCX generation error:", error);
      alert("Hiba a dokumentum generálás során!");
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

  // Helper: Extract owner number from template name (e.g., "{TULAJDONOS_2_NEV}" -> 2)
  const getOwnerNumberFromTemplateName = (templateName: string): number | null => {
    const match = templateName.match(/\{TULAJDONOS_(\d)_NEV\}/);
    return match ? parseInt(match[1], 10) : null;
  };

  // Generate single DOCX document from a specific template
  const generateSingleDocx = async (
    template: { id: string; name: string },
    data: Record<string, string>,
    filename: string
  ) => {
    const token = await getAuthToken();
    const res = await fetch(`${FUNCTIONS_BASE_URL}/generateDocument`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        templateId: template.id,
        format: "docx",
        data,
        useSampleData: false,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Generálási hiba");
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Generate DOCX documents for all owners (finds matching templates by owner number in name)
  const generateDocxForAllOwners = async (category: string, fallbackTitle: string) => {
    if (!selectedContract) return;
    setIsGeneratingPdf(true);
    try {
      const owners = selectedContract.owners || [];
      const ownerCount = owners.length;

      if (ownerCount === 0) {
        alert("Nincs tulajdonos megadva a szerződésben!");
        return;
      }

      // Find all templates in this category
      const templatesInCategory = docxTemplates.filter((t) => t.category === category);
      if (templatesInCategory.length === 0) {
        alert(`Nincs '${category}' kategóriájú DOCX sablon feltöltve.\n\nMenj a Sablonok menüpontra és tölts fel egy .docx fájlt ezzel a kategóriával!`);
        return;
      }

      const shortcodeData = buildShortcodeDataFromContract(selectedContract);
      const data: Record<string, string> = {};
      Object.entries(shortcodeData).forEach(([key, value]) => {
        const cleanKey = key.replace(/^\{\{|\}\}$/g, "");
        data[cleanKey] = value;
      });

      const slug = selectedContract.company?.name?.replace(/\s+/g, "_") || "ceg";
      let generatedCount = 0;

      // Generate document for each owner that has a matching template
      for (let ownerNum = 1; ownerNum <= ownerCount; ownerNum++) {
        // Find template for this owner number
        const template = templatesInCategory.find((t) => {
          const templateOwnerNum = getOwnerNumberFromTemplateName(t.name);
          return templateOwnerNum === ownerNum;
        });

        if (template) {
          const ownerName = owners[ownerNum - 1]?.natural?.fullName || 
                           owners[ownerNum - 1]?.legal?.companyName || 
                           `tulajdonos_${ownerNum}`;
          const safeOwnerName = ownerName.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_áéíóöőúüűÁÉÍÓÖŐÚÜŰ]/g, "");
          const filename = `${fallbackTitle.toLowerCase()}_${ownerNum}_${safeOwnerName}_${new Date().toISOString().slice(0, 10)}.docx`;
          
          await generateSingleDocx(template, data, filename);
          generatedCount++;
        }
      }

      if (generatedCount === 0) {
        // Fallback: try to find any template without owner number pattern
        const genericTemplate = templatesInCategory.find((t) => !getOwnerNumberFromTemplateName(t.name));
        if (genericTemplate) {
          const filename = `${fallbackTitle.toLowerCase()}_${slug}_${new Date().toISOString().slice(0, 10)}.docx`;
          await generateSingleDocx(genericTemplate, data, filename);
          generatedCount = 1;
        }
      }

      if (generatedCount === 0) {
        alert(`Nem található megfelelő sablon a(z) ${ownerCount} tulajdonoshoz.\n\nEllenőrizd, hogy a sablon nevében szerepel-e a {TULAJDONOS_X_NEV} minta!`);
      } else if (generatedCount < ownerCount) {
        alert(`${generatedCount} dokumentum generálva ${ownerCount} tulajdonosból.\n\nHiányzó sablonok lehetnek!`);
      }
    } catch (error) {
      console.error("DOCX generation error:", error);
      alert(`Hiba a dokumentum generálásakor: ${error instanceof Error ? error.message : "Ismeretlen hiba"}`);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Generate DOCX document from template by category (for single-owner docs like contract)
  const generateDocxByCategory = async (category: string, fallbackTitle: string) => {
    if (!selectedContract) return;
    setIsGeneratingPdf(true);
    try {
      // Find template by category (use first one, or one without owner pattern)
      console.log("Looking for category:", category);
      console.log("Available templates:", docxTemplates.map(t => ({ name: t.name, category: t.category })));
      const templatesInCategory = docxTemplates.filter((t) => t.category === category);
      console.log("Found templates:", templatesInCategory);
      const template = templatesInCategory.find((t) => !getOwnerNumberFromTemplateName(t.name)) || templatesInCategory[0];
      
      if (!template) {
        alert(`Nincs '${category}' kategóriájú DOCX sablon feltöltve.\n\nMenj a Sablonok menüpontra és tölts fel egy .docx fájlt ezzel a kategóriával!\n\nElérhető kategóriák: ${[...new Set(docxTemplates.map(t => t.category))].join(", ")}`);
        return;
      }

      const shortcodeData = buildShortcodeDataFromContract(selectedContract);
      const data: Record<string, string> = {};
      Object.entries(shortcodeData).forEach(([key, value]) => {
        const cleanKey = key.replace(/^\{\{|\}\}$/g, "");
        data[cleanKey] = value;
      });

      const slug = selectedContract.company?.name?.replace(/\s+/g, "_") || "ceg";
      const filename = `${fallbackTitle.toLowerCase().replace(/\s+/g, "_")}_${slug}_${new Date().toISOString().slice(0, 10)}.docx`;

      await generateSingleDocx(template, data, filename);
    } catch (error) {
      console.error("DOCX generation error:", error);
      alert(`Hiba a dokumentum generálásakor: ${error instanceof Error ? error.message : "Ismeretlen hiba"}`);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Legacy HTML preview (fallback if no DOCX template)
  const previewTemplateByType = async (templateType: string, fallbackTitle: string) => {
    if (!selectedContract) return;
    setIsGeneratingPdf(true);
    try {
      const templatesRef = collection(firestoreDb, "documentTemplates");
      const snapshot = await getDocs(templatesRef);
      
      const matchingTemplate = snapshot.docs.find((d) => {
        const data = d.data();
        return data.type === templateType && data.active === true;
      });

      if (!matchingTemplate) {
        alert(`Nincs aktív '${templateType}' típusú sablon beállítva.`);
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

  const generateContract = async () => {
    await generateDocxByCategory("Szerződés", "Szerzodes");
  };

  const generateKyc = async () => {
    await generateDocxForAllOwners("Adatlap", "atvilagitas");
  };

  const generatePepDoc = async () => {
    await generateDocxForAllOwners("Nyilatkozat", "pep_nyilatkozat");
  };

  const generateConsentDoc = async () => {
    // Try exact category match first, then fallback to name-based search
    const exactMatch = docxTemplates.find((t) => t.category === "Hozzájáruló nyilatkozat");
    const nameMatch = docxTemplates.find((t) => t.name.toLowerCase().includes("hozzájárul"));
    const template = exactMatch || nameMatch;
    
    if (!template) {
      alert(`Nincs 'Hozzájáruló nyilatkozat' sablon feltöltve.\n\nMenj a Sablonok menüpontra és tölts fel egy .docx fájlt ezzel a kategóriával!`);
      return;
    }
    
    // Use the found template's category for generation
    await generateDocxByCategory(template.category, "Hozzajarulo_nyilatkozat");
  };

  const generatePostalAuthDoc = async () => {
    if (!selectedContract) return;
    setIsGeneratingPdf(true);
    try {
      const owners = selectedContract.owners || [];
      const ownerCount = owners.length;

      if (ownerCount === 0) {
        alert("Nincs tulajdonos megadva a szerződésben!");
        return;
      }

      const deliveryAddress = "1064 Budapest, Izabella utca 68/b.";
      
      // E-Marketplace Kft. adatai (meghatalmazott)
      const emarketplaceData = {
        name: "E-Marketplace Kft.",
        address: "1064 Budapest, Izabella utca 68/b.",
        registrationNumber: "01-09-296567",
      };

      // Szerződés cég adatai (meghatalmazó szervezet)
      const company = selectedContract.company || {};
      const authorizerOrgData = {
        name: company.name || "",
        address: "", // Üres - nem kell kitölteni
        registrationNumber: company.registrationNumber || "",
      };

      // Generate PDF for each owner
      for (let i = 0; i < ownerCount; i++) {
        const owner = owners[i];
        const ownerNum = i + 1;
        
        let authorizerName = "";
        let birthName = "";
        let motherName = "";
        let birthPlace = "";
        let birthDate = "";

        if (owner.type !== "legal" && owner.natural) {
          authorizerName = owner.natural.fullName || "";
          birthName = owner.natural.birthName || "";
          motherName = owner.natural.motherName || "";
          birthPlace = owner.natural.birthPlace || "";
          birthDate = owner.natural.birthDate || "";
        } else if (owner.type === "legal" && owner.legal) {
          authorizerName = owner.legal.representativeName || "";
        }

        const pdfData: OfficialPostalAuthData = {
          authorizer: {
            name: authorizerName,
            birthName: birthName,
            motherName: motherName,
            birthPlace: birthPlace,
            birthDate: birthDate,
          },
          // Mindig kitöltjük a meghatalmazó szervezet adatait a szerződés cégével
          authorizerOrg: authorizerOrgData,
          deliveryAddress: deliveryAddress,
          authorized: {
            name: "", // E-Marketplace is org, not individual
          },
          authorizedOrg: emarketplaceData,
          // authorizedDeliveryAddress nem kell - csak a székhely cím szükséges
          authType: {
            indefinite: true,
            allPackages: true,
            letter: true,
            package: true,
            official: true,
          },
        };

        const pdfBytes = await fillOfficialPostalAuthPDF(pdfData);
        
        // Download the PDF
        const safeOwnerName = authorizerName.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_áéíóöőúüűÁÉÍÓÖŐÚÜŰ]/g, "") || `tulajdonos_${ownerNum}`;
        const filename = `meghatalmazas_${ownerNum}_${safeOwnerName}_${new Date().toISOString().slice(0, 10)}.pdf`;
        
        const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }

      if (ownerCount > 1) {
        alert(`${ownerCount} meghatalmazás generálva (minden tulajdonoshoz külön).`);
      }
    } catch (error) {
      console.error("Postal auth PDF generation error:", error);
      alert(`Hiba a meghatalmazás generálásakor: ${error instanceof Error ? error.message : "Ismeretlen hiba"}`);
    } finally {
      setIsGeneratingPdf(false);
    }
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
              <div className="space-y-3">
                {/* Header: Cégnév és csomag */}
                <div>
                  <h3 className="font-semibold text-[color:var(--foreground)] text-base leading-tight">
                    {contract.company?.name || "Névtelen cég"}
                  </h3>
                  {contract.company?.shortName && (
                    <p className="text-xs text-[color:var(--muted-foreground)] mt-0.5">
                      ({contract.company.shortName})
                    </p>
                  )}
                  <p className="text-xs text-[color:var(--primary)] mt-1 font-medium">
                    {PACKAGE_NAMES[contract.packageId || ""] || "Ismeretlen csomag"}
                  </p>
                </div>

                {/* Státusz badge - külön sorban, jól olvasható */}
                <div>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-semibold ${
                    contract.status === "approved" || contract.status === "active" 
                      ? "bg-green-600 text-white" 
                      : contract.status === "pending_review" || contract.status === "documents_needed"
                      ? "bg-amber-500 text-white"
                      : contract.status === "rejected"
                      ? "bg-red-600 text-white"
                      : "bg-gray-500 text-white"
                  }`}>
                    {STATUS_CONFIG[contract.status || "draft"].label}
                  </span>
                </div>

                {/* Info rows */}
                <div className="space-y-1.5 pt-2 border-t border-[color:var(--border)]">
                  <div className="flex items-center gap-2 text-sm text-[color:var(--muted-foreground)]">
                    <User className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{contract.representative?.fullName || "-"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[color:var(--muted-foreground)]">
                    <Mail className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{contract.contact?.email || "-"}</span>
                  </div>
                  {contract.contact?.phone && (
                    <div className="flex items-center gap-2 text-sm text-[color:var(--muted-foreground)]">
                      <Phone className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{contract.contact.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-[color:var(--muted-foreground)]">
                    <Calendar className="w-3.5 h-3.5 shrink-0" />
                    <span>{formatDate(contract.createdAt)}</span>
                  </div>
                </div>
              </div>
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
          <div className="space-y-5">
            {/* Status Row */}
            <div className="flex items-center gap-3 p-3 bg-[color:var(--muted)]/30 rounded-lg">
              <span className="text-sm font-medium text-[color:var(--foreground)]">Státusz:</span>
              <select
                value={selectedContract.status}
                onChange={(e) => updateStatus(e.target.value as ContractStatus)}
                disabled={isUpdating}
                className="h-9 px-3 rounded-md border border-[color:var(--border)] bg-[color:var(--background)] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[color:var(--primary)]"
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {STATUS_CONFIG[status].label}
                  </option>
                ))}
              </select>
              <span className={`ml-auto px-3 py-1 rounded-full text-xs font-semibold ${
                selectedContract.status === "approved" || selectedContract.status === "active" 
                  ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" 
                  : selectedContract.status === "pending_review" || selectedContract.status === "documents_needed"
                  ? "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
                  : selectedContract.status === "rejected"
                  ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                  : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
              }`}>
                {STATUS_CONFIG[selectedContract.status || "pending_review"].label}
              </span>
            </div>

            {/* Documents */}
            <div className="bg-[color:var(--muted)]/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-[color:var(--foreground)]">Dokumentumok generálása</span>
                <Button size="sm" variant="default" onClick={handleGenerateAll} disabled={isGeneratingPdf}>
                  {isGeneratingPdf ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileDown className="w-4 h-4 mr-2" />}
                  Összes letöltése
                </Button>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                <Button variant="outline" size="sm" className="justify-start" onClick={generateContract} disabled={isGeneratingPdf}>
                  <Download className="w-4 h-4 mr-2" />
                  Szerződés
                </Button>
                <Button variant="outline" size="sm" className="justify-start" onClick={generateKyc} disabled={isGeneratingPdf}>
                  <Download className="w-4 h-4 mr-2" />
                  KYC adatlap
                </Button>
                <Button variant="outline" size="sm" className="justify-start" onClick={generatePepDoc} disabled={isGeneratingPdf}>
                  <Download className="w-4 h-4 mr-2" />
                  PEP nyilatkozat
                </Button>
                <Button variant="outline" size="sm" className="justify-start" onClick={generateConsentDoc} disabled={isGeneratingPdf}>
                  <Download className="w-4 h-4 mr-2" />
                  Hozzájáruló nyil.
                </Button>
                <Button variant="outline" size="sm" className="justify-start" onClick={generatePostalAuthDoc} disabled={isGeneratingPdf}>
                  <Download className="w-4 h-4 mr-2" />
                  Meghatalmazás
                </Button>
              </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-5">
                {/* Company */}
                <div>
                  <div className="flex items-center justify-between mb-3 pb-1 border-b border-[color:var(--border)]">
                    <h4 className="text-sm font-semibold text-[color:var(--foreground)]">Cégadatok</h4>
                    {editingSection === "company" ? (
                      <div className="flex gap-1">
                        <button onClick={() => saveSection("company")} disabled={isSavingSection} className="p-1 text-green-600 hover:bg-green-100 rounded" title="Mentés">
                          <Check className="w-4 h-4" />
                        </button>
                        <button onClick={cancelEditing} className="p-1 text-red-600 hover:bg-red-100 rounded" title="Mégse">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => startEditing("company")} className="p-1 text-[color:var(--muted-foreground)] hover:text-[color:var(--primary)] hover:bg-[color:var(--muted)] rounded" title="Szerkesztés">
                        <Pencil className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  {editingSection === "company" ? (
                    <div className="space-y-3 text-sm">
                      <div>
                        <label className="text-[color:var(--muted-foreground)] text-xs">Cégnév</label>
                        <Input value={editedCompany?.name || ""} onChange={(e) => setEditedCompany({ ...editedCompany, name: e.target.value })} className="h-8 text-sm" />
                      </div>
                      <div>
                        <label className="text-[color:var(--muted-foreground)] text-xs">Rövidített név</label>
                        <Input value={editedCompany?.shortName || ""} onChange={(e) => setEditedCompany({ ...editedCompany, shortName: e.target.value })} className="h-8 text-sm" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[color:var(--muted-foreground)] text-xs">Cégjegyzékszám</label>
                          <Input value={editedCompany?.registrationNumber || ""} onChange={(e) => setEditedCompany({ ...editedCompany, registrationNumber: e.target.value })} className="h-8 text-sm" />
                        </div>
                        <div>
                          <label className="text-[color:var(--muted-foreground)] text-xs">Adószám</label>
                          <Input value={editedCompany?.taxNumber || ""} onChange={(e) => setEditedCompany({ ...editedCompany, taxNumber: e.target.value })} className="h-8 text-sm" />
                        </div>
                      </div>
                      <div>
                        <label className="text-[color:var(--muted-foreground)] text-xs">Főtevékenység</label>
                        <Input value={editedCompany?.mainActivity || ""} onChange={(e) => setEditedCompany({ ...editedCompany, mainActivity: e.target.value })} className="h-8 text-sm" />
                      </div>
                    </div>
                  ) : (
                    <dl className="space-y-2 text-sm">
                      <div>
                        <dt className="text-[color:var(--muted-foreground)]">Cégnév</dt>
                        <dd className="font-medium">{selectedContract.company?.name || "-"}</dd>
                      </div>
                      <div>
                        <dt className="text-[color:var(--muted-foreground)]">Rövidített név</dt>
                        <dd>{selectedContract.company?.shortName || "-"}</dd>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <dt className="text-[color:var(--muted-foreground)]">Cégjegyzékszám</dt>
                          <dd>{selectedContract.company?.registrationNumber || "-"}</dd>
                        </div>
                        <div>
                          <dt className="text-[color:var(--muted-foreground)]">Adószám</dt>
                          <dd>{selectedContract.company?.taxNumber || "-"}</dd>
                        </div>
                      </div>
                      <div>
                        <dt className="text-[color:var(--muted-foreground)]">Főtevékenység</dt>
                        <dd>{selectedContract.company?.mainActivity || "-"}</dd>
                      </div>
                    </dl>
                  )}
                </div>

                {/* Representative */}
                <div>
                  <div className="flex items-center justify-between mb-3 pb-1 border-b border-[color:var(--border)]">
                    <h4 className="text-sm font-semibold text-[color:var(--foreground)]">Képviselő</h4>
                    {editingSection === "representative" ? (
                      <div className="flex gap-1">
                        <button onClick={() => saveSection("representative")} disabled={isSavingSection} className="p-1 text-green-600 hover:bg-green-100 rounded" title="Mentés">
                          <Check className="w-4 h-4" />
                        </button>
                        <button onClick={cancelEditing} className="p-1 text-red-600 hover:bg-red-100 rounded" title="Mégse">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => startEditing("representative")} className="p-1 text-[color:var(--muted-foreground)] hover:text-[color:var(--primary)] hover:bg-[color:var(--muted)] rounded" title="Szerkesztés">
                        <Pencil className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  {editingSection === "representative" ? (
                    <div className="space-y-3 text-sm">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[color:var(--muted-foreground)] text-xs">Név</label>
                          <Input value={editedRepresentative?.fullName || ""} onChange={(e) => setEditedRepresentative({ ...editedRepresentative, fullName: e.target.value })} className="h-8 text-sm" />
                        </div>
                        <div>
                          <label className="text-[color:var(--muted-foreground)] text-xs">Beosztás</label>
                          <Input value={editedRepresentative?.position || ""} onChange={(e) => setEditedRepresentative({ ...editedRepresentative, position: e.target.value })} className="h-8 text-sm" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[color:var(--muted-foreground)] text-xs">Születési hely</label>
                          <Input value={editedRepresentative?.birthPlace || ""} onChange={(e) => setEditedRepresentative({ ...editedRepresentative, birthPlace: e.target.value })} className="h-8 text-sm" />
                        </div>
                        <div>
                          <label className="text-[color:var(--muted-foreground)] text-xs">Születési idő</label>
                          <Input value={editedRepresentative?.birthDate || ""} onChange={(e) => setEditedRepresentative({ ...editedRepresentative, birthDate: e.target.value })} className="h-8 text-sm" />
                        </div>
                      </div>
                      <div>
                        <label className="text-[color:var(--muted-foreground)] text-xs">Anyja neve</label>
                        <Input value={editedRepresentative?.motherName || ""} onChange={(e) => setEditedRepresentative({ ...editedRepresentative, motherName: e.target.value })} className="h-8 text-sm" />
                      </div>
                      <div>
                        <label className="text-[color:var(--muted-foreground)] text-xs">Lakcím</label>
                        <Input value={editedRepresentative?.address || ""} onChange={(e) => setEditedRepresentative({ ...editedRepresentative, address: e.target.value })} className="h-8 text-sm" />
                      </div>
                    </div>
                  ) : (
                    <dl className="space-y-2 text-sm">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <dt className="text-[color:var(--muted-foreground)]">Név</dt>
                          <dd className="font-medium">{selectedContract.representative?.fullName || "-"}</dd>
                        </div>
                        <div>
                          <dt className="text-[color:var(--muted-foreground)]">Beosztás</dt>
                          <dd>{selectedContract.representative?.position || "-"}</dd>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <dt className="text-[color:var(--muted-foreground)]">Születési hely</dt>
                          <dd>{selectedContract.representative?.birthPlace || "-"}</dd>
                        </div>
                        <div>
                          <dt className="text-[color:var(--muted-foreground)]">Születési idő</dt>
                          <dd>{selectedContract.representative?.birthDate || "-"}</dd>
                        </div>
                      </div>
                      <div>
                        <dt className="text-[color:var(--muted-foreground)]">Anyja neve</dt>
                        <dd>{selectedContract.representative?.motherName || "-"}</dd>
                      </div>
                      <div>
                        <dt className="text-[color:var(--muted-foreground)]">Lakcím</dt>
                        <dd>{selectedContract.representative?.address || "-"}</dd>
                      </div>
                    </dl>
                  )}
                </div>

                {/* Contact */}
                <div>
                  <div className="flex items-center justify-between mb-3 pb-1 border-b border-[color:var(--border)]">
                    <h4 className="text-sm font-semibold text-[color:var(--foreground)]">Kapcsolattartó</h4>
                    {editingSection === "contact" ? (
                      <div className="flex gap-1">
                        <button onClick={() => saveSection("contact")} disabled={isSavingSection} className="p-1 text-green-600 hover:bg-green-100 rounded" title="Mentés">
                          <Check className="w-4 h-4" />
                        </button>
                        <button onClick={cancelEditing} className="p-1 text-red-600 hover:bg-red-100 rounded" title="Mégse">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => startEditing("contact")} className="p-1 text-[color:var(--muted-foreground)] hover:text-[color:var(--primary)] hover:bg-[color:var(--muted)] rounded" title="Szerkesztés">
                        <Pencil className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  {editingSection === "contact" ? (
                    <div className="space-y-3 text-sm">
                      <div>
                        <label className="text-[color:var(--muted-foreground)] text-xs">Név</label>
                        <Input value={editedContact?.fullName || ""} onChange={(e) => setEditedContact({ ...editedContact, fullName: e.target.value })} className="h-8 text-sm" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[color:var(--muted-foreground)] text-xs">Email</label>
                          <Input value={editedContact?.email || ""} onChange={(e) => setEditedContact({ ...editedContact, email: e.target.value })} className="h-8 text-sm" />
                        </div>
                        <div>
                          <label className="text-[color:var(--muted-foreground)] text-xs">Telefon</label>
                          <Input value={editedContact?.phone || ""} onChange={(e) => setEditedContact({ ...editedContact, phone: e.target.value })} className="h-8 text-sm" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <dl className="space-y-2 text-sm">
                      <div>
                        <dt className="text-[color:var(--muted-foreground)]">Név</dt>
                        <dd className="font-medium">{selectedContract.contact?.fullName || (selectedContract.contact?.isSameAsOwner ? selectedContract.owners?.[0]?.natural?.fullName : "-") || "-"}</dd>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <dt className="text-[color:var(--muted-foreground)]">Email</dt>
                          <dd>{selectedContract.contact?.email || "-"}</dd>
                        </div>
                        <div>
                          <dt className="text-[color:var(--muted-foreground)]">Telefon</dt>
                          <dd>{selectedContract.contact?.phone || "-"}</dd>
                        </div>
                      </div>
                    </dl>
                  )}
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-5">
                {/* Owners */}
                <div>
                  <h4 className="text-sm font-semibold text-[color:var(--foreground)] mb-3 pb-1 border-b border-[color:var(--border)]">Tulajdonosok ({selectedContract.owners?.length || 0})</h4>
                  <div className="space-y-4">
                    {selectedContract.owners?.map((owner, idx) => (
                      <div key={idx} className="p-4 bg-[color:var(--muted)]/30 rounded-lg text-sm">
                        <div className="font-medium mb-3 flex items-center justify-between border-b border-[color:var(--border)] pb-2">
                          <span className="text-base">{owner.type === "legal" ? owner.legal?.companyName : owner.natural?.fullName}</span>
                          <span className="text-[color:var(--primary)] font-semibold text-lg">{owner.ownershipPercent}%</span>
                        </div>
                        {owner.type === "legal" ? (
                          <dl className="space-y-2 text-xs">
                            {owner.legal?.shortName && (
                              <div>
                                <dt className="text-[color:var(--muted-foreground)]">Rövidített név</dt>
                                <dd>{owner.legal.shortName}</dd>
                              </div>
                            )}
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <dt className="text-[color:var(--muted-foreground)]">Cégjegyzékszám</dt>
                                <dd>{owner.legal?.registrationNumber || "-"}</dd>
                              </div>
                              <div>
                                <dt className="text-[color:var(--muted-foreground)]">Adószám</dt>
                                <dd>{owner.legal?.taxNumber || "-"}</dd>
                              </div>
                            </div>
                            <div>
                              <dt className="text-[color:var(--muted-foreground)]">Székhely</dt>
                              <dd>{owner.legal?.address || "-"}</dd>
                            </div>
                            {owner.legal?.mainActivity && (
                              <div>
                                <dt className="text-[color:var(--muted-foreground)]">Főtevékenység</dt>
                                <dd>{owner.legal.mainActivity}</dd>
                              </div>
                            )}
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <dt className="text-[color:var(--muted-foreground)]">Képviselő neve</dt>
                                <dd>{owner.legal?.representativeName || "-"}</dd>
                              </div>
                              <div>
                                <dt className="text-[color:var(--muted-foreground)]">Beosztás</dt>
                                <dd>{owner.legal?.representativePosition || "-"}</dd>
                              </div>
                            </div>
                          </dl>
                        ) : (
                          <dl className="space-y-2 text-xs">
                            {owner.natural?.birthName && (
                              <div>
                                <dt className="text-[color:var(--muted-foreground)]">Születési név</dt>
                                <dd>{owner.natural.birthName}</dd>
                              </div>
                            )}
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <dt className="text-[color:var(--muted-foreground)]">Állampolgárság</dt>
                                <dd>{owner.natural?.nationality || "-"}</dd>
                              </div>
                              <div>
                                <dt className="text-[color:var(--muted-foreground)]">Anyja neve</dt>
                                <dd>{owner.natural?.motherName || "-"}</dd>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <dt className="text-[color:var(--muted-foreground)]">Születési hely</dt>
                                <dd>{owner.natural?.birthPlace || "-"}</dd>
                              </div>
                              <div>
                                <dt className="text-[color:var(--muted-foreground)]">Születési idő</dt>
                                <dd>{owner.natural?.birthDate || "-"}</dd>
                              </div>
                            </div>
                            <div>
                              <dt className="text-[color:var(--muted-foreground)]">Lakcím</dt>
                              <dd>{owner.natural?.address || "-"}</dd>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <dt className="text-[color:var(--muted-foreground)]">Okmány típusa</dt>
                                <dd>{owner.natural?.idType === "passport" ? "Útlevél" : "Személyi igazolvány"}</dd>
                              </div>
                              <div>
                                <dt className="text-[color:var(--muted-foreground)]">Okmányszám</dt>
                                <dd>{owner.natural?.idNumber || "-"}</dd>
                              </div>
                            </div>
                          </dl>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Service */}
                <div>
                  <h4 className="text-sm font-semibold text-[color:var(--foreground)] mb-3 pb-1 border-b border-[color:var(--border)]">Szolgáltatás</h4>
                  <dl className="space-y-2 text-sm">
                    <div>
                      <dt className="text-[color:var(--muted-foreground)]">Csomag</dt>
                      <dd className="font-medium">{PACKAGE_NAMES[selectedContract.packageId || ""] || selectedContract.packageId || "-"}</dd>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <dt className="text-[color:var(--muted-foreground)]">Havi díj</dt>
                        <dd className="font-semibold text-[color:var(--primary)]">{selectedContract.monthlyPrice ? `${selectedContract.monthlyPrice.toLocaleString()} Ft` : "-"}</dd>
                      </div>
                      <div>
                        <dt className="text-[color:var(--muted-foreground)]">Éves díj</dt>
                        <dd className="font-semibold text-[color:var(--primary)]">{selectedContract.annualPrice ? `${selectedContract.annualPrice.toLocaleString()} Ft` : "-"}</dd>
                      </div>
                    </div>
                  </dl>
                </div>

                {/* Timestamps */}
                <div>
                  <h4 className="text-sm font-semibold text-[color:var(--foreground)] mb-3 pb-1 border-b border-[color:var(--border)]">Időbélyegek</h4>
                  <dl className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <dt className="text-[color:var(--muted-foreground)]">Létrehozva</dt>
                      <dd>{formatDate(selectedContract.createdAt)}</dd>
                    </div>
                    <div>
                      <dt className="text-[color:var(--muted-foreground)]">Módosítva</dt>
                      <dd>{formatDate(selectedContract.updatedAt)}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>

            {/* Uploaded Documents */}
            {selectedContract.uploadedDocuments && Object.keys(selectedContract.uploadedDocuments).length > 0 && (
              <div className="border-t border-[color:var(--border)] pt-5">
                <h4 className="text-sm font-semibold text-[color:var(--foreground)] mb-3">Feltöltött dokumentumok</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {Object.entries(selectedContract.uploadedDocuments).map(([key, url]) => {
                    if (!url || key === "otherDocuments") return null
                    const labels: Record<string, string> = {
                      idFront: "Személyi elő",
                      idBack: "Személyi hát",
                      addressCard: "Lakcímkártya",
                      passport: "Útlevél",
                      companyExtract: "Cégkivonat",
                    }
                    const isImage = typeof url === "string" && (url.includes("image") || url.match(/\.(jpg|jpeg|png|gif|webp)/i))
                    return (
                      <a
                        key={key}
                        href={url as string}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group block bg-[color:var(--muted)]/30 rounded-lg overflow-hidden hover:ring-2 hover:ring-[color:var(--primary)] transition-all"
                      >
                        {isImage ? (
                          <div className="aspect-[4/3] relative bg-[color:var(--muted)]">
                            <img
                              src={url as string}
                              alt={labels[key] || key}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                              <ExternalLink className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                            </div>
                          </div>
                        ) : (
                          <div className="aspect-[4/3] flex items-center justify-center bg-[color:var(--muted)]">
                            <FileText className="w-10 h-10 text-[color:var(--muted-foreground)]" />
                          </div>
                        )}
                        <div className="p-2 text-center">
                          <span className="text-xs font-medium text-[color:var(--foreground)]">{labels[key] || key}</span>
                        </div>
                      </a>
                    )
                  })}
                </div>
              </div>
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
