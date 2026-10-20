# Borrow Request Workflow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver the approved librarian/admin Borrow Requests workflow, including reservation approval, pickup confirmation, reasoned rejection, and the Figma-matched Pending, For Pickup, and History interface.

**Architecture:** Extend the existing borrow state machine and API rather than creating a second request model. The React page continues to load the complete staff borrow collection through React Query, then uses a pure view-model module for tab classification, search, ordering, dates, counts, and display references; focused Sheet/Dialog components own the three staff interactions.

**Tech Stack:** Flask, Flask-SQLAlchemy, Alembic, Python `unittest`, React 19, TypeScript, React Router, TanStack Query, Base UI wrappers, Tailwind CSS, Vitest, Testing Library

**Spec:** `docs/superpowers/specs/2026-10-20-borrow-request-workflow-design.md`

## Global Constraints

- Approval reserves exactly one copy and changes `PENDING_BORROW` to `READY_FOR_PICKUP`; it must not start the loan clock.
- Pickup changes only `READY_FOR_PICKUP` to `BORROWED`, sets server-generated loan dates exactly 14 days apart, and must not decrement inventory again.
- Rejection is allowed only from `PENDING_BORROW` and requires a non-empty trimmed reason.
- Existing `/all-borrows` routes remain the separate Loans & Returns workspace; no other Figma screen is redesigned.
- The Request Date table cell displays a calendar date only; exact timestamps are limited to the detail timeline.
- Existing unrelated working-tree changes must be preserved.

## Review Focus

- Competing approvals for the last copy must result in one reservation and no negative inventory; Task 2 pins the locked availability check and the second approval failure.
- Retrying approve, reject, pickup, or return must fail without repeating an inventory adjustment; Tasks 2 and 3 pin wrong-state behavior.
- Whitespace-only rejection reasons must return `400` and must not mutate the request; Tasks 2 and 3 pin trimming and persistence.
- Missing timestamps, names, images, or authors in older rows must render useful fallbacks rather than crash; Tasks 4 and 5 pin nullable-data behavior.
- Date filtering and “picked up today” must compare local calendar dates while API timestamps remain ISO strings; Task 4 pins local-day boundaries.

---

### Task 1: Persist and serialize pickup workflow data

**Files:**
- Create: `backend/migrations/versions/e4a6b7c8d9f0_add_borrow_pickup_workflow.py`
- Create: `backend/tests/__init__.py`
- Modify: `backend/app/models/borrow.py`
- Modify: `backend/app/models/schemas.py`
- Test: `backend/tests/test_borrow_model.py`

**Interfaces:**
- Consumes: Existing `Borrow.to_dict() -> BorrowDict` and the `b7f3a91c4d2e` borrow migration branch.
- Produces: `Borrow.STATUS_READY_FOR_PICKUP`, nullable `approved_at: datetime`, nullable `rejection_reason: str`, and serialized `approved_at`, `rejection_reason`, and `book_available_copies` fields.

- [ ] **Step 1: Write model serialization tests**

Add `BorrowModelSerializationTests` using a minimal in-memory Flask-SQLAlchemy app. Assert that a borrow with an attached book serializes `READY_FOR_PICKUP`, ISO `approved_at`, `rejection_reason`, and `book_available_copies`; assert that missing optional relationships/fields serialize safe `None` or existing fallback values.

- [ ] **Step 2: Run the model test to verify it fails**

Run: `python -m unittest tests.test_borrow_model -v`

Working directory: `backend`

Expected: FAIL because the new status, columns, and response keys do not exist.

- [ ] **Step 3: Add the status, columns, and typed response fields**

In `Borrow`, add `STATUS_READY_FOR_PICKUP = "READY_FOR_PICKUP"`, `approved_at = db.Column(db.DateTime, nullable=True)`, and `rejection_reason = db.Column(db.Text, nullable=True)`. Extend `BorrowStatus` and `BorrowDict`, and have `to_dict()` expose both fields plus `book_available_copies: int | None` from the loaded book.

- [ ] **Step 4: Add the reversible Alembic migration**

Create revision `e4a6b7c8d9f0` with `down_revision = 'b7f3a91c4d2e'`; `upgrade()` adds the nullable datetime and text columns and `downgrade()` removes them. Do not rewrite existing borrow records or merge the repository’s unrelated migration branch.

- [ ] **Step 5: Run the model test to verify it passes**

Run: `python -m unittest tests.test_borrow_model -v`

Working directory: `backend`

Expected: PASS.

