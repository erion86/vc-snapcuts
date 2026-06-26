import { releaseStockReservation } from "@/lib/inventory/stock-reservation";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const orderId = typeof body.orderId === "string" ? body.orderId : "";

    if (!orderId) {
      return NextResponse.json({ error: "Order ID required" }, { status: 400 });
    }

    await releaseStockReservation(orderId);
    return NextResponse.json({ released: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Release failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
