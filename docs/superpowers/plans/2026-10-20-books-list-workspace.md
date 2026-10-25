# Books List Workspace Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver the Figma-designed staff Books List workspace with inventory summaries, filtering, details, add/edit drawers, safe archiving, archived browsing, and restoration.

**Architecture:** Add archive metadata and staff-only catalog queries behind the existing Flask books blueprint while preserving the public catalog contract. The React page consumes separate active/archived staff queries plus the existing borrow query, with pure view helpers feeding focused table, drawer, and confirmation components.

**Tech Stack:** Flask 3, Flask-SQLAlchemy, Alembic, PostgreSQL/SQLite tests, Python `unittest`, React 19, TypeScript, TanStack Query, React Hook Form, Zod, Base UI/shadcn components, Tailwind CSS 4, Vitest, Testing Library.

**Spec:** `docs/superpowers/specs/2026-10-20-books-list-workspace-design.md`

## Global Constraints

- Keep `GET /api/books` public and exclude archived books exactly as it does today.
- Staff roles are `admin` and `librarian`, enforced with the existing `admin_required()` middleware.
- Blocking borrow statuses are `PENDING_BORROW`, `READY_FOR_PICKUP`, `BORROWED`, `OVERDUE`, and `PENDING_RETURN`.
- Archive and restore state changes, including timestamps, must commit atomically.
- Reuse the existing Warm Glass tokens and project UI components; do not add a styling or component dependency.
- Preserve existing cover upload, form validation, category creation/selection, and inventory-adjustment behavior.
- Do not redesign the student catalog, Categories page, or any other workspace.

## Review Focus

- Legacy `is_deleted=true` rows with no archive timestamp receive a deterministic migration backfill and appear in Archived.
- Null ISBN, category, pages, description, image, author metadata, or dates render safely and remain searchable where applicable.
- Books reserved for pickup are treated as active circulation and cannot be archived.
- Archive/restore retries and concurrent wrong-state requests fail without changing `is_deleted` or `archived_at`.
- Reducing total copies through Edit cannot reduce inventory below copies currently on loan; the backend error remains visible through the existing toast path.

---

### Task 1: Archive Metadata and Serialization

**Files:**
- Create: `backend/migrations/versions/f2c3d4e5a6b7_add_books_archived_at.py`
- Modify: `backend/app/models/book.py`
- Modify: `backend/app/models/schemas.py`
- Create: `backend/tests/test_book_model.py`

**Interfaces:**
- Produces: `Book.archived_at: datetime | None`; `Book.to_dict()` fields `is_deleted: bool` and `archived_at: str | None`.
- Consumes: Alembic head `e4a6b7c8d9f0`.

- [ ] **Step 1: Write failing model serialization tests**

Add `BookModelSerializationTests.test_active_book_serializes_archive_fields` and `test_archived_book_serializes_utc_timestamp`. Assert literal `False`/`None` for an active book and an ISO timestamp plus `True` for an archived book.

- [ ] **Step 2: Run the model tests and verify RED**

Run: `.\.venv\Scripts\python.exe -m unittest tests.test_book_model -v`

Expected: FAIL because `archived_at` and `is_deleted` are not both serialized.

- [ ] **Step 3: Add the model field and schema keys**

Add `archived_at = db.Column(db.DateTime(timezone=True), nullable=True)` and serialize it using the model's existing ISO conventions. Extend `BookDict` with `is_deleted` and `archived_at`.

- [ ] **Step 4: Add the Alembic migration**

Revision `f2c3d4e5a6b7`, down revision `e4a6b7c8d9f0`: add nullable `books.archived_at`, backfill existing deleted rows with `CURRENT_TIMESTAMP`, and leave active rows null. Downgrade drops the column.

- [ ] **Step 5: Run tests and verify GREEN**

Run: `.\.venv\Scripts\python.exe -m unittest tests.test_book_model -v`

Expected: all `test_book_model` tests PASS.

- [ ] **Step 6: Commit**

```bash
git add backend/app/models/book.py backend/app/models/schemas.py backend/migrations/versions/f2c3d4e5a6b7_add_books_archived_at.py backend/tests/test_book_model.py
git commit -m "feat: add book archive metadata"
```

### Task 2: Staff Catalog and Archive Service Rules

**Files:**
- Modify: `backend/app/services/book_service.py`
- Create: `backend/tests/test_book_service.py`

**Interfaces:**
- Consumes: `Book.archived_at` from Task 1 and existing `Borrow` status constants.
- Produces: `BookService.get_staff_catalog(state: str = "active") -> list[Book]`; `BookService.archive_book(book_id) -> Book`; `BookService.restore_book(book_id) -> Book`.

- [ ] **Step 1: Write failing catalog ordering tests**

