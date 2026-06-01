import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { motion } from "framer-motion";
import { Chrome } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";

import { AuthCard } from "../components/auth/AuthCard";
import { AuthToggle } from "../components/auth/AuthToggle";
import { FormInput } from "../components/auth/FormInput";
import { PasswordInput } from "../components/auth/PasswordInput";
import { Button } from "../components/ui/Button";
import { getApiUrl } from "../config/env";
import { useAuth } from "../hooks/useAuth";
import { AuthLayout } from "../layouts/AuthLayout";
import { LOGIN_REFRESH_FLAG, OAUTH_REFRESH_FLAG } from "../utils/authRefreshFlags";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required")
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const {
    register,
    handleSubmit,
    clearErrors,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      email: "",
      password: ""
    }
  });

  useEffect(() => {
    reset({ email: "", password: "" });
    clearErrors();
    sessionStorage.removeItem(LOGIN_REFRESH_FLAG);
    sessionStorage.removeItem(OAUTH_REFRESH_FLAG);
  }, [reset, clearErrors]);

  useEffect(() => {
    const oauthError = searchParams.get("oauthError");

    if (oauthError !== "true" && oauthError !== "google") {
      return;
    }

    toast.error("OAuth login failed. Please try again.");

    const updatedParams = new URLSearchParams(searchParams);
    updatedParams.delete("oauthError");
    setSearchParams(updatedParams, { replace: true });
  }, [searchParams, setSearchParams]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      await login(values);
      toast.success("Login successful");
      navigate("/dashboard", { replace: true });

      window.setTimeout(() => {
        if (!window.location.hash.includes("/dashboard")) {
          navigate("/dashboard", { replace: true });
        }
      }, 300);

      if (!sessionStorage.getItem(LOGIN_REFRESH_FLAG)) {
        sessionStorage.setItem(LOGIN_REFRESH_FLAG, "true");
        toast("Opening your workspace...");
        window.setTimeout(() => {
          window.location.reload();
        }, 250);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          toast.error("Invalid email or password.");
          return;
        }

        if (error.response) {
          const responseMessage = error.response.data?.message as string | undefined;
          toast.error(responseMessage ?? "Login failed");
          return;
        }

        if (error.request) {
          if (
            (typeof error.message === "string" && error.message.includes("CORS")) ||
            error.message === "Network Error"
          ) {
            toast.error("Backend request blocked or unreachable. Check CORS and API URL.");
            return;
          }

          toast.error("Unable to reach backend. Check VITE_API_BASE_URL, Render health URL, and CORS.");
          return;
        }
      }

      toast.error(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    }
  });

  const handleGoogleLogin = (): void => {
    try {
      const googleOAuthUrl = getApiUrl("/auth/google");
      window.open(googleOAuthUrl, "_self");
    } catch {
      toast.error("API URL is not configured.");
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Enter your credentials to access your workspace.">
      <AuthCard>
        <AuthToggle mode="login" />

        <motion.form
          key="login-form"
          className="mt-6 space-y-4"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          onSubmit={onSubmit}
        >
          <FormInput
            label="Email Address"
            type="email"
            placeholder="name@company.com"
            error={errors.email?.message}
            {...register("email")}
          />

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="label-base mb-0">Password</label>
              <Link to="/forgot-password" className="text-xs font-semibold text-brand hover:text-brand-hover">
                Forgot Password?
              </Link>
            </div>
            <PasswordInput label={undefined} placeholder="********" error={errors.password?.message} {...register("password")} />
          </div>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            variant="primary"
            isLoading={isSubmitting}
            disabled={isSubmitting}
            loadingText="Signing in..."
          >
            Continue to Workspace
          </Button>
        </motion.form>

        <div className="my-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
          <div className="h-px flex-1 bg-violet-border" />
          Or continue with
          <div className="h-px flex-1 bg-violet-border" />
        </div>

        <Button type="button" variant="primary" className="w-full gap-2" onClick={handleGoogleLogin}>
          <Chrome size={16} />
          Continue with Google
        </Button>
      </AuthCard>
    </AuthLayout>
  );
};
