import { NextResponse } from "next/server";
import { calculateCartTotals } from "@/lib/cart/calculate";
import { validateCheckoutCart } from "@/lib/checkout/validate-checkout";
import { fulfillOrderInventory, toStockLineItems } from "@/lib/checkout/fulfill-order";
import { saveOrderToFirestore, patchOrderInFirestore } from "@/lib/db/firestore-orders";
import { createPendingOrder, updateOrder } from "@/lib/orders/store";
import { createCheckoutSession, isPayMongoConfigured } from "@/lib/paymongo";
import { createXenditPaymentSession, isXenditConfigured } from "@/lib/xendit";
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

function splitCustomerName(fullName: string): { givenNames: string; surname: string } {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) {
    return { givenNames: parts[0], surname: "." };
  }
  return {
    givenNames: parts.slice(0, -1).join(" "),
    surname: parts[parts.length - 1],
  };
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

    await saveOrderToFirestore(order);

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

    const hasXendit = isXenditConfigured();
    const hasPayMongo = isPayMongoConfigured();

    if (!hasXendit && !hasPayMongo) {
      await fulfillOrderInventory(order.id, coupon?.code ?? null);
      const paidOrder = {
        status: "paid" as const,
        payment: {
          ...order.payment,
          status: "paid",
          paidAt: new Date().toISOString(),
        },
      };
      updateOrder(order.id, paidOrder);
      await patchOrderInFirestore(order.id, paidOrder);
      reservedOrderId = null;

      return NextResponse.json({
        demo: true,
        orderId: order.id,
        orderNumber: order.orderNumber,
        checkoutUrl: successUrl,
        message: "No payment provider configured — demo checkout",
      });
    }

    if (hasXendit) {
      const { givenNames, surname } = splitCustomerName(body.shippingAddress.name);

      const session = await createXenditPaymentSession({
        referenceId: order.id,
        amountCentavos: totals.total,
        description: `Order ${order.orderNumber}${coupon ? ` (${coupon.code})` : ""}`,
        successUrl,
        cancelUrl,
        customer: {
          email: body.shippingAddress.email,
          phone: body.shippingAddress.phone,
          givenNames,
          surname,
        },
        metadata: {
          orderId: order.id,
          orderNumber: order.orderNumber,
          couponCode: coupon?.code ?? "",
        },
      });

      updateOrder(order.id, {
        payment: {
          ...order.payment,
          provider: "xendit",
          checkoutSessionId: session.sessionId,
          status: "awaiting_payment",
        },
      });

      await saveOrderToFirestore({
        ...order,
        payment: {
          ...order.payment,
          provider: "xendit",
          checkoutSessionId: session.sessionId,
          status: "awaiting_payment",
        },
      });

      return NextResponse.json({
        checkoutUrl: session.checkoutUrl,
        orderId: order.id,
        orderNumber: order.orderNumber,
        provider: "xendit",
      });
    }

    const ratio = totals.discount > 0 && totals.subtotal > 0
      ? (totals.subtotal - totals.discount) / totals.subtotal
      : 1;

    const lineItems = body.items.map((item) => ({
      name: item.variantName ? `${item.title} — ${item.variantName}` : item.title,
      amount: Math.max(100, Math.round(item.unitPrice * ratio)),
      currency: "PHP",
      quantity: item.qty,
    }));

    if (totals.shippingFee > 0) {
      lineItems.push({
        name: "Shipping",
        amount: totals.shippingFee,
        currency: "PHP",
        quantity: 1,
      });
    }

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
        provider: "paymongo",
        checkoutSessionId: session.sessionId,
        status: "awaiting_payment",
      },
    });

    return NextResponse.json({
      checkoutUrl: session.checkoutUrl,
      orderId: order.id,
      orderNumber: order.orderNumber,
      provider: "paymongo",
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
