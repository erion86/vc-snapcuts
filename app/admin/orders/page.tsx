"use client";

import { useEffect, useState } from "react";
import { getAllOrdersForAdmin } from "@/lib/firebase/firestore";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";

interface OrderRow {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  email: string;
  createdAt: string;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllOrdersForAdmin()
      .then(setOrders)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="font-display text-display-md text-ink mb-8">Orders</h1>

      {loading ? (
        <div className="skeleton h-40 rounded-2xl" />
      ) : orders.length === 0 ? (
        <p className="font-sans text-ink-soft">
          No orders in Firestore yet. Orders will appear after checkout saves them to the database.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full text-left font-sans text-sm">
            <thead className="bg-surface-alt border-b border-border">
              <tr>
                <th className="px-4 py-3 font-semibold text-ink">Order</th>
                <th className="px-4 py-3 font-semibold text-ink">Customer</th>
                <th className="px-4 py-3 font-semibold text-ink">Date</th>
                <th className="px-4 py-3 font-semibold text-ink">Status</th>
                <th className="px-4 py-3 font-semibold text-ink">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-surface">
              {orders.map((o) => (
                <tr key={o.id}>
                  <td className="px-4 py-3 font-medium text-ink">{o.orderNumber}</td>
                  <td className="px-4 py-3 text-ink-soft">{o.email}</td>
                  <td className="px-4 py-3 text-ink-soft">
                    {new Date(o.createdAt).toLocaleDateString("en-PH")}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={o.status === "paid" ? "success" : "default"}>{o.status}</Badge>
                  </td>
                  <td className="px-4 py-3 tabular-nums font-medium">{formatPrice(o.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
