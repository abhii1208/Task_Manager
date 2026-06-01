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
import { NavLink } from "react-router-dom";

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
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/tasks/kanban", label: "Board", icon: ListChecks },
  { to: "/tasks/list", label: "List View", icon: Users },
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
    <div className="flex h-full flex-col bg-[#fbf9ff]">
      <div className="border-b border-violet-border px-5 pb-7 pt-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand text-white shadow-soft">
            <BriefcaseBusiness size={20} />
          </div>
          <div>
            <p className="text-[26px] font-extrabold tracking-tight text-brand">TaskFlow Pro</p>
            <p className="text-sm font-medium text-text-muted">Premium Workspace</p>
          </div>
        </div>

        {onCreateTask ? (
          <Button className="w-full justify-center gap-2 rounded-lg py-6 text-base font-bold" onClick={onCreateTask}>
            <Plus size={18} />
            {createButtonLabel}
          </Button>
        ) : null}
      </div>

      <nav className="px-2 py-5">
        <div className="space-y-1.5">
          {navigationItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  "relative flex items-center gap-3 rounded-lg px-4 py-3 text-base font-semibold transition",
                  isActive
                    ? "bg-brand-soft text-brand before:absolute before:bottom-2 before:left-0 before:top-2 before:w-[3px] before:rounded-full before:bg-brand"
                    : "text-text-secondary hover:bg-brand-soft-bg"
                )
              }
            >
              <item.icon size={20} />
              {item.label}
            </NavLink>
          ))}

        </div>
      </nav>

      <div className="mt-auto border-t border-violet-border p-4">
        <div className="flex items-center gap-3">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-brand-soft text-sm font-bold text-brand">
            {userInitials || "U"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-semibold text-text-main">{user?.name ?? "Alex Rivera"}</p>
            <p className="truncate text-sm text-text-muted">{user?.email ?? "user@taskflow.pro"}</p>
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
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen overflow-x-hidden bg-page-bg text-text-main lg:pl-[280px]">
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
          "fixed inset-y-0 left-0 z-50 w-[280px] border-r border-violet-border transition-transform lg:translate-x-0",
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
          onLogout={logout}
        />
      </aside>

      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-30 border-b border-violet-border bg-white/95 backdrop-blur">
          <div className="page-container flex h-[78px] items-center gap-4">
            <Button variant="ghost" className="h-9 w-9 px-0 lg:hidden" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
              <Menu size={18} />
            </Button>

            <div className="hidden min-w-0 md:block">
              <p className="truncate text-[26px] font-extrabold tracking-tight text-brand">{title}</p>
              {subtitle ? <p className="truncate text-xs font-medium text-text-muted">{subtitle}</p> : null}
            </div>

            {!hideSearch ? (
              <label className="flex h-14 w-full items-center rounded-xl border border-violet-border bg-white px-4 shadow-sm md:ml-3 md:max-w-[560px]">
                <Search size={20} className="text-text-muted" />
                <input
                  type="text"
                  {...(onSearchChange
                    ? {
                        value: searchValue,
                        onChange: (event: ChangeEvent<HTMLInputElement>) => onSearchChange(event.target.value)
                      }
                    : { defaultValue: searchValue })}
                  placeholder={searchPlaceholder}
                  className="ml-3 h-full w-full border-none bg-transparent text-base text-text-main outline-none placeholder:text-text-muted"
                />
              </label>
            ) : null}

            {onCreateTask ? (
              <Button className="hidden rounded-xl bg-success px-4 text-sm font-semibold text-white shadow-sm hover:bg-success-hover md:inline-flex" onClick={onCreateTask}>
                <Plus size={16} />
                {createButtonLabel}
              </Button>
            ) : null}

            <Button variant="ghost" className="ml-auto h-11 w-11 rounded-full border border-violet-border bg-white px-0 text-brand">
              <Bell size={19} />
            </Button>
          </div>
        </header>

        <main className="page-container flex-1 py-5 sm:py-6">{children}</main>
      </div>
    </div>
  );
};
