import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary — Deep Navy & Midnight
        navy: {
          50: "#f0f3f9",
          100: "#d9e0f0",
          200: "#b3c1e0",
          300: "#8da2d1",
          400: "#6683c1",
          500: "#4064b2",
          600: "#2d4a8a",
          700: "#1e3463",
          800: "#142345",
          900: "#0b1527",
          950: "#060b14",
        },
        // Charcoal — Rich dark grays
        charcoal: {
          50: "#f4f4f5",
          100: "#e4e4e7",
          200: "#c8c8cf",
          300: "#a1a1ab",
          400: "#71717a",
          500: "#52525b",
          600: "#3f3f46",
          700: "#2c2c31",
          800: "#1c1c20",
          900: "#111114",
          950: "#09090b",
        },
        // Gold — Warm, prestigious accent
        gold: {
          50: "#fdf9ef",
          100: "#faf0d5",
          200: "#f4dea9",
          300: "#edc873",
          400: "#e5ac3d",
          500: "#d4952a",
          600: "#b87820",
          700: "#995b1d",
          800: "#7d491f",
          900: "#673c1e",
          950: "#3a1e0e",
        },
        // Cream — Soft warm whites
        cream: {
          50: "#fefdfb",
          100: "#fdf9f0",
          200: "#faf3e1",
          300: "#f5e8c8",
          400: "#eedba8",
          500: "#e5cb85",
          600: "#d4ad56",
          700: "#b08b3a",
          800: "#8c6f30",
          900: "#735b29",
          950: "#3d2f14",
        },
        // Ivory — Clean whites with warmth
        ivory: {
          50: "#fefefe",
          100: "#fdfcfa",
          200: "#fbf9f4",
          300: "#f7f4ec",
          400: "#f0ebe0",
          500: "#e8e0d0",
          600: "#d4c9b3",
          700: "#b5a78c",
          800: "#968a6f",
          900: "#7b725c",
          950: "#413b30",
        },
        // Emerald — Success / achievement accent
        emerald: {
          500: "#10b981",
          600: "#059669",
          700: "#047857",
        },
        // Burgundy — Error / premium warmth
        burgundy: {
          500: "#a3344a",
          600: "#8b2a3e",
          700: "#731f32",
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', "Georgia", '"Times New Roman"', "serif"],
        sans: ['"Inter"', "system-ui", "-apple-system", "sans-serif"],
        mono: ['"JetBrains Mono"', "Menlo", "monospace"],
      },
      fontSize: {
        "display-xl": ["3.5rem", { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "700" }],
        "display-lg": ["3rem", { lineHeight: "1.15", letterSpacing: "-0.02em", fontWeight: "700" }],
        "display": ["2.25rem", { lineHeight: "1.2", letterSpacing: "-0.01em", fontWeight: "700" }],
        "heading-xl": ["1.875rem", { lineHeight: "1.25", letterSpacing: "-0.01em", fontWeight: "600" }],
        "heading-lg": ["1.5rem", { lineHeight: "1.3", letterSpacing: "-0.005em", fontWeight: "600" }],
        "heading": ["1.25rem", { lineHeight: "1.4", fontWeight: "600" }],
        "heading-sm": ["1.125rem", { lineHeight: "1.4", fontWeight: "600" }],
        "body-lg": ["1.125rem", { lineHeight: "1.6", fontWeight: "400" }],
        "body": ["1rem", { lineHeight: "1.6", fontWeight: "400" }],
        "body-sm": ["0.875rem", { lineHeight: "1.5", fontWeight: "400" }],
        "caption": ["0.75rem", { lineHeight: "1.5", fontWeight: "500" }],
        "overline": ["0.6875rem", { lineHeight: "1.5", letterSpacing: "0.08em", fontWeight: "600" }],
      },
      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
        "26": "6.5rem",
        "30": "7.5rem",
        "34": "8.5rem",
        "38": "9.5rem",
      },
      borderRadius: {
        "sm": "0.25rem",
        "DEFAULT": "0.5rem",
        "md": "0.625rem",
        "lg": "0.75rem",
        "xl": "1rem",
        "2xl": "1.25rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        "card": "0 1px 3px rgba(11, 21, 39, 0.06), 0 1px 2px rgba(11, 21, 39, 0.04)",
        "card-hover": "0 10px 25px rgba(11, 21, 39, 0.08), 0 4px 10px rgba(11, 21, 39, 0.04)",
        "elevated": "0 20px 40px rgba(11, 21, 39, 0.12), 0 8px 16px rgba(11, 21, 39, 0.06)",
        "modal": "0 25px 50px rgba(11, 21, 39, 0.15), 0 12px 24px rgba(11, 21, 39, 0.08)",
        "gold-glow": "0 0 20px rgba(212, 149, 42, 0.15), 0 0 40px rgba(212, 149, 42, 0.08)",
        "inner-soft": "inset 0 2px 4px rgba(11, 21, 39, 0.04)",
      },
      backgroundImage: {
        "gradient-navy": "linear-gradient(135deg, #0b1527 0%, #1e3463 50%, #142345 100%)",
        "gradient-gold": "linear-gradient(135deg, #d4952a 0%, #e5ac3d 50%, #edc873 100%)",
        "gradient-cream": "linear-gradient(180deg, #fdf9f0 0%, #fefdfb 100%)",
        "gradient-card": "linear-gradient(180deg, #ffffff 0%, #fbf9f4 100%)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
        "gold-shimmer": "goldShimmer 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        goldShimmer: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
