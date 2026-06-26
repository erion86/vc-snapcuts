import dynamic from "next/dynamic";

const EditProductClient = dynamic(
  () => import("@/components/admin/EditProductClient").then((m) => m.EditProductClient),
  {
    ssr: false,
    loading: () => <div className="skeleton h-96 rounded-2xl" />,
  }
);

export default function AdminEditProductPage({ params }: { params: { id: string } }) {
  return <EditProductClient id={params.id} />;
}
