import { cn } from "@/lib/utils";

const steps = ["Information", "Shipping", "Payment"];

interface CheckoutStepperProps {
  currentStep: number;
}

export function CheckoutStepper({ currentStep }: CheckoutStepperProps) {
  return (
    <nav aria-label="Checkout progress" className="mb-10">
      <ol className="flex items-center justify-center gap-2 md:gap-4">
        {steps.map((label, i) => {
          const stepNum = i + 1;
          const isActive = stepNum === currentStep;
          const isComplete = stepNum < currentStep;

          return (
            <li key={label} className="flex items-center gap-2 md:gap-4">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "inline-flex h-8 w-8 items-center justify-center rounded-full font-sans text-xs font-bold",
                    isComplete && "bg-secondary text-white",
                    isActive && "bg-primary text-white",
                    !isActive && !isComplete && "bg-surface-alt text-ink-soft border border-border"
                  )}
                >
                  {isComplete ? "✓" : stepNum}
                </span>
                <span
                  className={cn(
                    "hidden sm:inline font-sans text-sm",
                    isActive ? "font-semibold text-ink" : "text-ink-soft"
                  )}
                >
                  {label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className="h-px w-6 md:w-12 bg-border" aria-hidden="true" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
