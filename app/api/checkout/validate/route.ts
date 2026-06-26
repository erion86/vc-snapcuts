import { validateCheckoutCart } from "@/lib/checkout/validate-checkout";
import type { CartItem } from "@/types/cart";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const items = (body.items ?? []) as CartItem[];
    const couponCode =
      typeof body.couponCode === "string" ? body.couponCode : null;

    const result = await validateCheckoutCart(items, couponCode);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { valid: false, errors: ["Could not validate checkout"], coupon: null },
      { status: 500 }
    );
  }
}
