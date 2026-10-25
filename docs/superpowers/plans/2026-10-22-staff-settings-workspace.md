# Staff Settings Workspace Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the current Figma Settings workspace for admin and librarian accounts with working profile/avatar, device theme, and password-security behavior while preserving the student profile.

**Architecture:** Keep `/profile` as a role-aware entry point that delegates staff accounts to a new focused Settings component and students to the existing profile component. Extend the existing authenticated users API for password changes and explicit avatar removal; keep theme state device-local through a small shared theme utility. Use React Query mutations to update server state and the auth context.

**Tech Stack:** React 19, TypeScript, React Router, TanStack Query, Tailwind CSS v4, shadcn/Base UI, next-themes, Vitest/Testing Library, Flask, Flask-JWT-Extended, SQLAlchemy, Werkzeug password hashing, unittest.

**Spec:** `docs/superpowers/specs/2026-10-22-staff-settings-workspace-design.md`

## Global Constraints

- Match Figma frames `211:475` and `211:596`; notification settings and System theme are not part of the current design.
- Do not redesign the student profile or alter unrelated pages.
- Email is read-only in staff Settings.
- Avatar uploads accept JPEG, PNG, and WebP up to 2 MB.
- Passwords require the current password, at least eight characters for the new password, matching confirmation, and a value different from the current password.
- Google-only accounts cannot use the local password form.
- Reuse project components and semantic design tokens; do not add dependencies or runtime Figma asset URLs.
- Preserve all unrelated working-tree changes and the untracked PDF.

## Review Focus

- A 2 MB file must be accepted while a file larger than 2 MB is rejected without calling the API; Task 4 pins this boundary.
- Removing an avatar and selecting a replacement in the same edit session must resolve to the latest explicit action; Task 4 pins replacement precedence.
- Whitespace-only display names must not be submitted; Task 4 validates and tests the trimmed value.
- Google accounts must never receive or submit password fields; Tasks 1 and 4 test both server and UI enforcement.
- A stored theme value outside `light` or `dark` must fall back safely without leaving the document in a stale class state; Task 3 tests initialization.

---

### Task 1: Authenticated Password Change API

**Files:**
- Create: `backend/tests/test_user_settings_routes.py`
- Modify: `backend/app/services/auth_service.py`
- Modify: `backend/app/blueprints/users/routes.py`

**Interfaces:**
- Produces: `AuthService.change_password(user_id, current_password, new_password) -> None`
- Produces: `PUT /api/users/me/password` accepting `current_password`, `new_password`, and `confirm_password`

- [ ] **Step 1: Write failing route and service tests**

Add tests named:

- `test_change_password_updates_hash`
- `test_change_password_rejects_wrong_current_password`
- `test_change_password_rejects_short_mismatched_and_reused_passwords`
- `test_change_password_rejects_google_only_account`

Assert HTTP 200 for success, HTTP 400 with stable user-facing messages for invalid input, and that a successful call makes `check_password(new_password)` true and the old password false.

- [ ] **Step 2: Run the password tests and verify RED**

Run: `backend\.venv\Scripts\python.exe -m unittest backend.tests.test_user_settings_routes -v`

Expected: FAIL because the endpoint and service method do not exist.

- [ ] **Step 3: Implement the service and route**

Add `AuthService.change_password(user_id, current_password, new_password) -> None`. Resolve the user through the session, reject missing password hashes, verify the current password, reject reuse, set the password through `user.password`, and commit with rollback on failure.

Add the authenticated `PUT /api/users/me/password` route. Validate required strings, eight-character minimum, and confirmation before calling the service. Convert validation/service `ValueError` exceptions into HTTP 400 JSON `{ "message": ... }`.

- [ ] **Step 4: Run the password tests and verify GREEN**

Run: `backend\.venv\Scripts\python.exe -m unittest backend.tests.test_user_settings_routes -v`

Expected: all password tests PASS.

- [ ] **Step 5: Commit**

```bash
git add backend/app/services/auth_service.py backend/app/blueprints/users/routes.py backend/tests/test_user_settings_routes.py
git commit -m "feat: add authenticated password changes"
```

### Task 2: Explicit Avatar Removal

**Files:**
- Modify: `backend/tests/test_user_settings_routes.py`
- Modify: `backend/app/blueprints/users/routes.py`

**Interfaces:**
- Consumes: existing `PUT /api/users/me` multipart profile endpoint
- Produces: multipart field `remove_avatar=true`; an uploaded replacement takes precedence over removal

- [ ] **Step 1: Add failing avatar-removal tests**

Add tests named:

- `test_profile_update_removes_existing_avatar_after_commit`
- `test_uploaded_avatar_takes_precedence_over_remove_flag`

