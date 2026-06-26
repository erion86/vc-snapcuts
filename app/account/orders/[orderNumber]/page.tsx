"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { collection, getDocs, query, where } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";
import { formatPrice } from "@/lib/utils";

export default function OrderDetailPage() {
  const params = useParams();
  const orderNumber = params.orderNumber as string;
  const [order, setOrder] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const db = getFirebaseDb();
      if (!db) {
        setLoading(false);
        return;
      }
      const q = query(collection(db, "orders"), where("orderNumber", "==", orderNumber));
      const snap = await getDocs(q);
      if (!snap.empty) setOrder(snap.docs[0]!.data());
      setLoading(false);
    }
    void load();
  }, [orderNumber]);

  if (loading) return <div className="skeleton h-48 rounded-2xl" />;

  if (!order) {
    return (
      <div>
        <p className="font-sans text-ink-soft mb-4">
          Order not found. Orders appear here after checkout when saved to Firestore.
        </p>
        <Link href="/account/orders" className="font-sans text-sm text-primary">← Back to orders</Link>
      </div>
    );
  }

  const items = (order.items as { title: string; qty: number; lineTotal: number }[]) ?? [];
  const timeline = (order.timeline as { status: string; at: string; note?: string }[]) ?? [];

  return (
    <div>
      <Link href="/account/orders" className="font-sans text-sm text-ink-soft hover:text-ink mb-4 inline-block">
        ← Back to orders
      </Link>
      <h2 className="font-display text-display-sm text-ink mb-2">{orderNumber}</h2>
      <p className="font-sans text-sm text-ink-soft mb-6 capitalize">Status: {String(order.status)}</p>

      <div className="p-5 rounded-2xl border border-border bg-surface mb-6">
        <h3 className="font-sans text-sm font-semibold text-ink mb-3">Items</h3>
        <ul className="flex flex-col gap-2">
          {items.map((item, i) => (
            <li key={i} className="flex justify-between font-sans text-sm">
              <span className="text-ink-soft">{item.qty}× {item.title}</span>
              <span className="tabular-nums">{formatPrice(item.lineTotal)}</span>
            </li>
          ))}
        </ul>
        <p className="font-sans text-sm font-semibold flex justify-between mt-4 pt-3 border-t border-border">
          <span>Total</span>
          <span className="tabular-nums">{formatPrice(order.total as number)}</span>
        </p>
      </div>

      {timeline.length > 0 && (
        <div>
          <h3 className="font-sans text-sm font-semibold text-ink mb-3">Timeline</h3>
          <ul className="flex flex-col gap-2">
            {timeline.map((t, i) => (
              <li key={i} className="font-sans text-sm text-ink-soft capitalize">
                {t.status} — {t.note ?? new Date(t.at).toLocaleString()}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
