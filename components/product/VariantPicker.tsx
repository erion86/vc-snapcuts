"use client";

import { cn } from "@/lib/utils";
import type { ProductVariant } from "@/types/product";

interface VariantSelectorProps {
  variants: ProductVariant[];
  selectedId: string | null;
  onSelect: (variant: ProductVariant) => void;
}

function getUniqueOptions(variants: ProductVariant[], key: "size" | "color"): string[] {
  const values = variants
    .map((v) => v.options[key])
    .filter((v): v is string => Boolean(v));
  return Array.from(new Set(values));
}

function findVariant(
  variants: ProductVariant[],
  selected: ProductVariant | null,
  key: "size" | "color",
  value: string
): ProductVariant | undefined {
  const otherKey = key === "size" ? "color" : "size";
  const otherValue = selected?.options[otherKey];

  const matches = variants.filter((v) => v.options[key] === value);
  if (otherValue) {
    return matches.find((v) => v.options[otherKey] === otherValue) ?? matches.find((v) => v.stock > 0) ?? matches[0];
  }
  return matches.find((v) => v.stock > 0) ?? matches[0];
}

export function VariantSelector({ variants, selectedId, onSelect }: VariantSelectorProps) {
  const selected = variants.find((v) => v.id === selectedId) ?? null;
  const sizes = getUniqueOptions(variants, "size");
  const colors = getUniqueOptions(variants, "color");

  function renderPills(options: string[], key: "size" | "color", label: string) {
    if (options.length === 0) return null;

    return (
      <div>
        <p className="font-sans text-sm font-semibold text-ink mb-2">{label}</p>
        <div className="flex flex-wrap gap-2">
          {options.map((value) => {
            const variant = findVariant(variants, selected, key, value);
            const isActive = selected?.options[key] === value;
            const outOfStock = !variant || variant.stock <= 0;

            return (
              <button
                key={value}
                type="button"
                disabled={outOfStock}
                onClick={() => variant && onSelect(variant)}
                className={cn(
                  "px-4 py-2 rounded-xl border font-sans text-sm font-medium transition-all",
                  isActive
                    ? "border-primary bg-primary/10 text-ink"
                    : "border-border text-ink-soft hover:border-primary/40",
                  outOfStock && "opacity-40 cursor-not-allowed line-through"
                )}
              >
                {value}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {renderPills(sizes, "size", "Size")}
      {renderPills(colors, "color", "Color")}
    </div>
  );
}

// Keep VariantPicker export for backwards compat
export { VariantSelector as VariantPicker };
