"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { ProductImage } from "@/types/product";

interface ProductGalleryProps {
  images: ProductImage[];
  title: string;
}

export function ProductGallery({ images, title }: ProductGalleryProps) {
  const sorted = [...images].sort((a, b) => a.order - b.order);
  const [active, setActive] = useState(0);
  const current = sorted[active];

  if (!current) return null;

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-surface-alt border border-border">
        <Image
          src={current.publicId}
          alt={current.alt || title}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
          priority
        />
      </div>

      {sorted.length > 1 && (
        <>
          {/* Dots — mobile */}
          <div className="flex justify-center gap-1.5 md:hidden">
            {sorted.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActive(i)}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === active ? "w-4 bg-primary" : "w-1.5 bg-border"
                )}
                aria-label={`View image ${i + 1}`}
              />
            ))}
          </div>

          {/* Thumbs — desktop */}
          <div className="hidden md:flex gap-2">
            {sorted.map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActive(i)}
                className={cn(
                  "relative h-16 w-16 rounded-xl overflow-hidden border-2 transition-colors flex-shrink-0",
                  i === active ? "border-primary" : "border-border hover:border-primary/40"
                )}
              >
                <Image
                  src={img.publicId}
                  alt={img.alt}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
