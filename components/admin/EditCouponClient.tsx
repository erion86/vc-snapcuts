"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CouponForm } from "@/components/admin/CouponForm";
import { getCouponByCodeClient } from "@/lib/firebase/coupons-client";
import type { Coupon } from "@/types/coupon";

interface EditCouponClientProps {
  code: string;
}

export function EditCouponClient({ code }: EditCouponClientProps) {
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    getCouponByCodeClient(decodeURIComponent(code))
      .then((c) => {
        if (!c) setNotFound(true);
        else setCoupon(c);
      })
      .finally(() => setLoading(false));
  }, [code]);

  if (loading) return <div className="skeleton h-96 rounded-2xl" />;

  if (notFound || !coupon) {
    return (
      <div className="text-center py-12">
        <p className="font-sans text-ink-soft mb-4">Coupon not found.</p>
        <Link href="/admin/coupons" className="font-sans text-sm text-primary hover:text-primary-strong">
          Back to coupons
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <Link href="/admin/coupons" className="font-sans text-sm text-ink-soft hover:text-ink">
          ← Back to coupons
        </Link>
        <h1 className="font-display text-display-md text-ink mt-2">Edit coupon</h1>
        <p className="font-sans text-sm text-ink-soft mt-1">{coupon.code}</p>
      </div>
      <CouponForm coupon={coupon} />
    </div>
  );
}
