import type { ReactNode, SelectHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Select({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { children: ReactNode }) {
  return (
    <select
      className={cn(
        "h-11 w-full rounded-2xl border border-border-strong bg-white px-4 text-sm text-foreground outline-none transition focus:border-primary focus:ring-3 focus:ring-primary/15",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}
