import { NextResponse } from "next/server";
import { calculateCartTotals } from "@/lib/cart/calculate";
import { validateCheckoutCart } from "@/lib/checkout/validate-checkout";
import { fulfillOrderInventory, toStockLineItems } from "@/lib/checkout/fulfill-order";
import { createPendingOrder, markOrderPaid, updateOrder } from "@/lib/orders/store";
import { createCheckoutSession, isPayMongoConfigured } from "@/lib/paymongo";
import { validateShippingAddress } from "@/lib/validators/shipping-address";
import {
  releaseStockReservation,
  reserveStockForOrder,
} from "@/lib/inventory/stock-reservation";
import type { AppliedCoupon, CartItem, ShippingAddress } from "@/types/cart";

function validateAddress(addr: ShippingAddress): string | null {
  return validateShippingAddress(addr).message;
}

interface CheckoutBody {
  items: CartItem[];
  couponCode?: string | null;
  shippingAddress: ShippingAddress;
  courier: "jt" | "lbc";
  orderNotes?: string;
}

function buildLineItems(
  items: CartItem[],
  subtotal: number,
  discount: number,
  shippingFee: number
) {
  const ratio = discount > 0 && subtotal > 0 ? (subtotal - discount) / subtotal : 1;

  const lineItems = items.map((item) => ({
    name: item.variantName ? `${item.title} — ${item.variantName}` : item.title,
    amount: Math.max(100, Math.round(item.unitPrice * ratio)),
    currency: "PHP",
    quantity: item.qty,
  }));

  if (shippingFee > 0) {
    lineItems.push({
      name: "Shipping",
      amount: shippingFee,
      currency: "PHP",
      quantity: 1,
    });
  }

  return lineItems;
}

export async function POST(request: Request) {
  let reservedOrderId: string | null = null;

  try {
    const body = (await request.json()) as CheckoutBody;

    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const addressError = validateAddress(body.shippingAddress);
    if (addressError) {
      return NextResponse.json({ error: addressError }, { status: 400 });
    }

    const validation = await validateCheckoutCart(body.items, body.couponCode);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.errors[0] }, { status: 400 });
    }

    const coupon: AppliedCoupon | null = validation.coupon;
    const totals = validation.totals;

    const order = createPendingOrder({
      items: body.items,
      subtotal: totals.subtotal,
      shippingFee: totals.shippingFee,
      discount: totals.discount,
      total: totals.total,
      coupon,
      shippingAddress: body.shippingAddress,
      courier: body.courier,
      orderNotes: body.orderNotes,
    });

    reservedOrderId = order.id;

    await reserveStockForOrder(
      order.id,
      toStockLineItems(
        body.items.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          qty: item.qty,
          title: item.title,
        }))
      )
    );

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const successUrl = `${siteUrl}/checkout/success?order=${order.orderNumber}`;
    const cancelUrl = `${siteUrl}/checkout?cancelled=1&orderId=${order.id}`;

    if (!isPayMongoConfigured()) {
      await fulfillOrderInventory(order.id, coupon?.code ?? null);
      markOrderPaid(order.id);
      reservedOrderId = null;

      return NextResponse.json({
        demo: true,
        orderId: order.id,
        orderNumber: order.orderNumber,
        checkoutUrl: successUrl,
        message: "PayMongo not configured — demo checkout",
      });
    }

    const lineItems = buildLineItems(
      body.items,
      totals.subtotal,
      totals.discount,
      totals.shippingFee
    );

    const session = await createCheckoutSession({
      lineItems,
      successUrl,
      cancelUrl,
      description: `Order ${order.orderNumber}${coupon ? ` (${coupon.code})` : ""}`,
      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        discount: String(totals.discount),
        couponCode: coupon?.code ?? "",
      },
    });

    updateOrder(order.id, {
      payment: {
        ...order.payment,
        checkoutSessionId: session.sessionId,
        status: "awaiting_payment",
      },
    });

    return NextResponse.json({
      checkoutUrl: session.checkoutUrl,
      orderId: order.id,
      orderNumber: order.orderNumber,
    });
  } catch (err) {
    if (reservedOrderId) {
      try {
        await releaseStockReservation(reservedOrderId);
      } catch {
        /* best-effort */
      }
    }

    const message = err instanceof Error ? err.message : "Checkout failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
