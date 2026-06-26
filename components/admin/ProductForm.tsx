"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { categories } from "@/config/site";
import {
  createProductClient,
  slugify,
  updateProductClient,
  type ProductInput,
} from "@/lib/firebase/products-client";
import type { Product, ProductStatus } from "@/types/product";
import { cn } from "@/lib/utils";

const inputClass =
  "w-full rounded-xl border border-border bg-surface px-3 py-2.5 font-sans text-sm text-ink placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-primary/30";

const labelClass = "block font-sans text-xs font-semibold text-ink mb-1.5";

interface ProductFormProps {
  product?: Product;
}

const emptyForm: ProductInput = {
  slug:             "",
  title:            "",
  shortDescription: "",
  description:      "",
  category:         "planners",
  tags:             [],
  price:            0,
  compareAtPrice:   null,
  stock:            0,
  status:           "draft",
  isFeatured:       false,
  isNewArrival:     false,
  isBestSeller:     false,
  imagePublicId:    "",
  imageAlt:         "",
  materials:        "",
  shipping:         "",
};

async function revalidateCatalog() {
  await fetch("/api/revalidate", { method: "POST" });
}

export function ProductForm({ product }: ProductFormProps) {
  const router = useRouter();
  const isEdit = Boolean(product);

  const [form, setForm] = useState<ProductInput>(emptyForm);
  const [pricePesos, setPricePesos] = useState("");
  const [comparePesos, setComparePesos] = useState("");
  const [tagsText, setTagsText] = useState("");
  const [slugManual, setSlugManual] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!product) return;

    setForm({
      slug:             product.slug,
      title:            product.title,
      shortDescription: product.shortDescription,
      description:      product.description,
      category:         product.category,
      tags:             product.tags,
      price:            product.price,
      compareAtPrice:   product.compareAtPrice,
      stock:            product.stock,
      status:           product.status,
      isFeatured:       product.isFeatured,
      isNewArrival:     product.isNewArrival,
      isBestSeller:     product.isBestSeller,
      imagePublicId:    product.images[0]?.publicId ?? "",
      imageAlt:         product.images[0]?.alt ?? product.title,
      materials:        product.materials ?? "",
      shipping:         product.shipping ?? "",
    });
    setPricePesos(String(product.price / 100));
    setComparePesos(product.compareAtPrice ? String(product.compareAtPrice / 100) : "");
    setTagsText(product.tags.join(", "));
    setSlugManual(true);
  }, [product]);

  function updateField<K extends keyof ProductInput>(key: K, value: ProductInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleTitleChange(title: string) {
    updateField("title", title);
    if (!slugManual) {
      updateField("slug", slugify(title));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const price = Math.round(parseFloat(pricePesos || "0") * 100);
      const compareAtPrice = comparePesos.trim()
        ? Math.round(parseFloat(comparePesos) * 100)
        : null;

      if (!form.title.trim()) throw new Error("Title is required");
      if (!form.slug.trim()) throw new Error("Slug is required");
      if (price <= 0) throw new Error("Price must be greater than zero");

      const payload: ProductInput = {
        ...form,
        slug:             slugify(form.slug),
        title:            form.title.trim(),
        shortDescription: form.shortDescription.trim(),
        description:      form.description.trim(),
        tags:             tagsText.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean),
        price,
        compareAtPrice,
        materials:        form.materials?.trim() || undefined,
        shipping:         form.shipping?.trim() || undefined,
      };

      if (isEdit && product) {
        await updateProductClient(product.id, payload);
      } else {
        await createProductClient(payload);
      }

      await revalidateCatalog();
      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save product");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && (
        <div className="rounded-xl border border-sale/30 bg-sale/10 px-4 py-3 font-sans text-sm text-sale">
          {error}
        </div>
      )}

      <section className="space-y-4 p-5 rounded-2xl border border-border bg-surface">
        <h2 className="font-sans text-sm font-semibold text-ink">Basics</h2>

        <div>
          <label className={labelClass} htmlFor="title">Title</label>
          <input
            id="title"
            className={inputClass}
            value={form.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            required
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="slug">URL slug</label>
          <input
            id="slug"
            className={inputClass}
            value={form.slug}
            onChange={(e) => {
              setSlugManual(true);
              updateField("slug", e.target.value);
            }}
            required
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="shortDescription">Short description</label>
          <input
            id="shortDescription"
            className={inputClass}
            value={form.shortDescription}
            onChange={(e) => updateField("shortDescription", e.target.value)}
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="description">Full description</label>
          <textarea
            id="description"
            rows={5}
            className={cn(inputClass, "resize-y")}
            value={form.description}
            onChange={(e) => updateField("description", e.target.value)}
          />
        </div>
      </section>

      <section className="space-y-4 p-5 rounded-2xl border border-border bg-surface">
        <h2 className="font-sans text-sm font-semibold text-ink">Pricing & inventory</h2>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass} htmlFor="price">Price (₱)</label>
            <input
              id="price"
              type="number"
              min="0"
              step="0.01"
              className={inputClass}
              value={pricePesos}
              onChange={(e) => setPricePesos(e.target.value)}
              required
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="comparePrice">Compare-at price (₱)</label>
            <input
              id="comparePrice"
              type="number"
              min="0"
              step="0.01"
              className={inputClass}
              value={comparePesos}
              onChange={(e) => setComparePesos(e.target.value)}
              placeholder="Optional sale price"
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass} htmlFor="stock">Stock</label>
            <input
              id="stock"
              type="number"
              min="0"
              className={inputClass}
              value={form.stock}
              onChange={(e) => updateField("stock", parseInt(e.target.value, 10) || 0)}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="status">Status</label>
            <select
              id="status"
              className={inputClass}
              value={form.status}
              onChange={(e) => updateField("status", e.target.value as ProductStatus)}
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        <div>
          <label className={labelClass} htmlFor="category">Category</label>
          <select
            id="category"
            className={inputClass}
            value={form.category}
            onChange={(e) => updateField("category", e.target.value)}
          >
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass} htmlFor="tags">Tags (comma-separated)</label>
          <input
            id="tags"
            className={inputClass}
            value={tagsText}
            onChange={(e) => setTagsText(e.target.value)}
            placeholder="new, gift, bestseller"
          />
        </div>
      </section>

      <section className="space-y-4 p-5 rounded-2xl border border-border bg-surface">
        <h2 className="font-sans text-sm font-semibold text-ink">Image</h2>
        <p className="font-sans text-xs text-ink-soft">
          Paste a Cloudinary public ID or full image URL.
        </p>

        <div>
          <label className={labelClass} htmlFor="imagePublicId">Image public ID / URL</label>
          <input
            id="imagePublicId"
            className={inputClass}
            value={form.imagePublicId}
            onChange={(e) => updateField("imagePublicId", e.target.value)}
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="imageAlt">Image alt text</label>
          <input
            id="imageAlt"
            className={inputClass}
            value={form.imageAlt}
            onChange={(e) => updateField("imageAlt", e.target.value)}
          />
        </div>
      </section>

      <section className="space-y-3 p-5 rounded-2xl border border-border bg-surface">
        <h2 className="font-sans text-sm font-semibold text-ink">Highlights</h2>
        {(
          [
            ["isFeatured", "Featured on home"],
            ["isNewArrival", "New arrival"],
            ["isBestSeller", "Best seller"],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="flex items-center gap-2 font-sans text-sm text-ink cursor-pointer">
            <input
              type="checkbox"
              checked={form[key]}
              onChange={(e) => updateField(key, e.target.checked)}
              className="rounded border-border"
            />
            {label}
          </label>
        ))}
      </section>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" loading={saving}>
          {isEdit ? "Save changes" : "Create product"}
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/admin/products">Cancel</Link>
        </Button>
      </div>
    </form>
  );
}
