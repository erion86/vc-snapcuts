import { cn, formatPrice } from "@/lib/utils";

interface PriceTagProps {
  price: number;
  compareAtPrice?: number | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
};

export function PriceTag({
  price,
  compareAtPrice,
  size = "md",
  className,
}: PriceTagProps) {
  const onSale = compareAtPrice != null && compareAtPrice > price;

  return (
    <div className={cn("flex items-baseline gap-2 tabular-nums", className)}>
      <span
        className={cn(
          "font-sans font-semibold text-ink",
          sizeClasses[size],
          onSale && "text-sale"
        )}
      >
        {formatPrice(price)}
      </span>
      {onSale && (
        <span className={cn("font-sans text-ink-soft line-through", sizeClasses.sm)}>
          {formatPrice(compareAtPrice)}
        </span>
      )}
    </div>
  );
}
