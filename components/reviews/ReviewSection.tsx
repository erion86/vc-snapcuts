"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthProvider";
import { getApprovedReviews, submitReview } from "@/lib/firebase/firestore";
import { Rating } from "@/components/ui/Rating";
import { Button } from "@/components/ui/Button";
import type { Review } from "@/types/review";

interface ReviewSectionProps {
  productId: string;
  productSlug: string;
  productTitle: string;
}

export function ReviewSection({ productId, productSlug, productTitle }: ReviewSectionProps) {
  const { user, firebaseReady } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    getApprovedReviews(productId)
      .then(setReviews)
      .finally(() => setLoading(false));
  }, [productId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    setMessage(null);
    try {
      await submitReview(
        { productId, rating, title, body },
        user.uid,
        user.displayName ?? "Customer"
      );
      setTitle("");
      setBody("");
      setMessage("Thanks! Your review is pending approval.");
    } catch {
      setMessage("Could not submit review. Check Firebase configuration.");
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "w-full px-4 py-3 rounded-xl border border-border bg-surface font-sans text-sm text-ink outline-none focus:[box-shadow:0_0_0_2px_hsl(var(--bg)),0_0_0_3px_hsl(var(--ring))]";

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="font-display text-display-sm text-ink mb-2">
          Reviews {reviews.length > 0 && `(${reviews.length})`}
        </h2>
        {loading ? (
          <div className="skeleton h-24 rounded-2xl" />
        ) : reviews.length === 0 ? (
          <p className="font-sans text-sm text-ink-soft">No reviews yet — be the first!</p>
        ) : (
          <ul className="flex flex-col gap-4 mt-4">
            {reviews.map((r) => (
              <li key={r.id} className="p-4 rounded-2xl border border-border bg-surface">
                <Rating value={r.rating} showCount={false} size="md" />
                <p className="font-sans text-sm font-semibold text-ink mt-2">{r.title}</p>
                <p className="font-sans text-sm text-ink-soft mt-1">{r.body}</p>
                <p className="font-sans text-xs text-ink-soft mt-2">— {r.userName}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {firebaseReady && user ? (
        <form onSubmit={handleSubmit} className="p-5 rounded-2xl border border-border bg-surface-alt flex flex-col gap-4">
          <h3 className="font-sans text-sm font-semibold text-ink">Write a review for {productTitle}</h3>
          <div>
            <label className="block font-sans text-xs text-ink-soft mb-1">Rating</label>
            <select
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="h-10 px-3 rounded-xl border border-border bg-surface font-sans text-sm"
            >
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>{n} stars</option>
              ))}
            </select>
          </div>
          <input type="text" placeholder="Review title" required value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
          <textarea rows={4} placeholder="Your experience…" required value={body} onChange={(e) => setBody(e.target.value)} className={inputClass} />
          {message && <p className="font-sans text-sm text-secondary-strong">{message}</p>}
          <Button type="submit" loading={submitting}>Submit review</Button>
        </form>
      ) : (
        <p className="font-sans text-sm text-ink-soft">
          <a href={`/login?redirect=/product/${productSlug}`} className="text-primary font-semibold">Sign in</a>
          {" "}to write a review.
        </p>
      )}
    </div>
  );
}
