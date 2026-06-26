"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getPendingReviews } from "@/lib/firebase/firestore";
import { listAllProductsClient } from "@/lib/firebase/products-client";

export default function AdminDashboardPage() {
  const [pendingReviews, setPendingReviews] = useState(0);
  const [activeProducts, setActiveProducts] = useState(0);
  const [lowStock, setLowStock] = useState(0);

  useEffect(() => {
    getPendingReviews().then((r) => setPendingReviews(r.length));

    listAllProductsClient().then((products) => {
      setActiveProducts(products.filter((p) => p.status === "active").length);
      setLowStock(products.filter((p) => p.stock > 0 && p.stock <= 10).length);
    });
  }, []);

  return (
    <div>
      <h1 className="font-display text-display-md text-ink mb-8">Dashboard</h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        <StatCard label="Active products" value={String(activeProducts)} href="/admin/products" />
        <StatCard label="Low stock (≤10)" value={String(lowStock)} href="/admin/products" alert={lowStock > 0} />
        <StatCard label="Pending reviews" value={String(pendingReviews)} href="/admin/reviews" alert={pendingReviews > 0} />
      </div>

      <div className="p-5 rounded-2xl border border-border bg-surface-alt">
        <h2 className="font-sans text-sm font-semibold text-ink mb-2">Catalog</h2>
        <p className="font-sans text-sm text-ink-soft leading-relaxed">
          Products are stored in Firestore. Add items from the{" "}
          <Link href="/admin/products/new" className="text-primary hover:text-primary-strong">
            Products
          </Link>{" "}
          tab — set status to <code className="text-xs bg-surface px-1 rounded">active</code> to publish to the shop.
        </p>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  href,
  alert,
}: {
  label: string;
  value: string;
  href: string;
  alert?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`p-5 rounded-2xl border bg-surface transition-colors hover:border-primary/30 ${
        alert ? "border-sale/40" : "border-border"
      }`}
    >
      <p className="font-sans text-xs text-ink-soft uppercase tracking-wider mb-1">{label}</p>
      <p className="font-display text-display-sm text-ink">{value}</p>
    </Link>
  );
}
