"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatPrice } from "@/lib/utils";
import { deleteCouponClient, listAllCouponsClient } from "@/lib/firebase/coupons-client";
import type { Coupon } from "@/types/coupon";

function formatDiscount(coupon: Coupon): string {
  if (coupon.type === "free_shipping") return "Free shipping";
  if (coupon.type === "percent") return `${coupon.value}% off`;
  return `${formatPrice(coupon.value)} off`;
}

function isExpired(coupon: Coupon): boolean {
  return Date.now() > new Date(coupon.expiresAt).getTime();
}

export function AdminCouponsTable() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingCode, setDeletingCode] = useState<string | null>(null);

  async function loadCoupons() {
    setLoading(true);
    setError(null);
    try {
      const list = await listAllCouponsClient();
      setCoupons(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load coupons");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCoupons();
  }, []);

  async function handleDelete(code: string) {
    if (!confirm(`Delete coupon "${code}"? This cannot be undone.`)) return;

    setDeletingCode(code);
    try {
      await deleteCouponClient(code);
      setCoupons((prev) => prev.filter((c) => c.code !== code));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete coupon");
    } finally {
      setDeletingCode(null);
    }
  }

  if (loading) {
    return <div className="skeleton h-64 rounded-2xl" />;
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-display-md text-ink">Coupons</h1>
          <p className="font-sans text-sm text-ink-soft mt-1">
            Create discount codes for cart and checkout. Only <strong>active</strong> codes within their date range can be used.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/coupons/new">
            <Plus className="h-4 w-4" />
            Add coupon
          </Link>
        </Button>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-sale/30 bg-sale/10 px-4 py-3 font-sans text-sm text-sale">
          {error}
        </div>
      )}

      {coupons.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-dashed border-border bg-surface-alt">
          <p className="font-sans text-ink-soft mb-2">No coupons yet.</p>
          <p className="font-sans text-xs text-ink-soft mb-4">
            Create codes like FIRST10 (10% off) or FREESHIP (free shipping over ₱500).
          </p>
          <Button asChild>
            <Link href="/admin/coupons/new">Create your first coupon</Link>
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-4 py-3 font-sans text-xs font-semibold text-ink-soft">Code</th>
                <th className="px-4 py-3 font-sans text-xs font-semibold text-ink-soft">Discount</th>
                <th className="px-4 py-3 font-sans text-xs font-semibold text-ink-soft">Min spend</th>
                <th className="px-4 py-3 font-sans text-xs font-semibold text-ink-soft">Usage</th>
                <th className="px-4 py-3 font-sans text-xs font-semibold text-ink-soft">Status</th>
                <th className="px-4 py-3 font-sans text-xs font-semibold text-ink-soft sr-only">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => (
                <tr key={coupon.code} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-sans text-sm font-semibold text-ink">{coupon.code}</td>
                  <td className="px-4 py-3 font-sans text-sm text-ink-soft">{formatDiscount(coupon)}</td>
                  <td className="px-4 py-3 font-sans text-sm text-ink-soft tabular-nums">
                    {coupon.minSpend > 0 ? formatPrice(coupon.minSpend) : "—"}
                  </td>
                  <td className="px-4 py-3 font-sans text-sm text-ink-soft tabular-nums">
                    {coupon.usedCount} / {coupon.usageLimit}
                  </td>
                  <td className="px-4 py-3">
                    {!coupon.active ? (
                      <Badge variant="outline">Inactive</Badge>
                    ) : isExpired(coupon) ? (
                      <Badge variant="outline">Expired</Badge>
                    ) : coupon.usedCount >= coupon.usageLimit ? (
                      <Badge variant="outline">Limit reached</Badge>
                    ) : (
                      <Badge>Active</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin/coupons/${encodeURIComponent(coupon.code)}/edit`}>
                          <Pencil className="h-4 w-4" />
                          Edit
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-sale hover:text-sale"
                        disabled={deletingCode === coupon.code}
                        onClick={() => handleDelete(coupon.code)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
