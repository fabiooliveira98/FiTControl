import Link from "next/link";
import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";

import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "sm";

const variantClasses: Record<Variant, string> = {
  primary:
    "border border-action bg-action text-on-action shadow-[0_8px_20px_rgba(38,5,46,0.18)] hover:border-action-hover hover:bg-action-hover focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-secondary/30",
  secondary:
    "border border-border-strong bg-white text-foreground hover:border-primary/35 hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/20",
  ghost:
    "text-primary hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/20",
};

const sizeClasses: Record<Size, string> = {
  md: "h-11 rounded-2xl px-5 text-sm font-semibold",
  sm: "h-9 rounded-xl px-4 text-sm font-semibold",
};

type BaseProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: BaseProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 transition disabled:cursor-not-allowed disabled:opacity-60",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  className,
  style,
  children,
}: BaseProps & { href: string; style?: CSSProperties }) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center gap-2 transition",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      style={style}
    >
      {children}
    </Link>
  );
}
