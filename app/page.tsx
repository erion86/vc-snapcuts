import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Container, Section, SectionHeader } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { ProductRail } from "@/components/home/ProductRail";
import { FeaturedBlock } from "@/components/home/FeaturedBlock";
import { BestSellerGrid } from "@/components/home/BestSellerGrid";
import { TestimonialStrip } from "@/components/home/TestimonialStrip";
import { InstagramGallery } from "@/components/home/InstagramGallery";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { organizationJsonLd } from "@/lib/seo/json-ld";
import {
  getBestSellers,
  getFeaturedProducts,
  getNewArrivals,
} from "@/lib/db/products";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Handmade Planners, Stickers & Journals — V&C Snapcuts",
};

export const revalidate = 60;

export default async function HomePage() {
  const [newArrivals, featured, bestSellers] = await Promise.all([
    getNewArrivals(6),
    getFeaturedProducts(1),
    getBestSellers(4),
  ]);

  const featuredProduct = featured[0];
  const orgLd = organizationJsonLd();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgLd) }}
      />
      <Header />

      <main>
        {/* Hero */}
        <section className="relative min-h-[85svh] flex items-center justify-center bg-surface-alt overflow-hidden texture-paper">
          <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-secondary/10 blur-3xl pointer-events-none" />

          <Container className="relative text-center flex flex-col items-center gap-6 py-24">
            <p className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-primary animate-fade-up">
              Handmade in the Philippines
            </p>

            <h1 className="font-display text-display-xl text-ink max-w-2xl animate-fade-up [animation-delay:60ms]">
              Made to be{" "}
              <em className="not-italic text-primary">held,</em>
              <br />
              written in,{" "}
              <em className="not-italic text-secondary">loved.</em>
            </h1>

            <p className="font-sans text-base md:text-lg text-ink-soft max-w-lg animate-fade-up [animation-delay:120ms]">
              Planners, stickers, journals &amp; scrapbooking supplies —
              each one crafted by hand, shipped with care.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 animate-fade-up [animation-delay:180ms]">
              <Button size="lg" variant="primary" asChild>
                <a href="/shop">Shop the Collection</a>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="/shop?filter=new">New Arrivals</a>
              </Button>
            </div>

            <p className="font-sans text-xs text-ink-soft animate-fade-up [animation-delay:240ms]">
              Loved by <strong>2,000+</strong> customers
            </p>
          </Container>
        </section>

        {/* Categories */}
        <ScrollReveal>
          <Section>
            <Container>
              <SectionHeader
                eyebrow="Browse"
                heading="Shop by Category"
                action={
                  <Button variant="outline" size="sm" asChild>
                    <a href="/shop">View all</a>
                  </Button>
                }
              />
              <CategoryGrid />
            </Container>
          </Section>
        </ScrollReveal>

        {/* New Arrivals */}
        {newArrivals.length > 0 && (
          <ScrollReveal>
            <Section alt>
            <Container>
              <SectionHeader
                eyebrow="Just dropped"
                heading="New Arrivals"
                action={
                  <Button variant="outline" size="sm" asChild>
                    <a href="/shop?filter=new">See all</a>
                  </Button>
                }
              />
              <ProductRail products={newArrivals} seeAllHref="/shop?filter=new" />
            </Container>
          </Section>
          </ScrollReveal>
        )}

        {/* Featured */}
        {featuredProduct && (
          <ScrollReveal>
          <Section>
            <Container>
              <FeaturedBlock product={featuredProduct} />
            </Container>
          </Section>
          </ScrollReveal>
        )}

        {/* Best Sellers */}
        {bestSellers.length > 0 && (
          <ScrollReveal>
          <Section alt>
            <Container>
              <SectionHeader
                eyebrow="Customer favorites"
                heading="Best Sellers"
                action={
                  <Button variant="outline" size="sm" asChild>
                    <a href="/shop?filter=bestseller">See all</a>
                  </Button>
                }
              />
              <BestSellerGrid products={bestSellers} />
            </Container>
          </Section>
          </ScrollReveal>
        )}

        {/* Testimonials */}
        <ScrollReveal>
          <Section>
            <Container>
              <SectionHeader
                eyebrow="Community"
                heading="Loved by makers"
                sub="Real words from our customers across the Philippines."
                center
              />
              <TestimonialStrip />
            </Container>
          </Section>
        </ScrollReveal>

        {/* Instagram */}
        <ScrollReveal>
          <Section alt>
            <Container>
              <SectionHeader
                eyebrow="Follow along"
                heading="@vcsnapcuts"
                sub="Daily inspiration, new drops, and behind-the-scenes."
                center
              />
              <InstagramGallery />
            </Container>
          </Section>
        </ScrollReveal>
      </main>

      <Footer />
    </>
  );
}
