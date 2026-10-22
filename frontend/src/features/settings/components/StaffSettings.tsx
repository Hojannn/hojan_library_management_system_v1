import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { Camera, Moon, ShieldCheck, Sun, Trash2, UserRound } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth, useUpdateUserProfile } from "@/hooks/useAuth";
import { validateDisplayName, validateProfilePhoto } from "../lib/settingsForm";
import { getStoredTheme, type ThemePreference } from "../lib/theme";
import { PasswordSettings } from "./PasswordSettings";
import { ThemeChoice } from "./ThemeChoice";

const cardClass = "rounded-2xl border border-[var(--glass-border)] bg-card p-6 shadow-[var(--glass-shadow)] backdrop-blur-[var(--glass-blur)]";

export function StaffSettings() {
  const { user } = useAuth();
  const updateProfile = useUpdateUserProfile();
  const [displayName, setDisplayName] = useState(user?.username ?? "");
  const [theme, setTheme] = useState<ThemePreference>(() => getStoredTheme());
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar_url ?? null);
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const previewUrl = useRef<string | null>(null);

  useEffect(() => () => {
    if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
  }, []);

  if (!user) return null;

  const initials = user.username.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  const roleLabel = user.role === "admin" ? "Administrator" : "Librarian";

  const handlePhoto = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const error = validateProfilePhoto(file);
    if (error) {
      setAvatarError(error);
      event.target.value = "";
      return;
    }
    if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
    previewUrl.current = URL.createObjectURL(file);
    setAvatarFile(file);
    setAvatarPreview(previewUrl.current);
    setRemoveAvatar(false);
    setAvatarError(null);
  };

  const handleRemovePhoto = () => {
    if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
    previewUrl.current = null;
    setAvatarFile(null);
    setAvatarPreview(null);
    setRemoveAvatar(true);
    setAvatarError(null);
  };

  const handleSave = (event: FormEvent) => {
    event.preventDefault();
    const nameError = validateDisplayName(displayName);
    if (nameError) {
      toast.error(nameError);
      return;
    }
    const payload = new FormData();
    payload.set("username", displayName.trim());
    if (avatarFile) payload.set("avatar", avatarFile);
    else if (removeAvatar) payload.set("remove_avatar", "true");
    updateProfile.mutate(payload);
  };

  return (
    <div className="mx-auto max-w-[1180px] space-y-6 px-4 pb-8 md:px-6">
      <header className="space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Workspace / Settings</p>
        <h1 className="text-3xl font-semibold tracking-tight text-heading">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your profile and personalize your library workspace.</p>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <form id="profile-settings-form" onSubmit={handleSave} className={`${cardClass} space-y-6`}>
          <div className="flex items-center gap-2">
            <UserRound className="size-5 text-primary" />
            <div><h2 className="font-semibold">Profile details</h2><p className="text-xs text-muted-foreground">Your staff identity across Booky.</p></div>
          </div>
          <div className="flex flex-col gap-5 border-y border-border py-5 sm:flex-row sm:items-center">
            <Avatar className="size-20">
              {avatarPreview && <AvatarImage src={avatarPreview} alt={`${user.username} profile`} />}
              <AvatarFallback className="text-lg font-semibold text-heading">{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{user.username}</p>
              <p className="text-sm text-muted-foreground">{roleLabel}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <label className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary-hover">
                  <Camera className="size-3.5" /> Change photo
                  <input aria-label="Choose profile photo" type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={handlePhoto} />
                </label>
                {(avatarPreview || user.avatar_url) && (
                  <Button type="button" variant="ghost" onClick={handleRemovePhoto} className="text-destructive hover:text-destructive">
                    <Trash2 className="size-3.5" /> Remove photo
                  </Button>
                )}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">JPEG, PNG or WebP. Maximum 2 MB.</p>
              {avatarError && <p className="mt-1 text-xs text-destructive">{avatarError}</p>}
            </div>
          </div>
          <div className="space-y-4">
            <div className="space-y-1.5"><label htmlFor="display-name" className="text-sm font-medium">Display name</label><Input id="display-name" value={displayName} onChange={(event) => setDisplayName(event.target.value)} className="h-10 bg-control" /></div>
            <div className="space-y-1.5"><label htmlFor="email-address" className="text-sm font-medium">Email address</label><Input id="email-address" value={user.email} disabled className="h-10 bg-control" /><p className="text-xs text-muted-foreground">Contact an administrator if your email address needs to change.</p></div>
          </div>
        </form>

        <div className="space-y-6">
          <section className={`${cardClass} space-y-5`}>
            <div className="flex items-start justify-between gap-3"><div><h2 className="font-semibold">Appearance</h2><p className="mt-1 text-xs text-muted-foreground">Choose how Booky looks on this device.</p></div>{theme === "dark" ? <Moon className="size-5 text-primary" /> : <Sun className="size-5 text-primary" />}</div>
            <ThemeChoice theme={theme} onChange={setTheme} />
          </section>
          <section className={`${cardClass} space-y-5`}>
            <div className="flex items-start gap-2"><ShieldCheck className="mt-0.5 size-5 text-primary" /><div><h2 className="font-semibold">Password &amp; security</h2><p className="mt-1 text-xs text-muted-foreground">Keep your account protected with a strong password.</p></div></div>
            <PasswordSettings isGoogleAccount={user.is_google_account} />
          </section>
        </div>
      </div>

      <footer className="flex flex-col gap-3 rounded-2xl border border-[var(--glass-border)] bg-card px-5 py-4 shadow-[var(--glass-shadow)] backdrop-blur-[var(--glass-blur)] sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">Profile changes apply across your library workspace. Appearance is saved on this device.</p>
        <Button type="submit" form="profile-settings-form" className="h-9 px-5" disabled={updateProfile.isPending}>{updateProfile.isPending ? "Saving…" : "Save changes"}</Button>
      </footer>
    </div>
  );
}
