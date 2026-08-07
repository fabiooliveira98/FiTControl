import type { InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-2xl border border-border-strong bg-white px-4 text-sm text-foreground outline-none transition placeholder:text-foreground/40 focus:border-primary focus:ring-3 focus:ring-primary/15",
        className,
      )}
      {...props}
    />
  );
}
