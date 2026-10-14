import UserTable from "@/features/auth/components/UserTable"
import { useParams } from "react-router-dom"

const ROLE_VALUES = ["librarian", "student"] as const;
type RoleFilter = (typeof ROLE_VALUES)[number];

const AdminUsersPage = () => {
  const { role } = useParams();
  const roleFilter: RoleFilter | undefined = ROLE_VALUES.includes(role as RoleFilter)
    ? (role as RoleFilter)
    : undefined;

  return (
    <div className="space-y-6">
      <UserTable roleFilter={roleFilter} />
    </div>
  )
}

export default AdminUsersPage
