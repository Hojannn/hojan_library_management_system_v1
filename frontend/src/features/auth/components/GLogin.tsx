import { useAuth } from "@/hooks/useAuth";
import { api } from "@/services/api";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useEffect, useRef, useState } from "react";

const GLogin = ({ layout = "default" }: { layout?: "default" | "login" }) => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [buttonWidth, setButtonWidth] = useState(400);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (layout !== "login" || !containerRef.current || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) => {
      setButtonWidth(entry.contentRect.width);
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [layout]);

  const handleGoogleSuccess = async (credentials: CredentialResponse) => {
    if (isSubmitting) return;
    try {
      if (!credentials.credential) {
        console.error("No credential received from Google");
        toast.error("Google login failed. Please try again.");
        return;
      }

      setIsSubmitting(true);
      const { data } = await api.post("/auth/google", {
        token: credentials.credential,
      });

      login(data.access_token, data.user);
      toast.success("Welcome Back!");

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
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      ref={containerRef}
      aria-busy={isSubmitting}
      className={
        layout === "login"
          ? `relative flex h-[52px] w-full cursor-pointer items-center justify-center overflow-hidden rounded-[12px] border border-[var(--glass-border)] dark:border-border bg-[var(--control)] shadow-[var(--elevation-sm)] transition-colors hover:bg-card focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background ${isSubmitting ? "pointer-events-none opacity-70" : ""}`
          : "flex flex-col items-center gap-4 p-4 rounded-sm"
      }
    >
      {layout === "login" && (
        <span
          aria-hidden="true"
          className="pointer-events-none flex items-center justify-center gap-3 text-[13px] font-bold text-foreground"
        >
          <img src="/images/login/google.svg" alt="" width="24" height="24" />
          {isSubmitting ? "Signing in with Google..." : "Sign in with Google"}
        </span>
      )}
      {/* Keep Google's iframe as the real pointer/keyboard target and preserve
          its ID-token flow. The visible presentation belongs to the container.
          Extra coverage accounts for the iframe's internal button margins. */}
      <div
        className={
          layout === "login"
            ? "absolute left-1/2 top-1/2 z-10 h-10 w-[400px] origin-center cursor-pointer opacity-[0.01]"
            : undefined
        }
        style={
          layout === "login"
            ? { transform: `translate(-50%, -50%) scale(${(buttonWidth + 24) / 400}, 1.6)` }
            : undefined
        }
      >
        <GoogleLogin
          size="large"
          text="signin_with"
          width={layout === "login" ? "400" : undefined}
          onSuccess={handleGoogleSuccess}
          onError={() => {
            console.error("Google Login Failed");
            toast.error("Google login failed. Please try again.");
          }}
        />
      </div>
    </div>
  );
};

export default GLogin;
