import reviewsData from "./data.json";
import type { Review } from "./types";

export * from "./types";

export const mockReviews = reviewsData as Review[];

/** Reviews grouped by product id (slug) for quick per-product lookups. */
export function getReviewsByProduct(productId: string): Review[] {
  return mockReviews.filter((review) => review.productId === productId);
}
