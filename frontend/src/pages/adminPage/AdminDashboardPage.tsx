import { LoadingState } from "@/components/ui/loading-spinner";
import type { Borrow, BorrowStatus } from "@/features/borrows/types/borrow.types";
import { useAuth, useGetAllUsers } from "@/hooks/useAuth";
import { useAdminBorrows } from "@/hooks/useBorrows";
import { useBooks } from "@/hooks/useBooks";
import { useCategories } from "@/hooks/useCategories";
import { cn } from "@/lib/utils";
import { ArrowRight, CalendarDays, RotateCcw, UserRoundCog } from "lucide-react";
import { useMemo } from "react";
import { Link } from "react-router-dom";

const DAY_MS = 86_400_000;

const STATUS_META: Record<BorrowStatus, { label: string; className: string; action: string }> = {
  PENDING_BORROW: { label: "Pending", className: "bg-warning-soft text-warning", action: "Review" },
  READY_FOR_PICKUP: { label: "For pickup", className: "bg-muted text-foreground", action: "Confirm pickup" },
  BORROWED: { label: "Borrowed", className: "bg-muted text-foreground", action: "View loan" },
  PENDING_RETURN: { label: "Return pending", className: "bg-warning-soft text-warning", action: "Record return" },
  RETURNED: { label: "Returned", className: "bg-success-soft text-success", action: "View loan" },
  REJECTED: { label: "Rejected", className: "bg-muted text-muted-foreground", action: "View request" },
  OVERDUE: { label: "Overdue", className: "bg-danger-soft text-danger", action: "View loan" },
};

const priority: Record<BorrowStatus, number> = {
  OVERDUE: 0,
  PENDING_RETURN: 1,
  PENDING_BORROW: 2,
  READY_FOR_PICKUP: 3,
  BORROWED: 4,
  RETURNED: 5,
  REJECTED: 6,
};

const getBorrowDate = (borrow: Borrow) =>
  borrow.returned_at ?? borrow.borrowed_at ?? borrow.approved_at ?? borrow.created_at ?? borrow.due_date ?? "";

const isSameLocalDay = (value: string | null | undefined, day: Date) => {
  if (!value) return false;
  const date = new Date(value);
  return date.getFullYear() === day.getFullYear()
    && date.getMonth() === day.getMonth()
    && date.getDate() === day.getDate();
};

const formatCompactDate = (value: string | null | undefined) => {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(value));
};

const AdminDashboardPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const { data: users = [], isLoading: usersLoading } = useGetAllUsers({ enabled: isAdmin });
  const { data: borrows = [], isLoading: borrowsLoading } = useAdminBorrows();
  const { data: books = [], isLoading: booksLoading } = useBooks();
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();

  const now = useMemo(() => new Date(), []);
  const isLoading = borrowsLoading || booksLoading || categoriesLoading || (isAdmin && usersLoading);

  const dashboard = useMemo(() => {
    const overdue = borrows.filter((borrow) =>
      borrow.status === "OVERDUE"
      || (borrow.status === "BORROWED" && borrow.due_date && new Date(borrow.due_date) < now));
    const pending = borrows.filter((borrow) => borrow.status === "PENDING_BORROW");
    const waitingForPickup = borrows.filter((borrow) => borrow.status === "READY_FOR_PICKUP");
    const active = borrows.filter((borrow) => borrow.status === "BORROWED" || borrow.status === "PENDING_RETURN");
    const returned = borrows.filter((borrow) => borrow.status === "RETURNED");
    const attention = [...borrows]
      .filter((borrow) => ["OVERDUE", "PENDING_RETURN", "PENDING_BORROW", "READY_FOR_PICKUP"].includes(borrow.status))
      .sort((a, b) => priority[a.status] - priority[b.status] || getBorrowDate(b).localeCompare(getBorrowDate(a)))
      .slice(0, 3);
    const recent = [...borrows]
      .sort((a, b) => getBorrowDate(b).localeCompare(getBorrowDate(a)))
      .slice(0, 4);
    const activity = Array.from({ length: 7 }, (_, index) => {
      const day = new Date(now.getTime() - (6 - index) * DAY_MS);
      return {
        date: day,
        label: new Intl.DateTimeFormat("en-US", { day: "numeric", month: "short" }).format(day),
        loans: borrows.filter((borrow) => isSameLocalDay(borrow.borrowed_at, day)).length,
        returns: borrows.filter((borrow) => isSameLocalDay(borrow.returned_at, day)).length,
      };
    });

    return {
      pending: pending.length,
      waitingForPickup: waitingForPickup.length,
      active: active.length,
      overdue: overdue.length,
      returned: returned.length,
      returnedToday: returned.filter((borrow) => isSameLocalDay(borrow.returned_at, now)).length,
      totalCopies: books.reduce((total, book) => total + (book.total_copies ?? 0), 0),
      availableCopies: books.reduce((total, book) => total + (book.available_copies ?? 0), 0),
      attention,
      recent,
      activity,
    };
  }, [books, borrows, now]);

  if (isLoading) {
    return <LoadingState className="text-primary" containerClassName="min-h-[70vh]" label="Loading dashboard" />;
  }

  const firstName = user?.username?.trim().split(/\s+/)[0] || "there";
  const greeting = now.getHours() < 12 ? "Good morning" : now.getHours() < 18 ? "Good afternoon" : "Good evening";
  const maxActivity = Math.max(1, ...dashboard.activity.flatMap((item) => [item.loans, item.returns]));
  const overviewItems = [
    ...(isAdmin ? [{ value: users.length, label: "Total users" }] : []),
    { value: books.length, label: "Book titles" },
    { value: dashboard.totalCopies, label: "Total copies" },
    { value: dashboard.availableCopies, label: "Available copies" },
    { value: categories.length, label: "Categories" },
    { value: dashboard.returned, label: "Returned · all time" },
  ];
  const statCards = [
    { label: "Pending requests", value: dashboard.pending, hint: "Awaiting your approval", featured: true },
    { label: "Waiting for pickup", value: dashboard.waitingForPickup, hint: "Approved and ready" },
    { label: "Active loans", value: dashboard.active, hint: `Includes ${dashboard.overdue} overdue ${dashboard.overdue === 1 ? "loan" : "loans"}` },
    { label: "Overdue", value: dashboard.overdue, hint: "Follow up with the borrower" },
  ];

  return (
    <section className="mx-auto w-full max-w-[1144px] space-y-6 pb-2">
      <header className="space-y-7">
        <div className="flex items-center justify-between gap-4 text-[10px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
          <span>Workspace / Overview</span>
          <span className="hidden font-normal normal-case tracking-normal sm:inline">
            {new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }).format(now)}
          </span>
        </div>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="booky-heading text-3xl tracking-tight">{greeting}, {firstName}.</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {isAdmin ? "Monitor library operations, accounts, and the collection." : "Here’s what needs your attention at the library today."}
            </p>
          </div>
          <Link to={isAdmin ? "/users" : "/all-borrows/active"} className="booky-button h-11 shrink-0 px-6">
            {isAdmin ? <UserRoundCog className="size-4" /> : <RotateCcw className="size-4" />}
            {isAdmin ? "Manage users" : "Record return"}
            {isAdmin && <ArrowRight className="size-4" />}
          </Link>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <article key={card.label} className={cn("flex min-h-32 flex-col justify-between rounded-[18px] border border-white/55 p-5 shadow-sm", card.featured ? "bg-primary/90" : "bg-card")}>
            <p className="text-xs font-bold text-muted-foreground">{card.label}</p>
            <strong className="booky-heading text-[34px] leading-none tabular-nums">{String(card.value).padStart(2, "0")}</strong>
            <p className="text-[11px] text-muted-foreground">{card.hint}</p>
          </article>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        <section className="booky-glass min-w-0 p-4 sm:p-5">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-foreground">Needs attention</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">Take care of urgent items first.</p>
            </div>
            <Link to="/borrow-requests/pending" className="booky-link shrink-0 text-xs">View all <ArrowRight className="ml-1 inline size-3" /></Link>
          </div>
          <div className="overflow-x-auto">
            <div className="min-w-[620px]">
              <div className="grid grid-cols-[minmax(210px,2fr)_1fr_82px_96px] rounded-md bg-muted/70 px-3 py-2 text-[9px] font-bold uppercase tracking-wide text-muted-foreground">
                <span>Student / Book</span><span>Status</span><span>Date</span><span>Action</span>
              </div>
              {dashboard.attention.length > 0 ? dashboard.attention.map((borrow) => {
                const status = STATUS_META[borrow.status];
                return (
                  <div key={borrow.id} className="grid grid-cols-[minmax(210px,2fr)_1fr_82px_96px] items-center border-b border-border/70 px-3 py-3 last:border-0">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-foreground">{borrow.user_name || "Library member"}</p>
                      <p className="mt-1 truncate text-[11px] text-muted-foreground">{borrow.book_title || "Untitled book"}</p>
                    </div>
                    <div><span className={cn("inline-flex min-w-24 rounded-full px-3 py-1.5 text-[10px] font-bold", status.className)}>{status.label}</span></div>
                    <span className="text-[11px] text-muted-foreground">{formatCompactDate(borrow.due_date ?? borrow.created_at)}</span>
                    <Link to={borrow.status === "PENDING_BORROW" ? "/borrow-requests/pending" : borrow.status === "READY_FOR_PICKUP" ? "/borrow-requests/pickup" : "/all-borrows/active"} className="text-[10px] font-bold text-foreground">{status.action} <ArrowRight className="inline size-3" /></Link>
                  </div>
                );
              }) : <div className="py-12 text-center text-sm text-muted-foreground">Nothing needs attention right now.</div>}
            </div>
          </div>
        </section>

        <aside className="booky-glass flex flex-col p-4 sm:p-5">
          <h2 className="text-lg font-bold text-foreground">Quick actions</h2>
          <div className="mt-3 space-y-2">
            {[["Review requests", "/borrow-requests/pending"], ["Record return", "/all-borrows/active"], ["Add book", "/book-list"]].map(([label, path]) => (
              <Link key={label} to={path} className="flex h-9 items-center justify-between rounded-lg bg-muted/70 px-3 text-xs font-bold text-foreground transition-colors hover:bg-accent">
                {label} <ArrowRight className="size-3.5" />
              </Link>
            ))}
          </div>
          <div className="mt-5 border-t border-border pt-4">
            <p className="text-[10px] font-bold uppercase tracking-wide text-leather">Today at the desk</p>
            <div className="mt-2 flex items-center gap-3 text-heading">
              <strong className="text-3xl tabular-nums">{String(dashboard.returnedToday).padStart(2, "0")}</strong>
              <span className="text-xs text-muted-foreground">books returned today</span>
            </div>
            <Link to="/all-borrows/returned" className="booky-link mt-2 inline-flex items-center text-xs">View return history <ArrowRight className="ml-1 size-3" /></Link>
          </div>
        </aside>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        <section className="booky-glass min-w-0 p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div><h2 className="text-lg font-bold text-foreground">Borrowing activity</h2><p className="mt-1 text-xs text-muted-foreground">Loans and returns · last 7 days</p></div>
            <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><i className="size-2 rounded-sm bg-foreground" />Loans</span>
              <span className="inline-flex items-center gap-1.5"><i className="size-2 rounded-sm bg-primary" />Returns</span>
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-muted/70 px-3 py-2"><CalendarDays className="size-3" />7 days</span>
            </div>
          </div>
          <div className="mt-5 grid h-48 grid-cols-7 items-end gap-2 border-b border-border px-2 sm:gap-4">
            {dashboard.activity.map((item) => (
              <div key={item.date.toISOString()} className="flex h-full min-w-0 flex-col items-center justify-end">
                <div className="flex h-36 items-end gap-1">
                  <div className="w-2.5 rounded-t-full bg-foreground sm:w-4 sm:rounded-t" style={{ height: `${Math.max(item.loans ? 12 : 0, (item.loans / maxActivity) * 100)}%` }} title={`${item.loans} loans`} />
                  <div className="w-2.5 rounded-t bg-primary sm:w-4" style={{ height: `${Math.max(item.returns ? 12 : 0, (item.returns / maxActivity) * 100)}%` }} title={`${item.returns} returns`} />
                </div>
                <span className="mt-2 truncate text-[9px] text-muted-foreground">{item.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="booky-glass p-4 sm:p-5">
          <h2 className="text-lg font-bold text-foreground">Recent activity</h2>
          <div className="mt-4 space-y-4">
            {dashboard.recent.length > 0 ? dashboard.recent.map((borrow, index) => {
              const eventDate = getBorrowDate(borrow);
              const label = borrow.status === "RETURNED" ? "Book returned" : borrow.status === "PENDING_BORROW" ? "New request" : borrow.status === "BORROWED" ? "Book picked up" : STATUS_META[borrow.status].label;
              return (
                <div key={borrow.id} className="grid grid-cols-[8px_1fr_auto] items-start gap-3">
                  <span className={cn("mt-1.5 size-2 rounded-sm", index === 0 ? "bg-primary" : "bg-muted")} />
                  <div className="min-w-0"><p className="text-xs font-bold text-foreground">{label}</p><p className="mt-1 truncate text-[10px] text-muted-foreground">{borrow.book_title} · {borrow.user_name || "Library member"}</p></div>
                  <time className="text-[9px] text-muted-foreground">{eventDate ? new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(new Date(eventDate)) : "—"}</time>
                </div>
              );
            }) : <p className="py-8 text-center text-sm text-muted-foreground">No recent activity yet.</p>}
          </div>
        </section>
      </div>

      <section className="rounded-xl border border-white/55 bg-card/70 p-4">
        <p className="text-[9px] font-bold uppercase tracking-wide text-muted-foreground">Library overview</p>
        <div className={cn("mt-2 grid gap-4", isAdmin ? "grid-cols-2 md:grid-cols-3 xl:grid-cols-6" : "grid-cols-2 md:grid-cols-5")}>
          {overviewItems.map((item) => (
            <div key={item.label} className="flex items-baseline gap-3"><strong className="booky-heading text-2xl tabular-nums">{item.value}</strong><span className="text-[11px] text-muted-foreground">{item.label}</span></div>
          ))}
        </div>
      </section>
    </section>
  );
};

export default AdminDashboardPage;
