import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Container, Section } from "@/components/ui/Container";
import { siteConfig } from "@/config/site";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with V&C Snapcuts for orders, custom requests, or collaboration.",
};

export default function ContactPage() {
  return (
    <>
      <Header />
      <main>
        <Section>
          <Container size="narrow">
            <h1 className="font-display text-display-lg text-ink mb-4">Contact us</h1>
            <p className="font-sans text-ink-soft leading-relaxed mb-8">
              Questions about an order, a product, or a custom request? We&apos;d love to hear from you.
            </p>
            <div className="p-6 rounded-2xl border border-border bg-surface space-y-4 font-sans text-sm">
              <p>
                <span className="font-semibold text-ink">Email: </span>
                <a href={`mailto:${siteConfig.contact.email}`} className="text-primary hover:text-primary-strong">
                  {siteConfig.contact.email}
                </a>
              </p>
              <p>
                <span className="font-semibold text-ink">Instagram: </span>
                <a href={siteConfig.social.instagram} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-strong">
                  @vcsnapcuts
                </a>
              </p>
              <p className="text-ink-soft">
                We typically reply within 1–2 business days. For order updates, include your order number.
              </p>
            </div>
          </Container>
        </Section>
      </main>
      <Footer />
    </>
  );
}
