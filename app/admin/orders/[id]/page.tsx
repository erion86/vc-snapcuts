import { AdminOrderDetail } from "@/components/admin/AdminOrderDetail";

interface PageProps {
  params: { id: string };
}

export default function AdminOrderDetailPage({ params }: PageProps) {
  return <AdminOrderDetail orderId={params.id} />;
}
