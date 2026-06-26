import type { AppliedCoupon, CartItem, ShippingAddress } from "@/types/cart";

export type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export interface OrderRecord {
  id: string;
  orderNumber: string;
  userId: string | null;
  email: string;
  phone: string;
  items: {
    productId: string;
    title: string;
    variantName: string | null;
    sku: string;
    qty: number;
    unitPrice: number;
    lineTotal: number;
    imagePublicId: string;
  }[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  coupon: AppliedCoupon | null;
  shippingAddress: ShippingAddress;
  courier: "jt" | "lbc";
  orderNotes?: string;
  status: OrderStatus;
  payment: {
    provider: "paymongo";
    checkoutSessionId: string | null;
    intentId: string | null;
    status: string;
    paidAt: string | null;
  };
  createdAt: string;
  updatedAt: string;
}

let orderCounter = 142;
const orders = new Map<string, OrderRecord>();

export function generateOrderNumber(): string {
  orderCounter += 1;
  return `VCS-${String(orderCounter).padStart(6, "0")}`;
}

export function createPendingOrder(input: {
  items: CartItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  coupon: AppliedCoupon | null;
  shippingAddress: ShippingAddress;
  courier: "jt" | "lbc";
  orderNotes?: string;
}): OrderRecord {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  const order: OrderRecord = {
    id,
    orderNumber: generateOrderNumber(),
    userId: null,
    email: input.shippingAddress.email,
    phone: input.shippingAddress.phone,
    items: input.items.map((item) => ({
      productId: item.productId,
      title: item.title,
      variantName: item.variantName,
      sku: item.sku,
      qty: item.qty,
      unitPrice: item.unitPrice,
      lineTotal: item.unitPrice * item.qty,
      imagePublicId: item.imagePublicId,
    })),
    subtotal: input.subtotal,
    shippingFee: input.shippingFee,
    discount: input.discount,
    total: input.total,
    coupon: input.coupon,
    shippingAddress: input.shippingAddress,
    courier: input.courier,
    orderNotes: input.orderNotes,
    status: "pending",
    payment: {
      provider: "paymongo",
      checkoutSessionId: null,
      intentId: null,
      status: "pending",
      paidAt: null,
    },
    createdAt: now,
    updatedAt: now,
  };

  orders.set(id, order);
  orders.set(order.orderNumber, order);
  return order;
}

export function getOrderById(id: string): OrderRecord | null {
  return orders.get(id) ?? null;
}

export function getOrderByNumber(orderNumber: string): OrderRecord | null {
  return orders.get(orderNumber) ?? null;
}

export function updateOrder(
  id: string,
  patch: Partial<Pick<OrderRecord, "status" | "payment" | "updatedAt">>
): OrderRecord | null {
  const order = orders.get(id);
  if (!order) return null;
  const updated = {
    ...order,
    ...patch,
    payment: patch.payment ? { ...order.payment, ...patch.payment } : order.payment,
    updatedAt: new Date().toISOString(),
  };
  orders.set(id, updated);
  orders.set(updated.orderNumber, updated);
  return updated;
}

export function markOrderPaid(id: string, intentId?: string): OrderRecord | null {
  return updateOrder(id, {
    status: "paid",
    payment: {
      provider: "paymongo",
      checkoutSessionId: orders.get(id)?.payment.checkoutSessionId ?? null,
      intentId: intentId ?? null,
      status: "paid",
      paidAt: new Date().toISOString(),
    },
  });
}