- [ ] **Step 6: Commit the persistence contract**

```bash
git add backend/app/models/borrow.py backend/app/models/schemas.py backend/migrations/versions/e4a6b7c8d9f0_add_borrow_pickup_workflow.py backend/tests/__init__.py backend/tests/test_borrow_model.py
git commit -m "feat: add borrow pickup workflow fields"
```

### Task 2: Implement atomic request state transitions

**Files:**
- Modify: `backend/app/services/borrow_service.py`
- Test: `backend/tests/test_borrow_service.py`

**Interfaces:**
- Consumes: Task 1’s `Borrow.STATUS_READY_FOR_PICKUP`, `approved_at`, and `rejection_reason`.
- Produces: `BorrowService.approve_borrow_request(borrow_id) -> Borrow`, `BorrowService.confirm_borrow_pickup(borrow_id) -> Borrow`, and `BorrowService.reject_borrow_request(borrow_id, reason: str) -> Borrow` with the state and inventory guarantees below.

- [ ] **Step 1: Write failing service tests for active requests and approval**

Test that active-query and duplicate-request status sets include `READY_FOR_PICKUP`; approval locks the associated book, reserves one copy, sets `approved_at`, clears loan dates, and yields `READY_FOR_PICKUP`. Test zero-stock, wrong-state, repeated approval, and two-request/one-copy behavior; every failure must preserve status and non-negative inventory.

- [ ] **Step 2: Run the focused tests to verify they fail**

Run: `python -m unittest tests.test_borrow_service.BorrowApprovalTests -v`

Working directory: `backend`

Expected: FAIL because approval currently starts a loan and ready-for-pickup is not active.

- [ ] **Step 3: Implement reservation approval and active-status coverage**

Update the two active-status filters. In `approve_borrow_request`, lock the borrow and book rows inside one transaction, validate `PENDING_BORROW` and positive availability, decrement once, set `READY_FOR_PICKUP` and one UTC `approved_at`, and leave `borrowed_at`/`due_date` null. Roll back all mutations on error.

- [ ] **Step 4: Run approval tests to verify they pass**

Run: `python -m unittest tests.test_borrow_service.BorrowApprovalTests -v`

Working directory: `backend`

Expected: PASS.

- [ ] **Step 5: Write failing pickup and rejection tests**

Test pickup from `READY_FOR_PICKUP` sets one UTC `borrowed_at`, sets `due_date` exactly `BORROW_DURATION` days later, preserves inventory, and rejects missing/wrong-state/repeated calls. Test rejection trims and persists a normal reason, rejects empty and whitespace-only strings, rejects wrong states, and leaves inventory unchanged.

- [ ] **Step 6: Run the focused tests to verify they fail**

Run: `python -m unittest tests.test_borrow_service.BorrowPickupAndRejectionTests -v`

Working directory: `backend`

Expected: FAIL because pickup does not exist and rejection has no reason parameter.

- [ ] **Step 7: Implement pickup and reasoned rejection**

Add `confirm_borrow_pickup`; compute both timestamps from a single `now = datetime.now(timezone.utc)`. Change rejection to accept `reason`, strip it before validation/persistence, and allow mutation only from `PENDING_BORROW`.

- [ ] **Step 8: Run all service tests**

Run: `python -m unittest tests.test_borrow_service -v`

Working directory: `backend`

Expected: PASS, including wrong-state retries and inventory invariants.

- [ ] **Step 9: Commit the service workflow**

```bash
git add backend/app/services/borrow_service.py backend/tests/test_borrow_service.py
git commit -m "feat: implement borrow reservation and pickup transitions"
```

### Task 3: Expose staff pickup and rejection API contracts

**Files:**
- Modify: `backend/app/blueprints/borrows/routes.py`
- Test: `backend/tests/test_borrow_routes.py`

**Interfaces:**
- Consumes: Task 2’s three staff service methods.
- Produces: `PUT /api/borrows/admin/<uuid:id>/confirm-pickup`, reason-aware `PUT .../reject-borrow`, and reservation semantics/messages for `PUT .../approve-borrow`.

- [ ] **Step 1: Write failing route contract tests**

Use a Flask test app with the borrow blueprint and staff JWT. Assert: approve returns the service borrow and a reservation-oriented message; pickup returns `200` with the updated borrow; reject passes the trimmed JSON `reason`; missing JSON, missing reason, empty reason, and whitespace reason return `{ "message": string }` with `400` without calling the service; missing records map to `404`; non-staff remains `403`.

