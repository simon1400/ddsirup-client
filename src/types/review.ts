export interface Review {
  id: number;
  documentId: string;
  review: string;
  reviewAuthor: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}
