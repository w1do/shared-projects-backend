/**
 * Customer reviews. `productId` is the product id (slug) so reviews can be
 * filtered per product detail view once the UI is built.
 */
export interface ReviewUser {
  name: string;
  avatar: string;
  location: string;
  isVerified: boolean;
}

export interface Review {
  id: string;
  productId: string;
  user: ReviewUser;
  rating: number;
  title: string;
  comment: string;
  images: string[];
  createdAt: string;
  likes: number;
}
