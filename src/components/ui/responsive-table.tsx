import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function ResponsiveTable({
  headers,
  children,
  className,
}: {
  headers: string[];
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("overflow-hidden rounded-[1.5rem] border border-border", className)}>
      <div className="hidden grid-cols-[1.3fr_repeat(2,0.9fr)_0.7fr] gap-4 border-b border-border bg-surface-muted px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-foreground/50 md:grid">
        {headers.map((header) => (
          <span key={header}>{header}</span>
        ))}
      </div>
      <div>{children}</div>
    </div>
  );
}
