import { NextResponse } from "next/server";
import { getOrderByNumber } from "@/lib/orders/store";

interface RouteParams {
  params: { orderNumber: string };
}

export async function GET(_request: Request, { params }: RouteParams) {
  const order = getOrderByNumber(params.orderNumber);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json({
    orderNumber: order.orderNumber,
    status: order.status,
    total: order.total,
    email: order.email,
    items: order.items.map((i) => ({
      title: i.title,
      qty: i.qty,
      lineTotal: i.lineTotal,
    })),
  });
}
