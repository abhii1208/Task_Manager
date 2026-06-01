import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { z } from "zod";

import { AuthCard } from "../components/auth/AuthCard";
import { FormInput } from "../components/auth/FormInput";
import { Button } from "../components/ui/Button";
import { AuthLayout } from "../layouts/AuthLayout";
import { authService } from "../services/auth.service";

const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email address")
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
const forgotPasswordSuccessMessage = "If an account exists with this email, a reset link has been sent.";

export const ForgotPasswordPage = () => {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: ""
    }
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const message = await authService.forgotPassword(values.email);
      setSuccessMessage(message);
      toast.success(message);
    } catch {
      setSuccessMessage(forgotPasswordSuccessMessage);
      toast.success(forgotPasswordSuccessMessage);
    }
  });

  return (
    <AuthLayout title="Forgot password" subtitle="Enter your email and we will send you a password reset link.">
      <AuthCard>
        <motion.form className="space-y-4" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} onSubmit={onSubmit}>
          <FormInput
            label="Email Address"
            type="email"
            placeholder="name@company.com"
            error={errors.email?.message}
            {...register("email")}
          />

          <Button type="submit" className="w-full" size="lg" variant="primary" isLoading={isSubmitting} loadingText="Sending...">
            Send Reset Link
          </Button>
        </motion.form>

        {successMessage ? (
          <div className="mt-4 rounded-xl border border-violet-border bg-brand-soft-bg px-4 py-3 text-sm text-text-secondary">
            {successMessage}
          </div>
        ) : null}

        <Link to="/login" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand hover:text-brand-hover">
          <ArrowLeft size={14} />
          Back to Login
        </Link>
      </AuthCard>
    </AuthLayout>
  );
};
