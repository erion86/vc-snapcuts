import type { ShippingAddress } from "@/types/cart";

export type ShippingAddressField = keyof ShippingAddress;
export type ShippingAddressErrors = Partial<Record<ShippingAddressField, string>>;

export function validateShippingAddress(addr: ShippingAddress): {
  valid: boolean;
  errors: ShippingAddressErrors;
  message: string | null;
} {
  const errors: ShippingAddressErrors = {};

  if (!addr.email?.trim()) {
    errors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addr.email.trim())) {
    errors.email = "Enter a valid email address";
  }

  if (!addr.name?.trim()) {
    errors.name = "Full name is required";
  }

  if (!addr.phone?.trim()) {
    errors.phone = "Phone number is required";
  }

  if (!addr.line1?.trim()) {
    errors.line1 = "Address is required";
  }

  if (!addr.city?.trim()) {
    errors.city = "City is required";
  }

  if (!addr.province?.trim()) {
    errors.province = "Province is required";
  }

  const message = Object.values(errors)[0] ?? null;
  return { valid: Object.keys(errors).length === 0, errors, message };
}
