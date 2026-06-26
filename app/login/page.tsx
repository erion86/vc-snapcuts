import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { AuthForm } from "@/components/auth/AuthForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
};

export default function LoginPage({
  searchParams,
}: {
  searchParams: { redirect?: string };
}) {
  const redirectTo = searchParams.redirect ?? "/account";

  return (
    <>
      <Header />
      <main className="py-10 md:py-14">
        <Container size="narrow">
          <h1 className="font-display text-display-md text-ink text-center mb-2">Welcome back</h1>
          <p className="font-sans text-ink-soft text-center mb-8">
            Sign in to track orders, save your wishlist, and checkout faster.
          </p>
          <AuthForm redirectTo={redirectTo} />
        </Container>
      </main>
      <Footer />
    </>
  );
}
