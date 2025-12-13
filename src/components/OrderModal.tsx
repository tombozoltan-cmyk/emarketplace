"use client";

import React, { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Check, CheckCircle2, Loader2, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

import { useModal } from "@/components/ModalContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { firestoreDb } from "@/lib/firebase";

type CompanyType = "existing" | "new";

type CountryOption = {
  label: string;
  value: string;
  phone: string;
};

const COUNTRIES_HU: CountryOption[] = [
  { label: "Magyarország", value: "hu", phone: "+36" },
  { label: "Ausztria", value: "at", phone: "+43" },
  { label: "Szlovákia", value: "sk", phone: "+421" },
  { label: "Németország", value: "de", phone: "+49" },
  { label: "Románia", value: "ro", phone: "+40" },
  { label: "Egyesült Királyság", value: "gb", phone: "+44" },
];

const COUNTRIES_EN: CountryOption[] = [
  { label: "Hungary", value: "hu", phone: "+36" },
  { label: "Austria", value: "at", phone: "+43" },
  { label: "Slovakia", value: "sk", phone: "+421" },
  { label: "Germany", value: "de", phone: "+49" },
  { label: "Romania", value: "ro", phone: "+40" },
  { label: "United Kingdom", value: "gb", phone: "+44" },
];

const PACKAGE_OPTIONS_HU = [
  { value: "szekhely-hu", label: "Székhelyszolgáltatás (HU) - 8.000 Ft/hó" },
  { value: "szekhely-kulfoldi", label: "Székhelyszolgáltatás (Külföldi) - 10.000 Ft/hó" },
  { value: "szekhely-kezbesitesi-hu", label: "Székhely + Kézbesítési (HU) - 11.000 Ft/hó" },
  { value: "szekhely-kezbesitesi-kulfoldi", label: "Székhely + Kézbesítési (Külföldi) - 13.000 Ft/hó" },
  { value: "kezbesitesi", label: "Kézbesítési megbízott - 5.000 Ft/hó" },
  { value: "iroda-hu", label: "Székhely + Iroda (HU) - 18.000 Ft/hó" },
  { value: "iroda-kulfoldi", label: "Székhely + Iroda (Külföldi) - 20.000 Ft/hó" },
  { value: "iroda-kezbesitesi-hu", label: "Székhely + Iroda + Kézbesítési (HU) - 24.000 Ft/hó" },
  { value: "iroda-kezbesitesi-kulfoldi", label: "Székhely + Iroda + Kézbesítési (Külföldi) - 27.000 Ft/hó" },
  { value: "szerzodeses-irodaberles", label: "Hosszú Távú Szerződéses Irodabérlés - 30.000 Ft/hó" },
];

const PACKAGE_OPTIONS_EN = [
  { value: "szekhely-hu", label: "Registered office service (HU) - 8,000 HUF/month" },
  { value: "szekhely-kulfoldi", label: "Registered office service (Foreign) - 10,000 HUF/month" },
  { value: "szekhely-kezbesitesi-hu", label: "Registered office + delivery agent (HU) - 11,000 HUF/month" },
  { value: "szekhely-kezbesitesi-kulfoldi", label: "Registered office + delivery agent (Foreign) - 13,000 HUF/month" },
  { value: "kezbesitesi", label: "Delivery agent - 5,000 HUF/month" },
  { value: "iroda-hu", label: "Registered office + office (HU) - 18,000 HUF/month" },
  { value: "iroda-kulfoldi", label: "Registered office + office (Foreign) - 20,000 HUF/month" },
  { value: "iroda-kezbesitesi-hu", label: "Registered office + office + delivery agent (HU) - 24,000 HUF/month" },
  { value: "iroda-kezbesitesi-kulfoldi", label: "Registered office + office + delivery agent (Foreign) - 27,000 HUF/month" },
  { value: "szerzodeses-irodaberles", label: "Long-term office rental (contract) - 30,000 HUF/month" },
];

export function OrderModal() {
  const { isOpen, closeModal, modalData } = useModal();

  const pathname = usePathname();
  const isEnglish = pathname?.startsWith("/en");

  const countries = isEnglish ? COUNTRIES_EN : COUNTRIES_HU;
  const packageOptions = isEnglish ? PACKAGE_OPTIONS_EN : PACKAGE_OPTIONS_HU;

  const text = {
    modalTitle: isEnglish ? "Quote request / Order" : "Ajánlatkérés / Megrendelés",
    modalSubtitle: isEnglish
      ? "Fill out the form below and our team will contact you shortly."
      : "Töltse ki az alábbi űrlapot, és munkatársunk rövid időn belül felveszi Önnel a kapcsolatot.",
    closeModalAria: isEnglish ? "Close modal" : "Modal bezárása",
    closeAria: isEnglish ? "Close" : "Bezárás",
    successTitle: isEnglish ? "Thank you for your request!" : "Köszönjük megkeresését!",
    successText: isEnglish
      ? "Our colleague will contact you soon using the details you provided to confirm the next steps."
      : "Munkatársunk hamarosan felveszi Önnel a kapcsolatot a megadott elérhetőségeken, és egyeztet a részletekről.",
    successNote: isEnglish
      ? "This quote request does not constitute a contract. Final terms are always confirmed in a written agreement."
      : "Ez az ajánlatkérés nem minősül szerződéskötésnek. A végleges feltételeket minden esetben írásos szerződés rögzíti.",
    successClose: isEnglish ? "OK, close" : "Rendben, bezárás",
    hpLabel: isEnglish ? "Do not fill" : "Ne töltse ki",
    step1Title: isEnglish ? "Select a service" : "Szolgáltatás kiválasztása",
    packageLabel: isEnglish ? "Which package are you interested in?" : "Melyik csomag érdekli?",
    packagePlaceholder: isEnglish ? "Select a package..." : "Válasszon csomagot...",
  };

  const [selectedPackage, setSelectedPackage] = useState<string>("");
  const [companyType, setCompanyType] = useState<CompanyType>("existing");
  const [sameContact, setSameContact] = useState(true);
  const [selectedPhoneCountry, setSelectedPhoneCountry] = useState<string>(countries[0]?.phone ?? "+36");
  const [selectedCountry, setSelectedCountry] = useState<string>(countries[0]?.value ?? "hu");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const startTimeRef = useRef<number>(0);

  const hpRef = useRef<HTMLInputElement | null>(null);
  const companyNameRef = useRef<HTMLInputElement | null>(null);
  const taxNumberRef = useRef<HTMLInputElement | null>(null);
  const nameRef = useRef<HTMLInputElement | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);
  const phoneRef = useRef<HTMLInputElement | null>(null);
  const addressRef = useRef<HTMLInputElement | null>(null);
  const messageRef = useRef<HTMLTextAreaElement | null>(null);
  const contactNameRef = useRef<HTMLInputElement | null>(null);
  const contactEmailRef = useRef<HTMLInputElement | null>(null);
  const contactPhoneRef = useRef<HTMLInputElement | null>(null);
  const contactAddressRef = useRef<HTMLInputElement | null>(null);
  const gdprRef = useRef<HTMLInputElement | null>(null);
  const aszfRef = useRef<HTMLInputElement | null>(null);

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      startTimeRef.current = Date.now();
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Prefill package from modalData
  useEffect(() => {
    if (isOpen && modalData?.packageId) {
      setSelectedPackage(modalData.packageId);
    }
  }, [isOpen, modalData]);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setSubmitError(null);

    // Honeypot
    if (hpRef.current && hpRef.current.value.trim() !== "") {
      return;
    }

    // Time-based spam protection
    if (Date.now() - startTimeRef.current < 2000) {
      return;
    }

    // Basic required validation safeguard
    if (!selectedPackage || !companyNameRef.current?.value || !nameRef.current?.value || !emailRef.current?.value) {
      return;
    }

    if (!gdprRef.current?.checked || !aszfRef.current?.checked) {
      return;
    }

    setIsLoading(true);

    try {
      const formSubmission = {
        id: Date.now(),
        type: "Ajánlatkérés",
        sender: nameRef.current?.value ?? "",
        email: emailRef.current?.value ?? "",
        phone: `${selectedPhoneCountry} ${phoneRef.current?.value ?? ""}`,
        company: companyNameRef.current?.value ?? "",
        package: selectedPackage,
        message: messageRef.current?.value ?? "",
        status: "unread",
        date: new Date().toISOString(),
        details: {
          companyType,
          taxNumber: taxNumberRef.current?.value ?? "",
          country: selectedCountry,
          address: addressRef.current?.value ?? "",
          contact: sameContact
            ? null
            : {
                name: contactNameRef.current?.value ?? "",
                email: contactEmailRef.current?.value ?? "",
                phone: contactPhoneRef.current?.value ?? "",
                address: contactAddressRef.current?.value ?? "",
              },
        },
      };

      const lead = {
        id: formSubmission.id,
        name: formSubmission.sender,
        email: formSubmission.email,
        phone: formSubmission.phone,
        company: formSubmission.company,
        package: formSubmission.package,
        createdAt: formSubmission.date,
        status: "new",
      };

      if (typeof window !== "undefined") {
        const existingFormsRaw = window.localStorage.getItem("v0_forms");
        const existingForms = existingFormsRaw ? JSON.parse(existingFormsRaw) : [];
        window.localStorage.setItem("v0_forms", JSON.stringify([formSubmission, ...existingForms]));

        const existingLeadsRaw = window.localStorage.getItem("v0_leads");
        const existingLeads = existingLeadsRaw ? JSON.parse(existingLeadsRaw) : [];
        window.localStorage.setItem("v0_leads", JSON.stringify([lead, ...existingLeads]));
      }

      await addDoc(collection(firestoreDb, "inquiries"), {
        createdAt: serverTimestamp(),
        language: isEnglish ? "en" : "hu",
        sourcePath: pathname ?? null,
        status: "new",
        type: isEnglish ? "Quote request" : "Ajánlatkérés",
        selectedPackage,
        companyType,
        companyName: companyNameRef.current?.value ?? "",
        taxNumber: taxNumberRef.current?.value ?? "",
        name: nameRef.current?.value ?? "",
        email: emailRef.current?.value ?? "",
        phone: `${selectedPhoneCountry} ${phoneRef.current?.value ?? ""}`.trim(),
        country: selectedCountry,
        address: addressRef.current?.value ?? "",
        message: messageRef.current?.value ?? "",
        contact: sameContact
          ? null
          : {
              name: contactNameRef.current?.value ?? "",
              email: contactEmailRef.current?.value ?? "",
              phone: contactPhoneRef.current?.value ?? "",
              address: contactAddressRef.current?.value ?? "",
            },
      });

      setIsSubmitted(true);
    } catch {
      setSubmitError(
        isEnglish
          ? "Something went wrong. Please try again."
          : "Hiba történt a küldés során. Kérjük próbálja újra.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const selectedCountryOption = countries.find((c) => c.value === selectedCountry) ?? countries[0];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <button
        type="button"
        aria-label={text.closeModalAria}
        onClick={closeModal}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
      />

      {/* Modal card */}
      <div className="relative z-[110] flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-[color:var(--card)] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b bg-[color:var(--secondary)]/5 p-6">
          <div>
            <h2 className="text-2xl font-bold text-[color:var(--secondary)]">{text.modalTitle}</h2>
            {!isSubmitted && (
              <p className="mt-1 text-sm text-[color:var(--muted-foreground)]">
                {text.modalSubtitle}
              </p>
            )}
          </div>
          <Button
            type="button"
            size="icon"
            variant="outline"
            aria-label={text.closeAria}
            className="rounded-full hover:bg-[color:var(--secondary)]/10"
            onClick={closeModal}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {isSubmitted ? (
            <div className="flex flex-col items-center justify-center space-y-6 py-12 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-[color:var(--secondary)]">{text.successTitle}</h3>
                <p className="mx-auto max-w-md text-sm text-[color:var(--muted-foreground)]">
                  {text.successText}
                </p>
              </div>
              <div className="max-w-md rounded-lg bg-blue-50 p-4 text-sm text-blue-800 dark:bg-blue-950 dark:text-blue-200">
                {text.successNote}
              </div>
              <Button
                type="button"
                className="rounded-full bg-[color:var(--primary)] px-8 text-white hover:bg-[color:var(--primary)]/90"
                onClick={closeModal}
              >
                {text.successClose}
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Honeypot */}
              <div className="hidden" aria-hidden="true">
                <label htmlFor="hp_field">{text.hpLabel}</label>
                <input id="hp_field" name="hp_field" type="text" ref={hpRef} autoComplete="off" tabIndex={-1} />
              </div>

              {/* 1. Szolgáltatás választó */}
              <div className="space-y-4 rounded-xl border border-[color:var(--secondary)]/10 bg-[color:var(--secondary)]/5 p-5">
                <div className="flex items-center gap-2 text-lg font-semibold text-[color:var(--secondary)]">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[color:var(--primary)] text-xs text-white">
                    1
                  </div>
                  <h3 className="text-lg font-semibold">{text.step1Title}</h3>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="package">{text.packageLabel}</Label>
                  <Select
                    id="package"
                    required
                    value={selectedPackage}
                    onChange={(e) => setSelectedPackage(e.target.value)}
                  >
                    <option value="" disabled>
                      {text.packagePlaceholder}
                    </option>
                    {packageOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              {/* 2. Cégadatok */}
              <div className="space-y-4 rounded-xl border border-[color:var(--border)] bg-[color:var(--card)] p-5">
                <div className="flex items-center gap-2 text-lg font-semibold text-[color:var(--secondary)]">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[color:var(--primary)] text-xs text-white">
                    2
                  </div>
                  <h3 className="text-lg font-semibold">Cégadatok</h3>
                </div>

                {/* Cégtípus */}
                <div className="mb-2 flex flex-col gap-3 sm:flex-row">
                  <label className="flex w-full cursor-pointer items-center space-x-2 rounded-lg border p-3 hover:bg-[color:var(--secondary)]/5">
                    <input
                      type="radio"
                      name="companyType"
                      value="existing"
                      checked={companyType === "existing"}
                      onChange={() => setCompanyType("existing")}
                      className="h-4 w-4"
                    />
                    <span className="text-sm font-medium">Már működő cég</span>
                  </label>
                  <label className="flex w-full cursor-pointer items-center space-x-2 rounded-lg border p-3 hover:bg-[color:var(--secondary)]/5">
                    <input
                      type="radio"
                      name="companyType"
                      value="new"
                      checked={companyType === "new"}
                      onChange={() => setCompanyType("new")}
                      className="h-4 w-4"
                    />
                    <span className="text-sm font-medium">Most alakuló cég</span>
                  </label>
                </div>

                <div className="space-y-3">
                  <div>
                    <Label htmlFor="companyName">Cég neve (vagy tervezett név)</Label>
                    <Input
                      id="companyName"
                      ref={companyNameRef}
                      required
                      placeholder="Pl. Minta Kft."
                      className="mt-1"
                    />
                  </div>

                  {companyType === "existing" && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                      <Label htmlFor="taxNumber">Adószám</Label>
                      <Input
                        id="taxNumber"
                        ref={taxNumberRef}
                        required={companyType === "existing"}
                        placeholder="12345678-1-42"
                        className="mt-1"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* 3. Szerződő személy adatai */}
              <div className="space-y-4 rounded-xl border border-[color:var(--border)] bg-[color:var(--card)] p-5">
                <div className="flex items-center gap-2 text-lg font-semibold text-[color:var(--secondary)]">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[color:var(--primary)] text-xs text-white">
                    3
                  </div>
                  <h3 className="text-lg font-semibold">Szerződő személy adatai</h3>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="fullName">Teljes név</Label>
                    <Input
                      id="fullName"
                      ref={nameRef}
                      required
                      placeholder="Kovács János"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">E-mail cím</Label>
                    <Input
                      id="email"
                      type="email"
                      ref={emailRef}
                      required
                      placeholder="janos@pelda.hu"
                      className="mt-1"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Telefonszám</Label>
                    <div className="mt-1 flex gap-2">
                      <Select
                        value={selectedPhoneCountry}
                        onChange={(e) => setSelectedPhoneCountry(e.target.value)}
                        className="w-[120px] flex-shrink-0"
                      >
                        {countries.map((c) => (
                          <option key={c.value} value={c.phone}>
                            {c.phone} {c.label}
                          </option>
                        ))}
                      </Select>
                      <Input
                        ref={phoneRef}
                        type="tel"
                        required
                        placeholder="30 123 4567"
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="country">Ország</Label>
                    <Select
                      id="country"
                      value={selectedCountry}
                      onChange={(e) => setSelectedCountry(e.target.value)}
                      className="mt-1"
                    >
                      {countries.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="address">Cím (Irányítószám, Város, Utca, Házszám)</Label>
                    <Input
                      id="address"
                      ref={addressRef}
                      required
                      placeholder="1064 Budapest, Izabella utca 68/B"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Üzenet */}
              <div className="space-y-4 rounded-xl border border-[color:var(--border)] bg-[color:var(--card)] p-5">
                <div className="flex items-center gap-2 text-lg font-semibold text-[color:var(--secondary)]">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[color:var(--primary)] text-xs text-white">
                    4
                  </div>
                  <h3 className="text-lg font-semibold">Üzenet vagy megjegyzés</h3>
                </div>
                <div>
                  <Label htmlFor="message">Üzenet (opcionális)</Label>
                  <Textarea
                    id="message"
                    ref={messageRef}
                    rows={5}
                    className="mt-1 resize-none"
                    placeholder="Kérdése, megjegyzése vagy egyedi igénye..."
                  />
                </div>
              </div>

              {/* Kapcsolattartó szekció */}
              <div className="space-y-4 rounded-xl border border-[color:var(--border)] bg-[color:var(--card)] p-5">
                <div className="flex items-center space-x-2">
                  <input
                    id="sameContact"
                    type="checkbox"
                    checked={sameContact}
                    onChange={(e) => setSameContact(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="sameContact" className="cursor-pointer text-sm font-medium">
                    A kapcsolattartó megegyezik a szerződővel
                  </Label>
                </div>

                {!sameContact && (
                  <div className="grid grid-cols-1 gap-4 pt-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="contactName">Kapcsolattartó neve</Label>
                      <Input
                        id="contactName"
                        ref={contactNameRef}
                        required
                        placeholder="Kapcsolattartó neve"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contactEmail">Kapcsolattartó e-mail címe</Label>
                      <Input
                        id="contactEmail"
                        type="email"
                        ref={contactEmailRef}
                        required
                        placeholder="kapcsolattarto@pelda.hu"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contactPhone">Kapcsolattartó telefonszáma</Label>
                      <Input
                        id="contactPhone"
                        ref={contactPhoneRef}
                        required
                        placeholder="30 123 4567"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contactAddress">Kapcsolattartó címe</Label>
                      <Input
                        id="contactAddress"
                        ref={contactAddressRef}
                        required
                        placeholder="Cím"
                        className="mt-1"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* GDPR / ÁSZF */}
              <div className="space-y-4 pt-2 text-sm">
                <div className="flex items-start space-x-2">
                  <input id="gdpr" type="checkbox" ref={gdprRef} required className="mt-1 h-4 w-4" />
                  <label htmlFor="gdpr" className="leading-snug">
                    Elfogadom az{" "}
                    <Link
                      href="/adatvedelem"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[color:var(--primary)] underline hover:text-[color:var(--primary)]/80"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Adatkezelési tájékoztatót
                    </Link>
                    .
                  </label>
                </div>
                <div className="flex items-start space-x-2">
                  <input id="aszf" type="checkbox" ref={aszfRef} required className="mt-1 h-4 w-4" />
                  <label htmlFor="aszf" className="leading-snug">
                    Elfogadom az{" "}
                    <Link
                      href="/aszf"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[color:var(--primary)] underline hover:text-[color:var(--primary)]/80"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Általános Szerződési Feltételeket
                    </Link>
                    .
                  </label>
                </div>
              </div>

              {/* Submit gomb */}
              <div className="flex justify-end pt-4">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex h-12 w-full items-center justify-center rounded-full bg-[color:var(--primary)] text-lg text-white hover:bg-[color:var(--primary)]/90"
                >
                  {isLoading ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Küldés folyamatban...
                    </span>
                  ) : (
                    <span>Árajánlat küldése</span>
                  )}
                </Button>
              </div>

              {submitError ? (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-200">
                  {submitError}
                </div>
              ) : null}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
