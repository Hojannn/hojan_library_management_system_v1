import { useMemo, useState } from "react";
import { AlertCircle, ChevronLeft, ChevronRight, FolderCog, Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingState } from "@/components/ui/loading-spinner";
import BookArchiveDialog from "@/features/books/components/books/BookArchiveDialog";
import BookDetailsDialog from "@/features/books/components/books/BookDetailsDialog";
import BookFormModal from "@/features/books/components/books/BookFormModal";
import BookRestoreDialog from "@/features/books/components/books/BookRestoreDialog";
import BooksTable from "@/features/books/components/books/BooksTable";
import CategoryModal from "@/features/books/components/categories/CategoryModal";
import { filterAndSortBooks, getBookCirculation, getBookSummary } from "@/features/books/lib/bookListView";
import type { Book, StaffBookState } from "@/features/books/types/book.types";
import { useAdminBorrows } from "@/hooks/useBorrows";
import { useArchiveBook, useRestoreBook, useStaffBooks } from "@/hooks/useBooks";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;
const EMPTY_BOOKS: Book[] = [];

const BooksListPage = () => {
  const activeQuery = useStaffBooks("active");
  const archivedQuery = useStaffBooks("archived");
  const borrowQuery = useAdminBorrows();
  const archiveMutation = useArchiveBook();
  const restoreMutation = useRestoreBook();
  const [state, setState] = useState<StaffBookState>("active");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [availability, setAvailability] = useState<"all" | "available" | "unavailable">("all");
  const [archiveDate, setArchiveDate] = useState("");
  const [sort, setSort] = useState<"recent" | "title" | "availability" | "archived">("recent");
  const [page, setPage] = useState(1);
  const [formBook, setFormBook] = useState<Book | null | undefined>(undefined);
  const [detailsBook, setDetailsBook] = useState<Book | null>(null);
  const [archiveBook, setArchiveBook] = useState<Book | null>(null);
  const [restoreBook, setRestoreBook] = useState<Book | null>(null);
  const [categoryOpen, setCategoryOpen] = useState(false);

  const activeBooks = activeQuery.data ?? EMPTY_BOOKS;
  const archivedBooks = archivedQuery.data ?? EMPTY_BOOKS;
  const selectedQuery = state === "active" ? activeQuery : archivedQuery;
  const circulationAvailable = !borrowQuery.isLoading && !borrowQuery.isError;
  const source = state === "active" ? activeBooks : archivedBooks;
  const summary = getBookSummary(activeBooks);
  const categories = useMemo(() => Array.from(new Map([...activeBooks, ...archivedBooks].flatMap((book) => book.category_id ? [[book.category_id, book.category_name || "Uncategorized"] as const] : []))).sort((a, b) => a[1].localeCompare(b[1])), [activeBooks, archivedBooks]);
  const filtered = useMemo(() => filterAndSortBooks(source, { search, category, availability: state === "active" ? availability : "all", archiveDate: state === "archived" ? archiveDate : "", sort }), [source, search, category, availability, archiveDate, sort, state]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const switchState = (next: StaffBookState) => { setState(next); setPage(1); setSearch(""); setCategory("all"); setAvailability("all"); setArchiveDate(""); setSort(next === "active" ? "recent" : "archived"); };
  const startEdit = (book: Book) => { setDetailsBook(null); setFormBook(book); };
  const startArchive = (book: Book) => { setDetailsBook(null); setArchiveBook(book); };
  const startRestore = (book: Book) => setRestoreBook(book);
  const confirmArchive = (book: Book) => archiveMutation.mutate(book.id, { onSuccess: () => setArchiveBook(null) });
  const confirmRestore = (book: Book) => restoreMutation.mutate(book.id, { onSuccess: () => setRestoreBook(null) });

  const cards = [
    ["Total titles", summary.totalTitles, "Across the active catalog", "total-titles"],
    ["Total copies", summary.totalCopies, "Physical books registered", "total-copies"],
    ["Available copies", summary.availableCopies, "Ready to be borrowed", "available-copies"],
    ["Unavailable titles", summary.unavailableTitles, "No copies currently available", "unavailable-titles"],
  ];

  return <div className="mx-auto min-h-[calc(100vh-4rem)] max-w-[1180px] space-y-6 pb-4">
    <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><p className="booky-eyebrow">Workspace / Library catalog</p><h1 className="booky-heading mt-3 text-3xl">Books List</h1><p className="mt-2 text-sm text-muted-foreground">Manage titles, inventory, and archived records.</p></div><div className="flex flex-col items-start gap-3 sm:items-end"><time className="text-xs text-muted-foreground">{new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "2-digit", year: "numeric" }).format(new Date())}</time><div className="flex flex-wrap gap-2"><Button variant="outline" onClick={() => setCategoryOpen(true)}><FolderCog /> Categories</Button><Button onClick={() => setFormBook(null)}><Plus /> Add book</Button></div></div></header>
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Catalog summary">{cards.map(([label, value, hint, testId], index) => <article key={label} className={cn("min-h-28 rounded-2xl border border-white/55 bg-card p-5", index === 0 && "bg-primary/90")}><p className="text-xs font-bold text-muted-foreground">{label}</p><strong data-testid={testId} className="mt-1 block text-3xl text-heading">{value}</strong><p className="mt-1 text-[11px] text-muted-foreground">{hint}</p></article>)}</section>
    <section className="booky-glass min-h-[570px] p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div className="flex gap-2"><button type="button" onClick={() => switchState("active")} className={cn("min-w-32 rounded-lg bg-muted px-4 py-3 text-[11px] font-bold text-muted-foreground", state === "active" && "rounded-full bg-primary text-primary-foreground")}>All Books&nbsp; {activeBooks.length}</button><button type="button" onClick={() => switchState("archived")} className={cn("min-w-32 rounded-lg bg-muted px-4 py-3 text-[11px] font-bold text-muted-foreground", state === "archived" && "rounded-full bg-primary text-primary-foreground")}>Archived&nbsp; {archivedBooks.length}</button></div><p className="text-[11px] text-muted-foreground">{filtered.length} {filtered.length === 1 ? "title" : "titles"}</p></div>
      <div className="my-4 grid gap-3 lg:grid-cols-[minmax(240px,1fr)_170px_160px_170px]">
        <label className="relative"><span className="sr-only">Search books</span><Search className="absolute left-3 top-3.5 size-4 text-muted-foreground" /><Input type="search" aria-label="Search books" className="h-11 border-0 bg-white/45 pl-10 text-xs" placeholder="Search title, author, or ISBN" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} /></label>
        <select aria-label="Category" className="booky-input text-xs font-semibold" value={category} onChange={(event) => { setCategory(event.target.value); setPage(1); }}><option value="all">All categories</option>{categories.map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select>
        {state === "active" ? <select aria-label="Availability" className="booky-input text-xs font-semibold" value={availability} onChange={(event) => { setAvailability(event.target.value as typeof availability); setPage(1); }}><option value="all">All availability</option><option value="available">Available</option><option value="unavailable">Unavailable</option></select> : <Input aria-label="Archive date" type="date" className="booky-input text-xs" value={archiveDate} onChange={(event) => { setArchiveDate(event.target.value); setPage(1); }} />}
        <select aria-label="Sort books" className="booky-input text-xs font-semibold" value={sort} onChange={(event) => setSort(event.target.value as typeof sort)}>{state === "archived" && <option value="archived">Recently archived</option>}<option value="recent">Recently added</option><option value="title">Title A–Z</option>{state === "active" && <option value="availability">Most available</option>}</select>
      </div>
      {selectedQuery.isLoading ? <LoadingState className="text-primary" containerClassName="min-h-72" label={`Loading ${state === "active" ? "active" : "archived"} books`} /> : selectedQuery.isError ? <div className="flex min-h-72 items-start gap-2 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive"><AlertCircle className="size-4 shrink-0" />Could not load {state === "active" ? "active" : "archived"} books.</div> : <>
        <BooksTable books={visible} state={state} onView={setDetailsBook} onEdit={startEdit} onArchive={startArchive} onRestore={startRestore} isProcessing={archiveMutation.isPending || restoreMutation.isPending} />
        {filtered.length > PAGE_SIZE && <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground"><span>Page {currentPage} of {pageCount}</span><div className="flex gap-2"><Button variant="outline" size="sm" aria-label="Previous page" disabled={currentPage <= 1} onClick={() => setPage((value) => value - 1)}><ChevronLeft /></Button><Button variant="outline" size="sm" aria-label="Next page" disabled={currentPage >= pageCount} onClick={() => setPage((value) => value + 1)}><ChevronRight /></Button></div></div>}
      </>}
    </section>
    <BookDetailsDialog book={detailsBook} borrows={circulationAvailable ? (borrowQuery.data || []) : []} circulationAvailable={circulationAvailable} open={!!detailsBook} onOpenChange={(open) => !open && setDetailsBook(null)} onEdit={startEdit} onArchive={startArchive} />
    <BookFormModal isOpen={formBook !== undefined} onClose={() => setFormBook(undefined)} book={formBook} />
    <BookArchiveDialog open={!!archiveBook} book={archiveBook} circulation={getBookCirculation(archiveBook?.id || "", circulationAvailable ? (borrowQuery.data || []) : [])} circulationAvailable={circulationAvailable} isPending={archiveMutation.isPending} onOpenChange={(open) => !open && setArchiveBook(null)} onConfirm={confirmArchive} />
    <BookRestoreDialog open={!!restoreBook} book={restoreBook} isPending={restoreMutation.isPending} onOpenChange={(open) => !open && setRestoreBook(null)} onConfirm={confirmRestore} />
    <CategoryModal isOpen={categoryOpen} onClose={() => setCategoryOpen(false)} />
  </div>;
};

export default BooksListPage;
