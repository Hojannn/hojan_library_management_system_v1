import type React from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

import { Label } from "@/components/ui/label";
import { Input } from "@base-ui/react/input";
import { Button } from "@base-ui/react/button";

import { type LoginFormValues, loginSchema } from "../types/auth.schema";
import { loginUser } from "../api/authApi";
import { useAuth } from "@/hooks/useAuth";
import { isAxiosError } from "axios";
import { toast } from "sonner";

interface LoginFormProps {
  onSuccess?: () => void;
}

const inputClassName =
  "w-full h-[52px] px-[16px] py-2 text-sm bg-[var(--control)] border border-[var(--glass-border)] dark:border-border rounded-[12px] text-foreground placeholder:text-muted-foreground shadow-[var(--elevation-sm)] focus:outline-none focus:border-primary focus-visible:ring-2 focus-visible:ring-ring/40 transition-colors";

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null);
    try {
      const res = await loginUser(values);
      login(res.token, res.user);
      if (onSuccess) onSuccess();

      if (res.user?.role === "admin" || res.user?.role === "librarian") {
        navigate("/dashboard");
      } else {
        navigate("/books");
      }

      toast.success("Welcome Back!");
    } catch (err) {
      setServerError(
        (isAxiosError(err) && err.response?.data?.message) ||
          "Wrong email or password. Please try again."
      );
    }
  };

  return (
    <div className="w-full space-y-3">
      {serverError && (
        <div className="px-3 py-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-[22px]">
        <div className="space-y-[10px]">
          <Label htmlFor="email" className="text-xs font-bold text-foreground">
            Email address
          </Label>
          <div className="relative flex items-center">
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              className={inputClassName}
              {...register("email")}
            />
          </div>
          {errors.email && (
            <p className="text-xs font-medium text-destructive">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-[10px]">
          <Label htmlFor="password" className="text-xs font-bold text-foreground">
            Password
          </Label>
          <div className="relative flex items-center">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••••••"
              className={`${inputClassName} pr-12`}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3.5 text-muted-foreground hover:text-foreground transition-colors focus:outline-none cursor-pointer"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="size-[18px]" />
              ) : (
                <Eye className="size-[18px]" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs font-medium text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-[52px] bg-primary hover:bg-primary-hover text-primary-foreground rounded-[20px] text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-70 mt-[6px] shadow-[var(--elevation-sm)]"
        >
          {isSubmitting ? "Signing in..." : "Sign in"}
        </Button>
      </form>
    </div>
  );
};

export default LoginForm;
