import "server-only";

import { fulfillOrderInventory } from "@/lib/checkout/fulfill-order";
import { fetchOrderByIdFromFirestore, patchOrderInFirestore } from "@/lib/db/firestore-orders";
import { getOrderById, markOrderPaid, updateOrder } from "@/lib/orders/store";
import type { OrderRecord } from "@/lib/orders/store";

async function resolveOrder(orderId: string): Promise<OrderRecord | null> {
  return (await fetchOrderByIdFromFirestore(orderId)) ?? getOrderById(orderId);
}

/** Idempotent: fulfill reserved stock, redeem coupon, mark order paid. */
export async function completePaidOrder(
  orderId: string,
  options?: {
    paymentId?: string;
    provider?: OrderRecord["payment"]["provider"];
    note?: string;
  }
): Promise<{ alreadyPaid: boolean; order: OrderRecord }> {
  const order = await resolveOrder(orderId);
  if (!order) {
    throw new Error(`Order not found: ${orderId}`);
  }

  await fulfillOrderInventory(orderId, order.coupon?.code ?? null);

  const paidStatuses = new Set(["paid", "processing", "shipped", "delivered"]);
  if (paidStatuses.has(order.status) && order.payment.status === "paid") {
    const refreshed = (await fetchOrderByIdFromFirestore(orderId)) ?? getOrderById(orderId);
    return { alreadyPaid: true, order: refreshed ?? order };
  }

  const paidAt = new Date().toISOString();
  const provider = options?.provider ?? order.payment.provider;
  const paymentPatch = {
    status: "paid" as const,
    payment: {
      ...order.payment,
      provider,
      status: "paid",
      paidAt,
      intentId: options?.paymentId ?? order.payment.intentId,
    },
    timeline: [
      ...(order.timeline ?? [{ status: "pending", at: order.createdAt }]),
      {
        status: "paid",
        at: paidAt,
        note: options?.note ?? "Payment confirmed",
      },
    ],
  };

  await patchOrderInFirestore(orderId, paymentPatch);
  markOrderPaid(orderId, options?.paymentId, provider);
  updateOrder(orderId, paymentPatch);

  const updated = (await fetchOrderByIdFromFirestore(orderId)) ?? getOrderById(orderId);
  return { alreadyPaid: false, order: updated ?? { ...order, ...paymentPatch } };
}
