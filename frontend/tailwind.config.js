module.exports = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#3323cc",
        "primary-hover": "#2416a8",
        "primary-soft": "#eeeafe",
        brand: "#3323cc",
        "brand-hover": "#2416a8",
        "brand-deep": "#2416a8",
        "brand-soft": "#eeeafe",
        "brand-soft-bg": "#f4f0ff",
        background: "#f8f7ff",
        "page-bg": "#f7f5ff",
        surface: "#ffffff",
        "surface-container": "#f4f0ff",
        "surface-container-low": "#ffffff",
        "surface-variant": "#eeeafe",
        "text-main": "#111827",
        "text-secondary": "#334155",
        "text-muted": "#64748b",
        outline: "#d8d2eb",
        "soft-border": "#e7e2f3",
        "violet-border": "#d8d2eb",
        "violet-soft": "#eeeafe",
        success: "#16a34a",
        warning: "#f59e0b",
        danger: "#dc2626",
        stage: {
          todo: "#64748b",
          progress: "#3323cc",
          done: "#16a34a"
        },
        priority: {
          low: "#64748b",
          medium: "#2563eb",
          high: "#dc2626"
        }
      },
      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem",
        "3xl": "1.25rem"
      },
      spacing: {
        18: "4.5rem",
        22: "5.5rem"
      },
      fontFamily: {
        sans: ["Inter", "Segoe UI", "system-ui", "-apple-system", "sans-serif"],
        heading: ["Inter", "Segoe UI", "system-ui", "-apple-system", "sans-serif"]
      },
      fontSize: {
        "display-lg": ["2.75rem", { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "700" }],
        "heading-lg": ["2rem", { lineHeight: "1.2", letterSpacing: "-0.01em", fontWeight: "700" }],
        "heading-md": ["1.375rem", { lineHeight: "1.3", fontWeight: "700" }],
        "label-md": ["0.8125rem", { lineHeight: "1.3", letterSpacing: "0.04em", fontWeight: "600" }],
        "body-md": ["0.9375rem", { lineHeight: "1.6", fontWeight: "400" }]
      },
      boxShadow: {
        soft: "0 1px 2px rgba(15, 23, 42, 0.06), 0 10px 24px rgba(51, 35, 204, 0.08)",
        lift: "0 14px 34px rgba(51, 35, 204, 0.16)"
      },
      transitionTimingFunction: {
        premium: "cubic-bezier(0.2, 0.7, 0.2, 1)"
      }
    }
  },
  plugins: []
};
