import { useState, type FormEvent } from "react";
import { KeyRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChangePassword } from "@/hooks/useAuth";
import { validatePasswordChange, type PasswordErrors } from "../lib/settingsForm";

export function PasswordSettings({ isGoogleAccount }: { isGoogleAccount?: boolean }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<PasswordErrors>({});
  const changePassword = useChangePassword();

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const nextErrors = validatePasswordChange(currentPassword, newPassword, confirmPassword);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    changePassword.mutate(
      {
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      },
      {
        onSuccess: () => {
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
          setErrors({});
        },
      },
    );
  };

  if (isGoogleAccount) {
    return (
      <div className="flex gap-3 rounded-xl border border-border bg-muted/35 p-4">
        <KeyRound className="mt-0.5 size-5 shrink-0 text-primary" />
        <div>
          <p className="text-sm font-semibold">Password managed by Google</p>
          <p className="mt-1 text-sm text-muted-foreground">Use your Google account settings to update your password and security preferences.</p>
        </div>
      </div>
    );
  }

  const field = (id: string, label: string, value: string, setValue: (value: string) => void, error?: string) => (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium">{label}</label>
      <Input id={id} type="password" autoComplete="off" value={value} onChange={(event) => setValue(event.target.value)} aria-invalid={Boolean(error)} className="h-10 bg-control" />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {field("current-password", "Current password", currentPassword, setCurrentPassword, errors.currentPassword)}
      <div className="grid gap-4 sm:grid-cols-2">
        {field("new-password", "New password", newPassword, setNewPassword, errors.newPassword)}
        {field("confirm-password", "Confirm new password", confirmPassword, setConfirmPassword, errors.confirmPassword)}
      </div>
      <div className="flex justify-end pt-1">
        <Button type="submit" variant="outline" className="h-9 px-4" disabled={changePassword.isPending}>
          {changePassword.isPending ? "Updating…" : "Update password"}
        </Button>
      </div>
    </form>
  );
}
