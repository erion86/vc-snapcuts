"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { categories } from "@/config/site";
import { cn } from "@/lib/utils";
import { ProductCard } from "@/components/product/ProductCard";
import type { Product } from "@/types/product";
import type { ProductSort } from "@/types/product";

interface ShopClientProps {
  products: Product[];
  initialFilter?: string;
  initialTag?: string;
  initialSort?: ProductSort;
  initialSearch?: string;
  pageTitle?: string;
}

const sortOptions: { value: ProductSort; label: string }[] = [
  { value: "new", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
  { value: "title", label: "A–Z" },
];

export function ShopClient({
  products,
  initialFilter,
  initialTag,
  initialSort = "new",
  initialSearch = "",
  pageTitle = "Shop",
}: ShopClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [search, setSearch] = useState(initialSearch);
  const [sort, setSort] = useState<ProductSort>(initialSort);
  const [category, setCategory] = useState<string | undefined>(
    searchParams.get("category") ?? undefined
  );
  const [inStock, setInStock] = useState(false);

  const filter = initialFilter ?? searchParams.get("filter") ?? undefined;
  const tag = initialTag ?? searchParams.get("tag") ?? undefined;

  const filtered = useMemo(() => {
    let results = [...products];

    if (filter === "new") results = results.filter((p) => p.isNewArrival);
    if (filter === "bestseller") results = results.filter((p) => p.isBestSeller);
    if (filter === "featured") results = results.filter((p) => p.isFeatured);
    if (filter === "sale") results = results.filter((p) => p.compareAtPrice != null);

    if (tag) results = results.filter((p) => p.tags.includes(tag));
    if (category) results = results.filter((p) => p.category === category);
    if (inStock) results = results.filter((p) => p.stock > 0);

    if (search.trim()) {
      const q = search.toLowerCase();
      results = results.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.shortDescription.toLowerCase().includes(q)
      );
    }

    results.sort((a, b) => {
      switch (sort) {
        case "price-asc": return a.price - b.price;
        case "price-desc": return b.price - a.price;
        case "rating": return b.rating.average - a.rating.average;
        case "title": return a.title.localeCompare(b.title);
        default: return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return results;
  }, [products, filter, tag, category, inStock, search, sort]);

  const activeChips = [
    filter && { key: "filter", label: filter === "new" ? "New Arrivals" : filter === "bestseller" ? "Best Sellers" : filter },
    tag && { key: "tag", label: `#${tag}` },
    category && { key: "category", label: categories.find((c) => c.slug === category)?.name ?? category },
    inStock && { key: "stock", label: "In stock" },
  ].filter(Boolean) as { key: string; label: string }[];

  function clearChip(key: string) {
    if (key === "category") setCategory(undefined);
    if (key === "stock") setInStock(false);
    if (key === "filter" || key === "tag") router.push("/shop");
  }

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <p className="font-sans text-sm text-ink-soft">
          {filtered.length} {filtered.length === 1 ? "product" : "products"}
          {pageTitle !== "Shop" && ` in ${pageTitle}`}
        </p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-border bg-surface font-sans text-sm font-medium text-ink hover:bg-surface-alt transition-colors md:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </button>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as ProductSort)}
            className="h-10 px-3 rounded-xl border border-border bg-surface font-sans text-sm text-ink outline-none focus:[box-shadow:0_0_0_2px_hsl(var(--bg)),0_0_0_3px_hsl(var(--ring))]"
            aria-label="Sort products"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search planners, stickers, journals…"
          className="w-full h-11 px-4 rounded-xl border border-border bg-surface font-sans text-sm text-ink placeholder:text-ink-soft outline-none focus:[box-shadow:0_0_0_2px_hsl(var(--bg)),0_0_0_3px_hsl(var(--ring))]"
        />
      </div>

      {/* Active filter chips */}
      {activeChips.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {activeChips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={() => clearChip(chip.key)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-alt border border-border font-sans text-xs font-medium text-ink hover:bg-primary/10 transition-colors"
            >
              {chip.label}
              <X className="h-3 w-3" />
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-8">
        {/* Desktop sidebar filters */}
        <aside className="hidden md:block w-52 flex-shrink-0">
          <FilterPanel
            category={category}
            inStock={inStock}
            onCategoryChange={setCategory}
            onInStockChange={setInStock}
          />
        </aside>

        {/* Grid */}
        <div className="flex-1 min-w-0">
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <p className="font-display text-display-sm text-ink mb-2">No products found</p>
              <p className="font-sans text-sm text-ink-soft">Try adjusting your filters or search.</p>
            </div>
          ) : (
            <div className="product-grid">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-ink/30 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-surface rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto animate-slide-in-right">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-display-sm text-ink">Filters</h2>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close filters"
              >
                <X className="h-5 w-5 text-ink" />
              </button>
            </div>
            <FilterPanel
              category={category}
              inStock={inStock}
              onCategoryChange={setCategory}
              onInStockChange={setInStock}
            />
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="w-full mt-6 h-11 rounded-xl bg-primary text-white font-sans font-semibold text-sm"
            >
              Show {filtered.length} products
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function FilterPanel({
  category,
  inStock,
  onCategoryChange,
  onInStockChange,
}: {
  category?: string;
  inStock: boolean;
  onCategoryChange: (v: string | undefined) => void;
  onInStockChange: (v: boolean) => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="font-sans text-xs font-bold uppercase tracking-widest text-ink-soft mb-3">
          Category
        </h3>
        <ul className="flex flex-col gap-1">
          <li>
            <button
              type="button"
              onClick={() => onCategoryChange(undefined)}
              className={cn(
                "w-full text-left px-3 py-2 rounded-lg font-sans text-sm transition-colors",
                !category ? "bg-surface-alt text-ink font-medium" : "text-ink-soft hover:bg-surface-alt"
              )}
            >
              All
            </button>
          </li>
          {categories.map((cat) => (
            <li key={cat.slug}>
              <button
                type="button"
                onClick={() => onCategoryChange(cat.slug)}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-lg font-sans text-sm transition-colors",
                  category === cat.slug ? "bg-surface-alt text-ink font-medium" : "text-ink-soft hover:bg-surface-alt"
                )}
              >
                {cat.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={inStock}
            onChange={(e) => onInStockChange(e.target.checked)}
            className="h-4 w-4 rounded border-border accent-primary"
          />
          <span className="font-sans text-sm text-ink">In stock only</span>
        </label>
      </div>
    </div>
  );
}
