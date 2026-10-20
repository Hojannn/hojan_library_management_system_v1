import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingState } from "@/components/ui/loading-spinner";
import BookFormModal from "@/features/books/components/books/BookFormModal";
import BooksTable from "@/features/books/components/books/BooksTable";
import CategoryFilter from "@/features/books/components/categories/CategoryFilter";
import CategoryModal from "@/features/books/components/categories/CategoryModal";
import { type Book } from "@/features/books/types/book.types";
import { useBooks, useDeleteBooks } from "@/hooks/useBooks";
import { formatAuthorName } from "@/utils/formatAuthorName";
import { AlertCircle, Plus, Search, X } from "lucide-react";
import { useState } from "react"

const BooksListPage = () => {
  const { data: books = [], isLoading, isError, error } = useBooks();
  const deleteMutation = useDeleteBooks();

  const [isAddOpen, setIsAddOpen] = useState<boolean>(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState<boolean>(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const handleEdit = (book: Book) => {
    setSelectedBook(book);
  };

  const handleDelete = (bookId: string) => {
    if (confirm("Are you sure you want to delete this book?")) {
      deleteMutation.mutate(bookId);
    }
  };

  const handleCloseModal = () => {
    setIsAddOpen(false);
    setSelectedBook(null);
  };

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredBooks = books.filter((book) => {
    const matchesCategory = selectedCategoryId
      ? book.category_id === selectedCategoryId
      : true;

    const matchesSearch = normalizedQuery
      ? book.title.toLowerCase().includes(normalizedQuery) ||
        formatAuthorName(book.author).toLowerCase().includes(normalizedQuery) ||
        (book.isbn ?? "").toLowerCase().includes(normalizedQuery)
      : true;

    return matchesCategory && matchesSearch;
  });

  if (isLoading) {
    return <LoadingState className="text-primary" containerClassName="h-64" label="Loading books" />;
  }

  if (isError) {
    return (
      <div className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
        <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
        <span>Error loading catalog: {error?.message || "Could not load books"}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Book Catalog</h1>
          <p className="text-sm text-muted-foreground">
            Manage titles, stock levels, and catalog items.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={() => setIsCategoryModalOpen(true)}>
            Manage Categories
          </Button>
          <Button onClick={() => setIsAddOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Book
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1">
          <CategoryFilter
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={setSelectedCategoryId}
          />
        </div>

        <div className="relative w-full sm:w-72 sm:shrink-0">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search by title, author, or ISBN..."
            aria-label="Search books"
            className="h-9 pl-9 pr-9 [&::-webkit-search-cancel-button]:appearance-none"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchQuery("")}
              aria-label="Clear search"
              title="Clear search"
              className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <BooksTable
        books={filteredBooks}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isDeleting={deleteMutation.isPending}
      />

      <BookFormModal
        isOpen={isAddOpen || !!selectedBook}
        onClose={handleCloseModal}
        book={selectedBook}
      />

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
      />
    </div>
  )
}

export default BooksListPage
