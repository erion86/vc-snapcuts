import { Rating } from "@/components/ui/Rating";

const testimonials = [
  {
    quote: "The Sage A5 planner changed how I organize my days. The paper quality is incredible!",
    name: "Mika R.",
    rating: 5,
  },
  {
    quote: "Cutest sticker sheets ever — kiss-cut perfection. Already ordered three more.",
    name: "Jasmine L.",
    rating: 5,
  },
  {
    quote: "Shipped fast, packaged with so much care. You can feel the handmade love.",
    name: "Patricia D.",
    rating: 5,
  },
];

export function TestimonialStrip() {
  return (
    <div className="grid md:grid-cols-3 gap-4">
      {testimonials.map((t) => (
        <blockquote
          key={t.name}
          className="p-5 rounded-2xl bg-surface border border-border flex flex-col gap-3"
        >
          <Rating value={t.rating} showCount={false} size="sm" />
          <p className="font-sans text-sm text-ink leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
          <footer className="font-sans text-xs font-semibold text-ink-soft">— {t.name}</footer>
        </blockquote>
      ))}
    </div>
  );
}
