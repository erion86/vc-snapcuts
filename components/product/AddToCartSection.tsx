"use client";

import { useState } from "react";
import { Minus, Plus, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/hooks/useCart";
import type { Product, ProductVariant } from "@/types/product";

interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 99,
}: QuantityStepperProps) {
  return (
    <div className="inline-flex items-center border border-border rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="inline-flex h-10 w-10 items-center justify-center hover:bg-surface-alt disabled:opacity-40 transition-colors"
        aria-label="Decrease quantity"
      >
        <Minus className="h-4 w-4" />
      </button>
      <span className="inline-flex h-10 w-10 items-center justify-center font-sans text-sm font-semibold tabular-nums">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="inline-flex h-10 w-10 items-center justify-center hover:bg-surface-alt disabled:opacity-40 transition-colors"
        aria-label="Increase quantity"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}

interface AddToCartSectionProps {
  product: Product;
  variant: ProductVariant | null;
  inStock: boolean;
}

export function AddToCartSection({ product, variant, inStock }: AddToCartSectionProps) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  function handleAdd() {
    addItem({ product, variant, qty });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <span className="font-sans text-sm font-semibold text-ink">Qty</span>
        <QuantityStepper value={qty} onChange={setQty} max={inStock ? 99 : 0} />
      </div>

      <button
        type="button"
        disabled={!inStock}
        onClick={handleAdd}
        className={cn(
          "w-full h-12 rounded-2xl font-sans font-semibold text-base transition-all inline-flex items-center justify-center gap-2",
          added
            ? "bg-secondary text-white"
            : inStock
              ? "bg-primary text-white hover:bg-primary-strong active:scale-[0.98]"
              : "bg-surface-alt text-ink-soft cursor-not-allowed"
        )}
      >
        {added ? (
          <>
            <Check className="h-5 w-5" />
            Added to bag
          </>
        ) : inStock ? (
          "Add to Cart"
        ) : (
          "Out of Stock"
        )}
      </button>
    </div>
  );
}
