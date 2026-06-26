export type ReviewStatus = "pending" | "approved" | "rejected";

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  body: string;
  images: string[];
  status: ReviewStatus;
  verifiedPurchase: boolean;
  helpfulCount: number;
  createdAt: string;
}

export interface ReviewInput {
  productId: string;
  rating: number;
  title: string;
  body: string;
}
