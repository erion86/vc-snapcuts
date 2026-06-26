export interface CartItem {
  productId: string;
  variantId: string | null;
  slug: string;
  title: string;
  variantName: string | null;
  imagePublicId: string;
  qty: number;
  unitPrice: number;
  sku: string;
  /** Max purchasable quantity based on live/last-known stock for this line */
  maxStock: number;
}

export interface AppliedCoupon {
  code: string;
  type: "percent" | "fixed" | "free_shipping";
  value: number;
  discountAmount: number;
}

export interface CartTotals {
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  itemCount: number;
}

export interface ShippingAddress {
  name: string;
  email: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  province: string;
  postal: string;
}

export interface CheckoutFormData {
  address: ShippingAddress;
  courier: "jt" | "lbc";
  orderNotes?: string;
}
