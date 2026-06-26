"use client";

import { useState } from "react";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import { subscribeNewsletter } from "@/lib/firebase/firestore";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError(null);

    try {
      if (isFirebaseConfigured()) {
        await subscribeNewsletter(email, "footer");
      } else {
        await new Promise((r) => setTimeout(r, 400));
      }
      setSubmitted(true);
    } catch {
      setError("Could not subscribe. Try again later.");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <p className="mt-3 font-sans text-sm text-secondary font-medium">
        You&apos;re in! Check your inbox for your 10% off code.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mt-3 min-w-0" aria-label="Newsletter signup">
      <label htmlFor="footer-email" className="sr-only">Email address</label>
      <input
        id="footer-email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        required
        className="min-w-0 flex-1 bg-surface border border-border rounded-xl px-4 py-2.5 font-sans text-sm text-ink placeholder:text-ink-soft outline-none transition-shadow focus:[box-shadow:0_0_0_2px_hsl(var(--bg)),0_0_0_3px_hsl(var(--ring))]"
      />
      <button
        type="submit"
        disabled={loading}
        className="shrink-0 bg-primary hover:bg-primary-strong disabled:opacity-60 text-white font-sans font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors whitespace-nowrap"
      >
        {loading ? "…" : "Subscribe"}
      </button>
      {error && <p className="font-sans text-xs text-sale col-span-2">{error}</p>}
    </form>
  );
}
