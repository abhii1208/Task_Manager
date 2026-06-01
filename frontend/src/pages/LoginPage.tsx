import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Chrome } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Link, useSearchParams } from "react-router-dom";
import { z } from "zod";

import { AuthCard } from "../components/auth/AuthCard";
import { AuthToggle } from "../components/auth/AuthToggle";
import { FormInput } from "../components/auth/FormInput";
import { PasswordInput } from "../components/auth/PasswordInput";
import { Button } from "../components/ui/Button";
import { useAuth } from "../hooks/useAuth";
import { AuthLayout } from "../layouts/AuthLayout";
import { GOOGLE_OAUTH_URL } from "../utils/constants";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required")
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginPage = () => {
  const { login } = useAuth();
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
      toast.success("Welcome back");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Login failed");
    }
  });

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

          <Button type="submit" className="w-full" size="lg" variant="primary" isLoading={isSubmitting}>
            Continue to Workspace
          </Button>
        </motion.form>

        <div className="my-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
          <div className="h-px flex-1 bg-violet-border" />
          Or continue with
          <div className="h-px flex-1 bg-violet-border" />
        </div>

        <Button type="button" variant="secondary" className="w-full gap-2" onClick={() => window.location.assign(GOOGLE_OAUTH_URL)}>
          <Chrome size={16} />
          Continue with Google
        </Button>
      </AuthCard>
    </AuthLayout>
  );
};
