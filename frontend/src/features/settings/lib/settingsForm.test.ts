import { describe, expect, it } from "vitest";

import { validatePasswordChange, validateProfilePhoto } from "./settingsForm";

describe("settings form validation", () => {
  it("accepts supported profile photos up to 2 MB", () => {
    const photo = new File([new Uint8Array(1024)], "avatar.webp", { type: "image/webp" });
    expect(validateProfilePhoto(photo)).toBeNull();
  });

  it("rejects unsupported and oversized profile photos", () => {
    expect(validateProfilePhoto(new File(["text"], "avatar.gif", { type: "image/gif" }))).toMatch(/JPEG, PNG, or WebP/);
    expect(
      validateProfilePhoto(
        new File([new Uint8Array(2 * 1024 * 1024 + 1)], "avatar.png", { type: "image/png" }),
      ),
    ).toMatch(/2 MB/);
  });

  it("validates password length, confirmation, and reuse", () => {
    expect(validatePasswordChange("current-pass", "short", "short")).toMatchObject({ newPassword: expect.any(String) });
    expect(validatePasswordChange("current-pass", "new-password", "different")).toMatchObject({ confirmPassword: expect.any(String) });
    expect(validatePasswordChange("same-password", "same-password", "same-password")).toMatchObject({ newPassword: expect.any(String) });
    expect(validatePasswordChange("current-pass", "new-password", "new-password")).toEqual({});
  });
});
