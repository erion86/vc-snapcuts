"use client";

import { useCallback, useEffect, useState } from "react";
import { getPendingReviews, updateReviewStatus } from "@/lib/firebase/firestore";
import { Rating } from "@/components/ui/Rating";
import { Button } from "@/components/ui/Button";
import type { Review } from "@/types/review";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await getPendingReviews();
    setReviews(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleStatus(reviewId: string, status: "approved" | "rejected") {
    setActing(reviewId);
    try {
      await updateReviewStatus(reviewId, status);
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    } finally {
      setActing(null);
    }
  }

  return (
    <div>
      <h1 className="font-display text-display-md text-ink mb-2">Review moderation</h1>
      <p className="font-sans text-sm text-ink-soft mb-8">Approve or reject customer reviews before they appear on product pages.</p>

      {loading ? (
        <div className="skeleton h-32 rounded-2xl" />
      ) : reviews.length === 0 ? (
        <p className="font-sans text-ink-soft py-8 text-center rounded-2xl border border-border bg-surface">
          No pending reviews — all caught up!
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {reviews.map((review) => (
            <li key={review.id} className="p-5 rounded-2xl border border-border bg-surface">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <Rating value={review.rating} showCount={false} size="md" />
                  <p className="font-sans text-sm font-semibold text-ink mt-2">{review.title}</p>
                  <p className="font-sans text-sm text-ink-soft mt-1">{review.body}</p>
                  <p className="font-sans text-xs text-ink-soft mt-2">
                    {review.userName} · product {review.productId}
                  </p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button
                    size="sm"
                    loading={acting === review.id}
                    onClick={() => handleStatus(review.id, "approved")}
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={acting === review.id}
                    onClick={() => handleStatus(review.id, "rejected")}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
