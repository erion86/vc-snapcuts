"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
import type { AppliedCoupon, CheckoutFormData, ShippingAddress } from "@/types/cart";
import {
  validateShippingAddress,
  type ShippingAddressErrors,
} from "@/lib/validators/shipping-address";

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

const PENDING_ORDER_KEY = "vc-snapcuts-pending-order";

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const { items, totals, coupon, isHydrated, applyCoupon, refreshCartStock } = useCart();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [checkoutReady, setCheckoutReady] = useState(true);
  const [form, setForm] = useState<CheckoutFormData>({
    address: emptyAddress,
    courier: "jt",
    orderNotes: "",
  });
  const [addressErrors, setAddressErrors] = useState<ShippingAddressErrors>({});

  const runCheckoutValidation = useCallback(async () => {
    if (items.length === 0) return { valid: false, errors: ["Your cart is empty"] };

    setValidating(true);
    try {
      await refreshCartStock();

      const res = await fetch("/api/checkout/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          couponCode: coupon?.code ?? null,
        }),
      });

      const data = await res.json();
      const errors = (data.errors as string[]) ?? [];
      setValidationErrors(errors);
      setCheckoutReady(Boolean(data.valid));

      if (data.coupon) {
        applyCoupon(data.coupon as AppliedCoupon);
      } else if (coupon && errors.some((e) => e.toLowerCase().includes("coupon"))) {
        applyCoupon(null);
      }

      return { valid: Boolean(data.valid), errors };
    } catch {
      setCheckoutReady(false);
      setValidationErrors(["Could not verify stock and coupon. Try again."]);
      return { valid: false, errors: ["Could not verify stock and coupon. Try again."] };
    } finally {
      setValidating(false);
    }
  }, [items, coupon, applyCoupon, refreshCartStock]);

  useEffect(() => {
    if (searchParams.get("cancelled") !== "1") return;

    const orderId =
      searchParams.get("orderId") ?? sessionStorage.getItem(PENDING_ORDER_KEY);

    if (orderId) {
      fetch("/api/checkout/release", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      }).catch(() => {});
      sessionStorage.removeItem(PENDING_ORDER_KEY);
    }

    setError("Payment was cancelled. Your reserved items have been released.");
    setStep(3);
  }, [searchParams]);

  useEffect(() => {
    if (!isHydrated || step !== 3 || items.length === 0) return;

    runCheckoutValidation();
    const interval = setInterval(() => {
      runCheckoutValidation();
    }, 30_000);

    return () => clearInterval(interval);
  }, [isHydrated, step, items.length, runCheckoutValidation]);

  function updateAddress(address: ShippingAddress) {
    setForm((f) => ({ ...f, address }));
    if (Object.keys(addressErrors).length > 0) {
      setAddressErrors(validateShippingAddress(address).errors);
    }
  }

  async function goToShippingStep() {
    const result = validateShippingAddress(form.address);
    if (!result.valid) {
      setAddressErrors(result.errors);
      setError(result.message);
      return;
    }
    setAddressErrors({});
    setError(null);
    setStep(2);
  }

  async function goToPaymentStep() {
    const result = validateShippingAddress(form.address);
    if (!result.valid) {
      setAddressErrors(result.errors);
      setError(result.message);
      setStep(1);
      return;
    }

    await refreshCartStock();
    const validation = await runCheckoutValidation();
    if (!validation.valid) {
      setError(validation.errors[0] ?? "Some items in your cart are no longer available.");
      return;
    }

    setAddressErrors({});
    setError(null);
    setStep(3);
  }

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

    const addressResult = validateShippingAddress(form.address);
    if (!addressResult.valid) {
      setAddressErrors(addressResult.errors);
      setError(addressResult.message);
      setStep(1);
      setLoading(false);
      return;
    }

    const validation = await runCheckoutValidation();
    if (!validation.valid) {
      setError(validation.errors[0] ?? "Please update your cart before paying.");
      setLoading(false);
      return;
    }

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

      if (data.orderId) {
        sessionStorage.setItem(PENDING_ORDER_KEY, data.orderId as string);
      }

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

          {!checkoutReady && step >= 2 && validationErrors.length > 0 && (
            <div className="mb-6 rounded-xl border border-sale/30 bg-sale/10 px-4 py-3 font-sans text-sm text-sale">
              <p className="font-semibold mb-1">Please review your cart</p>
              <ul className="list-disc pl-5 space-y-1">
                {validationErrors.map((msg) => (
                  <li key={msg}>{msg}</li>
                ))}
              </ul>
              <Link href="/cart" className="inline-block mt-2 underline">
                Update cart
              </Link>
            </div>
          )}

          <div className="grid lg:grid-cols-5 gap-10">
            <div className="lg:col-span-3">
              {step === 1 && (
                <form
                  className="flex flex-col gap-6"
                  onSubmit={(e) => {
                    e.preventDefault();
                    void goToShippingStep();
                  }}
                  noValidate
                >
                  <h2 className="font-sans text-lg font-semibold text-ink">Contact &amp; shipping address</h2>
                  <p className="font-sans text-xs text-ink-soft -mt-4">
                    Fields marked with <span className="text-sale">*</span> are required for shipping.
                  </p>
                  <AddressForm
                    value={form.address}
                    onChange={updateAddress}
                    errors={addressErrors}
                  />
                  {error && step === 1 && (
                    <p className="font-sans text-sm text-sale">{error}</p>
                  )}
                  <div className="flex justify-end">
                    <Button type="submit" size="lg">Continue to shipping</Button>
                  </div>
                </form>
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
                    <Button variant="outline" type="button" onClick={() => setStep(1)}>Back</Button>
                    <Button size="lg" type="button" onClick={() => void goToPaymentStep()}>
                      Continue to payment
                    </Button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="flex flex-col gap-6">
                  <h2 className="font-sans text-lg font-semibold text-ink">Payment</h2>
                  <p className="font-sans text-sm text-ink-soft leading-relaxed">
                    You&apos;ll be redirected to PayMongo to pay securely via GCash, Maya, Card, or GrabPay.
                    Stock is reserved for 30 minutes once you continue to payment.
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

                  {validating && (
                    <p className="font-sans text-xs text-ink-soft">Checking stock and coupon…</p>
                  )}

                  {error && <p className="font-sans text-sm text-sale">{error}</p>}

                  <div className="flex justify-between gap-3">
                    <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                    <Button
                      size="lg"
                      loading={loading}
                      disabled={!checkoutReady || validating}
                      onClick={() => void handlePayment()}
                    >
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
