import { LoadingState } from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";
import { useGetBookRecommendations } from "@/hooks/useBooks";
import BookCard from "./BookCard";
export default function BookRecommendations({ bookId }: { bookId: string }) {
  const { data: books = [], isLoading, isError, refetch } = useGetBookRecommendations(bookId);
  if (isLoading) return <LoadingState label="Loading recommendations" containerClassName="py-12" />;
  if (isError) return <div className="details-empty" role="alert"><p>Couldn’t load recommendations.</p><Button onClick={() => void refetch()}>Try again</Button></div>;
  return <section className="details-recommendations"><header className="details-panel-heading"><div><h2>Keep exploring</h2><p>More books to discover, inspired by this title.</p></div><span>{books.length} {books.length === 1 ? "suggestion" : "suggestions"}</span></header>{books.length ? <div className="details-recommendation-grid">{books.map(book => <BookCard key={book.id} book={book} variant="recommendation" />)}</div> : <p className="details-empty">No recommendations available for this title right now.</p>}</section>;
}
