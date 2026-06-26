import dynamic from "next/dynamic";

const EditCouponClient = dynamic(
  () => import("@/components/admin/EditCouponClient").then((m) => m.EditCouponClient),
  {
    ssr: false,
    loading: () => <div className="skeleton h-96 rounded-2xl" />,
  }
);

export default function AdminEditCouponPage({ params }: { params: { code: string } }) {
  return <EditCouponClient code={params.code} />;
}
