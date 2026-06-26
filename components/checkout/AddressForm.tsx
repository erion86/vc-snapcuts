"use client";

import type { ShippingAddress } from "@/types/cart";

interface AddressFormProps {
  value: ShippingAddress;
  onChange: (value: ShippingAddress) => void;
}

const inputClass =
  "w-full h-11 px-4 rounded-xl border border-border bg-surface font-sans text-sm text-ink placeholder:text-ink-soft outline-none focus:[box-shadow:0_0_0_2px_hsl(var(--bg)),0_0_0_3px_hsl(var(--ring))]";

export function AddressForm({ value, onChange }: AddressFormProps) {
  function set(field: keyof ShippingAddress, fieldValue: string) {
    onChange({ ...value, [field]: fieldValue });
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label htmlFor="email" className="block font-sans text-sm font-medium text-ink mb-1.5">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={value.email}
          onChange={(e) => set("email", e.target.value)}
          className={inputClass}
          placeholder="you@email.com"
        />
      </div>

      <div className="sm:col-span-2">
        <label htmlFor="name" className="block font-sans text-sm font-medium text-ink mb-1.5">
          Full name
        </label>
        <input
          id="name"
          type="text"
          required
          value={value.name}
          onChange={(e) => set("name", e.target.value)}
          className={inputClass}
          placeholder="Maria Santos"
        />
      </div>

      <div className="sm:col-span-2">
        <label htmlFor="phone" className="block font-sans text-sm font-medium text-ink mb-1.5">
          Phone
        </label>
        <input
          id="phone"
          type="tel"
          required
          value={value.phone}
          onChange={(e) => set("phone", e.target.value)}
          className={inputClass}
          placeholder="09XX XXX XXXX"
        />
      </div>

      <div className="sm:col-span-2">
        <label htmlFor="line1" className="block font-sans text-sm font-medium text-ink mb-1.5">
          Address
        </label>
        <input
          id="line1"
          type="text"
          required
          value={value.line1}
          onChange={(e) => set("line1", e.target.value)}
          className={inputClass}
          placeholder="Street address, barangay"
        />
      </div>

      <div className="sm:col-span-2">
        <label htmlFor="line2" className="block font-sans text-sm font-medium text-ink mb-1.5">
          Apt / unit (optional)
        </label>
        <input
          id="line2"
          type="text"
          value={value.line2 ?? ""}
          onChange={(e) => set("line2", e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="city" className="block font-sans text-sm font-medium text-ink mb-1.5">
          City
        </label>
        <input
          id="city"
          type="text"
          required
          value={value.city}
          onChange={(e) => set("city", e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="province" className="block font-sans text-sm font-medium text-ink mb-1.5">
          Province
        </label>
        <input
          id="province"
          type="text"
          required
          value={value.province}
          onChange={(e) => set("province", e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="postal" className="block font-sans text-sm font-medium text-ink mb-1.5">
          Postal code
        </label>
        <input
          id="postal"
          type="text"
          required
          value={value.postal}
          onChange={(e) => set("postal", e.target.value)}
          className={inputClass}
        />
      </div>
    </div>
  );
}
