import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import { cn } from "../../utils/cn";

type AuthToggleProps = {
  mode: "login" | "register";
};

const options: Array<{ key: "login" | "register"; label: string; path: string }> = [
  { key: "login", label: "Login", path: "/login" },
  { key: "register", label: "Create Account", path: "/register" }
];

export const AuthToggle = ({ mode }: AuthToggleProps) => {
  return (
    <div className="relative grid grid-cols-2 rounded-xl bg-brand-soft-bg p-1">
      <motion.div
        layoutId="auth-toggle-indicator"
        className="absolute bottom-1 left-1 top-1 w-[calc(50%-0.25rem)] rounded-lg border border-violet-border bg-white shadow-sm"
        animate={{ x: mode === "login" ? "0%" : "100%" }}
        transition={{ type: "spring", stiffness: 380, damping: 30 }}
      />

      {options.map((option) => (
        <Link
          key={option.key}
          to={option.path}
          className={cn(
            "relative z-10 flex items-center justify-center rounded-lg px-3 py-2 text-sm font-semibold uppercase tracking-[0.03em] transition",
            mode === option.key ? "text-brand" : "text-text-secondary hover:text-brand"
          )}
        >
          {option.label}
        </Link>
      ))}
    </div>
  );
};