- [ ] **Step 2: Run route tests to verify they fail**

Run: `python -m unittest tests.test_borrow_routes -v`

Working directory: `backend`

Expected: FAIL because the pickup route and rejection payload validation do not exist.

- [ ] **Step 3: Implement the route contracts**

Add the pickup route under the existing `admin_required()` middleware. Parse rejection JSON safely, require a string whose trimmed value is non-empty, and call `reject_borrow_request(id, reason)`. Preserve the existing outer `{message, borrow}` success shape and `{message}` error shape.

- [ ] **Step 4: Run all backend tests**

Run: `python -m unittest discover -s tests -v`

Working directory: `backend`

Expected: PASS.

- [ ] **Step 5: Commit the API contract**

```bash
git add backend/app/blueprints/borrows/routes.py backend/tests/test_borrow_routes.py
git commit -m "feat: expose pickup and reasoned rejection endpoints"
```

### Task 4: Add the typed frontend workflow and pure request view model

**Files:**
- Modify: `frontend/package.json`
- Modify: `frontend/package-lock.json`
- Create: `frontend/vitest.config.ts`
- Create: `frontend/src/test/setup.ts`
- Modify: `frontend/src/features/borrows/types/borrow.types.ts`
- Modify: `frontend/src/features/borrows/api/borrows.ts`
- Modify: `frontend/src/hooks/useBorrows.ts`
- Create: `frontend/src/features/borrows/lib/borrowRequestView.ts`
- Test: `frontend/src/features/borrows/lib/borrowRequestView.test.ts`
- Test: `frontend/src/hooks/useBorrowWorkflow.test.tsx`

**Interfaces:**
- Consumes: The API response fields and endpoints from Tasks 1 and 3.
- Produces: `READY_FOR_PICKUP` in `BorrowStatus`; `rejectBorrow(id, reason)`; `confirmPickup(id)`; React Query mutations `useRejectBorrow()` and `useConfirmBorrowPickup()`; and pure exports `classifyBorrowRequests`, `filterBorrowRequests`, `sortBorrowRequests`, `formatRequestDate`, `getBorrowReference`, and `getBorrowRequestCounts`.

- [ ] **Step 1: Add the frontend test harness**

Install Vitest, jsdom, `@testing-library/react`, `@testing-library/user-event`, and `@testing-library/jest-dom` as dev dependencies; add `"test": "vitest run"`, a jsdom Vitest config, and jest-dom setup. Keep Vite’s production configuration unchanged.

- [ ] **Step 2: Write failing view-model tests**

Pin these behaviors: Pending=`PENDING_BORROW` oldest request first; For Pickup=`READY_FOR_PICKUP` oldest `approved_at` first; History includes only `BORROWED`, `PENDING_RETURN`, `RETURNED`, `REJECTED` newest activity first; search covers name, email, title, author, UUID, and stable display reference case-insensitively; date filtering and picked-up-today use local calendar dates; null metadata remains searchable/renderable; and `formatRequestDate()` returns a date with no time token.

- [ ] **Step 3: Run focused tests to verify they fail**

Run: `npm test -- --run src/features/borrows/lib/borrowRequestView.test.ts`

Working directory: `frontend`

Expected: FAIL because the view-model module and new status contract do not exist.

- [ ] **Step 4: Write failing API and mutation tests**

Assert `rejectBorrow(id, reason)` sends `PUT /api/borrows/admin/:id/reject-borrow` with `{ reason }`, `confirmPickup(id)` sends `PUT /api/borrows/admin/:id/confirm-pickup`, and each successful mutation invalidates both `['borrows']` and `['books']` while failures surface the server message through the existing toast path.

- [ ] **Step 5: Run workflow tests to verify they fail**

Run: `npm test -- --run src/hooks/useBorrowWorkflow.test.tsx`

Working directory: `frontend`

Expected: FAIL because the pickup API/mutation and reason payload do not exist.

- [ ] **Step 6: Implement the typed API and view-model interfaces**

Extend `Borrow` with `approved_at`, `rejection_reason`, and `book_available_copies`. Add `rejectBorrow(id: string, reason: string)` sending `{ reason }` and `confirmPickup(id: string)`. Both related mutations invalidate `['borrows']` and `['books']`; retain toast-based server errors. Implement pure classification, filtering, stable reference, local-date formatting/comparison, count, and ordering functions without mutating the query result array.

- [ ] **Step 7: Run focused tests and TypeScript compilation**

