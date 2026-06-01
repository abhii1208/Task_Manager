import { KeyRound, Palette, ShieldCheck } from "lucide-react";

import { PageTransition } from "../components/common/PageTransition";
import { Button } from "../components/ui/Button";
import { useAuth } from "../hooks/useAuth";
import { AppLayout } from "../layouts/AppLayout";

export const SettingsPage = () => {
  const { user, logout } = useAuth();

  return (
    <AppLayout title="Settings" subtitle="Manage account, appearance, and session controls." hideSearch>
      <PageTransition>
        <div className="grid gap-4 lg:grid-cols-2">
          <section className="rounded-2xl border border-violet-border bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <ShieldCheck size={18} className="text-brand" />
              <h2 className="text-lg font-bold text-text-main">Profile</h2>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <p className="text-text-muted">Full Name</p>
                <p className="font-semibold text-text-main">{user?.name}</p>
              </div>
              <div>
                <p className="text-text-muted">Email</p>
                <p className="font-semibold text-text-main">{user?.email}</p>
              </div>
              <div>
                <p className="text-text-muted">Role</p>
                <p className="font-semibold text-text-main">{user?.role}</p>
              </div>
              <div>
                <p className="text-text-muted">Auth Provider</p>
                <p className="font-semibold text-text-main">{user?.provider}</p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="rounded-2xl border border-violet-border bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <Palette size={18} className="text-brand" />
                <h2 className="text-lg font-bold text-text-main">Appearance</h2>
              </div>
              <p className="text-sm text-text-secondary">This workspace uses the premium light violet theme by default.</p>
            </div>

            <div className="rounded-2xl border border-violet-border bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <KeyRound size={18} className="text-brand" />
                <h2 className="text-lg font-bold text-text-main">Session</h2>
              </div>
              <p className="text-sm text-text-secondary">Log out from your current session.</p>
              <Button className="mt-4" variant="danger" onClick={logout}>
                Logout
              </Button>
            </div>
          </section>
        </div>
      </PageTransition>
    </AppLayout>
  );
};
