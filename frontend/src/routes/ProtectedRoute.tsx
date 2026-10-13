import { useAuth } from "@/hooks/useAuth";
import { LoadingState } from "@/components/ui/loading-spinner";
import { Navigate, Outlet } from "react-router-dom";


export const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading){
    return <LoadingState containerClassName="min-h-screen" label="Loading your account" />;
  }

  if (!isAuthenticated){
    return <Navigate to="/login" replace />
  }

  return <Outlet />;
};
