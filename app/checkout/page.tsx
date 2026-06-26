"use client";

import { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { CheckoutStepper } from "@/components/checkout/CheckoutStepper";
import { AddressForm } from "@/components/checkout/AddressForm";
import { ShippingOptions } from "@/components/checkout/ShippingOptions";
import { OrderSummaryRail } from "@/components/checkout/OrderSummaryRail";
import { CouponInput } from "@/components/cart/CouponInput";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/Button";
import type { CheckoutFormData, ShippingAddress } from "@/types/cart";

const emptyAddress: ShippingAddress = {
  name: "",
  email: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  province: "",
  postal: "",
};

export default function CheckoutPage() {
  const { items, totals, coupon, isHydrated } = useCart();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<CheckoutFormData>({
    address: emptyAddress,
    courier: "jt",
    orderNotes: "",
  });

  if (!isHydrated) {
    return (
      <>
        <Header />
        <main className="py-10"><Container><div className="skeleton h-96 rounded-2xl" /></Container></main>
        <Footer />
      </>
    );
  }

  if (items.length === 0) {
    return (
      <>
        <Header />
        <main className="py-10 md:py-14">
          <Container size="narrow" className="text-center py-16">
            <h1 className="font-display text-display-md text-ink mb-3">Nothing to checkout</h1>
            <p className="font-sans text-ink-soft mb-6">Your cart is empty.</p>
            <Button asChild><Link href="/shop">Go to shop</Link></Button>
          </Container>
        </main>
        <Footer />
      </>
    );
  }

  async function handlePayment() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          couponCode: coupon?.code ?? null,
          shippingAddress: form.address,
          courier: form.courier,
          orderNotes: form.orderNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Checkout failed");

      window.location.href = data.checkoutUrl as string;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
      setLoading(false);
    }
  }

  return (
    <>
      <Header />
      <main className="py-10 md:py-14">
        <Container>
          <h1 className="font-display text-display-md text-ink text-center mb-2">Checkout</h1>
          <CheckoutStepper currentStep={step} />

          <div className="grid lg:grid-cols-5 gap-10">
            <div className="lg:col-span-3">
              {step === 1 && (
                <div className="flex flex-col gap-6">
                  <h2 className="font-sans text-lg font-semibold text-ink">Contact &amp; shipping address</h2>
                  <AddressForm
                    value={form.address}
                    onChange={(address) => setForm((f) => ({ ...f, address }))}
                  />
                  <div className="flex justify-end">
                    <Button size="lg" onClick={() => setStep(2)}>Continue to shipping</Button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="flex flex-col gap-6">
                  <h2 className="font-sans text-lg font-semibold text-ink">Shipping method</h2>
                  <ShippingOptions
                    value={form.courier}
                    onChange={(courier) => setForm((f) => ({ ...f, courier }))}
                  />
                  <div>
                    <label htmlFor="notes" className="block font-sans text-sm font-medium text-ink mb-1.5">
                      Order notes (optional)
                    </label>
                    <textarea
                      id="notes"
                      rows={3}
                      value={form.orderNotes ?? ""}
                      onChange={(e) => setForm((f) => ({ ...f, orderNotes: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-surface font-sans text-sm text-ink outline-none focus:[box-shadow:0_0_0_2px_hsl(var(--bg)),0_0_0_3px_hsl(var(--ring))]"
                      placeholder="Special delivery instructions…"
                    />
                  </div>
                  <div className="flex justify-between gap-3">
                    <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                    <Button size="lg" onClick={() => setStep(3)}>Continue to payment</Button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="flex flex-col gap-6">
                  <h2 className="font-sans text-lg font-semibold text-ink">Payment</h2>
                  <p className="font-sans text-sm text-ink-soft leading-relaxed">
                    You&apos;ll be redirected to PayMongo to pay securely via GCash, Maya, Card, or GrabPay.
                    {!process.env.NEXT_PUBLIC_PAYMONGO_PUBLIC_KEY && (
                      <span className="block mt-2 text-xs">
                        Demo mode: PayMongo keys not set — you&apos;ll go straight to the success page.
                      </span>
                    )}
                  </p>

                  <div className="p-4 rounded-2xl bg-surface-alt border border-border font-sans text-sm text-ink-soft">
                    <p><strong className="text-ink">Ship to:</strong> {form.address.name}</p>
                    <p>{form.address.line1}{form.address.line2 ? `, ${form.address.line2}` : ""}</p>
                    <p>{form.address.city}, {form.address.province} {form.address.postal}</p>
                    <p className="mt-2">{form.address.email} · {form.address.phone}</p>
                  </div>

                  <div className="lg:hidden">
                    <CouponInput />
                  </div>

                  {error && <p className="font-sans text-sm text-sale">{error}</p>}

                  <div className="flex justify-between gap-3">
                    <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                    <Button size="lg" loading={loading} onClick={handlePayment}>
                      Pay {new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 }).format(totals.total / 100)}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-2 flex flex-col gap-6">
              <OrderSummaryRail />
              <div className="hidden lg:block">
                <CouponInput />
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/cart">← Back to cart</Link>
              </Button>
            </div>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
