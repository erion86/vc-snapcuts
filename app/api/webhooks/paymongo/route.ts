import { NextResponse } from "next/server";
import { markOrderPaid } from "@/lib/orders/store";

/**
 * PayMongo webhook handler.
 * Marks order as paid on successful payment event.
 * Stock decrement via Firestore transaction will be added when Firebase Admin is wired.
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
        markOrderPaid(orderId, data?.id);
      }
    }

    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: "PayMongo webhook endpoint" });
}
