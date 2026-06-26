import { seedProducts } from "@/lib/data/seed-products";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";

export default function AdminProductsPage() {
  const products = seedProducts;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="font-display text-display-md text-ink">Products</h1>
        <p className="font-sans text-sm text-ink-soft">Catalog from seed data — Firestore CRUD coming next</p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border">
        <table className="w-full text-left font-sans text-sm">
          <thead className="bg-surface-alt border-b border-border">
            <tr>
              <th className="px-4 py-3 font-semibold text-ink">Product</th>
              <th className="px-4 py-3 font-semibold text-ink">Category</th>
              <th className="px-4 py-3 font-semibold text-ink">Price</th>
              <th className="px-4 py-3 font-semibold text-ink">Stock</th>
              <th className="px-4 py-3 font-semibold text-ink">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-surface">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-surface-alt/50">
                <td className="px-4 py-3 font-medium text-ink">{p.title}</td>
                <td className="px-4 py-3 text-ink-soft capitalize">{p.category}</td>
                <td className="px-4 py-3 tabular-nums">{formatPrice(p.price)}</td>
                <td className="px-4 py-3">
                  <span className={p.stock <= 10 ? "text-sale font-medium" : "text-ink"}>{p.stock}</span>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={p.status === "active" ? "success" : "default"}>{p.status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