Assert that removal clears `avatar_url`, calls `delete_avatar` once with the old URL after persistence, and that a supplied valid file results in its uploaded URL rather than `None` even if the removal flag is also present.

- [ ] **Step 2: Run the avatar tests and verify RED**

Run: `backend\.venv\Scripts\python.exe -m unittest backend.tests.test_user_settings_routes -v`

Expected: removal test FAIL because `remove_avatar` is ignored.

- [ ] **Step 3: Implement removal semantics**

Parse the multipart `remove_avatar` value case-insensitively. If a valid avatar file exists, upload and use it. Otherwise, when removal is true, clear `user.avatar_url`. Retain the old URL and call `delete_avatar` only after the database commit succeeds.

- [ ] **Step 4: Run tests and verify GREEN**

Run: `backend\.venv\Scripts\python.exe -m unittest backend.tests.test_user_settings_routes -v`

Expected: all settings route tests PASS.

- [ ] **Step 5: Commit**

```bash
git add backend/app/blueprints/users/routes.py backend/tests/test_user_settings_routes.py
git commit -m "feat: support avatar removal"
```

### Task 3: Device Theme Contract

**Files:**
- Create: `frontend/src/features/settings/lib/theme.ts`
- Create: `frontend/src/features/settings/lib/theme.test.ts`
- Modify: `frontend/src/main.tsx`

**Interfaces:**
- Produces: `type BookyTheme = "light" | "dark"`
- Produces: `readTheme(storage?: Storage): BookyTheme`
- Produces: `applyTheme(theme: BookyTheme, root?: HTMLElement, storage?: Storage): void`

- [ ] **Step 1: Write failing utility tests**

Test that `applyTheme("dark")` adds the root `dark` class and persists `booky-theme=dark`, `applyTheme("light")` removes it, and invalid/missing stored values resolve to `light` and clear a stale dark class when applied.

- [ ] **Step 2: Run the utility test and verify RED**

Run: `npm.cmd test -- --pool=forks --maxWorkers=1 src/features/settings/lib/theme.test.ts`

Expected: FAIL because the theme module does not exist.

- [ ] **Step 3: Implement and initialize theme state**

Implement the three exported contracts with `booky-theme` as the storage key. In `main.tsx`, call `applyTheme(readTheme())` before React renders so reloads do not default permanently to the wrong theme.

- [ ] **Step 4: Run the utility test and verify GREEN**

Run: `npm.cmd test -- --pool=forks --maxWorkers=1 src/features/settings/lib/theme.test.ts`

Expected: all theme tests PASS.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/features/settings/lib/theme.ts frontend/src/features/settings/lib/theme.test.ts frontend/src/main.tsx
git commit -m "feat: persist staff theme preference"
```

### Task 4: Settings API Mutations and Validation

**Files:**
- Modify: `frontend/src/features/auth/api/authApi.ts`
- Modify: `frontend/src/hooks/useAuth.ts`
- Create: `frontend/src/features/settings/lib/settingsForm.ts`
- Create: `frontend/src/features/settings/lib/settingsForm.test.ts`
- Create: `frontend/src/hooks/useSettings.test.tsx`

**Interfaces:**
- Produces: `changePassword(payload: ChangePasswordPayload): Promise<{ message: string }>`
- Produces: `useChangePassword()` mutation
- Produces: `validateAvatar(file: File): string | null`
- Produces: `validateDisplayName(value: string): string | null`
- Produces: `validatePasswordForm(values: PasswordFormValues): Record<string, string>`

- [ ] **Step 1: Write failing validation and mutation tests**

Use literal fixtures to test accepted MIME types, the exact 2 MB boundary, oversized rejection, whitespace-only display-name rejection, password mismatch/reuse/minimum length, password endpoint payload forwarding, and success/error mutation behavior. Verify the profile mutation still updates auth context and that `remove_avatar=true` can be included in its `FormData`.

- [ ] **Step 2: Run the focused frontend tests and verify RED**

Run: `npm.cmd test -- --pool=forks --maxWorkers=1 src/features/settings/lib/settingsForm.test.ts src/hooks/useSettings.test.tsx`

Expected: FAIL because the settings contracts and password mutation are missing.

- [ ] **Step 3: Implement API, hook, and validation contracts**

Add typed password payload/response interfaces, call `PUT /users/me/password`, and expose a mutation using existing toast conventions. Implement pure validators with the exact formats, size, trimming, and password rules from the spec.

- [ ] **Step 4: Run the focused tests and verify GREEN**

Run: `npm.cmd test -- --pool=forks --maxWorkers=1 src/features/settings/lib/settingsForm.test.ts src/hooks/useSettings.test.tsx`

Expected: focused tests PASS.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/features/auth/api/authApi.ts frontend/src/hooks/useAuth.ts frontend/src/features/settings/lib frontend/src/hooks/useSettings.test.tsx
git commit -m "feat: add settings mutations and validation"
```

