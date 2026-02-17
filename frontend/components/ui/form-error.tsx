import { TriangleAlert } from "lucide-react";
import * as React from "react";

export function FormError({ children }: { children?: React.ReactNode }) {
  if (!children) return null;

  return (
    <div
      className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
      role="alert"
      aria-live="polite"
    >
      <TriangleAlert className="h-4 w-4 shrink-0" />
      <p className="leading-none">{children}</p>
    </div>
  );
}

export default FormError;
