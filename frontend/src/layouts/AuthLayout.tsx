import { BarChart3, CheckCircle2, Sparkles, Zap } from "lucide-react";
import { ReactNode } from "react";

type AuthLayoutProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

const featureItems = [
  {
    icon: <Zap size={18} />,
    title: "Real-time Collaboration",
    description: "Synchronize with your team instantly across every device."
  },
  {
    icon: <BarChart3 size={18} />,
    title: "Advanced Analytics",
    description: "Get deep insights into your team's velocity and productivity trends."
  }
];

export const AuthLayout = ({ title, subtitle, children }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen bg-page-bg">
      <div className="grid min-h-screen lg:grid-cols-2">
        <section className="relative hidden overflow-hidden bg-[#2f2aa8] lg:flex">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(149,140,255,0.52),rgba(47,42,168,0.1)_45%),radial-gradient(circle_at_70%_0%,rgba(116,101,255,0.45),transparent_45%),linear-gradient(125deg,#2f2aa8_10%,#2b2498_40%,#3f31bf_100%)]" />
          <div className="absolute -top-36 left-40 h-[560px] w-[560px] rounded-full bg-violet-300/20 blur-[96px]" />
          <div className="absolute bottom-10 right-[-140px] h-[460px] w-[460px] rounded-full bg-indigo-200/20 blur-[80px]" />
          <div className="absolute inset-0 bg-[linear-gradient(160deg,rgba(255,255,255,0.1)_0%,rgba(255,255,255,0)_45%)]" />

          <div className="relative z-10 flex min-h-full w-full flex-col px-10 py-10 xl:px-14 xl:py-12">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/70 bg-white/10 text-white">
                <CheckCircle2 size={24} />
              </div>
              <p className="text-[24px] font-bold tracking-tight text-white">TaskFlow Pro</p>
            </div>

            <div className="mt-14 max-w-[520px]">
              <h1 className="text-4xl font-extrabold leading-[1.08] tracking-[-0.02em] text-white xl:text-[58px]">
                Master your
                <br />
                workflow with
                <br />
                precision.
              </h1>

              <div className="mt-8 space-y-4">
                {featureItems.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-white/25 bg-white/12 px-5 py-4 backdrop-blur-md"
                  >
                    <div className="flex items-start gap-3">
                      <span className="mt-1 text-white">{item.icon}</span>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                        <p className="mt-1 text-sm text-indigo-100/95">{item.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-auto flex items-center gap-4 text-xs font-semibold uppercase tracking-[0.14em] text-indigo-100/85">
              <Sparkles size={14} />
              <span>&copy; 2026 TaskFlow Pro</span>
              <span>|</span>
              <span>Enterprise Grade</span>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center bg-[#f8f5ff] px-4 py-10 sm:px-8">
          <div className="w-full max-w-[560px]">
            <div className="mb-8 lg:hidden">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand text-white shadow-sm">
                <CheckCircle2 size={23} />
              </div>
              <p className="mt-3 text-2xl font-extrabold tracking-tight text-brand">TaskFlow Pro</p>
            </div>

            <h1 className="text-[28px] font-extrabold tracking-[-0.02em] text-text-main">{title}</h1>
            <p className="mt-2 text-sm text-text-secondary">{subtitle}</p>

            <div className="mt-8">{children}</div>
          </div>
        </section>
      </div>
    </div>
  );
};

