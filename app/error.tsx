"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <>
      <Header />
      <main className="py-20 md:py-28">
        <Container size="narrow" className="text-center">
          <h1 className="font-display text-display-lg text-ink mb-4">
            Something went wrong
          </h1>
          <p className="font-sans text-ink-soft mb-8">
            We hit a snag loading this page. Please try again.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={reset}>Try again</Button>
            <Button variant="outline" asChild><Link href="/">Go home</Link></Button>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
