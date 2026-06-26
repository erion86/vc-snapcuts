import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Container, Section } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description: "V&C Snapcuts — cute, quality stationery for planning, crafting, and journaling, made with care and love.",
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
              Little Things, Made with Love
            </h1>
            <div className="font-sans text-ink-soft leading-relaxed space-y-4">
              <p>
                V &amp; C Snapcuts began with a passion for stickers, journaling, and all things creative.
                We wanted to share cute and quality stationery that makes planning, crafting, and journaling
                more fun.
              </p>
              <p>
                What started as a small idea has grown into a business built with care, creativity, and love.
                Every order means a lot to us, and we are grateful to everyone who supports our small business.
              </p>
              <p>
                We hope our products bring a little happiness to your everyday life. 💛
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
