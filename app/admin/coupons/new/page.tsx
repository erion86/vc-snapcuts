import dynamic from "next/dynamic";
import Link from "next/link";

const CouponForm = dynamic(
  () => import("@/components/admin/CouponForm").then((m) => m.CouponForm),
  {
    ssr: false,
    loading: () => <div className="skeleton h-96 rounded-2xl" />,
  }
);

export default function AdminNewCouponPage() {
  return (
    <div>
      <div className="mb-8">
        <Link href="/admin/coupons" className="font-sans text-sm text-ink-soft hover:text-ink">
          ← Back to coupons
        </Link>
        <h1 className="font-display text-display-md text-ink mt-2">Add coupon</h1>
      </div>
      <CouponForm />
    </div>
  );
}
