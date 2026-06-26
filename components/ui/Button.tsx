import * as React from "react";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────
type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type Size    = "sm" | "md" | "lg" | "icon";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?:    Size;
  loading?: boolean;
  asChild?: boolean;
}

// ── Variant styles ─────────────────────────────────────────────────────
const base = [
  "inline-flex items-center justify-center gap-2",
  "font-sans font-semibold tracking-wide",
  "rounded-xl transition-all duration-250 ease-spring",
  "cursor-pointer select-none",
  "disabled:opacity-50 disabled:cursor-not-allowed",
  "focus-visible:outline-none focus-visible:[box-shadow:0_0_0_2px_hsl(var(--bg)),0_0_0_4px_hsl(var(--ring))]",
].join(" ");

const variants: Record<Variant, string> = {
  primary:
    "bg-primary text-white hover:bg-primary-strong active:scale-[0.97] shadow-sm hover:shadow-md",
  secondary:
    "bg-secondary text-white hover:bg-secondary-strong active:scale-[0.97] shadow-sm hover:shadow-md",
  outline:
    "border border-border bg-transparent text-ink hover:bg-surface-alt active:scale-[0.97]",
  ghost:
    "bg-transparent text-ink hover:bg-surface-alt active:scale-[0.97]",
  danger:
    "bg-sale text-white hover:opacity-90 active:scale-[0.97]",
};

const sizes: Record<Size, string> = {
  sm:   "h-8  px-3 text-xs rounded-lg",
  md:   "h-10 px-5 text-sm",
  lg:   "h-12 px-7 text-base rounded-2xl",
  icon: "h-10 w-10 p-0 rounded-xl",
};

// ── Spinner ────────────────────────────────────────────────────────────
function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn("animate-spin h-4 w-4", className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12" cy="12" r="10"
        stroke="currentColor" strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v8H4z"
      />
    </svg>
  );
}

// ── Button ─────────────────────────────────────────────────────────────
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant  = "primary",
      size     = "md",
      loading  = false,
      asChild  = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const classes = cn(base, variants[variant], sizes[size], className);

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<{ className?: string }>, {
        className: cn(classes, (children.props as { className?: string }).className),
      });
    }

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={classes}
        {...props}
      >
        {loading && <Spinner />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button };
export type { ButtonProps, Variant as ButtonVariant, Size as ButtonSize };
