# Borrow Request Workflow Design

## Objective

Refactor the librarian/admin borrow-request experience to match the approved Figma screens while preserving the existing book, account, and loan-management behavior. The delivered flow must distinguish reviewing a request from handing the physical book to the student: approval reserves a copy, while pickup starts the 14-day loan.

## Scope

This change covers:

- The staff Borrow Requests page and its Pending, For Pickup, and History states.
- The request-detail drawer, rejection confirmation, and pickup confirmation dialogs.
- Backend request-state transitions, persistence, serialization, and staff endpoints needed by those screens.
- Student-facing borrow data needed to keep approved reservations visible.
- Navigation and dashboard links that lead to the request workflow.

The separate Loans & Returns page, Books List design, Categories design, and other Figma screens are out of scope. Existing unrelated working-tree changes must be preserved.

## Request Lifecycle

The canonical lifecycle is:

1. `PENDING_BORROW`: the student submitted a request and staff has not reviewed it.
2. `READY_FOR_PICKUP`: staff approved the request and one available copy is reserved.
3. `BORROWED`: staff confirmed physical pickup; `borrowed_at` is set and `due_date` is 14 days later.
4. `PENDING_RETURN`: the student requested a return.
5. `RETURNED`: staff confirmed physical receipt and the available-copy count was restored.

Terminal request outcomes are `REJECTED` and the existing completed loan state `RETURNED`. Existing `OVERDUE` behavior remains derived from a borrowed loan whose due date has passed.

Approval must atomically lock the book record, verify availability, decrement `available_copies`, set `READY_FOR_PICKUP`, and set `approved_at`. Pickup must not decrement inventory again. Rejection is valid only from `PENDING_BORROW`. Return confirmation restores inventory exactly once.

Existing records are not rewritten: current `BORROWED`, `PENDING_RETURN`, `RETURNED`, and `REJECTED` rows keep their meaning.

## Persistence and API Contract

The `borrows` table gains:

- `approved_at`, nullable datetime.
- `rejection_reason`, nullable text.

`READY_FOR_PICKUP` is added to the backend and frontend status unions. The serialized borrow response also exposes `book_available_copies`, derived from the joined book relationship, so the request drawer can show current availability without issuing a second catalog request.

Staff endpoints:

- Existing `PUT /api/borrows/admin/:id/approve-borrow` changes from starting a loan to reserving a copy and returning `READY_FOR_PICKUP`.
- New `PUT /api/borrows/admin/:id/confirm-pickup` starts the loan and returns the updated `BORROWED` record.
- Existing `PUT /api/borrows/admin/:id/reject-borrow` accepts JSON `{ "reason": string }`, requires a non-empty trimmed reason, stores it, and returns the updated `REJECTED` record.
- Existing list endpoints return the added fields without changing their outer response shapes.

Error responses continue to use `{ "message": string }`. Invalid state transitions return `400`, missing records return `404`, and authorization continues to use the existing staff middleware.

## Frontend Structure

Add a dedicated request-workflow route so this design does not overwrite the separate Loans & Returns behavior:

- `/borrow-requests` redirects or defaults to `/borrow-requests/pending`.
- `/borrow-requests/pending`
- `/borrow-requests/pickup`
- `/borrow-requests/history`

The existing `/all-borrows` routes remain the Loans & Returns workspace. Staff navigation and dashboard request links are updated to use `/borrow-requests/pending`; return and active-loan links continue to use `/all-borrows`.

The page uses the existing React Query borrow list as the source of truth and derives:

- Pending: `PENDING_BORROW`, oldest request first.
- For Pickup: `READY_FOR_PICKUP`, oldest approval first.
- History: `BORROWED`, `PENDING_RETURN`, `RETURNED`, and `REJECTED`, newest activity first.
- Picked up today: records whose `borrowed_at` is today.

Search matches student name, email, book title, author, full UUID, and a stable display reference derived from the UUID. Date and ordering controls operate client-side because the existing endpoint returns the complete collection. Pagination remains client-side.

## UI Behavior

The screen follows the Figma composition:

- Workspace breadcrumb, current date, title, and explanatory copy.
- Three summary cards: Pending requests, For pickup, and Picked up today.
- A glass workspace card containing state tabs, search, date/order controls, responsive table, status badges, and pagination.
- Book cover imagery uses `book_image` when present and a styled fallback otherwise.
- Empty, loading, API-error, and mutation-in-progress states remain accessible and visible.

Pending rows open a right-side request drawer. The drawer shows the request reference, student identity, requested book, author, available copies, and timeline. Approve and reject actions are available only while pending.

Reject opens a confirmation dialog with a required reason. Confirming sends the reason to the backend. For Pickup rows open a pickup dialog that previews the pickup date and expected return date; confirming calls the pickup endpoint. History rows provide read-only details.

On successful mutations, React Query invalidates borrow and book queries so counts, tables, and inventory refresh together. Buttons are disabled while their record is being processed, and server errors are surfaced through the existing toast system.

## Responsive and Accessibility Requirements

- Desktop dimensions and spacing follow the 1440px Figma frame and the existing 232px staff sidebar.
- Summary cards and controls stack at smaller breakpoints.
- The table scrolls horizontally when its columns cannot fit without truncating essential actions.
- Drawer and dialogs use the existing accessible Sheet/Dialog components, including focus management, labels, close controls, and keyboard dismissal.
- Interactive controls have visible focus states and non-color status labels.

## Testing and Verification

Backend verification covers:

- Approval reserves exactly one copy and produces `READY_FOR_PICKUP` without loan dates.
- Approval fails when no copy is available or the request is in the wrong state.
- Pickup is allowed only from `READY_FOR_PICKUP`, sets both loan dates, and does not decrement inventory twice.
- Rejection requires and persists a reason.
- Student active-borrow queries include `READY_FOR_PICKUP`.
- Duplicate-request checks treat `READY_FOR_PICKUP` as active.

Frontend verification covers tab classification, search/sort behavior, action availability by state, dialog submission payloads, query invalidation, empty states, and responsive compilation. The final verification commands are the repository's frontend lint/build checks plus backend syntax/tests available in the environment. Pre-existing unrelated failures are reported rather than silently changed.

## Acceptance Criteria

- Staff can approve a pending request without starting its loan clock.
- Approved requests appear in For Pickup and reserve inventory.
- Staff can confirm pickup, after which the loan begins with a server-generated 14-day due date.
- Staff must supply a rejection reason, and that reason is available in the serialized record for student-facing use.
- Pending, For Pickup, and History screens match the Figma hierarchy and remain usable on mobile.
- Existing loan return behavior continues to work without double-adjusting inventory.
- No unrelated Figma screen is implemented as part of this change.
