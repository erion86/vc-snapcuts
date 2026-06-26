import { Suspense } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Container, SectionHeader } from "@/components/ui/Container";
import { ShopClient } from "@/components/shop/ShopClient";
import { getProducts } from "@/lib/db/products";
import type { Metadata } from "next";
import type { ProductSort } from "@/lib/db/products";

export const metadata: Metadata = {
  title: "Shop All Products",
  description: "Browse handmade planners, stickers, journals, and scrapbooking supplies.",
};

export const revalidate = 60;

interface ShopPageProps {
  searchParams: {
    filter?: string;
    tag?: string;
    sort?: ProductSort;
    q?: string;
  };
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const products = await getProducts({
    filter: searchParams.filter as "new" | "bestseller" | "featured" | "sale" | undefined,
    tag: searchParams.tag,
    sort: searchParams.sort,
    search: searchParams.q,
  });

  const pageTitle =
    searchParams.filter === "new" ? "New Arrivals" :
    searchParams.filter === "bestseller" ? "Best Sellers" :
    searchParams.filter === "sale" ? "On Sale" :
    "Shop";

  return (
    <>
      <Header />
      <main className="py-10 md:py-14">
        <Container>
          <SectionHeader
            eyebrow="Collection"
            heading={pageTitle}
            sub="Handmade planners, stickers, journals & more — crafted with care in the Philippines."
          />
          <Suspense fallback={<ShopSkeleton />}>
            <ShopClient
              products={products}
              initialFilter={searchParams.filter}
              initialTag={searchParams.tag}
              initialSort={searchParams.sort}
              initialSearch={searchParams.q}
              pageTitle={pageTitle}
            />
          </Suspense>
        </Container>
      </main>
      <Footer />
    </>
  );
}

function ShopSkeleton() {
  return (
    <div className="product-grid">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-3">
          <div className="skeleton aspect-[4/5] rounded-2xl" />
          <div className="skeleton h-4 w-3/4 rounded" />
          <div className="skeleton h-4 w-1/2 rounded" />
        </div>
      ))}
    </div>
  );
}