Run: `npm test -- --run src/features/borrows/lib/borrowRequestView.test.ts`

Run: `npm test -- --run src/hooks/useBorrowWorkflow.test.tsx`

Run: `npx tsc -b --pretty false`

Working directory: `frontend`

Expected: View-model tests PASS. If TypeScript reports only the pre-existing unused `BookOpen` import in `BookCatalogPage.tsx`, record it for final verification and do not modify that unrelated page.

- [ ] **Step 8: Commit the frontend workflow contract**

```bash
git add frontend/package.json frontend/package-lock.json frontend/vitest.config.ts frontend/src/test/setup.ts frontend/src/features/borrows/types/borrow.types.ts frontend/src/features/borrows/api/borrows.ts frontend/src/hooks/useBorrows.ts frontend/src/hooks/useBorrowWorkflow.test.tsx frontend/src/features/borrows/lib/borrowRequestView.ts frontend/src/features/borrows/lib/borrowRequestView.test.ts
git commit -m "feat: add borrow request frontend workflow model"
```

### Task 5: Build the request table, drawer, and dialogs

**Files:**
- Create: `frontend/src/features/borrows/components/BorrowRequestsTable.tsx`
- Create: `frontend/src/features/borrows/components/BorrowRequestDetailsSheet.tsx`
- Create: `frontend/src/features/borrows/components/RejectBorrowRequestDialog.tsx`
- Create: `frontend/src/features/borrows/components/ConfirmPickupDialog.tsx`
- Test: `frontend/src/features/borrows/components/BorrowRequestWorkflow.test.tsx`

**Interfaces:**
- Consumes: Task 4’s `Borrow`, date/reference helpers, and mutation callback contracts.
- Produces: `BorrowRequestsTable({rows, tab, page, pageSize, onPageChange, onOpen})`; `BorrowRequestDetailsSheet({borrow, open, processing, onOpenChange, onApprove, onReject})`; `RejectBorrowRequestDialog({borrow, open, processing, onOpenChange, onConfirm})`; and `ConfirmPickupDialog({borrow, open, processing, onOpenChange, onConfirm})`.

- [ ] **Step 1: Write failing interaction and accessibility tests**

Assert date-only Request Date cells (no hour/minute text), image and text fallbacks for null metadata, pending action opens a labelled Sheet with timeline and approve/reject controls, history details are read-only, reject cannot submit an empty/whitespace reason and sends the trimmed reason, pickup previews today and today+14 days and calls confirmation once, processing disables repeat actions, and empty rows show a tab-specific empty state.

- [ ] **Step 2: Run component tests to verify they fail**

Run: `npm test -- --run src/features/borrows/components/BorrowRequestWorkflow.test.tsx`

Working directory: `frontend`

Expected: FAIL because the components do not exist.

- [ ] **Step 3: Implement the responsive table and details Sheet**

Use the existing `components/ui/sheet.tsx` primitives. Render Student, Book / Request, Request Date, Status, and Action columns in a horizontally scrollable table; retain essential actions on narrow screens. Use `book_image` with an accessible fallback, non-color status labels, exact timestamps only in the Sheet timeline, and read-only details outside Pending.

- [ ] **Step 4: Implement rejection and pickup Dialogs**

Use the existing `components/ui/dialog.tsx` primitives. Keep rejection reason state local and reset it on close/success. Derive pickup preview dates from the local calendar for display only; the backend remains authoritative for stored timestamps. Disable close/action paths that could submit twice while processing.

- [ ] **Step 5: Run component tests to verify they pass**

Run: `npm test -- --run src/features/borrows/components/BorrowRequestWorkflow.test.tsx`

Working directory: `frontend`

Expected: PASS.

- [ ] **Step 6: Commit the interaction components**

```bash
git add frontend/src/features/borrows/components/BorrowRequestsTable.tsx frontend/src/features/borrows/components/BorrowRequestDetailsSheet.tsx frontend/src/features/borrows/components/RejectBorrowRequestDialog.tsx frontend/src/features/borrows/components/ConfirmPickupDialog.tsx frontend/src/features/borrows/components/BorrowRequestWorkflow.test.tsx
git commit -m "feat: build borrow request staff interactions"
```

### Task 6: Assemble the Figma page and route it from staff navigation