Test active results exclude deleted books and sort by `created_at` descending; archived results include only deleted books and sort by `archived_at` descending. Add an invalid-state test expecting `ValueError("Invalid catalog state")`, including empty and mixed-case-invalid values.

- [ ] **Step 2: Run the catalog tests and verify RED**

Run: `.\.venv\Scripts\python.exe -m unittest tests.test_book_service.BookCatalogServiceTests -v`

Expected: FAIL because `get_staff_catalog` does not exist.

- [ ] **Step 3: Implement `get_staff_catalog`**

Use joined loading for category and reviews. Accept only literal `active` and `archived`; filter by `is_deleted` and apply the required ordering.

- [ ] **Step 4: Write failing archive and restore tests**

Add table-driven subtests for every blocking status. Assert eligible archive sets both fields, restore clears both, returned/rejected records do not block, ready-for-pickup does block, and retries preserve state while raising a not-found/wrong-state error.

Also pin the existing inventory invariant: editing `total_copies` below the number currently on loan raises `ValueError` and leaves total and available copies unchanged.

- [ ] **Step 5: Run archive tests and verify RED**

Run: `.\.venv\Scripts\python.exe -m unittest tests.test_book_service.BookArchiveServiceTests -v`

Expected: FAIL because the current delete service omits archive timestamps and does not block every required status.

- [ ] **Step 6: Implement transactional archive and restore methods**

Lock the target book for update, query blocking borrows, set/clear both archive fields, commit once, refresh, and roll back on exceptions. Keep `delete_book` only as a compatibility wrapper if another caller still imports it.

- [ ] **Step 7: Run service tests and verify GREEN**

Run: `.\.venv\Scripts\python.exe -m unittest tests.test_book_service -v`

Expected: all service tests PASS.

- [ ] **Step 8: Commit**

```bash
git add backend/app/services/book_service.py backend/tests/test_book_service.py
git commit -m "feat: add staff book archive service"
```

### Task 3: Staff Books API Contract

**Files:**
- Modify: `backend/app/blueprints/books/routes.py`
- Create: `backend/tests/test_book_routes.py`

**Interfaces:**
- Consumes: Task 2 service methods.
- Produces: `GET /api/books/admin/catalog?state=active|archived`; updated archive/restore responses `{ message: string, book: BookDict }`.

- [ ] **Step 1: Write failing route tests**

Register the real blueprint in a Flask test app and patch only service/database boundaries. Assert staff access, student `403`, unauthenticated `401`, default active state, archived state, invalid state `400`, archive conflict `400`, missing/wrong-state `404`, and successful archive/restore response bodies.

- [ ] **Step 2: Run route tests and verify RED**

Run: `.\.venv\Scripts\python.exe -m unittest tests.test_book_routes -v`

Expected: FAIL because the staff catalog route and updated mutation contracts do not exist.

- [ ] **Step 3: Implement routes and error mapping**

Define the static `/admin/catalog` route before the UUID detail route, validate through the service, and return consistent `{ "message": string }` errors. Update DELETE and restore to return serialized books.

- [ ] **Step 4: Pin the public endpoint regression**

Add a route/service integration assertion that `GET /api/books` still invokes the active-only public query and never returns archived fixtures.

- [ ] **Step 5: Run backend suite and verify GREEN**

Run: `.\.venv\Scripts\python.exe -m unittest discover -s tests -v`

Expected: all backend tests PASS.

- [ ] **Step 6: Commit**

```bash
git add backend/app/blueprints/books/routes.py backend/tests/test_book_routes.py
git commit -m "feat: expose staff book catalog api"
```

### Task 4: Frontend Staff Catalog Data Layer

**Files:**
- Modify: `frontend/src/features/books/types/book.types.ts`
- Modify: `frontend/src/features/books/api/books.ts`
- Modify: `frontend/src/hooks/useBooks.ts`
- Create: `frontend/src/hooks/useStaffBooks.test.tsx`

**Interfaces:**
- Produces: `type StaffBookState = "active" | "archived"`; `getStaffBooks(state): Promise<Book[]>`; `restoreBook(bookId): Promise<BookResponse>`; `useStaffBooks(state)`; `useArchiveBook()`; `useRestoreBook()`.
- Consumes: Task 3 API response shape.

- [ ] **Step 1: Write failing hook/API behavior tests**

Mock the HTTP boundary with complete `Book` fixtures. Assert each state requests `/books/admin/catalog` with the correct parameter, archive uses DELETE, restore uses PUT, and all mutations invalidate `['books', 'staff']`, public `['books']`, and affected `['book']` queries.

- [ ] **Step 2: Run focused tests and verify RED**

Run: `npm.cmd test -- --run src/hooks/useStaffBooks.test.tsx --maxWorkers=1`

Expected: FAIL because the staff functions and hooks are missing.

