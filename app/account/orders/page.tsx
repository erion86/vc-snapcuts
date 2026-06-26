"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthProvider";
import { getUserOrdersByEmail } from "@/lib/firebase/firestore";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";

interface OrderRow {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
}

export default function AccountOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.email) return;
    getUserOrdersByEmail(user.email)
      .then(setOrders)
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return <div className="skeleton h-40 rounded-2xl" />;

  if (orders.length === 0) {
    return (
      <div>
        <h2 className="font-display text-display-sm text-ink mb-4">Orders</h2>
        <p className="font-sans text-ink-soft mb-4">No orders yet.</p>
        <Link href="/shop" className="font-sans text-sm font-semibold text-primary">Start shopping</Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-display text-display-sm text-ink mb-6">Orders</h2>
      <ul className="flex flex-col gap-3">
        {orders.map((order) => (
          <li key={order.id}>
            <Link
              href={`/account/orders/${order.orderNumber}`}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-border bg-surface hover:border-primary/30 transition-colors"
            >
              <div>
                <p className="font-sans text-sm font-semibold text-ink">{order.orderNumber}</p>
                <p className="font-sans text-xs text-ink-soft">
                  {new Date(order.createdAt).toLocaleDateString("en-PH", {
                    year: "numeric", month: "short", day: "numeric",
                  })}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={order.status === "paid" ? "success" : "default"}>
                  {order.status}
                </Badge>
                <span className="font-sans text-sm font-semibold tabular-nums">{formatPrice(order.total)}</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
