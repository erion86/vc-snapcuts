import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Container, Section } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about V&C Snapcuts — handmade planners, stickers, and journals crafted in the Philippines.",
};

export default function AboutPage() {
  return (
    <>
      <Header />
      <main>
        <Section>
          <Container size="narrow">
            <p className="font-sans text-xs font-semibold uppercase tracking-widest text-primary mb-3">
              Our story
            </p>
            <h1 className="font-display text-display-lg text-ink mb-6">
              Handmade to be held
            </h1>
            <div className="font-sans text-ink-soft leading-relaxed space-y-4">
              <p>
                V&amp;C Snapcuts started with a simple idea: stationery should feel as good as it looks.
                Every planner, sticker sheet, and journal is crafted by hand in the Philippines —
                designed for dreamers, makers, and everyday creatives.
              </p>
              <p>
                We believe in quiet luxury — soft colors, thoughtful layouts, and the kind of quality
                you notice the moment you pick something up. No mass production, no rush. Just paper
                goods made to be written in, stuck on, and loved for a long time.
              </p>
              <p>
                Thank you for supporting a small handmade business. Every order helps us keep creating.
              </p>
            </div>
            <div className="mt-8">
              <Button asChild><Link href="/shop">Shop the collection</Link></Button>
            </div>
          </Container>
        </Section>
      </main>
      <Footer />
    </>
  );
}
