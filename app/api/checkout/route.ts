import { NextResponse } from "next/server";
import { calculateCartTotals } from "@/lib/cart/calculate";
import { validateCoupon } from "@/lib/coupons/validate";
import { createPendingOrder, markOrderPaid, updateOrder } from "@/lib/orders/store";
import { createCheckoutSession, isPayMongoConfigured } from "@/lib/paymongo";
import type { AppliedCoupon, CartItem, ShippingAddress } from "@/types/cart";

function validateAddress(addr: ShippingAddress): string | null {
  if (!addr.email?.includes("@")) return "Valid email required";
  if (!addr.name?.trim()) return "Name required";
  if (!addr.phone?.trim()) return "Phone required";
  if (!addr.line1?.trim()) return "Address required";
  if (!addr.city?.trim()) return "City required";
  if (!addr.province?.trim()) return "Province required";
  if (!addr.postal?.trim()) return "Postal code required";
  return null;
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
  try {
    const body = (await request.json()) as CheckoutBody;

    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const addressError = validateAddress(body.shippingAddress);
    if (addressError) {
      return NextResponse.json({ error: addressError }, { status: 400 });
    }

    let coupon: AppliedCoupon | null = null;
    if (body.couponCode) {
      const subtotalPreview = body.items.reduce(
        (s, i) => s + i.unitPrice * i.qty,
        0
      );
      const couponResult = validateCoupon(body.couponCode, subtotalPreview);
      if (!couponResult.valid) {
        return NextResponse.json({ error: couponResult.error }, { status: 400 });
      }
      coupon = couponResult.coupon ?? null;
    }

    const totals = calculateCartTotals(body.items, coupon);

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

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const successUrl = `${siteUrl}/checkout/success?order=${order.orderNumber}`;
    const cancelUrl = `${siteUrl}/checkout?cancelled=1`;

    // Demo mode when PayMongo is not configured
    if (!isPayMongoConfigured()) {
      markOrderPaid(order.id);
      return NextResponse.json({
        demo: true,
        orderNumber: order.orderNumber,
        checkoutUrl: successUrl,
        message: "PayMongo not configured — demo checkout",
      });
    }

    const lineItems = buildLineItems(body.items, totals.subtotal, totals.discount, totals.shippingFee);

    // PayMongo doesn't support negative line items; apply discount to description/metadata
    const session = await createCheckoutSession({
      lineItems,
      successUrl,
      cancelUrl,
      description: `Order ${order.orderNumber}${coupon ? ` (${coupon.code})` : ""}`,
      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        discount: String(totals.discount),
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
      orderNumber: order.orderNumber,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Checkout failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
