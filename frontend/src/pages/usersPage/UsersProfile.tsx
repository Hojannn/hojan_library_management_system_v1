import { useAuth } from "@/hooks/useAuth";
import { StaffSettings } from "@/features/settings/components/StaffSettings";

export default function UsersProfile() {
  const { user } = useAuth();

  if (!user) return null;
  return <StaffSettings />;
}
