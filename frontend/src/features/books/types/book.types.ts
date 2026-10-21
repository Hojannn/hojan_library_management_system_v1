export interface Review {
  id: string;
  user_id: string;
  user_name?: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface ReviewStatsResponse {
  average_rating: number;
  total_reviews: number;
}

export interface ReviewResponse extends Review {
  book_id: string;
}

export interface Book {
  id: string;
  isbn?: string | null;
  title: string;
  author: string;
  category_name?: string | null;
  category_id: string | null;
  total_copies: number;
  available_copies: number;
  image_url: string | null;
  description?: string | null;
  pages: number | null;
  average_rating?: number;
  total_reviews?: number;
  created_at?: string | null;
  is_deleted?: boolean;
  archived_at?: string | null;
}

export type StaffBookState = "active" | "archived";

export interface BookResponse {
  message: string;
  book: Book
}
