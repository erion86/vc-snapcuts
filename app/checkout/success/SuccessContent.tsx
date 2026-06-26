"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/lib/utils";
import { CheckCircle } from "lucide-react";

interface OrderSummary {
  orderNumber: string;
  status: string;
  total: number;
  email: string;
  items: { title: string; qty: number; lineTotal: number }[];
}

export default function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order");
  const { clearCart } = useCart();
  const [order, setOrder] = useState<OrderSummary | null>(null);

  useEffect(() => {
    sessionStorage.removeItem("vc-snapcuts-pending-order");
    clearCart();
  }, [clearCart]);

  useEffect(() => {
    if (!orderNumber) return;

    fetch("/api/checkout/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderNumber }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null);

    fetch(`/api/orders/${orderNumber}`)
      .then((r) => (r.ok ? r.json() : null))
      .then(setOrder)
      .catch(() => null);
  }, [orderNumber]);

  return (
    <>
      <Header />
      <main className="py-10 md:py-14">
        <Container size="narrow" className="text-center py-12">
          <CheckCircle className="h-16 w-16 text-secondary mx-auto mb-6" strokeWidth={1.5} />

          <h1 className="font-display text-display-md text-ink mb-3">
            Thank you for your order!
          </h1>

          {orderNumber && (
            <p className="font-sans text-ink-soft mb-2">
              Order <strong className="text-ink">{orderNumber}</strong>
            </p>
          )}

          {order && (
            <div className="mt-6 p-6 bg-surface-alt rounded-2xl border border-border text-left">
              <p className="font-sans text-sm text-ink-soft mb-4">
                Confirmation sent to <strong className="text-ink">{order.email}</strong>
              </p>
              <ul className="flex flex-col gap-2 mb-4">
                {order.items.map((item, i) => (
                  <li key={i} className="flex justify-between font-sans text-sm">
                    <span className="text-ink-soft">{item.qty}× {item.title}</span>
                    <span className="text-ink tabular-nums">{formatPrice(item.lineTotal)}</span>
                  </li>
                ))}
              </ul>
              <p className="font-sans text-sm font-semibold text-ink flex justify-between border-t border-border pt-3">
                <span>Total paid</span>
                <span className="tabular-nums">{formatPrice(order.total)}</span>
              </p>
            </div>
          )}

          <p className="font-sans text-sm text-ink-soft mt-6 mb-8">
            We&apos;ll send a shipping update once your order is on its way.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild>
              <Link href="/shop">Continue shopping</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">Back to home</Link>
            </Button>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
