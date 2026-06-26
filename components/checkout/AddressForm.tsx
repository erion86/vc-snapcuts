"use client";

import type { ShippingAddress } from "@/types/cart";
import type { ShippingAddressErrors } from "@/lib/validators/shipping-address";
import { cn } from "@/lib/utils";

interface AddressFormProps {
  value: ShippingAddress;
  onChange: (value: ShippingAddress) => void;
  errors?: ShippingAddressErrors;
}

const inputClass =
  "w-full h-11 px-4 rounded-xl border border-border bg-surface font-sans text-sm text-ink placeholder:text-ink-soft outline-none focus:[box-shadow:0_0_0_2px_hsl(var(--bg)),0_0_0_3px_hsl(var(--ring))]";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 font-sans text-xs text-sale">{message}</p>;
}

function RequiredLabel({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="block font-sans text-sm font-medium text-ink mb-1.5">
      {children}
      <span className="text-sale ml-0.5" aria-hidden="true">*</span>
    </label>
  );
}

export function AddressForm({ value, onChange, errors = {} }: AddressFormProps) {
  function set(field: keyof ShippingAddress, fieldValue: string) {
    onChange({ ...value, [field]: fieldValue });
  }

  function fieldClass(field: keyof ShippingAddress) {
    return cn(inputClass, errors[field] && "border-sale/60 focus:[box-shadow:0_0_0_2px_hsl(var(--bg)),0_0_0_3px_hsl(var(--sale))]");
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <RequiredLabel htmlFor="email">Email</RequiredLabel>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={value.email}
          onChange={(e) => set("email", e.target.value)}
          className={fieldClass("email")}
          placeholder="you@email.com"
          aria-invalid={Boolean(errors.email)}
        />
        <FieldError message={errors.email} />
      </div>

      <div className="sm:col-span-2">
        <RequiredLabel htmlFor="name">Full name</RequiredLabel>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          required
          value={value.name}
          onChange={(e) => set("name", e.target.value)}
          className={fieldClass("name")}
          placeholder="Maria Santos"
          aria-invalid={Boolean(errors.name)}
        />
        <FieldError message={errors.name} />
      </div>

      <div className="sm:col-span-2">
        <RequiredLabel htmlFor="phone">Phone number</RequiredLabel>
        <input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          required
          value={value.phone}
          onChange={(e) => set("phone", e.target.value)}
          className={fieldClass("phone")}
          placeholder="09XX XXX XXXX"
          aria-invalid={Boolean(errors.phone)}
        />
        <FieldError message={errors.phone} />
      </div>

      <div className="sm:col-span-2">
        <RequiredLabel htmlFor="line1">Address</RequiredLabel>
        <input
          id="line1"
          name="line1"
          type="text"
          autoComplete="address-line1"
          required
          value={value.line1}
          onChange={(e) => set("line1", e.target.value)}
          className={fieldClass("line1")}
          placeholder="Street address, barangay"
          aria-invalid={Boolean(errors.line1)}
        />
        <FieldError message={errors.line1} />
      </div>

      <div className="sm:col-span-2">
        <label htmlFor="line2" className="block font-sans text-sm font-medium text-ink mb-1.5">
          Apt / unit (optional)
        </label>
        <input
          id="line2"
          name="line2"
          type="text"
          autoComplete="address-line2"
          value={value.line2 ?? ""}
          onChange={(e) => set("line2", e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <RequiredLabel htmlFor="city">City</RequiredLabel>
        <input
          id="city"
          name="city"
          type="text"
          autoComplete="address-level2"
          required
          value={value.city}
          onChange={(e) => set("city", e.target.value)}
          className={fieldClass("city")}
          aria-invalid={Boolean(errors.city)}
        />
        <FieldError message={errors.city} />
      </div>

      <div>
        <RequiredLabel htmlFor="province">Province</RequiredLabel>
        <input
          id="province"
          name="province"
          type="text"
          autoComplete="address-level1"
          required
          value={value.province}
          onChange={(e) => set("province", e.target.value)}
          className={fieldClass("province")}
          aria-invalid={Boolean(errors.province)}
        />
        <FieldError message={errors.province} />
      </div>

      <div>
        <label htmlFor="postal" className="block font-sans text-sm font-medium text-ink mb-1.5">
          Postal code (optional)
        </label>
        <input
          id="postal"
          name="postal"
          type="text"
          autoComplete="postal-code"
          value={value.postal}
          onChange={(e) => set("postal", e.target.value)}
          className={inputClass}
        />
      </div>
    </div>
  );
}
