import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type Tone = "default" | "success" | "warning" | "danger";

const toneClasses: Record<Tone, string> = {
  default: "border border-border bg-surface-muted text-foreground",
  success: "bg-[rgba(31,111,95,0.14)] text-success",
  warning: "bg-[rgba(154,103,0,0.12)] text-warning",
  danger: "bg-[rgba(166,56,85,0.12)] text-danger",
};

export function Badge({
  children,
  tone = "default",
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]",
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
