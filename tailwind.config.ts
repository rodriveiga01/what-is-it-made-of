import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        void: "#080908",
        ink: "#0F100F",
        panel: "#141513",
        panel2: "#1B1C1A",
        bone: "#EDE7DB",
        faded: "#A8A39A",
        dim: "#8A8780",
        ghost: "#3A3B38",
        signal: "#FF4D00",
        signaltext: "#FF8A4D",
        moss: "#C6F24E",
        line: {
          faint: "rgba(237,231,223,0.08)",
          DEFAULT: "rgba(237,231,223,0.12)",
          strong: "rgba(237,231,223,0.2)",
          bright: "rgba(237,231,223,0.28)",
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
