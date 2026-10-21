# Staff Settings Workspace Design

Date: 2026-10-22

## Goal

Implement the current Figma Settings design for librarian and administrator accounts while preserving the existing student profile experience. The page must support real profile, theme, avatar, and password operations rather than visual-only controls.

## Design Source

- Figma file: `QwXwbAIhx3u8ZQn63XfkHT`
- Librarian Settings frame: `211:475`
- Admin Settings frame: `211:596`

The frames were re-read on 2026-10-22. The latest version contains Profile details, Appearance, Password & security, and the settings footer. It does not contain notification settings or a System theme choice. Earlier notification-preference concepts are therefore out of scope.

## Scope

### Staff routing

The existing `/profile` route remains the single account route. It renders:

- the new Settings workspace for `admin` and `librarian` users;
- the existing student profile page for `student` users.

No sidebar route changes are required.

### Page layout

The staff page uses the existing application sidebar and warm-glass design tokens. Inside the content area it reproduces the Figma hierarchy:

1. Eyebrow: `WORKSPACE / SETTINGS`
2. Heading: `Settings`
3. Description: `Manage your profile and personalize your library workspace.`
4. Responsive two-column content:
   - left: Profile details;
   - right: Appearance, then Password & security.
5. Footer note and `Save changes` action.

At narrower widths the cards stack into one column. The layout uses the project's semantic colors and glass card treatment, supporting both light and dark themes even though the supplied Figma frames depict dark mode.

## Profile Details

The card shows the current avatar or initials, display name, and role. It includes:

- `Change photo`, backed by an accessible hidden file input;
- `Remove photo`, available when an avatar exists;
- accepted formats JPEG, PNG, and WebP;
- a 2 MB client-side size limit;
- editable display name;
- read-only email address;
- explanatory text directing the user to an administrator for email changes.

Selecting a photo shows an immediate local preview. `Save changes` sends display name and any avatar action through the profile API. Removing a photo is an explicit operation rather than sending an empty file.

## Appearance

The card provides the two current Figma choices:

- Light
- Dark

Choosing a theme applies it immediately by toggling the `dark` class on the root document element. The choice is saved to local storage because the Figma copy states that it applies to the current device. The selected theme card receives the gold border and selection marker shown in the design.

The application initializes the saved theme before or during root rendering so the preference survives reloads. No database field or backend endpoint is needed for theme state.

## Password & Security

Password-authenticated accounts receive inputs for:

- current password;
- new password;
- confirm new password.

The `Update password` button is independent from `Save changes`. Client and server validate that:

- every field is present;
- the current password is correct;
- the new password is at least eight characters;
- confirmation matches;
- the new password differs from the current password.

On success, the fields clear and a success notification appears. Validation and server errors remain visible through the existing toast/error conventions. While the request is pending, the form cannot be submitted twice.

Google-only accounts do not have a local password hash. Their security card replaces the password form with an explanation that password security is managed by Google.

## Backend API

Add an authenticated endpoint:

`PUT /api/users/me/password`

Request body:

```json
{
  "current_password": "current secret",
  "new_password": "new secret",
  "confirm_password": "new secret"
}
```

Success returns HTTP 200 with a confirmation message. Expected errors use HTTP 400 for invalid input or an incorrect current password. Google-only accounts receive HTTP 400 with a clear account-provider message. The service updates the existing password hash through the model setter and commits atomically.

The existing `PUT /api/users/me` profile endpoint gains support for an explicit `remove_avatar=true` multipart field. It clears the stored avatar URL and deletes the previous Cloudinary asset after a successful database commit. Email changes are not sent from this Settings screen.

No database migration is required because the latest Figma design contains no server-persisted preferences and the existing user model already stores display name, avatar, and password hash.

## Frontend Structure

- `UsersProfile.tsx` becomes a small role-aware dispatcher.
- The existing student profile UI moves to or remains in a dedicated student component without behavioral changes.
- A new staff Settings component owns the Figma page layout and local form state.
- Theme behavior is isolated in a small utility or hook so initialization and selection use one storage contract.
- Auth API and React Query hooks expose profile saving and password updating.

Existing shared `Button`, `Input`, `Avatar`, and form primitives are reused. The Figma sidebar and icons are not copied into the page because the application layout already supplies exact functional equivalents. No temporary Figma asset URLs are used.

## State and Error Handling

- Missing authenticated user: render no editable form while protected-route state resolves.
- Profile save pending: disable `Save changes` and show a saving label.
- Avatar validation failure: reject before upload and preserve the current avatar.
- Profile API failure: preserve unsaved form values and preview.
- Password failure: preserve entries except after successful completion.
- Google account: password form is unavailable by design.

The auth context is updated with the user returned by a successful profile save so the sidebar and page identity update immediately.

## Testing

Backend tests cover:

- successful password change and subsequent password verification;
- incorrect current password;
- short or mismatched new password;
- Google-only account rejection;
- explicit avatar removal behavior.

Frontend tests cover:

- role-aware student/staff rendering;
- Figma card headings and current account data;
- display-name save payload;
- avatar type/size validation and removal payload;
- Light/Dark selection and persistence;
- password mismatch and successful mutation flow;
- Google-managed security state;
- pending and error-safe interactions.

Verification includes focused tests, the complete frontend and backend suites, linting, type checking/build, and a visual comparison of the requested Settings screen against frames `211:475` and `211:596`.

## Out of Scope

- Notification preferences removed from the current Figma frames
- System theme selection removed from the current Figma frames
- Student profile redesign
- Email address changes from this page
- Password reset or recovery flows
- Changes to unrelated dashboard, catalog, or circulation pages
