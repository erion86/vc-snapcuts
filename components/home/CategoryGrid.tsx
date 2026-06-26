import Link from "next/link";
import { categories } from "@/config/site";
import { cn } from "@/lib/utils";

export function CategoryGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {categories.map((cat) => (
        <Link
          key={cat.slug}
          href={`/category/${cat.slug}`}
          className={cn(
            "group flex flex-col items-center gap-3 p-5",
            "bg-surface rounded-2xl border border-border",
            "hover:border-primary/40 hover:shadow-card transition-all kiss-cut"
          )}
        >
          <div
            className={cn(
              "h-14 w-14 rounded-xl flex items-center justify-center text-2xl",
              "group-hover:scale-110 transition-transform",
              cat.color
            )}
          >
            {cat.emoji}
          </div>
          <span className="font-sans text-sm font-medium text-ink text-center">
            {cat.name}
          </span>
        </Link>
      ))}
    </div>
  );
}
