"use client";

import Link from "next/link";
import { User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

export function AccountLink({ className }: { className?: string }) {
  const { user, profile, loading, firebaseReady } = useAuth();

  if (!firebaseReady || loading) {
    return <div className={cn("h-9 w-9", className)} aria-hidden="true" />;
  }

  if (!user) {
    return (
      <Link
        href="/login"
        className={cn(
          "hidden sm:inline-flex items-center justify-center h-9 px-3 rounded-xl",
          "font-sans text-sm font-medium text-ink-soft hover:text-ink hover:bg-surface-alt transition-colors",
          className
        )}
      >
        Sign in
      </Link>
    );
  }

  const isAdmin = profile?.role === "admin";

  return (
    <Link
      href={isAdmin ? "/admin/dashboard" : "/account"}
      className={cn(
        "inline-flex items-center justify-center h-9 w-9 rounded-xl hover:bg-surface-alt transition-colors",
        className
      )}
      aria-label={isAdmin ? "Admin dashboard" : "My account"}
      title={isAdmin ? "Admin" : "Account"}
    >
      <User className="h-5 w-5 text-ink" strokeWidth={1.75} />
    </Link>
  );
}
