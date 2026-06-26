"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatPrice } from "@/lib/utils";
import { deleteProductClient, listAllProductsClient } from "@/lib/firebase/products-client";
import type { Product } from "@/types/product";

export function AdminProductsTable() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function loadProducts() {
    setLoading(true);
    setError(null);
    try {
      const list = await listAllProductsClient();
      setProducts(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load products");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;

    setDeletingId(id);
    try {
      await deleteProductClient(id);
      await fetch("/api/revalidate", { method: "POST" });
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete product");
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return <div className="skeleton h-64 rounded-2xl" />;
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-display-md text-ink">Products</h1>
          <p className="font-sans text-sm text-ink-soft mt-1">
            Manage your catalog in Firestore. Only <strong>active</strong> products appear in the shop.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">
            <Plus className="h-4 w-4" />
            Add product
          </Link>
        </Button>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-sale/30 bg-sale/10 px-4 py-3 font-sans text-sm text-sale">
          {error}
        </div>
      )}

      {products.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-dashed border-border bg-surface-alt">
          <p className="font-sans text-ink-soft mb-4">No products yet. Add your first item to open the shop.</p>
          <Button asChild>
            <Link href="/admin/products/new">Add product</Link>
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full text-left font-sans text-sm">
            <thead className="bg-surface-alt border-b border-border">
              <tr>
                <th className="px-4 py-3 font-semibold text-ink">Product</th>
                <th className="px-4 py-3 font-semibold text-ink">Category</th>
                <th className="px-4 py-3 font-semibold text-ink">Price</th>
                <th className="px-4 py-3 font-semibold text-ink">Stock</th>
                <th className="px-4 py-3 font-semibold text-ink">Status</th>
                <th className="px-4 py-3 font-semibold text-ink">Actions</th>
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
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/products/${p.id}/edit`}
                        className="inline-flex items-center gap-1 text-primary hover:text-primary-strong font-medium"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(p.id, p.title)}
                        disabled={deletingId === p.id}
                        className="inline-flex items-center gap-1 text-sale hover:text-sale/80 font-medium disabled:opacity-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