### Task 5: Figma Staff Settings Workspace

**Files:**
- Create: `frontend/src/features/settings/components/StaffSettings.tsx`
- Create: `frontend/src/features/settings/components/StaffSettings.test.tsx`
- Create: `frontend/src/features/settings/components/ThemeChoice.tsx`
- Create: `frontend/src/features/settings/components/PasswordSettings.tsx`
- Create: `frontend/src/pages/usersPage/StudentProfile.tsx`
- Modify: `frontend/src/pages/usersPage/UsersProfile.tsx`

**Interfaces:**
- Consumes: `useUpdateUserProfile()`, `useChangePassword()`, `readTheme()`, `applyTheme()` and validators from Tasks 3–4
- Produces: role-aware `/profile` rendering and the complete staff Settings interaction

- [ ] **Step 1: Write failing component tests**

Add tests that assert:

- staff accounts see `Settings`, `Profile details`, `Appearance`, and `Password & security`;
- students render the existing `Student Profile` experience;
- admin and librarian identity labels are correct;
- display name is trimmed into the profile `FormData`, while email is disabled/read-only;
- a valid photo previews, removal sends `remove_avatar=true`, a later replacement wins, and invalid type/size never submits;
- Light and Dark theme cards update the root and storage;
- password mismatch blocks submission, valid values call the mutation, pending state blocks a duplicate call, and success clears fields;
- Google accounts render the managed-by-Google message and no password inputs.

- [ ] **Step 2: Run the component tests and verify RED**

Run: `npm.cmd test -- --pool=forks --maxWorkers=1 src/features/settings/components/StaffSettings.test.tsx`

Expected: FAIL because the staff Settings components do not exist.

- [ ] **Step 3: Preserve the student component boundary**

Move the current student profile implementation without behavioral changes to `StudentProfile.tsx`. Make `UsersProfile.tsx` dispatch to `StudentProfile` for students and `StaffSettings` for admins/librarians.

- [ ] **Step 4: Implement the Figma layout and interactions**

Build the responsive two-column page using project primitives and semantic tokens. Match the verified copy, 560 px desktop card proportions, 16 px card radii, 24 px padding/gaps, avatar/photo controls, two theme previews, independent password action, and bottom save footer. Reuse Lucide/project icons rather than temporary Figma SVG URLs because they are exact functional design-library equivalents already used by the application shell.

- [ ] **Step 5: Run the component tests and verify GREEN**

Run: `npm.cmd test -- --pool=forks --maxWorkers=1 src/features/settings/components/StaffSettings.test.tsx`

Expected: all Settings component tests PASS with no accessibility warnings.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/features/settings/components frontend/src/pages/usersPage/StudentProfile.tsx frontend/src/pages/usersPage/UsersProfile.tsx
git commit -m "feat: implement staff settings workspace"
```

### Task 6: Integrated Verification and Figma Comparison

**Files:**
- Modify only in-scope Settings files if verification exposes defects.

**Interfaces:**
- Consumes: completed backend and frontend Settings workflow
- Produces: verified implementation matching Figma frames `211:475` and `211:596`

- [ ] **Step 1: Run the complete backend suite**

Run: `backend\.venv\Scripts\python.exe -m unittest discover -s backend/tests -v`

Expected: all backend tests PASS.

- [ ] **Step 2: Run the complete frontend suite**

Run: `npm.cmd test -- --pool=threads --maxWorkers=1`

Working directory: `frontend`

Expected: all frontend tests PASS.

- [ ] **Step 3: Run static checks**

Run: `npm.cmd run lint` and `npm.cmd run build`

Working directory: `frontend`

Expected: zero new lint or type errors. If the known pre-existing unused `BookOpen` import in `BookCatalogPage.tsx` remains, report it without modifying that unrelated file unless separately authorized.

- [ ] **Step 4: Compare the rendered staff page to Figma**

Run the application at desktop width 1440 px and compare both admin and librarian states against frames `211:596` and `211:475`. Verify card order, widths, gaps, headings/copy, selected theme styling, profile controls, password form, and footer. Also inspect a narrow viewport to confirm a usable single-column stack.

- [ ] **Step 5: Verify repository scope**

Run: `git diff --check` and `git status --short`.

Expected: only Settings implementation files plus the user’s already-existing unrelated changes are present; the PDF is untouched.

- [ ] **Step 6: Commit verification fixes, if any**

```bash
git add <settings-files-only>
git commit -m "fix: align settings workspace with figma"
```
