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
        neo: {
          bg: "rgb(247, 245, 240)",
          surface: "rgb(255, 255, 252)",
          lcd: "rgb(232, 241, 235)",
          black: "rgb(30, 35, 42)",
          muted: "rgb(100, 110, 120)",
          yellow: "rgb(254, 240, 138)",
          mint: "rgb(167, 243, 208)",
          coral: "rgb(253, 164, 175)",
          lilac: "rgb(221, 214, 254)",
          sky: "rgb(186, 230, 253)",
          orange: "rgb(254, 215, 170)",
        },
      },
      borderWidth: {
        "2": "2px",
        "3": "2px",
      },
      boxShadow: {
        "neo-sm": "2px 2px 0px 0px rgb(30, 35, 42)",
        "neo": "3px 3px 0px 0px rgb(30, 35, 42)",
        "neo-lg": "4px 4px 0px 0px rgb(30, 35, 42)",
        "none": "0px 0px 0px 0px rgb(30, 35, 42)",
      },
      fontFamily: {
        sans: ["var(--font-space)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
