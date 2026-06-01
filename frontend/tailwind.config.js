module.exports = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#5b21b6",
        "primary-hover": "#4c1d95",
        "primary-soft": "#ede9fe",
        brand: "#5b21b6",
        "brand-hover": "#4c1d95",
        "brand-deep": "#4c1d95",
        "brand-soft": "#ede9fe",
        "brand-soft-bg": "#f3efff",
        background: "#f8f5ff",
        "page-bg": "#f8f5ff",
        surface: "#ffffff",
        "surface-container": "#f3efff",
        "surface-container-low": "#ffffff",
        "surface-variant": "#ede9fe",
        "text-main": "#111827",
        "text-secondary": "#374151",
        "text-muted": "#64748b",
        outline: "#e5e7eb",
        "soft-border": "#e5e7eb",
        "violet-border": "#ddd6fe",
        "violet-soft": "#ede9fe",
        success: "#16a34a",
        "success-hover": "#15803d",
        warning: "#f59e0b",
        danger: "#dc2626",
        stage: {
          todo: "#475569",
          progress: "#5b21b6",
          done: "#15803d"
        },
        priority: {
          low: "#15803d",
          medium: "#b45309",
          high: "#b91c1c"
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
        "display-lg": ["2.5rem", { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "700" }],
        "heading-lg": ["1.75rem", { lineHeight: "1.2", letterSpacing: "-0.01em", fontWeight: "700" }],
        "heading-md": ["1.25rem", { lineHeight: "1.3", fontWeight: "700" }],
        "label-md": ["0.8125rem", { lineHeight: "1.3", letterSpacing: "0.04em", fontWeight: "600" }],
        "body-md": ["0.875rem", { lineHeight: "1.55", fontWeight: "400" }]
      },
      boxShadow: {
        soft: "0 1px 2px rgba(15, 23, 42, 0.06), 0 6px 16px rgba(91, 33, 182, 0.08)",
        lift: "0 12px 28px rgba(15, 23, 42, 0.14)"
      },
      transitionTimingFunction: {
        premium: "cubic-bezier(0.2, 0.7, 0.2, 1)"
      }
    }
  },
  plugins: []
};
