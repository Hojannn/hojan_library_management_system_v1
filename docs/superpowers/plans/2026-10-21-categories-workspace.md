# Categories Workspace Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the approved Figma Categories workspace for staff, including accurate category counts, management actions, and category book drill-down.

**Architecture:** Extend the existing category API representation with active-book counts, then build a dedicated React page around the existing category and staff-book hooks. Keep transformation/filtering logic in a small tested library and keep dialogs focused on mutations.

**Tech Stack:** Flask, SQLAlchemy, React 19, TypeScript, TanStack Query, React Router, Vitest, Testing Library, Tailwind CSS.

**Spec:** Approved in chat on 2026-10-21 from Figma node `268:2032` and its sibling Categories workspace states.

## Global Constraints

- Limit changes to category/backend contracts, the Categories page, navigation/routing, and their tests.
- Administrators can create, edit, and delete categories; librarians can browse, search, sort, and drill down only.
- Counts include active (not archived) book titles.
- Preserve the existing warm glass visual system and responsive staff layout.
- Leave unrelated untracked files untouched.

## Review Focus

- Categories with no books display zero and remain deletable for administrators.
- Archived books do not inflate active category counts.
- Search is case-insensitive and sorting remains deterministic.
- Librarians never receive mutation controls.
- Mutation success refreshes category counts and staff-book data.

---

### Task 1: Category count API contract

**Files:**
- Modify: `backend/app/services/category_service.py`
- Modify: `backend/app/models/category.py`
- Modify: `backend/app/blueprints/category/routes.py`
- Test: `backend/tests/test_category_routes.py`

**Interfaces:**
- Produces: `GET /api/categories` items shaped as `{ id, name, book_count }`.
- Produces: admin-only category create, update, and delete mutations.

- [ ] Write route tests for active counts, zero counts, archived-book exclusion, and mutation authorization.
- [ ] Run the focused backend tests and verify they fail for the missing contract.
- [ ] Implement the minimal aggregate query/serialization and authorization changes.
- [ ] Run the focused backend tests and verify they pass.

### Task 2: Category view-model behavior

**Files:**
- Create: `frontend/src/features/books/lib/categoryWorkspace.ts`
- Test: `frontend/src/features/books/lib/categoryWorkspace.test.ts`
- Modify: `frontend/src/features/books/types/category.types.ts`

**Interfaces:**
- Consumes: categories with `book_count` and active staff books.
- Produces: summary metrics and deterministic search/sort helpers.

- [ ] Write failing unit tests for metrics, case-insensitive search, A-Z/Z-A/most-books sorting, and empty inputs.
- [ ] Run the focused test and verify the expected failures.
- [ ] Implement the helpers and required types.
- [ ] Run the focused test and verify it passes.

### Task 3: Categories page workflow

**Files:**
- Create: `frontend/src/pages/adminPage/CategoriesPage.tsx`
- Create: `frontend/src/pages/adminPage/CategoriesPage.test.tsx`
- Modify: `frontend/src/features/books/components/categories/CategoryModal.tsx`
- Modify: `frontend/src/hooks/useCategories.ts`
- Modify: `frontend/src/components/layout/NavContent.tsx`
- Modify: `frontend/src/App.tsx`
- Modify: `frontend/src/pages/adminPage/BooksListPage.tsx`

**Interfaces:**
- Consumes: Task 1 category contract and Task 2 view-model helpers.
- Produces: `/categories` staff route with admin CRUD and librarian read-only behavior.

- [ ] Write failing component tests for Figma structure, search/sort, drill-down, admin actions, librarian permissions, and loading/error/empty states.
- [ ] Run the focused page test and verify it fails because the page does not exist.
- [ ] Implement the responsive page, role-aware dialogs, cache invalidation, route, and navigation.
- [ ] Run focused frontend tests and verify they pass.
- [ ] Run backend and frontend suites, lint touched files, and build; record any pre-existing failures separately.

