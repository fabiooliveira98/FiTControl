import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type Tone = "info" | "warning" | "danger";

const toneClasses: Record<Tone, string> = {
  info: "border-primary/12 bg-surface-muted text-foreground",
  warning: "border-warning/18 bg-[rgba(154,103,0,0.08)] text-warning",
  danger: "border-danger/16 bg-[rgba(166,56,85,0.08)] text-danger",
};

export function Alert({
  title,
  children,
  tone = "info",
  className,
}: {
  title: string;
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[1.5rem] border px-4 py-4 sm:px-5",
        toneClasses[tone],
        className,
      )}
    >
      <p className="text-sm font-semibold">{title}</p>
      <div className="mt-2 text-sm leading-6">{children}</div>
    </div>
  );
}