- [ ] **Step 3: Implement types, API calls, and hooks**

Add optional `is_deleted?: boolean` and `archived_at?: string | null` to `Book`. Keep existing public hooks unchanged and use the shared staff query-key prefix for invalidation.

- [ ] **Step 4: Run focused tests and verify GREEN**

Run: `npm.cmd test -- --run src/hooks/useStaffBooks.test.tsx --maxWorkers=1`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/features/books/types/book.types.ts frontend/src/features/books/api/books.ts frontend/src/hooks/useBooks.ts frontend/src/hooks/useStaffBooks.test.tsx
git commit -m "feat: add staff catalog client"
```

### Task 5: Books List View Model

**Files:**
- Create: `frontend/src/features/books/lib/bookListView.ts`
- Create: `frontend/src/features/books/lib/bookListView.test.ts`

**Interfaces:**
- Produces: `getBookSummary(activeBooks)`; `filterAndSortBooks(books, options)`; `getBookCirculation(bookId, borrows)`; `formatBookDate(value)`; `BookListFilters`.
- Consumes: `Book` and existing `Borrow` types.

- [ ] **Step 1: Write failing pure-function tests**

Use literal fixtures to pin summary totals, zero-copy unavailable titles, null-safe search, category filtering, active availability filtering, archive-date filtering, title/recent/availability/archive sorting, and stable pagination input ordering.

- [ ] **Step 2: Add circulation classification tests**

Assert `BORROWED`, `OVERDUE`, and `PENDING_RETURN` count as on-loan; `PENDING_BORROW` and `READY_FOR_PICKUP` count as reserved; returned/rejected are excluded; null student/book metadata never throws.

- [ ] **Step 3: Run tests and verify RED**

Run: `npm.cmd test -- --run src/features/books/lib/bookListView.test.ts --maxWorkers=1`

Expected: FAIL because the view-model module is missing.

- [ ] **Step 4: Implement the pure view-model functions**

Use local calendar dates for archive-date filtering and `Intl.DateTimeFormat('en-US')` for display. Do not mutate input arrays.

- [ ] **Step 5: Run tests and verify GREEN**

Run: `npm.cmd test -- --run src/features/books/lib/bookListView.test.ts --maxWorkers=1`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/features/books/lib/bookListView.ts frontend/src/features/books/lib/bookListView.test.ts
git commit -m "feat: add books list view model"
```

### Task 6: Books Workspace, Table, and Details

**Files:**
- Modify: `frontend/src/pages/adminPage/BooksListPage.tsx`
- Modify: `frontend/src/features/books/components/books/BooksTable.tsx`
- Create: `frontend/src/features/books/components/books/BookDetailsDialog.tsx`
- Create: `frontend/src/pages/adminPage/BooksListPage.test.tsx`

**Interfaces:**
- Consumes: Tasks 4 and 5 hooks/helpers plus `useAdminBorrows()`.
- Produces: responsive active/archived workspace and `BookDetailsDialog` callbacks `onEdit(book)` and `onArchive(book)`.

- [ ] **Step 1: Write failing page tests for summaries and tabs**

Render with complete active, archived, and borrow fixtures. Assert the four literal summary values, Active excludes archived rows, Archived displays archive date and Restore, and loading/error states preserve readable feedback.

- [ ] **Step 2: Write failing filter, sort, and pagination tests**

Assert title/author/ISBN search, category, availability, archived date, sort controls, empty state, and 10-row pagination behavior through user-visible results.

- [ ] **Step 3: Write failing details tests**

Open View and assert title metadata plus literal total/available/on-loan/reserved counts. Include null fields and borrow-query-error behavior.

- [ ] **Step 4: Run focused tests and verify RED**

Run: `npm.cmd test -- --run src/pages/adminPage/BooksListPage.test.tsx --maxWorkers=1`

Expected: FAIL because the Figma workspace and details drawer are missing.

- [ ] **Step 5: Implement the workspace and table**

Translate the Figma fixed frame into the existing responsive MainLayout. Use summary cards, pill tabs, native/project controls, horizontal table overflow, 10-row client pagination, and dynamic API-supplied cover images.

- [ ] **Step 6: Implement `BookDetailsDialog`**

Use the existing Base UI dialog primitives as a right drawer. Render the four inventory metrics and current circulation, with full-width mobile behavior and accessible titles/actions.

- [ ] **Step 7: Run focused tests and verify GREEN**

Run: `npm.cmd test -- --run src/pages/adminPage/BooksListPage.test.tsx --maxWorkers=1`

Expected: PASS with no accessibility or nested-interactive warnings.

- [ ] **Step 8: Commit**

