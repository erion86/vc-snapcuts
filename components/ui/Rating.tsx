import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingProps {
  value: number;
  count?: number;
  size?: "sm" | "md";
  showCount?: boolean;
  className?: string;
}

export function Rating({
  value,
  count,
  size = "sm",
  showCount = true,
  className,
}: RatingProps) {
  const starSize = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";

  return (
    <div
      className={cn("flex items-center gap-1", className)}
      aria-label={`Rated ${value} out of 5${count ? `, ${count} reviews` : ""}`}
    >
      <div className="flex items-center">
        {Array.from({ length: 5 }).map((_, i) => {
          const filled = value >= i + 1;
          const partial = !filled && value > i && value < i + 1;
          return (
            <Star
              key={i}
              className={cn(
                starSize,
                filled || partial ? "text-primary fill-primary" : "text-border fill-border"
              )}
              strokeWidth={1.5}
            />
          );
        })}
      </div>
      {showCount && count != null && count > 0 && (
        <span className="font-sans text-xs text-ink-soft">({count})</span>
      )}
    </div>
  );
}