**Files:**
- Create: `frontend/src/pages/adminPage/BorrowRequestsPage.tsx`
- Modify: `frontend/src/App.tsx`
- Modify: `frontend/src/components/layout/NavContent.tsx`
- Modify: `frontend/src/pages/adminPage/AdminDashboardPage.tsx`
- Modify: `frontend/src/features/borrows/components/AdminBorrowsTable.tsx`
- Test: `frontend/src/pages/adminPage/BorrowRequestsPage.test.tsx`

**Interfaces:**
- Consumes: Task 4’s query/mutation hooks and view-model helpers; Task 5’s interaction components.
- Produces: staff routes `/borrow-requests/pending`, `/borrow-requests/pickup`, and `/borrow-requests/history`, with `/borrow-requests` defaulting to Pending; request links target the new workspace while Loans & Returns remains `/all-borrows`.

- [ ] **Step 1: Write failing page behavior tests**

With query/mutation hooks stubbed at their boundary, assert route-to-tab mapping and default redirect, the three Figma summary counts, search/date/order controls, pagination reset after filters, loading/error/empty states, pending approval flow, rejection payload flow, pickup flow, and dialog/sheet closure after success. Assert mutation loading disables only the selected record’s actions.

- [ ] **Step 2: Run page tests to verify they fail**

Run: `npm test -- --run src/pages/adminPage/BorrowRequestsPage.test.tsx`

Working directory: `frontend`

Expected: FAIL because the page and routes do not exist.

- [ ] **Step 3: Assemble the Borrow Requests page**

Match the Figma hierarchy: Workspace breadcrumb/current date, title/copy, three summary cards, and glass workspace containing URL-backed tabs, search, request-date filter, order selector, table, and client pagination. Stack cards/controls at small breakpoints and keep API errors visible with a retry action.

- [ ] **Step 4: Wire routes, navigation, and dashboard links**

Add the three staff routes and the `/borrow-requests` default redirect. Change Borrow Requests navigation and pending/review dashboard links to `/borrow-requests/pending`; retain Loans & Returns at `/all-borrows`. Teach the legacy loans table to label `READY_FOR_PICKUP` safely without redesigning that screen.

- [ ] **Step 5: Run page tests and targeted lint**

Run: `npm test -- --run src/pages/adminPage/BorrowRequestsPage.test.tsx`

Run: `npx eslint src/pages/adminPage/BorrowRequestsPage.tsx src/features/borrows src/hooks/useBorrows.ts src/App.tsx src/components/layout/NavContent.tsx src/pages/adminPage/AdminDashboardPage.tsx`

Working directory: `frontend`

Expected: PASS.

- [ ] **Step 6: Commit the routed page**

```bash
git add frontend/src/pages/adminPage/BorrowRequestsPage.tsx frontend/src/pages/adminPage/BorrowRequestsPage.test.tsx frontend/src/App.tsx frontend/src/components/layout/NavContent.tsx frontend/src/pages/adminPage/AdminDashboardPage.tsx frontend/src/features/borrows/components/AdminBorrowsTable.tsx
git commit -m "feat: add librarian borrow request workspace"
```

### Task 7: Verify the complete workflow without broadening scope

**Files:**
- Modify only if a test exposes a defect in files already listed above.

**Interfaces:**
- Consumes: All prior tasks.
- Produces: A verified full-stack borrow-request workflow and a record of any unrelated pre-existing failures.

- [ ] **Step 1: Run the complete backend suite and migration syntax check**

Run: `python -m unittest discover -s tests -v`

Run: `python -m compileall app migrations/versions`

Working directory: `backend`

Expected: PASS.

- [ ] **Step 2: Run the complete frontend test and lint suites**

Run: `npm test`

Run: `npm run lint`

Working directory: `frontend`

Expected: New tests and changed-file lint pass. Report unrelated lint failures with exact file/line instead of modifying out-of-scope files.

- [ ] **Step 3: Run the production build**

Run: `npm run build`

Working directory: `frontend`

Expected: PASS, except that the already-observed unused `BookOpen` import in `src/pages/usersPage/BookCatalogPage.tsx` may still block the TypeScript phase; if so, report it as pre-existing and separately run `npx vite build` to validate bundling.

- [ ] **Step 4: Review the final diff and scope**

Run: `git status --short`

Run: `git diff --check`

Run: `git diff --stat HEAD~6..HEAD`

Expected: No whitespace errors; no redesign of Loans & Returns, Books List, Categories, or other screens; existing unrelated working-tree changes remain intact.

- [ ] **Step 5: Commit only test-discovered fixes, if any**

```bash
git add <only files from Tasks 1-6 changed by verified fixes>
git commit -m "fix: harden borrow request workflow"
```
