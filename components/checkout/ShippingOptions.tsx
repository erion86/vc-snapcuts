"use client";

import { checkoutConfig } from "@/config/checkout";
import { cn } from "@/lib/utils";

interface ShippingOptionsProps {
  value: "jt" | "lbc";
  onChange: (value: "jt" | "lbc") => void;
}

export function ShippingOptions({ value, onChange }: ShippingOptionsProps) {
  return (
    <div className="flex flex-col gap-3">
      {checkoutConfig.couriers.map((courier) => (
        <label
          key={courier.id}
          className={cn(
            "flex items-center gap-4 p-4 rounded-2xl border cursor-pointer transition-colors",
            value === courier.id
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/30"
          )}
        >
          <input
            type="radio"
            name="courier"
            value={courier.id}
            checked={value === courier.id}
            onChange={() => onChange(courier.id)}
            className="accent-primary"
          />
          <div>
            <p className="font-sans text-sm font-semibold text-ink">{courier.name}</p>
            <p className="font-sans text-xs text-ink-soft">{courier.eta}</p>
          </div>
        </label>
      ))}
    </div>
  );
}
