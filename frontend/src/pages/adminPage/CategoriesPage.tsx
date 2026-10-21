import { useMemo, useState } from "react";
import { AlertCircle, ArrowLeft, Eye, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { LoadingState } from "@/components/ui/loading-spinner";
import CategoryModal from "@/features/books/components/categories/CategoryModal";
import { filterAndSortCategories, getCategorySummary, type CategorySort } from "@/features/books/lib/categoryWorkspace";
import type { Category } from "@/features/books/types/category.types";
import { useAuth } from "@/hooks/useAuth";
import { useCategories, useDeleteCategory } from "@/hooks/useCategories";
import { useStaffBooks } from "@/hooks/useBooks";

const pad = (value: number) => String(value).padStart(2, "0");
const EMPTY_CATEGORIES: Category[] = [];

const CategoriesPage = () => {
  const { user } = useAuth();
  const categoryQuery = useCategories();
  const booksQuery = useStaffBooks("active");
  const deleteMutation = useDeleteCategory();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<CategorySort>("name-asc");
  const [selected, setSelected] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [managerOpen, setManagerOpen] = useState(false);
  const [managerCategory, setManagerCategory] = useState<Category | null>(null);
  const categories = categoryQuery.data ?? EMPTY_CATEGORIES;
  const books = booksQuery.data ?? [];
  const isAdmin = user?.role === "admin";
  const summary = getCategorySummary(categories);
  const visible = useMemo(() => filterAndSortCategories(categories, search, sort), [categories, search, sort]);
  const selectedBooks = selected ? books.filter((book) => book.category_id === selected.id) : [];

  const cards = [
    ["Total categories", pad(summary.totalCategories), "Organize your library collection", "total-categories"],
    ["Book titles", pad(summary.bookTitles), "Titles across all categories", "book-titles"],
    ["Empty categories", pad(summary.emptyCategories), "Ready for new books", "empty-categories"],
  ];

  return <div className="mx-auto min-h-[calc(100vh-4rem)] max-w-[1180px] space-y-6 pb-4">
    <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div><p className="booky-eyebrow">Workspace / Categories</p><h1 className="booky-heading mt-3 text-3xl">Categories</h1><p className="mt-2 text-sm text-muted-foreground">Organize your collection so every book is easy to find.</p></div>
      {isAdmin && <Button className="mt-8 rounded-full" onClick={() => { setManagerCategory(null); setManagerOpen(true); }} aria-label="Add category"><Plus /> Add category</Button>}
    </header>

    <section className="grid gap-4 md:grid-cols-3" aria-label="Category summary">
      {cards.map(([label, value, hint, testId], index) => <article key={label} className={`min-h-28 rounded-2xl border border-white/55 p-5 ${index === 0 ? "bg-primary/90" : "bg-card"}`}><p className="text-xs text-muted-foreground">{label}</p><strong data-testid={testId} className="mt-1 block text-3xl text-heading">{value}</strong><p className="mt-2 text-[11px] text-muted-foreground">{hint}</p></article>)}
    </section>

    <section className="booky-glass min-h-[590px] p-4 sm:p-6">
      {selected ? <>
        <div><h2 className="booky-heading text-xl">{selected.name} books</h2><p className="mt-1 text-xs text-muted-foreground">{selectedBooks.length} book {selectedBooks.length === 1 ? "title" : "titles"} in this category</p></div>
        <Button variant="outline" className="my-5 rounded-full" onClick={() => setSelected(null)} aria-label="Back to categories"><ArrowLeft /> Back to categories</Button>
        <div className="space-y-3">{booksQuery.isLoading ? <LoadingState label="Loading category books" /> : booksQuery.isError ? <div className="flex gap-2 rounded-xl bg-destructive/10 p-4 text-sm text-destructive"><AlertCircle className="size-4" />Could not load books in this category.</div> : selectedBooks.length === 0 ? <p className="rounded-xl bg-white/40 p-6 text-sm text-muted-foreground">No active books in this category.</p> : selectedBooks.map((book) => <article key={book.id} className="flex flex-col gap-3 rounded-xl bg-white/40 p-4 sm:flex-row sm:items-center sm:justify-between"><div><h3 className="font-bold">{book.title}</h3><p className="mt-1 text-xs text-muted-foreground">{book.author}</p></div><Link className="inline-flex h-9 items-center justify-center rounded-full border bg-background px-4 text-xs font-semibold hover:bg-accent" to={`/book-list?book=${encodeURIComponent(book.id)}`}>View book details</Link></article>)}</div>
      </> : <>
        <div><h2 className="booky-heading text-xl">All categories</h2><p className="mt-1 text-xs text-muted-foreground">Keep category names clear and consistent.</p></div>
        <div className="my-5 grid gap-3 sm:grid-cols-[1fr_180px]"><label className="relative"><span className="sr-only">Search categories</span><Search className="absolute left-3 top-3.5 size-4 text-muted-foreground" /><Input type="search" aria-label="Search categories" className="h-11 border-0 bg-white/45 pl-10 text-xs" placeholder="Search categories" value={search} onChange={(event) => setSearch(event.target.value)} /></label><select aria-label="Sort categories" className="booky-input text-xs font-semibold" value={sort} onChange={(event) => setSort(event.target.value as CategorySort)}><option value="name-asc">Name A–Z</option><option value="name-desc">Name Z–A</option><option value="most-books">Most books</option></select></div>
        {categoryQuery.isLoading ? <LoadingState label="Loading categories" containerClassName="min-h-72" /> : categoryQuery.isError ? <div className="flex gap-2 rounded-xl bg-destructive/10 p-4 text-sm text-destructive"><AlertCircle className="size-4" />Could not load categories.</div> : visible.length === 0 ? <p className="rounded-xl bg-white/40 p-6 text-sm text-muted-foreground">No categories found.</p> : <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead><tr className="border-b text-[10px] uppercase tracking-wide text-muted-foreground"><th className="px-4 py-3">Category</th><th className="px-4 py-3">Book titles</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Actions</th></tr></thead><tbody>{visible.map((category) => <tr key={category.id} className="border-b border-white/45"><td className="px-4 py-5 font-bold">{category.name}</td><td className="px-4 py-5">{category.book_count ?? 0}</td><td className="px-4 py-5"><span className="booky-badge">{(category.book_count ?? 0) > 0 ? "In use" : "Empty"}</span></td><td className="px-4 py-5"><div className="flex flex-wrap gap-2">{(category.book_count ?? 0) > 0 && <Button variant="ghost" size="sm" aria-label={`View ${category.name} books`} onClick={() => setSelected(category)}><Eye /> View</Button>}{isAdmin && <><Button variant="ghost" size="sm" aria-label={`Edit ${category.name}`} onClick={() => { setManagerCategory(category); setManagerOpen(true); }}><Pencil /> Edit</Button><Button variant="ghost" size="sm" className="text-destructive" aria-label={`Delete ${category.name}`} onClick={() => setDeleteTarget(category)}><Trash2 /> Delete</Button></>}</div></td></tr>)}</tbody></table><p className="mt-4 text-xs text-muted-foreground">Showing {visible.length} of {categories.length} categories</p></div>}
      </>}
    </section>
    <aside className="rounded-xl bg-accent/60 p-5"><p className="text-sm font-bold text-heading">A category keeps related books together.</p><p className="mt-2 text-xs text-muted-foreground">Move its books to another category before deleting it. Your books are never deleted with a category.</p></aside>
    {isAdmin && managerOpen && <CategoryModal isOpen initialCategory={managerCategory} onClose={() => { setManagerOpen(false); setManagerCategory(null); }} />}
    <ConfirmDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)} description={`Are you sure you want to delete “${deleteTarget?.name}”?`} confirmLabel="Delete" variant="destructive" loading={deleteMutation.isPending} onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })} />
  </div>;
};

export default CategoriesPage;
