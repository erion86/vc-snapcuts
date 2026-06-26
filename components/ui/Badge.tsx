import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "primary" | "secondary" | "sale" | "success" | "outline";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variants: Record<BadgeVariant, string> = {
  default:   "bg-surface-alt text-ink border border-border",
  primary:   "bg-primary/15 text-primary-strong border border-primary/20",
  secondary: "bg-secondary/15 text-secondary-strong border border-secondary/20",
  sale:      "bg-sale text-white border-transparent",
  success:   "bg-secondary/20 text-secondary-strong border border-secondary/30",
  outline:   "bg-transparent border border-border text-ink",
};

export function Badge({
  variant = "default",
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1",
        "text-xs font-sans font-semibold",
        "px-2 py-0.5 rounded-md",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

/**
 * SaleBadge — the kiss-cut washi-tape style tag
 * Slight rotation gives the "sticker placed by hand" feel
 */
export function SaleBadge({ children = "Sale" }: { children?: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center",
        "text-xs font-sans font-bold text-white",
        "bg-sale px-2.5 py-0.5 rounded",
        // Signature kiss-cut tilt
        "rotate-[-1.5deg]",
        "shadow-sm"
      )}
      aria-label="On sale"
    >
      {children}
    </span>
  );
}

/**
 * NewBadge — for new arrivals
 */
export function NewBadge() {
  return (
    <Badge variant="primary" className="font-bold">
      New
    </Badge>
  );
}
