import dynamic from "next/dynamic";
import Link from "next/link";

const ProductForm = dynamic(
  () => import("@/components/admin/ProductForm").then((m) => m.ProductForm),
  {
    ssr: false,
    loading: () => <div className="skeleton h-96 rounded-2xl" />,
  }
);

export default function AdminNewProductPage() {
  return (
    <div>
      <div className="mb-8">
        <Link href="/admin/products" className="font-sans text-sm text-ink-soft hover:text-ink">
          ← Back to products
        </Link>
        <h1 className="font-display text-display-md text-ink mt-2">Add product</h1>
      </div>
      <ProductForm />
    </div>
  );
}
