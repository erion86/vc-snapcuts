import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Container, Section, SectionHeader } from "@/components/ui/Container";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductDetailClient } from "@/components/product/ProductDetailClient";
import { ReviewSection } from "@/components/reviews/ReviewSection";
import { productJsonLd } from "@/lib/seo/json-ld";
import { siteConfig } from "@/config/site";
import {
  getAllProductSlugs,
  getProductBySlug,
  getRelatedProducts,
} from "@/lib/db/products";
import type { Metadata } from "next";

export const revalidate = 60;

interface ProductPageProps {
  params: { slug: string };
}

export async function generateStaticParams() {
  const slugs = await getAllProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  if (!product) return { title: "Product Not Found" };

  return {
    title: product.seo?.title ?? product.title,
    description: product.seo?.description ?? product.shortDescription,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProductBySlug(params.slug);

  if (!product) notFound();

  const related = await getRelatedProducts(product, 4);
  const productUrl = `${siteConfig.url.replace(/\/$/, "")}/product/${product.slug}`;
  const jsonLd = productJsonLd(product, productUrl);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main className="py-10 md:py-14">
        <Container>
          <nav className="font-sans text-sm text-ink-soft mb-8">
            <Link href="/shop" className="hover:text-ink transition-colors">Shop</Link>
            <span className="mx-2">/</span>
            <Link
              href={`/category/${product.category}`}
              className="hover:text-ink transition-colors capitalize"
            >
              {product.category}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-ink">{product.title}</span>
          </nav>

          <ProductDetailClient product={product} />
        </Container>

        {related.length > 0 && (
          <Section className="mt-16">
            <Container>
              <SectionHeader heading="You may also like" />
              <div className="product-grid">
                {related.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </Container>
          </Section>
        )}

        <Section className="mt-8">
          <Container>
            <ReviewSection productId={product.id} productSlug={product.slug} productTitle={product.title} />
          </Container>
        </Section>
      </main>
      <Footer />
    </>
  );
}
