import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";

import { AuthCard } from "../components/auth/AuthCard";
import { PasswordInput } from "../components/auth/PasswordInput";
import { Button } from "../components/ui/Button";
import { AuthLayout } from "../layouts/AuthLayout";
import { authService } from "../services/auth.service";

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/, "Use uppercase, lowercase, number, and special character"),
    confirmPassword: z.string().min(1, "Confirm your password")
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
  });

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = useMemo(() => searchParams.get("token")?.trim() ?? "", [searchParams]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: ""
    }
  });

  const onSubmit = handleSubmit(async (values) => {
    if (!token) {
      toast.error("Reset token is missing. Please request a new link.");
      return;
    }

    try {
      const message = await authService.resetPassword(token, values.password);
      toast.success(message);
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 900);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to reset password");
    }
  });

  if (!token) {
    return (
      <AuthLayout title="Reset password" subtitle="Reset token is missing. Please request a new link.">
        <AuthCard>
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-danger">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} />
              Reset token is missing. Please request a new link.
            </div>
          </div>

          <Link to="/forgot-password" className="mt-4 inline-flex text-sm font-semibold text-brand hover:text-brand-hover">
            Go to Forgot Password
          </Link>
        </AuthCard>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Reset password" subtitle="Enter your new password to continue.">
      <AuthCard>
        <motion.form className="space-y-4" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} onSubmit={onSubmit}>
          <PasswordInput
            label="New Password"
            placeholder="NewPassword@123"
            error={errors.password?.message}
            hint="Use uppercase, lowercase, number, and special character"
            {...register("password")}
          />

          <PasswordInput
            label="Confirm Password"
            placeholder="Re-enter password"
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />

          <Button type="submit" className="w-full" size="lg" variant="primary" isLoading={isSubmitting} loadingText="Resetting...">
            Reset Password
          </Button>
        </motion.form>
      </AuthCard>
    </AuthLayout>
  );
};
