/**
 * IvyAmbition Design Tokens
 *
 * A premium admissions consulting aesthetic — dark navy backgrounds,
 * warm gold accents, crisp white cards, refined serif headings paired
 * with clean sans-serif body text. The feeling of stepping into a
 * mahogany-paneled admissions office at a top university.
 */

// ─── Color Palette ──────────────────────────────────────────────────────────

export const colors = {
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

  // Charcoal — Rich dark grays for text and surfaces
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

  // Cream — Soft warm whites for backgrounds
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

  // Semantic colors
  success: {
    light: "#d1fae5",
    DEFAULT: "#10b981",
    dark: "#047857",
  },
  error: {
    light: "#fce4ec",
    DEFAULT: "#a3344a",
    dark: "#731f32",
  },
  warning: {
    light: "#fef3c7",
    DEFAULT: "#f59e0b",
    dark: "#b45309",
  },
  info: {
    light: "#dbeafe",
    DEFAULT: "#3b82f6",
    dark: "#1d4ed8",
  },

  // Pure
  white: "#ffffff",
  black: "#000000",
} as const;

// ─── Typography ─────────────────────────────────────────────────────────────

export const fontFamily = {
  serif: '"Playfair Display", Georgia, "Times New Roman", serif',
  sans: '"Inter", system-ui, -apple-system, sans-serif',
  mono: '"JetBrains Mono", Menlo, monospace',
} as const;

export const typography = {
  "display-xl": {
    fontSize: "3.5rem",
    lineHeight: "1.1",
    letterSpacing: "-0.02em",
    fontWeight: 700,
    fontFamily: fontFamily.serif,
  },
  "display-lg": {
    fontSize: "3rem",
    lineHeight: "1.15",
    letterSpacing: "-0.02em",
    fontWeight: 700,
    fontFamily: fontFamily.serif,
  },
  display: {
    fontSize: "2.25rem",
    lineHeight: "1.2",
    letterSpacing: "-0.01em",
    fontWeight: 700,
    fontFamily: fontFamily.serif,
  },
  "heading-xl": {
    fontSize: "1.875rem",
    lineHeight: "1.25",
    letterSpacing: "-0.01em",
    fontWeight: 600,
    fontFamily: fontFamily.serif,
  },
  "heading-lg": {
    fontSize: "1.5rem",
    lineHeight: "1.3",
    letterSpacing: "-0.005em",
    fontWeight: 600,
    fontFamily: fontFamily.serif,
  },
  heading: {
    fontSize: "1.25rem",
    lineHeight: "1.4",
    fontWeight: 600,
    fontFamily: fontFamily.serif,
  },
  "heading-sm": {
    fontSize: "1.125rem",
    lineHeight: "1.4",
    fontWeight: 600,
    fontFamily: fontFamily.serif,
  },
  "body-lg": {
    fontSize: "1.125rem",
    lineHeight: "1.6",
    fontWeight: 400,
    fontFamily: fontFamily.sans,
  },
  body: {
    fontSize: "1rem",
    lineHeight: "1.6",
    fontWeight: 400,
    fontFamily: fontFamily.sans,
  },
  "body-sm": {
    fontSize: "0.875rem",
    lineHeight: "1.5",
    fontWeight: 400,
    fontFamily: fontFamily.sans,
  },
  caption: {
    fontSize: "0.75rem",
    lineHeight: "1.5",
    fontWeight: 500,
    fontFamily: fontFamily.sans,
  },
  overline: {
    fontSize: "0.6875rem",
    lineHeight: "1.5",
    letterSpacing: "0.08em",
    fontWeight: 600,
    fontFamily: fontFamily.sans,
    textTransform: "uppercase" as const,
  },
} as const;

// ─── Spacing Scale ──────────────────────────────────────────────────────────

export const spacing = {
  px: "1px",
  0: "0",
  0.5: "0.125rem",
  1: "0.25rem",
  1.5: "0.375rem",
  2: "0.5rem",
  2.5: "0.625rem",
  3: "0.75rem",
  3.5: "0.875rem",
  4: "1rem",
  5: "1.25rem",
  6: "1.5rem",
  7: "1.75rem",
  8: "2rem",
  9: "2.25rem",
  10: "2.5rem",
  12: "3rem",
  14: "3.5rem",
  16: "4rem",
  18: "4.5rem",
  20: "5rem",
  24: "6rem",
  28: "7rem",
  32: "8rem",
  36: "9rem",
  40: "10rem",
  48: "12rem",
  56: "14rem",
  64: "16rem",
} as const;

// ─── Border Radius ──────────────────────────────────────────────────────────

export const borderRadius = {
  none: "0",
  sm: "0.25rem",
  DEFAULT: "0.5rem",
  md: "0.625rem",
  lg: "0.75rem",
  xl: "1rem",
  "2xl": "1.25rem",
  "3xl": "1.5rem",
  full: "9999px",
} as const;

// ─── Shadows ────────────────────────────────────────────────────────────────

export const shadows = {
  card: "0 1px 3px rgba(11, 21, 39, 0.06), 0 1px 2px rgba(11, 21, 39, 0.04)",
  "card-hover":
    "0 10px 25px rgba(11, 21, 39, 0.08), 0 4px 10px rgba(11, 21, 39, 0.04)",
  elevated:
    "0 20px 40px rgba(11, 21, 39, 0.12), 0 8px 16px rgba(11, 21, 39, 0.06)",
  modal:
    "0 25px 50px rgba(11, 21, 39, 0.15), 0 12px 24px rgba(11, 21, 39, 0.08)",
  "gold-glow":
    "0 0 20px rgba(212, 149, 42, 0.15), 0 0 40px rgba(212, 149, 42, 0.08)",
  "inner-soft": "inset 0 2px 4px rgba(11, 21, 39, 0.04)",
} as const;

// ─── Gradients ──────────────────────────────────────────────────────────────

export const gradients = {
  navy: "linear-gradient(135deg, #0b1527 0%, #1e3463 50%, #142345 100%)",
  gold: "linear-gradient(135deg, #d4952a 0%, #e5ac3d 50%, #edc873 100%)",
  cream: "linear-gradient(180deg, #fdf9f0 0%, #fefdfb 100%)",
  card: "linear-gradient(180deg, #ffffff 0%, #fbf9f4 100%)",
} as const;

// ─── Transitions ────────────────────────────────────────────────────────────

export const transitions = {
  fast: "150ms ease",
  base: "200ms ease",
  smooth: "300ms ease-out",
  slow: "500ms ease-in-out",
} as const;

// ─── Z-Index Scale ──────────────────────────────────────────────────────────

export const zIndex = {
  hide: -1,
  base: 0,
  dropdown: 10,
  sticky: 20,
  overlay: 30,
  modal: 40,
  popover: 50,
  toast: 60,
  tooltip: 70,
} as const;

// ─── Breakpoints ────────────────────────────────────────────────────────────

export const breakpoints = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
} as const;

// ─── Combined Theme Export ──────────────────────────────────────────────────

export const theme = {
  colors,
  fontFamily,
  typography,
  spacing,
  borderRadius,
  shadows,
  gradients,
  transitions,
  zIndex,
  breakpoints,
} as const;

export default theme;
