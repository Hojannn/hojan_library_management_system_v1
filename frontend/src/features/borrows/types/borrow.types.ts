export type BorrowStatus = 
  | "PENDING_BORROW"
  | "READY_FOR_PICKUP"
  | "BORROWED"
  | "PENDING_RETURN"
  | "RETURNED"
  | "REJECTED"
  | "OVERDUE";

export interface Borrow {
  id: string;
  user_id: string;
  user_name?: string;
  user_email?: string;
  book_id: string;
  book_title: string;
  book_image?: string | null;
  author?: string;
  book_available_copies: number | null;
  borrowed_at: string | null;
  due_date: string | null;    
  approved_at: string | null;
  rejection_reason: string | null;
  returned_at: string | null;
  status: BorrowStatus;
  is_overdue: boolean;
  created_at?: string | null;
}

export interface CreateBorrowPayload {
  book_id: string;
}
