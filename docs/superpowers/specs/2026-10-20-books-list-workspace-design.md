# Books List Workspace Design

## Goal

Refactor the librarian/admin Books List workspace to match the approved Figma screens while preserving the public student catalog. Staff must be able to review inventory, add and edit titles, inspect current circulation, archive eligible books, browse archived titles, and restore archived books.

## Scope

This work covers the staff route at `/book-list`, its add/edit/detail/archive/restore interactions, the staff catalog API required by those screens, and the database metadata needed to display archive dates.

The student book catalog, Categories page redesign, dashboard redesign, Loans & Returns redesign, and unrelated settings screens are out of scope. Existing unrelated working-tree changes must be preserved.

## Catalog State and Archive Rules

Books remain soft deleted through the existing `is_deleted` field. Add a nullable timezone-aware `archived_at` timestamp.

- Archiving sets `is_deleted` to `true` and `archived_at` to the server timestamp in one transaction.
- Restoring sets `is_deleted` to `false` and clears `archived_at` in one transaction.
- Repeating archive or restore against the wrong state fails without changing the record.
- A book cannot be archived while any associated borrow is in `PENDING_BORROW`, `READY_FOR_PICKUP`, `BORROWED`, `OVERDUE`, or `PENDING_RETURN`.
- `REJECTED` and `RETURNED` records do not block archiving.
- The existing public books endpoint continues to exclude archived books.

Existing archived rows receive an `archived_at` value during migration using the migration execution time so every archived row can be displayed and sorted consistently. Active rows keep `archived_at = NULL`.

## Backend API

Add a staff-protected endpoint:

`GET /api/books/admin/catalog?state=active|archived`

- `state` defaults to `active`.
- Any other value returns `400` with `{ "message": string }`.
- The response is a JSON array of complete book records.
- Each record includes the existing fields plus `is_deleted` and `archived_at`.
- Active results are newest-created first; archived results are newest-archived first.
- Both admin and librarian roles may access the endpoint through the existing staff authorization middleware.

The existing endpoints remain responsible for mutations:

- `DELETE /api/books/:id` archives an eligible active book and returns the updated book with a success message.
- `PUT /api/books/restore/:id` restores an archived book and returns the updated book with a success message.
- Archive conflicts return `400`; missing or wrong-state records return `404`.

The service performs eligibility checks and state changes transactionally. Routes translate expected service errors into `{ "message": string }` without exposing internal exceptions.

## Frontend Data Flow

Add staff catalog API functions and query hooks for active and archived books. Both queries share a staff-catalog query-key prefix so create, update, archive, and restore mutations can invalidate all staff catalog views. Existing public book hooks and API functions remain unchanged.

The Books List page also consumes the existing admin borrow collection to associate current requests, reservations, and loans with a selected book. This avoids creating a second circulation endpoint. A failure to load circulation details must not hide the catalog; the details drawer shows book inventory and a concise unavailable-state message for the circulation section.

The frontend `Book` type gains `is_deleted` and `archived_at`. These fields are required for staff responses and optional for compatibility with existing public responses during rollout.

## Books List Workspace

The page follows the responsive Warm Glass design already used by the dashboard and Loans & Returns workspace.

The header contains the workspace eyebrow, current date, `Books List` title, supporting text, and an `Add book` action.

Four live summary cards display:

1. Active book-title count.
2. Total copies across active titles.
3. Available copies across active titles.
4. Count of active titles with zero available copies.

The main workspace contains:

- `All books` and `Archived` tabs with live counts.
- Search across title, formatted author, and ISBN.
- Category filter.
- Availability filter for active books; archived-date filter for archived books.
- Sort controls for recently added, title, availability, or archive date as appropriate.
- Responsive tabular results and client-side pagination.

The active table displays book, category, ISBN, available/total copies, availability, and actions. Each row supports View, Edit, and an overflow archive action. The archived table displays book, category, ISBN, archive date, archived status, and Restore.

Empty, loading, and API-error states remain visible inside the workspace without breaking page structure.

## Drawers and Dialogs

### Add and Edit Book

Refactor the existing book form into a right-side drawer matching Figma. Preserve existing schema validation, cover upload, category selection, and create/update mutations. Available copies remain derived by the backend from total-copy changes and are not directly editable.

### Book Details

The right-side details drawer shows cover, title, author, availability, total/available/on-loan/reserved counts, ISBN, category, pages, added date, description, and associated current circulation records.

`on-loan` counts `BORROWED`, `OVERDUE`, and `PENDING_RETURN`. `reserved` counts `PENDING_BORROW` and `READY_FOR_PICKUP`. The drawer offers Edit and Archive actions for active titles.

### Archive

Eligible books open an archive confirmation dialog showing title, author, copy count, and the fact that no active loans or reservations exist. Confirmation invokes the archive endpoint.

Ineligible books open the Figma blocked dialog summarizing the blocking circulation records. No mutation is offered; staff may return to books or navigate to the relevant Loans & Returns or Borrow Requests workspace.

### Restore

Archived books open a restore confirmation dialog. Confirmation invokes the restore endpoint and makes the title visible in the active collection again.

Mutation buttons show pending states and prevent duplicate submission. API failures continue to use the existing toast error handling.

## Responsive and Accessibility Requirements

- Desktop proportions match the 1440-pixel Figma frames while using project-native responsive layout rather than fixed positioning.
- Tables remain horizontally scrollable at narrow widths; page controls and summary cards reflow without clipping.
- Drawers become full-width on small screens.
- All icon-only and row actions have accessible names.
- Dialogs have programmatic titles and descriptions, keyboard focus management, and cancel controls.
- Native or project-standard form controls retain visible focus states and labels.

## Testing

Backend tests cover:

- Active and archived staff listing, ordering, serialization, authorization, and invalid-state query handling.
- Archive timestamp creation and restore timestamp clearing.
- Every blocking borrow status, including ready-for-pickup reservations.
- Successful archive/restore and repeated or wrong-state attempts.
- Preservation of public catalog behavior.

Frontend tests cover:

- Summary calculations from active titles.
- Active/archived tabs, search, category, availability/date filters, sorting, and pagination.
- Details inventory and circulation counts.
- Eligible archive confirmation and blocked archive behavior.
- Restore confirmation.
- Add and edit drawer entry points while retaining existing form validation and mutation wiring.

## Acceptance Criteria

- Staff can browse and manage active books in a responsive screen matching the approved Figma design.
- Summary cards and table availability values are derived from live data.
- Staff can inspect book details and current circulation.
- Eligible books can be archived and later restored.
- Books with active requests, reservations, loans, overdue loans, or pending returns cannot be archived.
- Archived books are hidden from the student catalog and visible only in the staff Archived tab.
- Archive dates are persisted and displayed.
- Existing add/edit functionality remains operational.
- No unrelated page is redesigned or refactored.
