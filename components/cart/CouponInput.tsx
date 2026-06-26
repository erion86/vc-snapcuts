"use client";

import { useState } from "react";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/Button";

export function CouponInput() {
  const { totals, coupon, applyCoupon } = useCart();
  const [code, setCode] = useState(coupon?.code ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleApply(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, subtotal: totals.subtotal }),
      });
      const data = await res.json();

      if (!data.valid) {
        setError(data.error ?? "Invalid coupon");
        applyCoupon(null);
        return;
      }

      applyCoupon(data.coupon);
      setCode(data.coupon.code);
    } catch {
      setError("Could not validate coupon. Try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleRemove() {
    setCode("");
    setError(null);
    applyCoupon(null);
  }

  return (
    <div className="flex flex-col gap-2 w-full min-w-0">
      <form onSubmit={handleApply} className="flex w-full min-w-0 gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Coupon code"
          disabled={!!coupon}
          className="min-w-0 flex-1 h-10 px-3 rounded-xl border border-border bg-surface font-sans text-sm text-ink placeholder:text-ink-soft outline-none focus:[box-shadow:0_0_0_2px_hsl(var(--bg)),0_0_0_3px_hsl(var(--ring))]"
        />
        {coupon ? (
          <Button type="button" variant="outline" size="md" className="shrink-0" onClick={handleRemove}>
            Remove
          </Button>
        ) : (
          <Button type="submit" variant="outline" size="md" className="shrink-0" loading={loading}>
            Apply
          </Button>
        )}
      </form>
      {error && <p className="font-sans text-xs text-sale">{error}</p>}
      {coupon && !error && (
        <p className="font-sans text-xs text-secondary-strong">
          Coupon {coupon.code} applied
        </p>
      )}
    </div>
  );
}
