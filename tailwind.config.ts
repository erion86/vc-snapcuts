import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./context/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // ── Color tokens → CSS variables so dark mode is a single swap ──
      colors: {
        bg:       "hsl(var(--bg) / <alpha-value>)",
        surface:  "hsl(var(--surface) / <alpha-value>)",
        "surface-alt": "hsl(var(--surface-alt) / <alpha-value>)",
        border:   "hsl(var(--border) / <alpha-value>)",
        primary: {
          DEFAULT: "hsl(var(--primary) / <alpha-value>)",
          strong:  "hsl(var(--primary-strong) / <alpha-value>)",
          fg:      "hsl(var(--primary-fg) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary) / <alpha-value>)",
          strong:  "hsl(var(--secondary-strong) / <alpha-value>)",
          fg:      "hsl(var(--secondary-fg) / <alpha-value>)",
        },
        ink: {
          DEFAULT: "hsl(var(--ink) / <alpha-value>)",
          soft:    "hsl(var(--ink-soft) / <alpha-value>)",
        },
        sale: "hsl(var(--sale) / <alpha-value>)",
        ring: "hsl(var(--ring) / <alpha-value>)",
      },

      // ── Typography ─────────────────────────────────────────────────
      fontFamily: {
        display: ["var(--font-fraunces)", "Georgia", "serif"],
        sans:    ["var(--font-plus-jakarta)", "system-ui", "sans-serif"],
      },
      fontSize: {
        "display-xl": ["clamp(2.25rem, 5vw, 4rem)",   { lineHeight: "1.1",  letterSpacing: "-0.01em" }],
        "display-lg": ["clamp(1.75rem, 3vw, 2.5rem)", { lineHeight: "1.15", letterSpacing: "-0.01em" }],
        "display-md": ["clamp(1.375rem, 2vw, 1.875rem)", { lineHeight: "1.2" }],
        "display-sm": ["clamp(1.125rem, 1.5vw, 1.25rem)", { lineHeight: "1.25" }],
      },

      // ── Spacing ────────────────────────────────────────────────────
      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
        "30": "7.5rem",
        "section": "5rem",        // standard section vertical padding
        "section-lg": "7.5rem",
      },

      // ── Border radius ──────────────────────────────────────────────
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },

      // ── Box shadows ────────────────────────────────────────────────
      boxShadow: {
        "card":  "0 2px 12px 0 rgba(51, 46, 41, 0.06)",
        "card-hover": "0 8px 32px 0 rgba(51, 46, 41, 0.12)",
        "drawer": "-8px 0 40px rgba(51, 46, 41, 0.12)",
        "sticky": "0 2px 16px rgba(51, 46, 41, 0.08)",
      },

      // ── Animation ──────────────────────────────────────────────────
      transitionTimingFunction: {
        "spring": "cubic-bezier(.2,.8,.2,1)",
      },
      transitionDuration: {
        "250": "250ms",
      },
      keyframes: {
        "fade-up": {
          "0%":   { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "scale-in": {
          "0%":   { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "slide-in-right": {
          "0%":   { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "slide-in-left": {
          "0%":   { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "heart-pop": {
          "0%,100%": { transform: "scale(1)" },
          "50%":     { transform: "scale(1.3)" },
        },
        "cart-bump": {
          "0%,100%": { transform: "scale(1)" },
          "40%":     { transform: "scale(1.25)" },
        },
      },
      animation: {
        "fade-up":        "fade-up 0.5s cubic-bezier(.2,.8,.2,1) both",
        "fade-in":        "fade-in 0.3s ease both",
        "scale-in":       "scale-in 0.25s cubic-bezier(.2,.8,.2,1) both",
        "slide-in-right": "slide-in-right 0.28s cubic-bezier(.2,.8,.2,1) both",
        "slide-in-left":  "slide-in-left 0.28s cubic-bezier(.2,.8,.2,1) both",
        "heart-pop":      "heart-pop 0.3s ease",
        "cart-bump":      "cart-bump 0.35s ease",
      },

      // ── Kiss-cut signature device ──────────────────────────────────
      // Applied via utility classes on featured cards / badges
      backgroundImage: {
        "paper-grain":
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23noise)' opacity='0.025'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
};

export default config;
