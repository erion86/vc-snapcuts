import { NextResponse } from "next/server";
import { completePaidOrder } from "@/lib/checkout/complete-paid-order";
import { fetchOrderByIdFromFirestore } from "@/lib/db/firestore-orders";
import {
  parseXenditWebhookEvent,
  verifyXenditWebhookToken,
} from "@/lib/xendit";
import { getOrderById } from "@/lib/orders/store";
import { releaseStockReservation } from "@/lib/inventory/stock-reservation";
import { patchOrderInFirestore } from "@/lib/db/firestore-orders";

async function resolveOrder(orderId: string) {
  return (await fetchOrderByIdFromFirestore(orderId)) ?? getOrderById(orderId);
}

export async function POST(request: Request) {
  if (!verifyXenditWebhookToken(request)) {
    // #region agent log
    fetch("http://127.0.0.1:7690/ingest/c9d741a0-7459-4973-bdd9-4faf8c080522", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "356ec0" },
      body: JSON.stringify({
        sessionId: "356ec0",
        runId: "fulfillment-fix",
        hypothesisId: "D",
        location: "webhooks/xendit:auth-fail",
        message: "Webhook token rejected",
        data: {},
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
    return NextResponse.json({ error: "Invalid webhook token" }, { status: 401 });
  }

  try {
    const payload = await request.json();
    const { event, referenceId, paymentId } = parseXenditWebhookEvent(payload);

    // #region agent log
    fetch("http://127.0.0.1:7690/ingest/c9d741a0-7459-4973-bdd9-4faf8c080522", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "356ec0" },
      body: JSON.stringify({
        sessionId: "356ec0",
        runId: "fulfillment-fix",
        hypothesisId: "A",
        location: "webhooks/xendit:received",
        message: "Webhook received",
        data: { event, hasReferenceId: Boolean(referenceId), hasPaymentId: Boolean(paymentId) },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion

    if (!referenceId) {
      return NextResponse.json({ received: true, skipped: "no reference_id" });
    }

    if (event === "payment_session.completed") {
      const order = await resolveOrder(referenceId);

      if (order) {
        try {
          await completePaidOrder(referenceId, {
            paymentId: paymentId ?? undefined,
            provider: "xendit",
            note: "Payment confirmed via Xendit webhook",
          });

          // #region agent log
          fetch("http://127.0.0.1:7690/ingest/c9d741a0-7459-4973-bdd9-4faf8c080522", {
            method: "POST",
            headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "356ec0" },
            body: JSON.stringify({
              sessionId: "356ec0",
              runId: "fulfillment-fix",
              hypothesisId: "B",
              location: "webhooks/xendit:fulfilled",
              message: "Webhook fulfillment succeeded",
              data: { orderId: referenceId },
              timestamp: Date.now(),
            }),
          }).catch(() => {});
          // #endregion
        } catch (err) {
          const message = err instanceof Error ? err.message : "Fulfillment failed";
          console.error(`Order ${referenceId} paid but fulfillment failed:`, message);

          // #region agent log
          fetch("http://127.0.0.1:7690/ingest/c9d741a0-7459-4973-bdd9-4faf8c080522", {
            method: "POST",
            headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "356ec0" },
            body: JSON.stringify({
              sessionId: "356ec0",
              runId: "fulfillment-fix",
              hypothesisId: "C",
              location: "webhooks/xendit:fulfillment-fail",
              message: "Webhook fulfillment failed",
              data: { orderId: referenceId, error: message },
              timestamp: Date.now(),
            }),
          }).catch(() => {});
          // #endregion

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
