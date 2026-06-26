import { NextResponse } from "next/server";
import { completePaidOrder } from "@/lib/checkout/complete-paid-order";
import { fetchOrderByNumberFromFirestore } from "@/lib/db/firestore-orders";
import { getOrderByNumber } from "@/lib/orders/store";
import { getXenditPaymentSession } from "@/lib/xendit";

interface ConfirmBody {
  orderNumber?: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ConfirmBody;
    const orderNumber = body.orderNumber?.trim();

    if (!orderNumber) {
      return NextResponse.json({ error: "orderNumber is required" }, { status: 400 });
    }

    const order =
      (await fetchOrderByNumberFromFirestore(orderNumber)) ?? getOrderByNumber(orderNumber);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // #region agent log
    fetch("http://127.0.0.1:7690/ingest/c9d741a0-7459-4973-bdd9-4faf8c080522", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "356ec0" },
      body: JSON.stringify({
        sessionId: "356ec0",
        runId: "fulfillment-fix",
        hypothesisId: "A",
        location: "api/checkout/confirm:entry",
        message: "Confirm payment requested",
        data: {
          orderNumber,
          orderId: order.id,
          status: order.status,
          provider: order.payment.provider,
          hasSessionId: Boolean(order.payment.checkoutSessionId),
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion

    if (order.payment.provider === "xendit" && order.payment.checkoutSessionId) {
      const session = await getXenditPaymentSession(order.payment.checkoutSessionId);

      if (session.referenceId && session.referenceId !== order.id) {
        return NextResponse.json({ error: "Payment session mismatch" }, { status: 400 });
      }

      if (session.status !== "COMPLETED") {
        return NextResponse.json(
          { error: "Payment not completed yet", sessionStatus: session.status },
          { status: 409 }
        );
      }

      const result = await completePaidOrder(order.id, {
        paymentId: session.paymentId ?? undefined,
        provider: "xendit",
        note: "Confirmed via success page",
      });

      // #region agent log
      fetch("http://127.0.0.1:7690/ingest/c9d741a0-7459-4973-bdd9-4faf8c080522", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "356ec0" },
        body: JSON.stringify({
          sessionId: "356ec0",
          runId: "fulfillment-fix",
          hypothesisId: "B",
          location: "api/checkout/confirm:success",
          message: "Order marked paid and fulfilled",
          data: { orderId: order.id, alreadyPaid: result.alreadyPaid, status: result.order.status },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion

      return NextResponse.json({
        ok: true,
        alreadyPaid: result.alreadyPaid,
        status: result.order.status,
      });
    }

    if (order.status === "pending") {
      return NextResponse.json({ error: "No payment session to confirm" }, { status: 400 });
    }

    return NextResponse.json({ ok: true, alreadyPaid: true, status: order.status });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not confirm payment";

    // #region agent log
    fetch("http://127.0.0.1:7690/ingest/c9d741a0-7459-4973-bdd9-4faf8c080522", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "356ec0" },
      body: JSON.stringify({
        sessionId: "356ec0",
        runId: "fulfillment-fix",
        hypothesisId: "C",
        location: "api/checkout/confirm:error",
        message: "Confirm payment failed",
        data: { error: message },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
