import * as React from "react";
import { cn } from "@/lib/utils";

// ── Container ──────────────────────────────────────────────────────────
interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "default" | "narrow" | "wide" | "full";
}

const containerSizes = {
  default: "max-w-7xl",
  narrow:  "max-w-3xl",
  wide:    "max-w-screen-2xl",
  full:    "max-w-none",
};

export function Container({
  size = "default",
  className,
  children,
  ...props
}: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-4 md:px-6 lg:px-8",
        containerSizes[size],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// ── Section ────────────────────────────────────────────────────────────
interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType;
  tight?: boolean;          // less vertical padding
  alt?: boolean;            // surface-alt background
}

export function Section({
  as: Tag = "section",
  tight   = false,
  alt     = false,
  className,
  children,
  ...props
}: SectionProps) {
  return (
    <Tag
      className={cn(
        tight ? "py-8 md:py-12" : "py-14 md:py-20 lg:py-24",
        alt && "bg-surface-alt",
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}

// ── SectionHeader ─────────────────────────────────────────────────────
interface SectionHeaderProps {
  eyebrow?: string;
  heading:  string;
  sub?:     string;
  center?:  boolean;
  action?:  React.ReactNode;
  className?: string;
}

export function SectionHeader({
  eyebrow,
  heading,
  sub,
  center = false,
  action,
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 mb-8 md:mb-12",
        center ? "items-center text-center" : "items-start",
        action && "md:flex-row md:items-end md:justify-between",
        className
      )}
    >
      <div className={cn("flex flex-col gap-1.5", center && "items-center")}>
        {eyebrow && (
          <p className="text-xs font-sans font-semibold uppercase tracking-widest text-primary">
            {eyebrow}
          </p>
        )}
        <h2 className="font-display text-display-md text-ink">{heading}</h2>
        {sub && (
          <p className="text-sm md:text-base text-ink-soft max-w-xl">
            {sub}
          </p>
        )}
      </div>
      {action && <div className="mt-2 md:mt-0 flex-shrink-0">{action}</div>}
    </div>
  );
}
