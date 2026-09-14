import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Daylight workshop: warm paper ground, white cards, warm ink text.
        // Three accents with jobs: signal = action/energy, leaf = materials,
        // pool = elements/origins. Muted trio all clear 4.5:1 on paper+card.
        paper: "#FAF7F0",
        card: "#FFFFFF",
        tint: "#F1EBDD",
        ink: "#20211C",
        soft: "#55534C",
        mute: "#6E6A62",
        ghost: "#D9D3C2",
        signal: "#FF4D00",
        signaldeep: "#C74300",
        leaf: "#527A1F",
        pool: "#2F5FC0",
        line: {
          faint: "rgba(32,33,28,0.08)",
          DEFAULT: "rgba(32,33,28,0.14)",
          strong: "rgba(32,33,28,0.22)",
          bright: "rgba(32,33,28,0.32)",
        },
      },
      fontFamily: {
        serif: ["var(--font-serif-d)", '"Instrument Serif"', "Georgia", "serif"],
        sans: ["var(--font-sans)", '"Inter Tight"', "Inter", "-apple-system", "sans-serif"],
        mono: ["var(--font-mono-l)", '"JetBrains Mono"', '"IBM Plex Mono"', "monospace"],
      },
      borderRadius: { xs: "3px", sm: "6px", md: "10px", lg: "14px" },
    },
  },
  plugins: [],
};
export default config;
