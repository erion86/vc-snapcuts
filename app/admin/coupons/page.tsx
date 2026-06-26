import dynamic from "next/dynamic";

const AdminCouponsTable = dynamic(
  () => import("@/components/admin/AdminCouponsTable").then((m) => m.AdminCouponsTable),
  {
    ssr: false,
    loading: () => <div className="skeleton h-64 rounded-2xl" />,
  }
);

export default function AdminCouponsPage() {
  return <AdminCouponsTable />;
}
