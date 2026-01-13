"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Mail, MapPin, Phone, Building2, FileText, User, CheckCircle2 } from "lucide-react";
import { usePathname } from "next/navigation";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

import { Button } from "@/components/ui/button";
import { QuoteButton } from "@/components/QuoteButton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/select";
import { firestoreDb } from "@/lib/firebase";

const serviceMap: Record<string, string> = {
  virtualis: "office",
  szekhely: "seat",
  kezbesitesi: "delivery",
  ugyved: "legal",
  konyveles: "accounting",
};

export function ContactPageContent() {
  const [selectedService, setSelectedService] = useState(() => {
    if (typeof window === "undefined") {
      return "";
    }

    const hash = window.location.hash;
    if (!hash) {
      return "";
    }

    const key = hash.replace("#", "");
    return serviceMap[key] ?? "";
  });
  const pathname = usePathname();
  const isEnglish = pathname?.startsWith("/en");

  const text = {
    heroTitle: isEnglish ? "Get in touch with us!" : "Lépjen kapcsolatba velünk!",
    heroSubtitle: isEnglish
      ? "Questions about our registered office services? Contact us with confidence — we’ll help you choose the right solution."
      : "Kérdése van székhelyszolgáltatásunkkal kapcsolatban? Keressen minket bizalommal, örömmel segítünk a megfelelő megoldás kiválasztásában.",
    email: isEnglish ? "Email" : "Email cím",
    address: isEnglish ? "Address" : "Cím",
    phone: isEnglish ? "Phone" : "Telefonszám",
    formTitle: isEnglish ? "Send a message" : "Küldjön üzenetet",
    formSubtitle: isEnglish
      ? "Fill out the form below and our team will get back to you shortly."
      : "Töltse ki az alábbi űrlapot, és kollégáink rövid időn belül felveszik Önnel a kapcsolatot.",
    serviceQuestion: isEnglish
      ? "Which service are you interested in?"
      : "Melyik szolgáltatás érdekli?",
    servicePlaceholder: isEnglish ? "Select a service..." : "Válasszon szolgáltatást...",
    serviceSeat: isEnglish ? "Registered office service" : "Székhelyszolgáltatás",
    serviceDelivery: isEnglish
      ? "Service address / delivery agent"
      : "Kézbesítési Megbízott",
    serviceOffice: isEnglish
      ? "Long-term office rental (contract)"
      : "Hosszú Távú Szerződéses Irodabérlés",
    serviceLegal: isEnglish
      ? "Company formation & legal services"
      : "Cégalapítás & Jogi Szolgáltatás",
    serviceAccounting: isEnglish ? "Accounting services" : "Könyvelési Szolgáltatás",
    lastName: isEnglish ? "Last name *" : "Vezetéknév *",
    firstName: isEnglish ? "First name *" : "Keresztnév *",
    lastNamePh: isEnglish ? "Smith" : "Kovács",
    firstNamePh: isEnglish ? "John" : "János",
    emailField: isEnglish ? "Email *" : "Email cím *",
    emailPh: isEnglish ? "name@email.com" : "minta@email.hu",
    phoneField: isEnglish ? "Phone" : "Telefonszám",
    message: isEnglish ? "Message *" : "Üzenet *",
    messagePh: isEnglish ? "Describe your question or request..." : "Írja le kérdését vagy üzenetét...",
    submit: isEnglish ? "Send message" : "Üzenet küldése",
    companyName: isEnglish ? "Company name" : "Cégnév",
    companyReg: isEnglish ? "Company registration no." : "Cégjegyzékszám",
    taxNo: isEnglish ? "Tax number" : "Adószám",
    representedBy: isEnglish ? "Represented by" : "Képviseli",
    finalTitle: isEnglish ? "Ready to start your business?" : "Készen áll vállalkozása indítására?",
    finalText: isEnglish
      ? "Book a time now and start your business with a professional registered office solution."
      : "Foglaljon időpontot most, és indítsa el vállalkozását profi székhelyszolgáltatással!",
    finalButton: isEnglish ? "Request a quote" : "Ajánlatot kérek",
  };
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [submitErrorMessage, setSubmitErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const key = hash.replace("#", "");
      const mapped = serviceMap[key];
      if (mapped) {
        setTimeout(() => {
          const form = document.getElementById("contact-form");
          if (form) {
            form.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }, 100);
      }
    }
  }, []);

  const handleChange = (
    field: keyof typeof formData,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    setIsSubmitting(true);
    setSubmitStatus("idle");
    setSubmitErrorMessage(null);

    try {
      await addDoc(collection(firestoreDb, "inquiries"), {
        createdAt: serverTimestamp(),
        site: "emarketplace",
        language: isEnglish ? "en" : "hu",
        sourcePath: pathname ?? null,
        status: "new",
        type: isEnglish ? "Contact" : "Kapcsolat",
        selectedPackage: "",
        companyType: "contact",
        companyName: "",
        taxNumber: "",
        name: `${formData.lastName} ${formData.firstName}`.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        country: "",
        address: "",
        message: formData.message.trim(),
        contact: null,
        service: selectedService,
      });

      setSubmitStatus("success");
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        message: "",
      });
      setSelectedService("");
    } catch (error: unknown) {
      setSubmitErrorMessage(error instanceof Error ? error.message : null);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-[color:var(--secondary)] pt-16 pb-12 md:pt-20 md:pb-16 lg:pt-24 lg:pb-20">
        <div className="pointer-events-none absolute inset-0 opacity-10">
          <div className="absolute left-10 top-10 h-32 w-32 rounded-full bg-[color:var(--primary)] blur-3xl" />
          <div className="absolute bottom-10 right-10 h-40 w-40 rounded-full bg-[color:var(--primary)] blur-3xl" />
        </div>
        <div className="relative z-10 mx-auto flex min-h-[220px] max-w-3xl flex-col items-center justify-center px-4 text-center sm:min-h-[260px] sm:px-6 lg:min-h-[300px] lg:px-8">
          <h1 className="mb-4 text-3xl font-bold text-[color:var(--primary)] md:mb-6 md:text-4xl lg:text-5xl xl:text-6xl">
            {text.heroTitle}
          </h1>
          <p className="text-base text-secondary-foreground opacity-80 md:text-lg lg:text-xl">
            {text.heroSubtitle}
          </p>
        </div>
      </section>

      {/* INFO KÁRTYÁK */}
      <section className="bg-[color:var(--muted)] py-12 md:py-16">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 px-4 sm:px-6 md:grid-cols-3 md:gap-6 lg:px-8">
          {/* Email */}
          <div className="flex flex-col items-center rounded-2xl bg-[color:var(--primary)] p-6 text-center shadow-lg transition-shadow hover:shadow-xl md:p-8">
            <div className="mb-3 md:mb-4">
              <Mail className="h-7 w-7 text-[color:var(--primary-foreground)] md:h-8 md:w-8" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-[color:var(--primary-foreground)] md:mb-3 md:text-xl">
              {text.email}
            </h3>
            <a
              href="mailto:emarketplacekft@gmail.com"
              className="break-all text-sm text-[color:var(--primary-foreground)]/80 transition-colors hover:text-[color:var(--primary-foreground)]"
            >
              emarketplacekft@gmail.com
            </a>
          </div>

          {/* Cím */}
          <div className="flex flex-col items-center rounded-2xl bg-[color:var(--primary)] p-6 text-center shadow-lg transition-shadow hover:shadow-xl md:p-8">
            <div className="mb-3 md:mb-4">
              <MapPin className="h-7 w-7 text-[color:var(--primary-foreground)] md:h-8 md:w-8" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-[color:var(--primary-foreground)] md:mb-3 md:text-xl">
              {text.address}
            </h3>
            <a
              href="https://www.google.com/maps/dir/?api=1&destination=Eco-Office+Budapest+Izabella+utca+68/B+1064"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-sm text-[color:var(--primary-foreground)]/80 transition-colors hover:text-[color:var(--primary-foreground)]"
            >
              1064 Budapest
              <br />
              Izabella utca 68/B
            </a>
          </div>

          {/* Telefon */}
          <div className="flex flex-col items-center rounded-2xl bg-[color:var(--primary)] p-6 text-center shadow-lg transition-shadow hover:shadow-xl md:p-8">
            <div className="mb-3 md:mb-4">
              <Phone className="h-7 w-7 text-[color:var(--primary-foreground)] md:h-8 md:w-8" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-[color:var(--primary-foreground)] md:mb-3 md:text-xl">
              {text.phone}
            </h3>
            <a
              href="tel:+36501046116"
              className="text-sm text-[color:var(--primary-foreground)]/80 transition-colors hover:text-[color:var(--primary-foreground)]"
            >
              +36 50 104 61 16
            </a>
          </div>
        </div>
      </section>

      {/* FORM + CÉGINFO / MAP */}
      <section id="contact-form" className="bg-[color:var(--background)] py-12 md:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center md:mb-12">
            <h2 className="mb-3 text-2xl font-bold text-foreground md:mb-4 md:text-3xl lg:text-4xl">
              {text.formTitle}
            </h2>
            <p className="mx-auto max-w-2xl text-base text-muted-foreground md:text-lg">
              {text.formSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
            {/* Bal: űrlap */}
            {submitStatus === "success" ? (
              <div className="flex flex-col items-center justify-center space-y-6 rounded-2xl border border-[color:var(--border)] bg-card p-6 text-center text-card-foreground shadow-lg">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle2 className="h-10 w-10 text-green-600" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-foreground">
                    {isEnglish ? "Thank you!" : "Köszönjük!"}
                  </h3>
                  <p className="mx-auto max-w-md text-sm text-[color:var(--muted-foreground)]">
                    {isEnglish
                      ? "We received your message. Our team will get back to you shortly."
                      : "Megkaptuk az üzenetet. Kollégáink hamarosan felveszik Önnel a kapcsolatot."}
                  </p>
                </div>
                <div className="max-w-md rounded-lg bg-blue-50 p-4 text-sm text-blue-800 dark:bg-blue-950 dark:text-blue-200">
                  {isEnglish
                    ? "If you don’t see our response, please check your spam folder as well."
                    : "Ha nem érkezik válasz, kérjük ellenőrizze a spam mappát is."}
                </div>
                <Button
                  type="button"
                  className="w-full rounded-full bg-[color:var(--primary)] px-8 py-6 text-lg font-semibold text-[color:var(--primary-foreground)] hover:bg-[color:var(--primary)]/90"
                  onClick={() => {
                    setSubmitStatus("idle");
                    setSubmitErrorMessage(null);
                  }}
                >
                  {isEnglish ? "Send another message" : "Új üzenet küldése"}
                </Button>
              </div>
            ) : (
              <form className="space-y-6" onSubmit={handleSubmit}>
                {submitStatus === "error" ? (
                  <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--muted)]/40 p-4 text-sm text-foreground">
                    {isEnglish
                      ? "Something went wrong. Please try again."
                      : "Hiba történt a küldés során. Kérjük próbálja újra."}
                    {submitErrorMessage ? (
                      <div className="mt-2 text-xs text-muted-foreground">{submitErrorMessage}</div>
                    ) : null}
                  </div>
                ) : null}

                <div>
                  <Label htmlFor="service">{text.serviceQuestion}</Label>
                  <NativeSelect
                    id="service"
                    value={selectedService}
                    onChange={(e) => setSelectedService(e.target.value)}
                    className="mt-1"
                  >
                    <option value="" disabled>
                      {text.servicePlaceholder}
                    </option>
                    <option value="seat">{text.serviceSeat}</option>
                    <option value="delivery">{text.serviceDelivery}</option>
                    <option value="office">{text.serviceOffice}</option>
                    <option value="legal">{text.serviceLegal}</option>
                    <option value="accounting">{text.serviceAccounting}</option>
                  </NativeSelect>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="firstName">{text.lastName}</Label>
                    <Input
                      id="firstName"
                      required
                      value={formData.firstName}
                      onChange={(e) => handleChange("firstName", e.target.value)}
                      placeholder={text.lastNamePh}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">{text.firstName}</Label>
                    <Input
                      id="lastName"
                      required
                      value={formData.lastName}
                      onChange={(e) => handleChange("lastName", e.target.value)}
                      placeholder={text.firstNamePh}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="email">{text.emailField}</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      placeholder={text.emailPh}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">{text.phoneField}</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      placeholder="+36 30 123 4567"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="message">{text.message}</Label>
                  <Textarea
                    id="message"
                    required
                    value={formData.message}
                    onChange={(e) => handleChange("message", e.target.value)}
                    placeholder={text.messagePh}
                    className="mt-1 min-h-[150px]"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-full bg-[color:var(--primary)] py-6 text-lg font-semibold text-[color:var(--primary-foreground)] hover:bg-[color:var(--primary)]/90"
                >
                  {isSubmitting ? (isEnglish ? "Sending..." : "Küldés...") : text.submit}
                </Button>
              </form>
            )}

            {/* Jobb: céginfo + térkép */}
            <div className="space-y-8">
              <div className="space-y-3 rounded-xl bg-card p-4 text-sm text-card-foreground ring-1 ring-[color:var(--border)]/60 md:space-y-4 md:p-6">
                <div className="flex items-start space-x-3">
                  <Building2 className="mt-1 h-5 w-5 flex-shrink-0 text-[color:var(--primary)]" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">Cégnév</p>
                    <p className="text-sm font-semibold text-foreground">{text.companyName}</p>
                    <p className="text-sm text-muted-foreground">
                      E-Marketplace Szolgáltató Korlátolt Felelősségű Társaság
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <FileText className="mt-1 h-5 w-5 flex-shrink-0 text-[color:var(--primary)]" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">{text.companyReg}</p>
                    <p className="text-sm text-muted-foreground">01-09-296567</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <FileText className="mt-1 h-5 w-5 flex-shrink-0 text-[color:var(--primary)]" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">{text.taxNo}</p>
                    <p className="text-sm text-muted-foreground">25924916-2-42</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <User className="mt-1 h-5 w-5 flex-shrink-0 text-[color:var(--primary)]" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">{text.representedBy}</p>
                    <p className="text-sm text-muted-foreground">Kádár Zoltán</p>
                  </div>
                </div>
              </div>

              <div className="h-[250px] overflow-hidden rounded-xl shadow-lg md:h-[300px]">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2695.115849989964!2d19.063944276825692!3d47.5056781712058!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4741dc7dffd03cb9%3A0x859065fe4bdb940d!2sEco-Office%20Iroda!5e0!3m2!1shu!2shu!4v1702320000000!5m2!1shu!2shu"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  title="E-Marketplace Kft. Location"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ZÁRÓ CTA */}
      <section className="bg-[color:var(--secondary)] py-12 md:py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-4 text-2xl font-bold text-[color:var(--primary)] md:mb-6 md:text-3xl lg:text-4xl">
            {text.finalTitle}
          </h2>
          <p className="mb-6 text-base text-secondary-foreground opacity-80 md:mb-8 md:text-lg">
            {text.finalText}
          </p>
          <QuoteButton className="w-full rounded-full bg-[color:var(--card)] px-6 py-5 text-base font-semibold text-[color:var(--card-foreground)] hover:bg-[color:var(--card)]/90 sm:w-auto md:px-8 md:py-6 md:text-lg">
            {text.finalButton}
          </QuoteButton>
        </div>
      </section>
    </>
  );
}
