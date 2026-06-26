import { NextResponse } from "next/server";
import { fulfillOrderInventory } from "@/lib/checkout/fulfill-order";
import { getOrderById, markOrderPaid, updateOrder } from "@/lib/orders/store";

/**
 * PayMongo webhook handler.
 * Fulfills inventory (stock + coupon) atomically, then marks order paid.
 */
export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const eventType = payload?.data?.attributes?.type as string | undefined;
    const data = payload?.data?.attributes?.data;

    if (eventType === "checkout.session.payment.paid" || eventType === "payment.paid") {
      const metadata = data?.attributes?.metadata ?? data?.metadata;
      const orderId = metadata?.orderId as string | undefined;

      if (orderId) {
        const order = getOrderById(orderId);
        if (order && order.status !== "paid") {
          try {
            await fulfillOrderInventory(orderId, order.coupon?.code ?? null);
            markOrderPaid(orderId, data?.id, "paymongo");
          } catch (err) {
            const message = err instanceof Error ? err.message : "Fulfillment failed";
            updateOrder(orderId, {
              payment: {
                ...order.payment,
                status: "paid_fulfillment_failed",
                intentId: data?.id ?? null,
                paidAt: new Date().toISOString(),
              },
            });
            console.error(`Order ${orderId} paid but fulfillment failed:`, message);
            return NextResponse.json({ error: message }, { status: 500 });
          }
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Webhook processing failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: "PayMongo webhook endpoint" });
}
