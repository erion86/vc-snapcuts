"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "@/context/ThemeProvider";
import { AuthProvider } from "@/context/AuthProvider";
import { CartProvider } from "@/context/CartProvider";
import { WishlistProvider } from "@/context/WishlistProvider";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { CartMergeBridge } from "@/components/providers/CartMergeBridge";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <WishlistProvider>
          <CartProvider>
            <CartMergeBridge />
            {children}
            <CartDrawer />
          </CartProvider>
        </WishlistProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
