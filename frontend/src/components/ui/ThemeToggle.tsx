import { Moon, Sun } from "lucide-react";

import { useTheme } from "../../hooks/useTheme";
import { cn } from "../../utils/cn";
import { Button } from "./Button";

export const ThemeToggle = ({ inverted = false, className }: { inverted?: boolean; className?: string }) => {
  const { mode, toggleTheme } = useTheme();

  return (
    <Button
      variant={inverted ? "ghost" : "secondary"}
      className={cn(
        "h-10 w-10 px-0",
        inverted ? "text-white hover:bg-white/15" : "",
        className
      )}
      onClick={toggleTheme}
      aria-label="Toggle theme"
    >
      {mode === "dark" ? <Sun size={18} /> : <Moon size={18} />}
    </Button>
  );
};
