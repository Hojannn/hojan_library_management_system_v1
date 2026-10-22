const MAX_PROFILE_PHOTO_SIZE = 2 * 1024 * 1024;
const SUPPORTED_PROFILE_PHOTO_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export type PasswordErrors = Partial<Record<"currentPassword" | "newPassword" | "confirmPassword", string>>;

export function validateProfilePhoto(file: File): string | null {
  if (!SUPPORTED_PROFILE_PHOTO_TYPES.has(file.type)) {
    return "Choose a JPEG, PNG, or WebP image.";
  }
  if (file.size > MAX_PROFILE_PHOTO_SIZE) {
    return "Profile photos must be 2 MB or smaller.";
  }
  return null;
}

export function validatePasswordChange(
  currentPassword: string,
  newPassword: string,
  confirmPassword: string,
): PasswordErrors {
  const errors: PasswordErrors = {};

  if (!currentPassword) errors.currentPassword = "Enter your current password.";
  if (newPassword.length < 8) errors.newPassword = "Use at least 8 characters.";
  else if (newPassword === currentPassword) errors.newPassword = "Choose a password you have not used here.";
  if (confirmPassword !== newPassword) errors.confirmPassword = "Passwords do not match.";

  return errors;
}
