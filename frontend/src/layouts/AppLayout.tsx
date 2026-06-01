import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  BriefcaseBusiness,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Menu,
  Plus,
  Search,
  Settings,
  Users,
  X
} from "lucide-react";
import { ChangeEvent, ReactNode, useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import { Button } from "../components/ui/Button";
import { useAuth } from "../hooks/useAuth";
import { cn } from "../utils/cn";

type NavItem = {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  end?: boolean;
};

const navigationItems: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/board", label: "Board", icon: ListChecks },
  { to: "/list", label: "List View", icon: Users },
  { to: "/settings", label: "Settings", icon: Settings }
];

type SidebarContentProps = {
  onNavigate: () => void;
  onCreateTask?: () => void;
  createButtonLabel: string;
  onLogout: () => void;
};

const SidebarContent = ({ onNavigate, onCreateTask, createButtonLabel, onLogout }: SidebarContentProps) => {
  const { user } = useAuth();

  const userInitials = useMemo(() => {
    const name = user?.name ?? "User";
    return name
      .split(" ")
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("");
  }, [user?.name]);

  return (
    <div className="flex h-full flex-col bg-[#fbfaff]">
      <div className="border-b border-violet-border px-4 pb-5 pt-5">
        <div className="mb-5 flex items-center gap-3">
          <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-white shadow-sm">
            <BriefcaseBusiness size={18} />
          </div>
          <div>
            <p className="text-[20px] font-bold tracking-tight text-brand">TaskFlow Pro</p>
            <p className="text-xs font-medium text-text-muted">Premium Workspace</p>
          </div>
        </div>

        {onCreateTask ? (
          <Button variant="create" className="h-10 w-full justify-center gap-2 text-sm font-semibold" onClick={onCreateTask}>
            <Plus size={16} />
            {createButtonLabel}
          </Button>
        ) : null}
      </div>

      <nav className="px-2 py-4">
        <div className="space-y-1">
          {navigationItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  "relative flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition",
                  isActive
                    ? "bg-brand-soft text-brand before:absolute before:bottom-2 before:left-0 before:top-2 before:w-[3px] before:rounded-full before:bg-brand"
                    : "text-text-secondary hover:bg-brand-soft-bg"
                )
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}

        </div>
      </nav>

      <div className="mt-auto border-t border-violet-border p-4">
        <div className="flex items-center gap-3">
          <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand-soft text-sm font-bold text-brand">
            {userInitials || "U"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-text-main">{user?.name ?? "User"}</p>
            <p className="truncate text-xs text-text-muted">{user?.email ?? ""}</p>
          </div>
          <Button variant="ghost" className="h-8 w-8 px-0 text-text-secondary" onClick={onLogout} aria-label="Logout">
            <LogOut size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};

type AppLayoutProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  onCreateTask?: () => void;
  createButtonLabel?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  hideSearch?: boolean;
};

export const AppLayout = ({
  title,
  subtitle,
  children,
  onCreateTask,
  createButtonLabel = "New Task",
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "Search tasks...",
  hideSearch = false
}: AppLayoutProps) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = (): void => {
    logout();
    setSidebarOpen(false);
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-page-bg text-text-main lg:pl-[260px]">
      <AnimatePresence>
        {isSidebarOpen ? (
          <motion.div
            className="fixed inset-0 z-40 bg-slate-900/35 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
          />
        ) : null}
      </AnimatePresence>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[260px] border-r border-violet-border transition-transform lg:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-14 items-center justify-end border-b border-violet-border bg-[#fbf9ff] px-3 lg:hidden">
          <Button variant="ghost" className="h-8 w-8 px-0" onClick={() => setSidebarOpen(false)} aria-label="Close menu">
            <X size={16} />
          </Button>
        </div>

        <SidebarContent
          onNavigate={() => setSidebarOpen(false)}
          onCreateTask={onCreateTask}
          createButtonLabel={createButtonLabel}
          onLogout={handleLogout}
        />
      </aside>

      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-30 border-b border-outline bg-white/95 backdrop-blur">
          <div className="page-container flex h-16 items-center gap-3">
            <Button variant="ghost" className="h-9 w-9 px-0 lg:hidden" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
              <Menu size={18} />
            </Button>

            <div className="hidden min-w-0 md:block">
              <p className="truncate text-2xl font-bold tracking-tight text-text-main">{title}</p>
              {subtitle ? <p className="truncate text-xs font-medium text-text-muted">{subtitle}</p> : null}
            </div>

            {!hideSearch ? (
              <label className="flex h-10 w-full items-center rounded-xl border border-violet-border bg-white px-3 md:ml-2 md:max-w-[420px]">
                <Search size={18} className="text-text-muted" />
                <input
                  type="text"
                  {...(onSearchChange
                    ? {
                        value: searchValue,
                        onChange: (event: ChangeEvent<HTMLInputElement>) => onSearchChange(event.target.value)
                      }
                    : { defaultValue: searchValue })}
                  placeholder={searchPlaceholder}
                  className="ml-2 h-full w-full border-none bg-transparent text-sm text-text-main outline-none placeholder:text-text-muted"
                />
              </label>
            ) : null}

            {onCreateTask ? (
              <Button variant="create" className="hidden md:inline-flex" onClick={onCreateTask}>
                <Plus size={16} />
                {createButtonLabel}
              </Button>
            ) : null}

            <Button variant="ghost" className="ml-auto h-10 w-10 rounded-full border border-violet-border bg-white px-0 text-brand">
              <Bell size={17} />
            </Button>
          </div>
        </header>

        <main className="page-container flex-1 py-5">{children}</main>
      </div>
    </div>
  );
};
