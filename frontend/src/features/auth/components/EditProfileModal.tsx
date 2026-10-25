import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth, useUpdateUserProfile } from "@/hooks/useAuth";

interface EditProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface EditProfileFormProps {
  onOpenChange: (open: boolean) => void;
}

function EditProfileForm({ onOpenChange }: EditProfileFormProps) {
  const { user } = useAuth();
  const { mutate: updateUserProfile, isPending: isSubmitting } = useUpdateUserProfile();

  const student = user?.role === "student" ? user.student : null;

  const [formData, setFormData] = useState({
    username: user?.username || "",
    email: user?.email || "",
    phone: user?.phone || "",
    studentNumber: student?.student_number || "",
    course: student?.course || "",
    yearLevel: student?.year_level || "",
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setAvatarFile(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const submitData = new FormData();
    submitData.append("username", formData.username);
    submitData.append("email", formData.email);
    submitData.append("phone", formData.phone);

    if (user?.role === "student") {
      submitData.append("student", "true");
      submitData.append("student_number", formData.studentNumber);
      submitData.append("course", formData.course);
      submitData.append("year_level", formData.yearLevel);
    }

    if (avatarFile) {
      submitData.append("avatar", avatarFile);
    }

    updateUserProfile(submitData, {
      onSuccess: () => {
        onOpenChange(false);
      },
    });
  };

  const inputClasses = "h-10 rounded-xl bg-[var(--control)] text-sm text-foreground";

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-xl font-bold text-heading">Edit Profile</DialogTitle>
        <DialogDescription className="text-sm text-muted-foreground">
          Update your account details and student information.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4 py-2">
        <div className="space-y-1.5">
          <Label htmlFor="avatar" className="text-sm font-semibold text-foreground">
            Profile Avatar
          </Label>
          <div className="flex items-center gap-3">
            <Input
              id="avatar"
              name="avatar"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleAvatarChange}
              className="h-10 rounded-xl bg-[var(--control)] text-sm cursor-pointer file:text-xs file:font-semibold"
            />
          </div>
          {avatarFile && (
            <p className="text-xs font-medium text-success">
              Selected: {avatarFile.name}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="username" className="text-sm font-semibold text-foreground">
              Full Name / Username
            </Label>
            <Input
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={inputClasses}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm font-semibold text-foreground">
              University Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className={inputClasses}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-sm font-semibold text-foreground">
              Phone Number
            </Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={inputClasses}
            />
          </div>

          {user?.role === "student" && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="studentNumber" className="text-sm font-semibold text-foreground">
                  Student Number
                </Label>
                <Input
                  id="studentNumber"
                  name="studentNumber"
                  value={formData.studentNumber}
                  onChange={handleChange}
                  className={inputClasses}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="course" className="text-sm font-semibold text-foreground">
                  Course / Major
                </Label>
                <Input
                  id="course"
                  name="course"
                  value={formData.course}
                  onChange={handleChange}
                  className={inputClasses}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="yearLevel" className="text-sm font-semibold text-foreground">
                  Year Level
                </Label>
                <Input
                  id="yearLevel"
                  name="yearLevel"
                  value={formData.yearLevel}
                  onChange={handleChange}
                  className={inputClasses}
                />
              </div>
            </>
          )}
        </div>

        <DialogFooter className="pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-10 rounded-xl text-sm"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-10 min-w-[110px] rounded-xl bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}

export function EditProfileModal({ open, onOpenChange }: EditProfileModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl border border-border bg-popover text-popover-foreground sm:max-w-[500px]">
        <EditProfileForm onOpenChange={onOpenChange} />
      </DialogContent>
    </Dialog>
  );
}
