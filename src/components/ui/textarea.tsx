import type { TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-28 w-full rounded-2xl border border-border-strong bg-white px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-foreground/40 focus:border-primary focus:ring-3 focus:ring-primary/15",
        className,
      )}
      {...props}
    />
  );
}
