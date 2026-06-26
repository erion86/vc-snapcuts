import { validateCoupon } from "@/lib/coupons/validate";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const code = typeof body.code === "string" ? body.code : "";
    const subtotal = typeof body.subtotal === "number" ? body.subtotal : 0;

    const result = validateCoupon(code, subtotal);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { valid: false, error: "Invalid request" },
      { status: 400 }
    );
  }
}