```bash
git add frontend/src/pages/adminPage/BooksListPage.tsx frontend/src/pages/adminPage/BooksListPage.test.tsx frontend/src/features/books/components/books/BooksTable.tsx frontend/src/features/books/components/books/BookDetailsDialog.tsx
git commit -m "feat: redesign books list workspace"
```

### Task 7: Add/Edit Drawer and Archive/Restore Dialogs

**Files:**
- Modify: `frontend/src/features/books/components/books/BookFormModal.tsx`
- Create: `frontend/src/features/books/components/books/BookArchiveDialog.tsx`
- Create: `frontend/src/features/books/components/books/BookRestoreDialog.tsx`
- Create: `frontend/src/features/books/components/books/BookManagementWorkflow.test.tsx`
- Modify: `frontend/src/pages/adminPage/BooksListPage.tsx`

**Interfaces:**
- Consumes: Task 4 mutations, Task 5 circulation result, Task 6 page callbacks.
- Produces: Figma add/edit drawer, eligible/blocked archive dialogs, and restore confirmation.

- [ ] **Step 1: Write failing add/edit drawer tests**

Assert Add opens `Add a new book`, Edit opens populated fields, client validation blocks missing title/author and totals below one, Cancel closes, and submit reaches the existing create/update mutation contracts. Assert a server rejection of a total-copy reduction keeps the drawer open so the existing mutation error toast remains visible.

- [ ] **Step 2: Write failing archive workflow tests**

Assert eligible archive shows the confirmation facts and invokes archive once; every blocking status opens the unavailable dialog instead; blocked actions link to `/borrow-requests/pending` for pending/reserved records and `/all-borrows/active` for loans/returns.

- [ ] **Step 3: Write failing restore test**

Assert Restore opens a confirmation dialog and invokes restore once while disabling duplicate submission.

- [ ] **Step 4: Run workflow tests and verify RED**

Run: `npm.cmd test -- --run src/features/books/components/books/BookManagementWorkflow.test.tsx --maxWorkers=1`

Expected: FAIL because the drawer/dialog workflows do not exist.

- [ ] **Step 5: Refactor the form into the right-side drawer**

Retain `BookFormModal`'s public props and React Hook Form/Zod wiring. Match Figma field order, cover preview geometry, footer actions, pending states, and responsive width.

- [ ] **Step 6: Implement archive and restore dialogs**

Use accessible Dialog primitives, exact eligible/blocked branching from circulation data, and mutation pending guards. Close only after a successful mutation callback.

- [ ] **Step 7: Run workflow tests and verify GREEN**

Run: `npm.cmd test -- --run src/features/books/components/books/BookManagementWorkflow.test.tsx --maxWorkers=1`

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add frontend/src/features/books/components/books/BookFormModal.tsx frontend/src/features/books/components/books/BookArchiveDialog.tsx frontend/src/features/books/components/books/BookRestoreDialog.tsx frontend/src/features/books/components/books/BookManagementWorkflow.test.tsx frontend/src/pages/adminPage/BooksListPage.tsx
git commit -m "feat: add book management workflows"
```

### Task 8: Migration, Regression, and Visual Verification

**Files:**
- Modify only in-scope files above if verification exposes defects.

**Interfaces:**
- Consumes: all prior tasks.
- Produces: migrated local database and verified Books List deliverable.

- [ ] **Step 1: Apply the migration**

Run from `backend`: `.\.venv\Scripts\flask.exe db upgrade`

Expected: database advances to `f2c3d4e5a6b7`; existing archived rows have non-null `archived_at`.

- [ ] **Step 2: Run the complete backend suite**

Run: `.\.venv\Scripts\python.exe -m unittest discover -s tests -v`

Expected: all tests PASS.

- [ ] **Step 3: Run the complete frontend suite**

Run: `npm.cmd test -- --maxWorkers=1`

Expected: all tests PASS with zero unhandled errors.

- [ ] **Step 4: Run targeted lint and TypeScript checks**

Run ESLint over every changed Books List file, then `npx.cmd tsc -b --pretty false`. Any unrelated pre-existing failure must be reported by exact file and diagnostic; do not edit that file.

- [ ] **Step 5: Build the frontend bundle**

Run: `node --max-old-space-size=4096 node_modules/vite/bin/vite.js build`

Expected: Vite exits `0`; report the existing chunk-size advisory if it remains.

- [ ] **Step 6: Verify the requested screen against Figma**

At desktop and narrow widths, compare All Books, Archived, Add, Edit, Details, eligible archive, blocked archive, and Restore states. Confirm every API-supplied cover preserves its aspect ratio and no temporary Figma asset URL exists in source.

- [ ] **Step 7: Review scope and working tree**

Confirm no unrelated file was modified and the untracked PDF remains untouched.

- [ ] **Step 8: Commit verification fixes, if any**

```bash
git add <only in-scope verification fixes>
git commit -m "fix: finish books list workspace"
```
