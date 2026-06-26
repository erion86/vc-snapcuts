import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Container, SectionHeader } from "@/components/ui/Container";
import { ProductCard } from "@/components/product/ProductCard";
import { getCategoryBySlug, getProducts } from "@/lib/db/products";
import type { Metadata } from "next";

export const revalidate = 60;

interface CategoryPageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const category = await getCategoryBySlug(params.slug);
  if (!category) return { title: "Category Not Found" };
  return {
    title: category.name,
    description: category.description,
  };
}

export async function generateStaticParams() {
  const { categories } = await import("@/config/site");
  return categories.map((c) => ({ slug: c.slug }));
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const category = await getCategoryBySlug(params.slug);

  if (!category) notFound();

  const products = await getProducts({ category: params.slug });

  return (
    <>
      <Header />
      <main className="py-10 md:py-14">
        <Container>
          <nav className="font-sans text-sm text-ink-soft mb-6">
            <Link href="/shop" className="hover:text-ink transition-colors">Shop</Link>
            <span className="mx-2">/</span>
            <span className="text-ink">{category.name}</span>
          </nav>

          <SectionHeader
            heading={category.name}
            sub={category.description}
          />

          {products.length === 0 ? (
            <div className="text-center py-16">
              <p className="font-display text-display-sm text-ink mb-2">No products yet</p>
              <p className="font-sans text-sm text-ink-soft mb-6">
                Check back soon — new items are added regularly.
              </p>
              <Link href="/shop" className="font-sans text-sm font-semibold text-primary hover:text-primary-strong">
                Browse all products
              </Link>
            </div>
          ) : (
            <div className="product-grid">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </Container>
      </main>
      <Footer />
    </>
  );
}
