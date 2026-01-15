"use client";

import { Building2, PlusCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ContractLanguage } from "@/lib/contract-types";

type Step1CompanyTypeProps = {
  isNew: boolean;
  onSelect: (isNew: boolean) => void;
  language: ContractLanguage;
};

export function Step1CompanyType({
  isNew,
  onSelect,
  language,
}: Step1CompanyTypeProps) {
  const t = language === "hu";

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="mb-2 text-2xl font-bold text-[color:var(--foreground)]">
          {t ? "Milyen céggel szeretne szerződni?" : "What type of company?"}
        </h2>
        <p className="text-[color:var(--muted-foreground)]">
          {t
            ? "Válassza ki, hogy új céget alapít vagy már meglévő cégének keres székhelyet."
            : "Choose whether you are founding a new company or looking for a registered office for an existing one."}
        </p>
      </div>

      <div className="mx-auto grid max-w-2xl grid-cols-1 gap-4 md:grid-cols-2">
        {/* Új cég */}
        <button
          type="button"
          onClick={() => onSelect(true)}
          className="text-left"
        >
          <Card
            className={cn(
              "h-full cursor-pointer border-2 transition-all hover:shadow-lg",
              isNew
                ? "border-[color:var(--primary)] bg-[color:var(--primary)]/5"
                : "border-[color:var(--border)] hover:border-[color:var(--primary)]/50"
            )}
          >
            <CardContent className="flex flex-col items-center px-6 pt-8 pb-6 text-center">
              <div
                className={cn(
                  "mb-4 flex h-16 w-16 items-center justify-center rounded-full",
                  isNew
                    ? "bg-[color:var(--primary)] text-[color:var(--primary-foreground)]"
                    : "bg-[color:var(--muted)] text-[color:var(--muted-foreground)]"
                )}
              >
                <PlusCircle className="h-8 w-8" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-[color:var(--foreground)]">
                {t ? "Új cég alapítása" : "Founding a new company"}
              </h3>
              <p className="text-sm text-[color:var(--muted-foreground)]">
                {t
                  ? "Most alapítom a cégemet, még nincs cégjegyzékszámom és adószámom."
                  : "I am founding my company now, I don't have a registration number or tax ID yet."}
              </p>
              {isNew && (
                <div className="mt-4 rounded-full bg-[color:var(--primary)] px-3 py-1 text-xs font-medium text-[color:var(--primary-foreground)]">
                  {t ? "Kiválasztva" : "Selected"}
                </div>
              )}
            </CardContent>
          </Card>
        </button>

        {/* Meglévő cég */}
        <button
          type="button"
          onClick={() => onSelect(false)}
          className="text-left"
        >
          <Card
            className={cn(
              "h-full cursor-pointer border-2 transition-all hover:shadow-lg",
              !isNew
                ? "border-[color:var(--primary)] bg-[color:var(--primary)]/5"
                : "border-[color:var(--border)] hover:border-[color:var(--primary)]/50"
            )}
          >
            <CardContent className="flex flex-col items-center px-6 pt-8 pb-6 text-center">
              <div
                className={cn(
                  "mb-4 flex h-16 w-16 items-center justify-center rounded-full",
                  !isNew
                    ? "bg-[color:var(--primary)] text-[color:var(--primary-foreground)]"
                    : "bg-[color:var(--muted)] text-[color:var(--muted-foreground)]"
                )}
              >
                <Building2 className="h-8 w-8" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-[color:var(--foreground)]">
                {t ? "Meglévő cég" : "Existing company"}
              </h3>
              <p className="text-sm text-[color:var(--muted-foreground)]">
                {t
                  ? "Már működő cégem van, rendelkezem cégjegyzékszámmal és adószámmal."
                  : "I have an existing company with a registration number and tax ID."}
              </p>
              {!isNew && (
                <div className="mt-4 rounded-full bg-[color:var(--primary)] px-3 py-1 text-xs font-medium text-[color:var(--primary-foreground)]">
                  {t ? "Kiválasztva" : "Selected"}
                </div>
              )}
            </CardContent>
          </Card>
        </button>
      </div>

      {/* Információs doboz */}
      <div className="mx-auto max-w-2xl rounded-lg border border-[color:var(--border)] bg-[color:var(--muted)]/50 p-4">
        <p className="text-sm text-[color:var(--muted-foreground)]">
          <span className="font-semibold text-[color:var(--foreground)]">
            {t ? "Megjegyzés: " : "Note: "}
          </span>
          {t
            ? "Új cég esetén a cégjegyzékszám és adószám megadása nem kötelező, ezeket a cégbejegyzés után pótolhatja."
            : "For new companies, the registration number and tax ID are not required and can be added after company registration."}
        </p>
      </div>
    </div>
  );
}
