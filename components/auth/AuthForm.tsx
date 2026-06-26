"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthProvider";
import { Button } from "@/components/ui/Button";
import { isFirebaseConfigured } from "@/lib/firebase/config";

type Mode = "signin" | "register";

export function AuthForm({ redirectTo = "/account" }: { redirectTo?: string }) {
  const { firebaseReady, signInGoogle, signInEmail, registerEmail, loading } = useAuth();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (loading) {
    return <div className="skeleton h-48 rounded-2xl" />;
  }

  if (!firebaseReady || !isFirebaseConfigured()) {
    return (
      <div className="p-6 bg-surface-alt rounded-2xl border border-border text-center">
        <p className="font-sans text-sm text-ink-soft mb-4">
          Firebase is not configured yet. Add your keys to{" "}
          <code className="text-xs bg-surface px-1 py-0.5 rounded">.env.local</code> to enable
          sign-in.
        </p>
        <Button variant="outline" asChild>
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      if (mode === "register") {
        await registerEmail(email, password, name);
      } else {
        await signInEmail(email, password);
      }
      window.location.href = redirectTo;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogle() {
    setSubmitting(true);
    setError(null);
    try {
      await signInGoogle();
      window.location.href = redirectTo;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed");
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "w-full h-11 px-4 rounded-xl border border-border bg-surface font-sans text-sm text-ink outline-none focus:[box-shadow:0_0_0_2px_hsl(var(--bg)),0_0_0_3px_hsl(var(--ring))]";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-2 p-1 bg-surface-alt rounded-xl">
        <button
          type="button"
          onClick={() => setMode("signin")}
          className={`flex-1 py-2 rounded-lg font-sans text-sm font-semibold transition-colors ${
            mode === "signin" ? "bg-surface text-ink shadow-sm" : "text-ink-soft"
          }`}
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => setMode("register")}
          className={`flex-1 py-2 rounded-lg font-sans text-sm font-semibold transition-colors ${
            mode === "register" ? "bg-surface text-ink shadow-sm" : "text-ink-soft"
          }`}
        >
          Create account
        </button>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        loading={submitting}
        onClick={handleGoogle}
      >
        Continue with Google
      </Button>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-border" />
        <span className="font-sans text-xs text-ink-soft">or</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {mode === "register" && (
          <div>
            <label htmlFor="name" className="block font-sans text-sm font-medium text-ink mb-1.5">
              Full name
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
            />
          </div>
        )}
        <div>
          <label htmlFor="email" className="block font-sans text-sm font-medium text-ink mb-1.5">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="password" className="block font-sans text-sm font-medium text-ink mb-1.5">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />
        </div>

        {error && <p className="font-sans text-sm text-sale">{error}</p>}

        <Button type="submit" size="lg" loading={submitting} className="w-full">
          {mode === "register" ? "Create account" : "Sign in"}
        </Button>
      </form>
    </div>
  );
}
