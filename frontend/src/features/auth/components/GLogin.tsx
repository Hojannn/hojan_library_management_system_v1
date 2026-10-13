import { useAuth } from "@/hooks/useAuth";
import { api } from "@/services/api"
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const GLogin = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSuccess = async(credentials: CredentialResponse) => {
    try {

      if (!credentials.credential) {
        console.error("No credential received from Google");
        toast.error("Google login failed. Please try again.");
        return;
      }

      const { data } = await api.post("/auth/google", {
        token: credentials.credential,
      });

      login(data.access_token, data.user);

      if (data.user?.role === "admin" || data.user?.role === "librarian") {
        navigate("/dashboard");
      } else {
        navigate("/books");
      }

      return data;
    } catch (error) {
      console.error("Failed to login", error);
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Google login failed. Please try again.";
      toast.error(message);
    }
  }

  return (
    <div className="flex flex-col items-center gap-4 p-4 rounded-sm">
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={() => {
          console.error("Google Login Failed");
          toast.error("Google login failed. Please try again.");
        }}
      />
    </div>
  )
}

export default GLogin
