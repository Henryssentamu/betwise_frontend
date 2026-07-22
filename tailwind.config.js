/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          bg: "#0E1416",      // deep pitch-under-floodlights base
          panel: "#161F22",   // raised panel / card surface
          panel2: "#1D2A2E",  // secondary panel (hover, nested)
          hairline: "#28353A",// dividers, borders
          paper: "#EDEAE2",   // warm programme-paper white — primary text
          muted: "#93A3A7",   // secondary text
          faint: "#5D6C70",   // tertiary / placeholder text
        },
        ticker: {
          DEFAULT: "#4FD1C5", // scoreboard cyan — primary actions, links, progress
          dim: "#357F79",
          glow: "#8FEAE0",
        },
        risk: {
          low: "#3FA796",
          medium: "#D9A441",
          high: "#C1502E",
        },
      },
      fontFamily: {
        display: ["'Big Shoulders Display'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      borderRadius: {
        stub: "6px",
      },
      backgroundImage: {
        "hairline-fade": "linear-gradient(90deg, transparent, #28353A 15%, #28353A 85%, transparent)",
      },
    },
  },
  plugins: [],
};
