import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Chrome } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

import { AuthCard } from "../components/auth/AuthCard";
import { AuthToggle } from "../components/auth/AuthToggle";
import { FormInput } from "../components/auth/FormInput";
import { PasswordInput } from "../components/auth/PasswordInput";
import { Button } from "../components/ui/Button";
import { useAuth } from "../hooks/useAuth";
import { AuthLayout } from "../layouts/AuthLayout";
import { GOOGLE_OAUTH_URL } from "../utils/constants";

const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/, "Use uppercase, lowercase, number, and special character")
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export const RegisterPage = () => {
  const { register: registerUser } = useAuth();

  const {
    register,
    handleSubmit,
    clearErrors,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      password: ""
    }
  });

  useEffect(() => {
    reset({ name: "", email: "", password: "" });
    clearErrors();
  }, [clearErrors, reset]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      await registerUser({
        name: values.name,
        email: values.email,
        password: values.password
      });
      toast.success("Account created");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Registration failed");
    }
  });

  return (
    <AuthLayout title="Create your account" subtitle="Set up your workspace in less than a minute.">
      <AuthCard>
        <AuthToggle mode="register" />

        <motion.form
          key="register-form"
          className="mt-6 space-y-4"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          onSubmit={onSubmit}
        >
          <FormInput label="Full Name" placeholder="Shiva" error={errors.name?.message} {...register("name")} />

          <FormInput
            label="Email Address"
            type="email"
            placeholder="name@company.com"
            error={errors.email?.message}
            {...register("email")}
          />

          <PasswordInput
            label="Password"
            placeholder="Password@123"
            hint="Use uppercase, lowercase, number, and special character"
            error={errors.password?.message}
            {...register("password")}
          />

          <Button type="submit" className="w-full" size="lg" variant="success" isLoading={isSubmitting}>
            Create Account
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
