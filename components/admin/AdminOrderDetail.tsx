"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Package, Truck } from "lucide-react";
import { getOrderByIdForAdmin, updateOrderForAdmin } from "@/lib/firebase/firestore";
import type { OrderRecord } from "@/lib/orders/store";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

const inputClass =
  "w-full h-11 px-4 rounded-xl border border-border bg-surface font-sans text-sm text-ink placeholder:text-ink-soft outline-none focus:[box-shadow:0_0_0_2px_hsl(var(--bg)),0_0_0_3px_hsl(var(--ring))]";

const COURIER_LABELS: Record<OrderRecord["courier"], string> = {
  jt: "J&T Express",
  lbc: "LBC",
};

export function AdminOrderDetail({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<OrderRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadOrder = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getOrderByIdForAdmin(orderId);
      setOrder(data);
      setTrackingNumber(data?.tracking?.number ?? "");
    } catch {
      setError("Could not load order.");
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    void loadOrder();
  }, [loadOrder]);

  async function syncPayment() {
    if (!order) return;
    setSyncing(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch("/api/checkout/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber: order.orderNumber }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Sync failed");
      setMessage(data.alreadyPaid ? "Order was already paid — stock synced." : "Payment confirmed and stock updated.");
      await loadOrder();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sync failed");
    } finally {
      setSyncing(false);
    }
  }

  async function updateStatus(
    status: OrderRecord["status"],
    note: string,
    tracking?: OrderRecord["tracking"]
  ) {
    if (!order) return;
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const at = new Date().toISOString();
      const timeline = [...(order.timeline ?? []), { status, at, note }];
      await updateOrderForAdmin(orderId, { status, timeline, tracking: tracking ?? order.tracking });
      setMessage(`Order marked as ${status}.`);
      await loadOrder();
    } catch {
      setError("Could not update order.");
    } finally {
      setSaving(false);
    }
  }

  async function markShipped() {
    if (!order || !trackingNumber.trim()) {
      setError("Enter a tracking number before marking shipped.");
      return;
    }
    await updateStatus("shipped", `Shipped via ${COURIER_LABELS[order.courier]}`, {
      courier: COURIER_LABELS[order.courier],
      number: trackingNumber.trim(),
    });
  }

  if (loading) {
    return <div className="skeleton h-64 rounded-2xl" />;
  }

  if (!order) {
    return (
      <div>
        <p className="font-sans text-ink-soft mb-4">Order not found.</p>
        <Button variant="outline" asChild>
          <Link href="/admin/orders">Back to orders</Link>
        </Button>
      </div>
    );
  }

  const addr = order.shippingAddress;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-2 font-sans text-sm text-ink-soft hover:text-ink mb-3"
          >
            <ArrowLeft className="h-4 w-4" />
            Orders
          </Link>
          <h1 className="font-display text-display-md text-ink">{order.orderNumber}</h1>
          <p className="font-sans text-sm text-ink-soft mt-1">
            Placed {new Date(order.createdAt).toLocaleString("en-PH")}
          </p>
        </div>
        <Badge variant={order.status === "paid" || order.status === "shipped" ? "success" : "default"}>
          {order.status}
        </Badge>
      </div>

      {message && <p className="font-sans text-sm text-secondary">{message}</p>}
      {error && <p className="font-sans text-sm text-sale">{error}</p>}

      {order.status === "pending" && order.payment.provider === "xendit" && (
        <div className="rounded-2xl border border-border bg-surface-alt p-4">
          <p className="font-sans text-sm text-ink-soft mb-3">
            Payment completed on Xendit but order still pending? Sync payment to decrement stock and mark paid.
          </p>
          <Button onClick={() => void syncPayment()} loading={syncing}>
            Sync payment from Xendit
          </Button>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <section className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="font-sans text-sm font-semibold text-ink mb-4 flex items-center gap-2">
            <Package className="h-4 w-4" />
            Items
          </h2>
          <ul className="divide-y divide-border">
            {order.items.map((item, i) => (
              <li key={i} className="py-3 flex justify-between gap-4 font-sans text-sm">
                <span className="text-ink">
                  {item.qty}× {item.title}
                  {item.variantName ? ` — ${item.variantName}` : ""}
                </span>
                <span className="text-ink tabular-nums shrink-0">{formatPrice(item.lineTotal)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 pt-4 border-t border-border font-sans text-sm space-y-1">
            <div className="flex justify-between text-ink-soft">
              <dt>Subtotal</dt>
              <dd className="tabular-nums">{formatPrice(order.subtotal)}</dd>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-ink-soft">
                <dt>Discount</dt>
                <dd className="tabular-nums">−{formatPrice(order.discount)}</dd>
              </div>
            )}
            <div className="flex justify-between text-ink-soft">
              <dt>Shipping</dt>
              <dd className="tabular-nums">{formatPrice(order.shippingFee)}</dd>
            </div>
            <div className="flex justify-between font-semibold text-ink pt-2">
              <dt>Total</dt>
              <dd className="tabular-nums">{formatPrice(order.total)}</dd>
            </div>
          </dl>
        </section>

        <section className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="font-sans text-sm font-semibold text-ink mb-4">Ship to</h2>
          <address className="font-sans text-sm text-ink-soft not-italic space-y-1">
            <p className="font-medium text-ink">{addr.name}</p>
            <p>{addr.line1}</p>
            {addr.line2 && <p>{addr.line2}</p>}
            <p>
              {addr.city}, {addr.province} {addr.postal}
            </p>
            <p>{addr.phone}</p>
            <p>{addr.email}</p>
          </address>
          <p className="font-sans text-xs text-ink-soft mt-4">
            Courier: {COURIER_LABELS[order.courier]}
          </p>
          {order.orderNotes && (
            <p className="font-sans text-xs text-ink-soft mt-2">Notes: {order.orderNotes}</p>
          )}
        </section>
      </div>

      {(order.status === "paid" || order.status === "processing") && (
        <section className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="font-sans text-sm font-semibold text-ink mb-4 flex items-center gap-2">
            <Truck className="h-4 w-4" />
            Fulfillment
          </h2>
          <div className="flex flex-wrap gap-3 mb-4">
            {order.status === "paid" && (
              <Button
                variant="outline"
                loading={saving}
                onClick={() => void updateStatus("processing", "Order is being prepared")}
              >
                Mark processing
              </Button>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 max-w-lg">
            <div className="flex-1">
              <label htmlFor="tracking" className="block font-sans text-sm font-medium text-ink mb-1.5">
                Tracking number
              </label>
              <input
                id="tracking"
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="J&T or LBC tracking #"
                className={inputClass}
              />
            </div>
            <div className="sm:pt-6">
              <Button loading={saving} onClick={() => void markShipped()}>
                Mark shipped
              </Button>
            </div>
          </div>
        </section>
      )}

      {order.tracking && (
        <p className="font-sans text-sm text-ink-soft">
          Tracking: <strong className="text-ink">{order.tracking.number}</strong> ({order.tracking.courier})
        </p>
      )}

      {order.timeline && order.timeline.length > 0 && (
        <section className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="font-sans text-sm font-semibold text-ink mb-4">Timeline</h2>
          <ul className="space-y-2 font-sans text-sm">
            {order.timeline.map((entry, i) => (
              <li key={i} className="text-ink-soft">
                <span className="text-ink font-medium capitalize">{entry.status}</span>
                {" · "}
                {new Date(entry.at).toLocaleString("en-PH")}
                {entry.note ? ` — ${entry.note}` : ""}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
