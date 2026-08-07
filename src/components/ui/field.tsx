import type { ReactNode } from "react";

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <span className="block text-sm font-semibold text-foreground">{label}</span>
      {children}
      {hint ? <span className="block text-xs text-foreground/55">{hint}</span> : null}
    </label>
  );
}
