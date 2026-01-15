"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Phone, Mail, Facebook, Linkedin } from "lucide-react";
import { usePathname } from "next/navigation";

export function Footer() {
  const pathname = usePathname();
  const isEnglish = pathname?.startsWith("/en");

  const slogan = isEnglish
    ? "Registered office service+ Budapest"
    : "Székhelyszolgáltatás+ Budapest";

  const introText = isEnglish
    ? "Premium registered office service in Budapest – reliable mail handling, service address and modern office solutions for Hungarian and foreign businesses."
    : "Prémium székhelyszolgáltatás Budapesten – megbízható postakezeléssel, kézbesítési megbízottal és modern irodamegoldásokkal hazai és külföldi vállalkozásoknak.";

  const contactHeading = isEnglish ? "Contact" : "Kapcsolat";
  const servicesHeading = isEnglish ? "Services" : "Szolgáltatások";
  const infoHeading = isEnglish ? "Information" : "Információk";
  const followHeading = isEnglish ? "Follow us" : "Kövess minket";

  const serviceRegisteredOffice = isEnglish
    ? "Registered office service+"
    : "Székhelyszolgáltatás+";
  const serviceOfficeRental = isEnglish
    ? "Long‑term office rental"
    : "Hosszú Távú Irodabérlés";
  const pricesLabel = isEnglish ? "Prices" : "Árak";
  const contactLabel = isEnglish ? "Contact" : "Kapcsolat";

  const blogLabel = "Blog"; // brand name, maradhat mindkét nyelven
  const faqLabel = isEnglish ? "FAQ" : "GYIK";
  const termsLabel = isEnglish ? "Terms & Conditions" : "ÁSZF";
  const privacyLabel = isEnglish ? "Privacy policy" : "Adatvédelem";

  const cookieSettingsLabel = isEnglish ? "Cookie settings" : "Cookie beállítások";

  const copyright = isEnglish
    ? "© 2025 E-Marketplace Kft. All rights reserved."
    : "© 2025 E-Marketplace Kft. Minden jog fenntartva.";

  const blogHref = isEnglish ? "/en/blog" : "/blog";
  const faqHref = isEnglish ? "/en#gyik" : "/#gyik";

  const handleOpenCookies = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("open-cookie-settings"));
    }
  };

  return (
    <footer className="w-full bg-secondary py-6 text-slate-50 md:py-10 lg:py-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 sm:px-6 lg:px-8">
        {/* Logo + leírás */}
        <div className="border-b border-[color:var(--primary)]/20 pb-6 md:pb-8 md:mb-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-3">
                <div className="relative h-10 w-auto md:h-12 lg:h-14">
                  <Image
                    src="https://firebasestorage.googleapis.com/v0/b/emarketplace-8aab1.firebasestorage.app/o/image%2FPlexi-tabla-86x53-E-marketplace_logo-2.png?alt=media&token=b1684b4b-932d-4f6d-ba90-d860aa24a98e"
                    alt="E-Marketplace Kft. logó"
                    width={86}
                    height={53}
                    className="h-full w-auto object-contain object-left drop-shadow-sm"
                  />
                </div>
                <div className="h-8 w-px bg-[color:var(--primary)]/30 md:h-10" />
              </div>
              <p className="text-[11px] font-semibold leading-tight text-[color:var(--primary)] sm:text-xs md:text-sm">
                {slogan}
              </p>
            </div>

            <p className="max-w-md text-xs text-slate-200/80 md:text-sm">
              {introText}
            </p>
          </div>
        </div>

        {/* 4 oszlopos grid */}
        <div className="grid grid-cols-1 gap-6 text-xs sm:grid-cols-2 md:text-sm lg:grid-cols-4 md:gap-8">
          {/* Kapcsolat */}
          <div>
            <h3 className="mb-3 text-base font-semibold text-[color:var(--primary)] md:mb-4 md:text-lg">
              {contactHeading}
            </h3>
            <ul className="space-y-2 md:space-y-3 text-slate-200/80">
              <li>
                <Link
                  href="https://maps.google.com/?q=1064+Budapest,+Izabella+utca+68/B"
                  target="_blank"
                  className="flex items-center gap-2 hover:text-[color:var(--primary)]"
                >
                  <MapPin className="h-4 w-4 text-[color:var(--primary)] md:h-5 md:w-5" />
                  <span>1064 Budapest, Izabella utca 68/B</span>
                </Link>
              </li>
              <li>
                <Link
                  href="tel:+36501046116"
                  className="flex items-center gap-2 hover:text-[color:var(--primary)]"
                >
                  <Phone className="h-4 w-4 text-[color:var(--primary)] md:h-5 md:w-5" />
                  <span>06 50 104 61 16</span>
                </Link>
              </li>
              <li>
                <Link
                  href="mailto:emarketplacekft@gmail.com"
                  className="flex items-center gap-2 break-all hover:text-[color:var(--primary)]"
                >
                  <Mail className="h-4 w-4 text-[color:var(--primary)] md:h-5 md:w-5" />
                  <span>emarketplacekft@gmail.com</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Szolgáltatások */}
          <div>
            <h3 className="mb-3 text-base font-semibold text-[color:var(--primary)] md:mb-4 md:text-lg">
              {servicesHeading}
            </h3>
            <ul className="space-y-1.5 md:space-y-2 text-slate-200/80">
              <li>
                <Link
                  href="/szekhelyszolgaltatas#szekhely"
                  className="block hover:text-[color:var(--primary)]"
                >
                  {serviceRegisteredOffice}
                </Link>
              </li>
              <li>
                <Link
                  href="/szekhelyszolgaltatas#virtualis"
                  className="block hover:text-[color:var(--primary)]"
                >
                  {serviceOfficeRental}
                </Link>
              </li>
              <li>
                <Link href="/arak" className="block hover:text-[color:var(--primary)]">
                  {pricesLabel}
                </Link>
              </li>
              <li>
                <Link
                  href="/kapcsolat"
                  className="block hover:text-[color:var(--primary)]"
                >
                  {contactLabel}
                </Link>
              </li>
            </ul>
          </div>

          {/* Információk */}
          <div>
            <h3 className="mb-3 text-base font-semibold text-[color:var(--primary)] md:mb-4 md:text-lg">
              {infoHeading}
            </h3>
            <ul className="space-y-1.5 md:space-y-2 text-slate-200/80">
              <li>
                <Link href={blogHref} className="block hover:text-[color:var(--primary)]">
                  {blogLabel}
                </Link>
              </li>
              <li>
                <Link href={faqHref} className="block hover:text-[color:var(--primary)]">
                  {faqLabel}
                </Link>
              </li>
              <li>
                <Link href="/aszf" className="block hover:text-[color:var(--primary)]">
                  {termsLabel}
                </Link>
              </li>
              <li>
                <Link
                  href="/adatvedelem"
                  className="block hover:text-[color:var(--primary)]"
                >
                  {privacyLabel}
                </Link>
              </li>
            </ul>
          </div>

          {/* Közösségi média */}
          <div>
            <h3 className="mb-3 text-base font-semibold text-[color:var(--primary)] md:mb-4 md:text-lg">
              {followHeading}
            </h3>
            <div className="flex items-center gap-3 md:gap-4">
              <Link
                href="https://facebook.com"
                target="_blank"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[color:var(--primary)]/10 text-foreground transition hover:bg-[color:var(--primary)] hover:text-[color:var(--primary-foreground)] md:h-10 md:w-10"
              >
                <Facebook className="h-4 w-4 md:h-5 md:w-5" />
              </Link>
              <Link
                href="https://linkedin.com"
                target="_blank"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[color:var(--primary)]/10 text-foreground transition hover:bg-[color:var(--primary)] hover:text-[color:var(--primary-foreground)] md:h-10 md:w-10"
              >
                <Linkedin className="h-4 w-4 md:h-5 md:w-5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Alsó sáv */}
        <div className="mt-6 border-t border-[color:var(--primary)]/20 pt-4 text-xs text-slate-200/80 md:mt-10 md:flex md:items-center md:justify-between md:pt-6 lg:mt-12 lg:pt-8 md:text-sm">
          <p>{copyright}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2 md:mt-0 md:gap-4 lg:gap-6">
            <button
              type="button"
              onClick={handleOpenCookies}
              className="hover:text-[color:var(--primary)]"
            >
              {cookieSettingsLabel}
            </button>
            <Link
              href="/adatvedelem"
              className="hover:text-[color:var(--primary)]"
            >
              {privacyLabel}
            </Link>
            <Link href="/aszf" className="hover:text-[color:var(--primary)]">
              {termsLabel}
            </Link>
            <Link
              href="/admin/login"
              className="opacity-0 transition hover:opacity-100"
            >
              🔒
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
