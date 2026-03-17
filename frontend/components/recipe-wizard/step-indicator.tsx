import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  label: string;
}

interface Props {
  steps: Step[];
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: Props) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {steps.map((step, index) => {
        const isDone = index < currentStep;
        const isCurrent = index === currentStep;

        return (
          <div key={step.label} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-all",
                  isDone && "bg-primary border-primary text-primary-foreground",
                  isCurrent && "border-primary text-primary",
                  !isDone &&
                    !isCurrent &&
                    "border-muted-foreground/30 text-muted-foreground",
                )}
              >
                {isDone ? <Check size={14} /> : index + 1}
              </div>
              <span
                className={cn(
                  "text-xs whitespace-nowrap",
                  isCurrent
                    ? "text-primary font-medium"
                    : "text-muted-foreground",
                )}
              >
                {step.label}
              </span>
            </div>

            {index < steps.length - 1 && (
              <div
                className={cn(
                  "h-0.5 w-8 sm:w-16 mb-4 mx-1 transition-all",
                  index < currentStep ? "bg-primary" : "bg-muted-foreground/30",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
