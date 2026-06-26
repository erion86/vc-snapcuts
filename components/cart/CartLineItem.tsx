"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/lib/utils";
import type { CartItem } from "@/types/cart";

interface CartLineItemProps {
  item: CartItem;
}

export function CartLineItem({ item }: CartLineItemProps) {
  const { updateQty, removeItem } = useCart();

  return (
    <li className="flex gap-3">
      <Link
        href={`/product/${item.slug}`}
        className="relative h-20 w-16 flex-shrink-0 rounded-xl overflow-hidden bg-surface-alt border border-border"
      >
        {item.imagePublicId && (
          <Image
            src={item.imagePublicId}
            alt={item.title}
            fill
            sizes="64px"
            className="object-cover"
          />
        )}
      </Link>

      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
        <Link
          href={`/product/${item.slug}`}
          className="font-sans text-sm font-semibold text-ink line-clamp-2 hover:text-primary-strong"
        >
          {item.title}
        </Link>
        {item.variantName && (
          <p className="font-sans text-xs text-ink-soft">{item.variantName}</p>
        )}
        <p className="font-sans text-sm font-semibold text-ink tabular-nums">
          {formatPrice(item.unitPrice)}
        </p>

        <div className="flex items-center justify-between gap-2 mt-1">
          <div className="inline-flex items-center border border-border rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => updateQty(item.productId, item.variantId, item.qty - 1)}
              className="inline-flex h-8 w-8 items-center justify-center hover:bg-surface-alt"
              aria-label="Decrease quantity"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="inline-flex h-8 w-8 items-center justify-center font-sans text-xs font-semibold tabular-nums">
              {item.qty}
            </span>
            <button
              type="button"
              onClick={() => updateQty(item.productId, item.variantId, item.qty + 1)}
              className="inline-flex h-8 w-8 items-center justify-center hover:bg-surface-alt"
              aria-label="Increase quantity"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => removeItem(item.productId, item.variantId)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-ink-soft hover:text-sale hover:bg-surface-alt transition-colors"
            aria-label="Remove item"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </li>
  );
}

export function CartLineList() {
  const { items } = useCart();
  if (items.length === 0) return null;
  return (
    <ul className="flex flex-col gap-4">
      {items.map((item) => (
        <CartLineItem key={`${item.productId}:${item.variantId ?? "default"}`} item={item} />
      ))}
    </ul>
  );
}
