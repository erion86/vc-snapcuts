import dynamic from "next/dynamic";
import Link from "next/link";
import { ProductForm } from "@/components/admin/ProductForm";

const AdminProductsTable = dynamic(
  () => import("@/components/admin/AdminProductsTable").then((m) => m.AdminProductsTable),
  {
    ssr: false,
    loading: () => <div className="skeleton h-64 rounded-2xl" />,
  }
);

export default function AdminProductsPage() {
  return <AdminProductsTable />;
}
