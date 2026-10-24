import { Link } from "react-router-dom";
import { useBooks } from "@/hooks/useBooks";
import { LoadingState } from "@/components/ui/loading-spinner";
import { formatAuthorName } from "@/utils/formatAuthorName";

interface AuthorOtherBooksProps { currentBookId: string; authorName: string; }
export default function AuthorOtherBooks({ currentBookId, authorName }: AuthorOtherBooksProps) {
  const { data: books = [], isLoading, isError, refetch } = useBooks();
  const authorBooks = books.filter(book => book.id !== currentBookId && book.author.trim().toLowerCase() === authorName.trim().toLowerCase()).slice(0, 3);
  return <aside className="details-author-panel"><h2>More by this author</h2><p className="details-author-name">{formatAuthorName(authorName, 1)}</p>
    {isLoading ? <LoadingState label="Loading author’s books" containerClassName="py-8" size={20} /> : isError ? <div className="details-author-empty"><p>Couldn’t load this author’s books.</p><button type="button" onClick={() => void refetch()}>Try again</button></div> : !authorBooks.length ? <div className="details-author-empty"><img src="/book-details/empty-books.svg" alt="" /><p>No other books by this author<br />are in the library yet.</p></div> : <div className="details-author-books">{authorBooks.map(book => <Link key={book.id} to={`/books/${book.id}`}><div className="details-author-cover">{book.image_url ? <img src={book.image_url} alt="" /> : <img src="/book-details/empty-books.svg" alt="" />}</div><span><strong>{book.title}</strong><small>{book.available_copies > 0 ? "Available" : "On loan"}</small></span></Link>)}</div>}
  </aside>;
}
