import { useBooks } from "@/hooks/useBooks";
import { Loader2 } from "lucide-react";
import BookCard from "@/features/books/components/books/BookCard";
import { NavLink } from "react-router-dom";

const BookCatalogPage = () => {
  const { data: books = [], isLoading, isError, error } = useBooks();


  // 1. POPULAR: Sorted by highest rating / most reviews, limited to 5
  const popularBooks = [...books]
    .sort((a, b) => (b.average_rating ?? 0) - (a.average_rating ?? 0))
    .slice(0, 5);
  
  // 2. RECOMMENDED: Books with rating >= 4.0 and review activity
  const recommendedBooks = books.filter(
      (book) =>
        (book.average_rating ?? 0) >= 4.0 && (book.total_reviews ?? 0) >= 1
    ).slice(0, 5);
  
  // 3. OTHER BOOKS: Regular catalog slice or newly added titles
  const otherBooks = books.slice(0, 5);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="m-6 p-4 border border-destructive/20 bg-destructive/10 text-destructive rounded-md">
        Error loading catalog: {error.message}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-12">
      {/* 1. CURATED HERO BANNER */}
      {/* <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white p-8 md:p-10 flex items-center justify-between shadow-lg">
        <div className="space-y-4 z-10 max-w-lg">
          <span className="inline-block px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[10px] font-semibold tracking-wider uppercase text-purple-200 border border-white/10">
            CURATED SELECTION
          </span>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight leading-tight uppercase">
            MOST READ BOOKS THESE MONTHS
          </h1>
          <p className="text-xs md:text-sm text-purple-100/80 leading-relaxed">
            View trending books in this month and explore recommended reads curated by librarians.
          </p>
          <Button
            size="sm"
            className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-6 py-5 text-xs font-bold gap-2 shadow-md transition-all hover:gap-3"
          >
            VIEW NOW <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="hidden lg:block relative shrink-0">
          <div className="w-48 h-36 border-4 border-white/20 rounded-2xl rotate-6 flex items-center justify-center bg-white/5 backdrop-blur-xs">
            <div className="w-full h-full border-r-2 border-white/20" />
          </div>
        </div>
      </div> */}

      {/* 2. POPULAR SECTION */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-foreground">Popular</h2>
            <p className="text-xs text-muted-foreground">Most requested titles this week</p>
          </div>
          <NavLink to="/all-books?filter=popular" className="text-sm font-medium text-primary hover:text-black">
            View Popular
          </NavLink>
        </div>

        {popularBooks.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">No popular books available.</p>
        ) : (
          <div className="flex sm:grid sm:grid-cols-3 lg:grid-cols-5 gap-1 sm:gap-5 overflow-x-auto sm:overflow-visible pb-4 sm:pb-0 snap-x snap-mandatory scrollbar-none">
            {popularBooks.map((book) => (
              <div key={book.id} className="min-w-[150px] max-w-[170px] sm:min-w-0 sm:max-w-none snap-start shrink-0">
                <BookCard book={book} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 3. RECOMMENDED FOR YOU SECTION */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-foreground">Recommended For You</h2>
            <p className="text-xs text-muted-foreground">Based on your recent reading history and preferences</p>
          </div>
          <NavLink to="/all-books?filter=recommended" className="text-sm font-medium text-primary hover:text-black">
            View Recommended
          </NavLink>
        </div>

        {recommendedBooks.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">No recommendations found.</p>
        ) : (
          <div className="flex sm:grid sm:grid-cols-3 lg:grid-cols-5 gap-1 sm:gap-5 overflow-x-auto sm:overflow-visible pb-4 sm:pb-0 snap-x snap-mandatory scrollbar-none">
            {recommendedBooks.map((book) => (
              <div key={book.id} className="min-w-[150px] max-w-[170px] sm:min-w-0 sm:max-w-none snap-start shrink-0">
                <BookCard book={book} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. OTHER BOOKS SECTION */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-foreground">Other Books</h2>
            <p className="text-xs text-muted-foreground">Browse general catalog titles across all genres</p>
          </div>
          <NavLink to="/all-books" className="text-sm font-medium text-primary hover:text-black">
            View Others
          </NavLink>
        </div>

        {otherBooks.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">No books found matching your criteria.</p>
        ) : (
          <div className="flex sm:grid sm:grid-cols-3 lg:grid-cols-5 gap-1 sm:gap-5 overflow-x-auto sm:overflow-visible pb-4 sm:pb-0 snap-x snap-mandatory scrollbar-none">
            {otherBooks.map((book) => (
              <div key={book.id} className="min-w-[150px] max-w-[170px] sm:min-w-0 sm:max-w-none snap-start shrink-0">
                <BookCard book={book} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default BookCatalogPage;