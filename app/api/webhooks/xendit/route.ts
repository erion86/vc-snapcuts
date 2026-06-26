import { NextResponse } from "next/server";
import { fulfillOrderInventory } from "@/lib/checkout/fulfill-order";
import {
  parseXenditWebhookEvent,
  verifyXenditWebhookToken,
} from "@/lib/xendit";
import { fetchOrderByIdFromFirestore, patchOrderInFirestore } from "@/lib/db/firestore-orders";
import { getOrderById, markOrderPaid, updateOrder } from "@/lib/orders/store";
import { releaseStockReservation } from "@/lib/inventory/stock-reservation";

async function resolveOrder(orderId: string) {
  return (await fetchOrderByIdFromFirestore(orderId)) ?? getOrderById(orderId);
}

export async function POST(request: Request) {
  if (!verifyXenditWebhookToken(request)) {
    return NextResponse.json({ error: "Invalid webhook token" }, { status: 401 });
  }

  try {
    const payload = await request.json();
    const { event, referenceId } = parseXenditWebhookEvent(payload);

    if (!referenceId) {
      return NextResponse.json({ received: true, skipped: "no reference_id" });
    }

    if (event === "payment_session.completed") {
      const order = await resolveOrder(referenceId);

      if (order && order.status !== "paid") {
        try {
          await fulfillOrderInventory(referenceId, order.coupon?.code ?? null);

          const paidAt = new Date().toISOString();
          const paymentPatch = {
            status: "paid" as const,
            payment: {
              ...order.payment,
              provider: "xendit" as const,
              status: "paid",
              paidAt,
            },
          };

          await patchOrderInFirestore(referenceId, paymentPatch);
          markOrderPaid(referenceId, undefined, "xendit");
          updateOrder(referenceId, paymentPatch);
        } catch (err) {
          const message = err instanceof Error ? err.message : "Fulfillment failed";
          const failPatch = {
            payment: {
              ...order.payment,
              provider: "xendit" as const,
              status: "paid_fulfillment_failed",
              paidAt: new Date().toISOString(),
            },
          };
          await patchOrderInFirestore(referenceId, failPatch);
          updateOrder(referenceId, failPatch);
          console.error(`Order ${referenceId} paid but fulfillment failed:`, message);
          return NextResponse.json({ error: message }, { status: 500 });
        }
      }
    }

    if (event === "payment_session.expired") {
      const order = await resolveOrder(referenceId);
      if (order && order.status === "pending") {
        await releaseStockReservation(referenceId);
        await patchOrderInFirestore(referenceId, {
          payment: {
            ...order.payment,
            provider: "xendit",
            status: "expired",
          },
        });
        updateOrder(referenceId, {
          payment: {
            ...order.payment,
            provider: "xendit",
            status: "expired",
          },
        });
      }
    }

    return NextResponse.json({ received: true, event });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Webhook processing failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: "Xendit webhook endpoint" });
}
