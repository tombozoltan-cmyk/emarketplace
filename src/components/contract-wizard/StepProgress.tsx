"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WizardStep, ContractLanguage } from "@/lib/contract-types";
import { WIZARD_STEPS, WIZARD_STEP_LABELS } from "@/lib/contract-types";

type StepProgressProps = {
  currentStep: WizardStep;
  isStepComplete: (step: WizardStep) => boolean;
  onStepClick?: (step: WizardStep) => void;
  language: ContractLanguage;
};

export function StepProgress({
  currentStep,
  isStepComplete,
  onStepClick,
  language,
}: StepProgressProps) {
  const currentIndex = WIZARD_STEPS.indexOf(currentStep);

  return (
    <div className="w-full">
      {/* Desktop nézet */}
      <div className="hidden md:block">
        <div className="flex items-center justify-between">
          {WIZARD_STEPS.map((step, index) => {
            const isActive = step === currentStep;
            const isCompleted = isStepComplete(step) && index < currentIndex;
            const isPast = index < currentIndex;
            const label = WIZARD_STEP_LABELS[step][language];

            return (
              <div
                key={step}
                className="flex flex-1 items-center"
              >
                {/* Lépés gomb */}
                <button
                  type="button"
                  onClick={() => onStepClick?.(step)}
                  disabled={index > currentIndex && !isCompleted}
                  className={cn(
                    "group flex flex-col items-center gap-2 transition-colors",
                    (isPast || isCompleted) && onStepClick
                      ? "cursor-pointer"
                      : "cursor-default"
                  )}
                >
                  {/* Kör */}
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all",
                      isActive &&
                        "border-[color:var(--primary)] bg-[color:var(--primary)] text-[color:var(--primary-foreground)]",
                      isCompleted &&
                        "border-green-500 bg-green-500 text-white",
                      isPast &&
                        !isCompleted &&
                        "border-[color:var(--primary)]/50 bg-[color:var(--primary)]/10 text-[color:var(--primary)]",
                      !isActive &&
                        !isCompleted &&
                        !isPast &&
                        "border-[color:var(--border)] bg-[color:var(--muted)] text-[color:var(--muted-foreground)]"
                    )}
                  >
                    {isCompleted ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>

                  {/* Címke */}
                  <span
                    className={cn(
                      "text-xs font-medium transition-colors",
                      isActive && "text-[color:var(--primary)]",
                      isCompleted && "text-green-600",
                      !isActive &&
                        !isCompleted &&
                        "text-[color:var(--muted-foreground)]"
                    )}
                  >
                    {label}
                  </span>
                </button>

                {/* Összekötő vonal */}
                {index < WIZARD_STEPS.length - 1 && (
                  <div
                    className={cn(
                      "mx-2 h-0.5 flex-1",
                      index < currentIndex
                        ? "bg-[color:var(--primary)]"
                        : "bg-[color:var(--border)]"
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobil nézet */}
      <div className="md:hidden">
        <div className="flex items-center justify-between gap-1">
          {WIZARD_STEPS.map((step, index) => {
            const isActive = step === currentStep;
            const isCompleted = isStepComplete(step) && index < currentIndex;
            const isPast = index < currentIndex;

            return (
              <div
                key={step}
                className="flex flex-1 items-center"
              >
                <button
                  type="button"
                  onClick={() => onStepClick?.(step)}
                  disabled={index > currentIndex && !isCompleted}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold transition-all",
                    isActive &&
                      "border-[color:var(--primary)] bg-[color:var(--primary)] text-[color:var(--primary-foreground)]",
                    isCompleted && "border-green-500 bg-green-500 text-white",
                    isPast &&
                      !isCompleted &&
                      "border-[color:var(--primary)]/50 bg-[color:var(--primary)]/10 text-[color:var(--primary)]",
                    !isActive &&
                      !isCompleted &&
                      !isPast &&
                      "border-[color:var(--border)] bg-[color:var(--muted)] text-[color:var(--muted-foreground)]"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </button>

                {index < WIZARD_STEPS.length - 1 && (
                  <div
                    className={cn(
                      "mx-1 h-0.5 flex-1",
                      index < currentIndex
                        ? "bg-[color:var(--primary)]"
                        : "bg-[color:var(--border)]"
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Aktuális lépés címe mobil alatt */}
        <div className="mt-3 text-center">
          <span className="text-sm font-medium text-[color:var(--primary)]">
            {currentIndex + 1}. {WIZARD_STEP_LABELS[currentStep][language]}
          </span>
        </div>
      </div>
    </div>
  );
}
