"use client";

import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWishlist } from "@/context/WishlistProvider";

interface WishlistButtonProps {
  productId: string;
  className?: string;
  size?: "sm" | "md";
}

export function WishlistButton({ productId, className, size = "md" }: WishlistButtonProps) {
  const { isWishlisted, toggle } = useWishlist();
  const active = isWishlisted(productId);
  const iconSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void toggle(productId);
      }}
      className={cn(
        "inline-flex items-center justify-center transition-colors",
        active ? "text-primary animate-heart-pop" : "text-ink-soft hover:text-primary",
        className
      )}
      aria-label={active ? "Remove from wishlist" : "Save to wishlist"}
      aria-pressed={active}
    >
      <Heart className={iconSize} fill={active ? "currentColor" : "none"} strokeWidth={1.75} />
    </button>
  );
}
