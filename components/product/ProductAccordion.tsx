"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface AccordionItem {
  title: string;
  content: string;
}

interface ProductAccordionProps {
  items: AccordionItem[];
}

export function ProductAccordion({ items }: ProductAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="border-t border-border divide-y divide-border">
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div key={item.title}>
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="flex w-full items-center justify-between py-4 font-sans text-sm font-semibold text-ink"
              aria-expanded={isOpen}
            >
              {item.title}
              <ChevronDown
                className={cn("h-4 w-4 text-ink-soft transition-transform", isOpen && "rotate-180")}
              />
            </button>
            {isOpen && (
              <div className="pb-4 font-sans text-sm text-ink-soft leading-relaxed whitespace-pre-line">
                {item.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
