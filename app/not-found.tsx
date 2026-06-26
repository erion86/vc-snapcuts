import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="py-20 md:py-28">
        <Container size="narrow" className="text-center">
          <p className="font-sans text-xs font-semibold uppercase tracking-widest text-primary mb-3">
            404
          </p>
          <h1 className="font-display text-display-lg text-ink mb-4">
            Page not found
          </h1>
          <p className="font-sans text-ink-soft mb-8 max-w-md mx-auto">
            This page may have moved or doesn&apos;t exist. Try the shop or head back home.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild><Link href="/">Go home</Link></Button>
            <Button variant="outline" asChild><Link href="/shop">Browse shop</Link></Button>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
